from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from src.models.database import db, Documento, TipoDocumento, Transportadora, Usuario, HistoricoDocumento
import jwt
import os
from datetime import datetime, date
import uuid

documentos_bp = Blueprint('documentos', __name__)

ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def verify_token():
    """Verifica se o token é válido"""
    try:
        token = request.headers.get('Authorization')
        if not token or not token.startswith('Bearer '):
            return None
        
        token = token[7:]
        payload = jwt.decode(token, 'NimoEnergia2024JWT!@#$%', algorithms=['HS256'])
        return payload
    except:
        return None

@documentos_bp.route('/tipos', methods=['GET'])
def listar_tipos_documento():
    try:
        tipos = TipoDocumento.query.filter_by(ativo=True).all()
        return jsonify([t.to_dict() for t in tipos]), 200
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@documentos_bp.route('/upload', methods=['POST'])
def upload_documento():
    try:
        # Verificar token
        payload = verify_token()
        if not payload:
            return jsonify({'error': 'Token inválido'}), 401
        
        # Verificar se há arquivo
        if 'arquivo' not in request.files:
            return jsonify({'error': 'Nenhum arquivo enviado'}), 400
        
        arquivo = request.files['arquivo']
        if arquivo.filename == '':
            return jsonify({'error': 'Nenhum arquivo selecionado'}), 400
        
        if not allowed_file(arquivo.filename):
            return jsonify({'error': 'Tipo de arquivo não permitido'}), 400
        
        # Obter dados do formulário
        tipo_documento_id = request.form.get('tipo_documento_id')
        data_vencimento = request.form.get('data_vencimento')
        valor_garantia = request.form.get('valor_garantia')
        
        if not tipo_documento_id:
            return jsonify({'error': 'Tipo de documento é obrigatório'}), 400
        
        # Verificar tipo de documento
        tipo_documento = TipoDocumento.query.get(tipo_documento_id)
        if not tipo_documento:
            return jsonify({'error': 'Tipo de documento inválido'}), 400
        
        # Determinar transportadora
        if payload['tipo_usuario'] == 'ADMIN':
            transportadora_id = request.form.get('transportadora_id')
            if not transportadora_id:
                return jsonify({'error': 'Transportadora é obrigatória para admin'}), 400
        else:
            transportadora_id = payload['transportadora_id']
        
        if not transportadora_id:
            return jsonify({'error': 'Transportadora não identificada'}), 400
        
        # Verificar se transportadora existe
        transportadora = Transportadora.query.get(transportadora_id)
        if not transportadora:
            return jsonify({'error': 'Transportadora não encontrada'}), 400
        
        # Gerar nome único para o arquivo
        filename = secure_filename(arquivo.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        
        # Salvar arquivo
        upload_folder = current_app.config['UPLOAD_FOLDER']
        filepath = os.path.join(upload_folder, unique_filename)
        arquivo.save(filepath)
        
        # Processar data de vencimento
        data_venc_obj = None
        if data_vencimento and tipo_documento.tem_vencimento:
            try:
                data_venc_obj = datetime.strptime(data_vencimento, '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Formato de data inválido (use YYYY-MM-DD)'}), 400
        
        # Processar valor da garantia
        valor_gar_obj = None
        if valor_garantia and tipo_documento.tem_garantia:
            try:
                valor_gar_obj = float(valor_garantia)
            except ValueError:
                return jsonify({'error': 'Valor de garantia inválido'}), 400
        
        # Criar documento
        documento = Documento(
            transportadora_id=transportadora_id,
            tipo_documento_id=tipo_documento_id,
            nome_arquivo=filename,
            caminho_arquivo=filepath,
            tamanho_arquivo=os.path.getsize(filepath),
            tipo_mime=arquivo.content_type or 'application/octet-stream',
            data_vencimento=data_venc_obj,
            valor_garantia=valor_gar_obj,
            status='PENDENTE'
        )
        
        db.session.add(documento)
        db.session.flush()
        
        # Registrar histórico
        historico = HistoricoDocumento(
            documento_id=documento.id,
            usuario_id=payload['user_id'],
            acao='UPLOAD',
            status_anterior=None,
            status_novo='PENDENTE',
            observacoes=f'Upload do documento {filename}'
        )
        
        db.session.add(historico)
        db.session.commit()
        
        return jsonify(documento.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        if 'filepath' in locals() and os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@documentos_bp.route('/', methods=['GET'])
def listar_documentos():
    try:
        # Verificar token
        payload = verify_token()
        if not payload:
            return jsonify({'error': 'Token inválido'}), 401
        
        # Filtrar por transportadora se não for admin
        if payload['tipo_usuario'] == 'ADMIN':
            transportadora_id = request.args.get('transportadora_id')
            if transportadora_id:
                documentos = Documento.query.filter_by(transportadora_id=transportadora_id).all()
            else:
                documentos = Documento.query.all()
        else:
            documentos = Documento.query.filter_by(transportadora_id=payload['transportadora_id']).all()
        
        return jsonify([d.to_dict() for d in documentos]), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@documentos_bp.route('/<int:documento_id>/aprovar', methods=['PUT'])
def aprovar_documento(documento_id):
    try:
        # Verificar se é admin
        payload = verify_token()
        if not payload or payload['tipo_usuario'] != 'ADMIN':
            return jsonify({'error': 'Acesso negado'}), 403
        
        data = request.get_json()
        observacoes = data.get('observacoes', '') if data else ''
        
        documento = Documento.query.get_or_404(documento_id)
        status_anterior = documento.status
        
        documento.status = 'APROVADO'
        documento.aprovado_por = payload['user_id']
        documento.data_aprovacao = datetime.utcnow()
        documento.observacoes = observacoes
        
        # Registrar histórico
        historico = HistoricoDocumento(
            documento_id=documento.id,
            usuario_id=payload['user_id'],
            acao='APROVACAO',
            status_anterior=status_anterior,
            status_novo='APROVADO',
            observacoes=observacoes
        )
        
        db.session.add(historico)
        db.session.commit()
        
        return jsonify(documento.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@documentos_bp.route('/<int:documento_id>/rejeitar', methods=['PUT'])
def rejeitar_documento(documento_id):
    try:
        # Verificar se é admin
        payload = verify_token()
        if not payload or payload['tipo_usuario'] != 'ADMIN':
            return jsonify({'error': 'Acesso negado'}), 403
        
        data = request.get_json()
        observacoes = data.get('observacoes', '') if data else ''
        
        if not observacoes:
            return jsonify({'error': 'Observações são obrigatórias para rejeição'}), 400
        
        documento = Documento.query.get_or_404(documento_id)
        status_anterior = documento.status
        
        documento.status = 'REJEITADO'
        documento.aprovado_por = payload['user_id']
        documento.data_aprovacao = datetime.utcnow()
        documento.observacoes = observacoes
        
        # Registrar histórico
        historico = HistoricoDocumento(
            documento_id=documento.id,
            usuario_id=payload['user_id'],
            acao='REJEICAO',
            status_anterior=status_anterior,
            status_novo='REJEITADO',
            observacoes=observacoes
        )
        
        db.session.add(historico)
        db.session.commit()
        
        return jsonify(documento.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@documentos_bp.route('/<int:documento_id>/historico', methods=['GET'])
def obter_historico_documento(documento_id):
    try:
        # Verificar token
        payload = verify_token()
        if not payload:
            return jsonify({'error': 'Token inválido'}), 401
        
        # Verificar se tem acesso ao documento
        documento = Documento.query.get_or_404(documento_id)
        
        if payload['tipo_usuario'] != 'ADMIN' and documento.transportadora_id != payload['transportadora_id']:
            return jsonify({'error': 'Acesso negado'}), 403
        
        historico = HistoricoDocumento.query.filter_by(documento_id=documento_id).order_by(HistoricoDocumento.data_acao.desc()).all()
        
        return jsonify([h.to_dict() for h in historico]), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

