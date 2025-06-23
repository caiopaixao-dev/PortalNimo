from flask import Blueprint, jsonify, request, send_file
from src.models.user import Documento, TipoDocumento, Transportadora, User, db
from src.routes.auth import token_required, admin_required
from werkzeug.utils import secure_filename
from datetime import datetime, date, timedelta
import os
import hashlib
import uuid

documento_bp = Blueprint('documento', __name__)

UPLOAD_FOLDER = '/home/ubuntu/portal-gestao-documentos/uploads'
ALLOWED_EXTENSIONS = {'pdf', 'jpg', 'jpeg', 'png', 'docx', 'doc'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def calculate_file_hash(file_path):
    """Calcular hash SHA-256 do arquivo"""
    hash_sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_sha256.update(chunk)
    return hash_sha256.hexdigest()

@documento_bp.route('/documentos', methods=['GET'])
@token_required
def get_documentos(current_user):
    """Listar documentos (admin vê todos, transportadora vê apenas os seus)"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status_filter = request.args.get('status')
        tipo_filter = request.args.get('tipo_documento_id', type=int)
        
        query = Documento.query
        
        # Filtrar por transportadora se não for admin
        if current_user.role != 'admin':
            if not current_user.transportadora_id:
                return jsonify({'message': 'Usuário não vinculado a uma transportadora'}), 400
            query = query.filter_by(transportadora_id=current_user.transportadora_id)
        
        # Aplicar filtros
        if status_filter:
            query = query.filter_by(status=status_filter)
        if tipo_filter:
            query = query.filter_by(tipo_documento_id=tipo_filter)
        
        # Paginação
        documentos = query.order_by(Documento.data_upload.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'documentos': [doc.to_dict() for doc in documentos.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': documentos.total,
                'pages': documentos.pages,
                'has_next': documentos.has_next,
                'has_prev': documentos.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@documento_bp.route('/documentos/upload', methods=['POST'])
@token_required
def upload_documento(current_user):
    """Upload de documento"""
    try:
        # Verificar se arquivo foi enviado
        if 'file' not in request.files:
            return jsonify({'message': 'Nenhum arquivo enviado'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'message': 'Nenhum arquivo selecionado'}), 400
        
        # Validações
        if not allowed_file(file.filename):
            return jsonify({'message': 'Tipo de arquivo não permitido'}), 400
        
        # Obter dados do formulário
        tipo_documento_id = request.form.get('tipo_documento_id', type=int)
        transportadora_id = request.form.get('transportadora_id', type=int)
        data_vencimento = request.form.get('data_vencimento')
        
        if not tipo_documento_id:
            return jsonify({'message': 'Tipo de documento é obrigatório'}), 400
        
        # Verificar tipo de documento
        tipo_documento = TipoDocumento.query.get_or_404(tipo_documento_id)
        
        # Determinar transportadora
        if current_user.role == 'admin':
            if not transportadora_id:
                return jsonify({'message': 'Transportadora é obrigatória para admin'}), 400
            transportadora = Transportadora.query.get_or_404(transportadora_id)
        else:
            if not current_user.transportadora_id:
                return jsonify({'message': 'Usuário não vinculado a uma transportadora'}), 400
            transportadora = Transportadora.query.get_or_404(current_user.transportadora_id)
            transportadora_id = transportadora.id
        
        # Criar diretório se não existir
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        
        # Gerar nome único para o arquivo
        file_extension = file.filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        
        # Salvar arquivo
        file.save(file_path)
        
        # Verificar tamanho
        file_size = os.path.getsize(file_path)
        if file_size > MAX_FILE_SIZE:
            os.remove(file_path)
            return jsonify({'message': 'Arquivo muito grande (máximo 5MB)'}), 400
        
        # Calcular hash
        file_hash = calculate_file_hash(file_path)
        
        # Processar data de vencimento
        data_venc = None
        if data_vencimento:
            try:
                data_venc = datetime.strptime(data_vencimento, '%Y-%m-%d').date()
            except ValueError:
                os.remove(file_path)
                return jsonify({'message': 'Formato de data inválido (use YYYY-MM-DD)'}), 400
        
        # Criar registro no banco
        documento = Documento(
            nome_arquivo=unique_filename,
            nome_original=secure_filename(file.filename),
            caminho_arquivo=file_path,
            tamanho_bytes=file_size,
            tipo_mime=file.content_type or 'application/octet-stream',
            transportadora_id=transportadora_id,
            tipo_documento_id=tipo_documento_id,
            data_vencimento=data_venc,
            hash_arquivo=file_hash
        )
        
        db.session.add(documento)
        db.session.commit()
        
        return jsonify({
            'message': 'Documento enviado com sucesso',
            'documento': documento.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        # Remover arquivo se houve erro
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@documento_bp.route('/documentos/<int:documento_id>/aprovar', methods=['POST'])
@token_required
@admin_required
def aprovar_documento(current_user, documento_id):
    """Aprovar documento (apenas admin)"""
    try:
        documento = Documento.query.get_or_404(documento_id)
        data = request.get_json() or {}
        
        documento.status = 'aprovado'
        documento.data_aprovacao = datetime.utcnow()
        documento.aprovado_por = current_user.id
        documento.observacoes = data.get('observacoes')
        
        db.session.commit()
        
        return jsonify({
            'message': 'Documento aprovado com sucesso',
            'documento': documento.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@documento_bp.route('/documentos/<int:documento_id>/rejeitar', methods=['POST'])
@token_required
@admin_required
def rejeitar_documento(current_user, documento_id):
    """Rejeitar documento (apenas admin)"""
    try:
        documento = Documento.query.get_or_404(documento_id)
        data = request.get_json() or {}
        
        if not data.get('observacoes'):
            return jsonify({'message': 'Observações são obrigatórias para rejeição'}), 400
        
        documento.status = 'rejeitado'
        documento.data_rejeicao = datetime.utcnow()
        documento.aprovado_por = current_user.id
        documento.observacoes = data['observacoes']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Documento rejeitado com sucesso',
            'documento': documento.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@documento_bp.route('/documentos/<int:documento_id>/download', methods=['GET'])
@token_required
def download_documento(current_user, documento_id):
    """Download de documento"""
    try:
        documento = Documento.query.get_or_404(documento_id)
        
        # Verificar permissão
        if current_user.role != 'admin' and current_user.transportadora_id != documento.transportadora_id:
            return jsonify({'message': 'Acesso negado'}), 403
        
        if not os.path.exists(documento.caminho_arquivo):
            return jsonify({'message': 'Arquivo não encontrado'}), 404
        
        return send_file(
            documento.caminho_arquivo,
            as_attachment=True,
            download_name=documento.nome_original
        )
        
    except Exception as e:
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@documento_bp.route('/documentos/stats', methods=['GET'])
@token_required
def get_documentos_stats(current_user):
    """Obter estatísticas de documentos"""
    try:
        query = Documento.query
        
        # Filtrar por transportadora se não for admin
        if current_user.role != 'admin':
            if not current_user.transportadora_id:
                return jsonify({'message': 'Usuário não vinculado a uma transportadora'}), 400
            query = query.filter_by(transportadora_id=current_user.transportadora_id)
        
        total = query.count()
        aprovados = query.filter_by(status='aprovado').count()
        pendentes = query.filter_by(status='pendente').count()
        rejeitados = query.filter_by(status='rejeitado').count()
        
        # Documentos vencendo em 30 dias
        data_limite = date.today() + timedelta(days=30)
        vencendo = query.filter(
            Documento.data_vencimento.isnot(None),
            Documento.data_vencimento <= data_limite,
            Documento.status == 'aprovado'
        ).count()
        
        # Documentos vencidos
        vencidos = query.filter(
            Documento.data_vencimento.isnot(None),
            Documento.data_vencimento < date.today()
        ).count()
        
        return jsonify({
            'stats': {
                'total': total,
                'aprovados': aprovados,
                'pendentes': pendentes,
                'rejeitados': rejeitados,
                'vencendo': vencendo,
                'vencidos': vencidos
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@documento_bp.route('/documentos/vencimentos', methods=['GET'])
@token_required
def get_vencimentos(current_user):
    """Obter documentos próximos do vencimento"""
    try:
        dias = request.args.get('dias', 30, type=int)
        data_limite = date.today() + timedelta(days=dias)
        
        query = Documento.query.filter(
            Documento.data_vencimento.isnot(None),
            Documento.data_vencimento <= data_limite,
            Documento.status == 'aprovado'
        )
        
        # Filtrar por transportadora se não for admin
        if current_user.role != 'admin':
            if not current_user.transportadora_id:
                return jsonify({'message': 'Usuário não vinculado a uma transportadora'}), 400
            query = query.filter_by(transportadora_id=current_user.transportadora_id)
        
        documentos = query.order_by(Documento.data_vencimento.asc()).all()
        
        return jsonify({
            'documentos_vencendo': [doc.to_dict() for doc in documentos]
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

