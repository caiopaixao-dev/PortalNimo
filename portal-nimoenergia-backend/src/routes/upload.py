from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash
import os
import uuid
import hashlib
from datetime import datetime
from cryptography.fernet import Fernet
import base64
from models.user import db, Documento, TipoDocumento
from routes.auth import token_required

upload_bp = Blueprint('upload', __name__)

# Gerar chave de criptografia (em produção, usar variável de ambiente)
ENCRYPTION_KEY = Fernet.generate_key()
cipher_suite = Fernet(ENCRYPTION_KEY)

# Configurações de upload seguro
UPLOAD_FOLDER = '/home/ubuntu/portal-nimoenergia-backend/uploads'
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def encrypt_file_content(file_content):
    """Criptografa o conteúdo do arquivo"""
    return cipher_suite.encrypt(file_content)

def decrypt_file_content(encrypted_content):
    """Descriptografa o conteúdo do arquivo"""
    return cipher_suite.decrypt(encrypted_content)

def generate_secure_filename():
    """Gera nome de arquivo seguro e único"""
    return str(uuid.uuid4()) + '_' + hashlib.md5(str(datetime.now()).encode()).hexdigest()[:8]

@upload_bp.route('/upload', methods=['POST'])
@token_required
def upload_document(current_user):
    try:
        # Verificar se o arquivo foi enviado
        if 'file' not in request.files:
            return jsonify({'error': 'Nenhum arquivo enviado'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Nenhum arquivo selecionado'}), 400
        
        # Validar tipo de arquivo
        if not allowed_file(file.filename):
            return jsonify({'error': 'Tipo de arquivo não permitido'}), 400
        
        # Verificar tamanho do arquivo
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > MAX_FILE_SIZE:
            return jsonify({'error': 'Arquivo muito grande (máximo 16MB)'}), 400
        
        # Obter dados do formulário
        tipo_documento_id = request.form.get('tipo_documento_id')
        data_vencimento = request.form.get('data_vencimento')
        valor_garantia = request.form.get('valor_garantia')
        observacoes = request.form.get('observacoes', '')
        
        if not tipo_documento_id:
            return jsonify({'error': 'Tipo de documento é obrigatório'}), 400
        
        # Verificar se o tipo de documento existe
        tipo_documento = TipoDocumento.query.get(tipo_documento_id)
        if not tipo_documento:
            return jsonify({'error': 'Tipo de documento inválido'}), 400
        
        # Criar pasta de upload se não existir
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        
        # Gerar nome seguro para o arquivo
        secure_name = generate_secure_filename()
        file_extension = file.filename.rsplit('.', 1)[1].lower()
        encrypted_filename = f"{secure_name}.{file_extension}.enc"
        
        # Ler e criptografar conteúdo do arquivo
        file_content = file.read()
        encrypted_content = encrypt_file_content(file_content)
        
        # Salvar arquivo criptografado
        file_path = os.path.join(UPLOAD_FOLDER, encrypted_filename)
        with open(file_path, 'wb') as f:
            f.write(encrypted_content)
        
        # Salvar informações no banco de dados
        documento = Documento(
            id_transportadora=current_user.id_transportadora,
            id_tipo_documento=tipo_documento_id,
            nome_original=secure_filename(file.filename),
            nome_arquivo=encrypted_filename,
            caminho_arquivo=file_path,
            tamanho_arquivo=file_size,
            data_upload=datetime.now(),
            data_vencimento=datetime.strptime(data_vencimento, '%Y-%m-%d') if data_vencimento else None,
            valor_garantia=float(valor_garantia) if valor_garantia else None,
            observacoes=observacoes,
            status='PENDENTE',
            hash_arquivo=hashlib.sha256(file_content).hexdigest()
        )
        
        db.session.add(documento)
        db.session.commit()
        
        return jsonify({
            'message': 'Documento enviado com sucesso',
            'documento_id': documento.id,
            'status': 'PENDENTE',
            'data_upload': documento.data_upload.isoformat()
        }), 201
        
    except Exception as e:
        current_app.logger.error(f"Erro no upload: {str(e)}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

@upload_bp.route('/documentos', methods=['GET'])
@token_required
def listar_documentos(current_user):
    try:
        # Filtrar documentos por transportadora (se não for admin)
        if current_user.tipo == 'TRANSPORTADORA':
            documentos = Documento.query.filter_by(
                id_transportadora=current_user.id_transportadora
            ).order_by(Documento.data_upload.desc()).all()
        else:
            # Admin pode ver todos os documentos
            documentos = Documento.query.order_by(Documento.data_upload.desc()).all()
        
        documentos_list = []
        for doc in documentos:
            documentos_list.append({
                'id': doc.id,
                'tipo_documento': doc.tipo_documento.nome,
                'nome_original': doc.nome_original,
                'data_upload': doc.data_upload.isoformat(),
                'data_vencimento': doc.data_vencimento.isoformat() if doc.data_vencimento else None,
                'status': doc.status,
                'valor_garantia': doc.valor_garantia,
                'observacoes': doc.observacoes,
                'transportadora': doc.transportadora.razao_social if doc.transportadora else None
            })
        
        return jsonify({'documentos': documentos_list}), 200
        
    except Exception as e:
        current_app.logger.error(f"Erro ao listar documentos: {str(e)}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

@upload_bp.route('/tipos-documento', methods=['GET'])
@token_required
def listar_tipos_documento(current_user):
    try:
        tipos = TipoDocumento.query.all()
        tipos_list = []
        
        for tipo in tipos:
            tipos_list.append({
                'id': tipo.id,
                'nome': tipo.nome,
                'descricao': tipo.descricao,
                'requer_vencimento': tipo.requer_vencimento,
                'requer_garantia': tipo.requer_garantia
            })
        
        return jsonify({'tipos_documento': tipos_list}), 200
        
    except Exception as e:
        current_app.logger.error(f"Erro ao listar tipos de documento: {str(e)}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

@upload_bp.route('/documento/<int:documento_id>/aprovar', methods=['POST'])
@token_required
def aprovar_documento(current_user, documento_id):
    try:
        # Apenas admin pode aprovar documentos
        if current_user.tipo != 'ADMIN':
            return jsonify({'error': 'Acesso negado'}), 403
        
        documento = Documento.query.get(documento_id)
        if not documento:
            return jsonify({'error': 'Documento não encontrado'}), 404
        
        observacoes_aprovacao = request.json.get('observacoes', '')
        
        documento.status = 'APROVADO'
        documento.data_aprovacao = datetime.now()
        documento.id_usuario_aprovacao = current_user.id
        documento.observacoes_aprovacao = observacoes_aprovacao
        
        db.session.commit()
        
        return jsonify({
            'message': 'Documento aprovado com sucesso',
            'status': 'APROVADO'
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Erro ao aprovar documento: {str(e)}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

@upload_bp.route('/documento/<int:documento_id>/rejeitar', methods=['POST'])
@token_required
def rejeitar_documento(current_user, documento_id):
    try:
        # Apenas admin pode rejeitar documentos
        if current_user.tipo != 'ADMIN':
            return jsonify({'error': 'Acesso negado'}), 403
        
        documento = Documento.query.get(documento_id)
        if not documento:
            return jsonify({'error': 'Documento não encontrado'}), 404
        
        motivo_rejeicao = request.json.get('motivo', '')
        if not motivo_rejeicao:
            return jsonify({'error': 'Motivo da rejeição é obrigatório'}), 400
        
        documento.status = 'REJEITADO'
        documento.data_aprovacao = datetime.now()
        documento.id_usuario_aprovacao = current_user.id
        documento.observacoes_aprovacao = motivo_rejeicao
        
        db.session.commit()
        
        return jsonify({
            'message': 'Documento rejeitado com sucesso',
            'status': 'REJEITADO'
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Erro ao rejeitar documento: {str(e)}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

# Endpoint para estatísticas (dashboard)
@upload_bp.route('/estatisticas', methods=['GET'])
@token_required
def obter_estatisticas(current_user):
    try:
        if current_user.tipo == 'TRANSPORTADORA':
            # Estatísticas da transportadora específica
            total_docs = Documento.query.filter_by(id_transportadora=current_user.id_transportadora).count()
            aprovados = Documento.query.filter_by(
                id_transportadora=current_user.id_transportadora, 
                status='APROVADO'
            ).count()
            pendentes = Documento.query.filter_by(
                id_transportadora=current_user.id_transportadora, 
                status='PENDENTE'
            ).count()
            rejeitados = Documento.query.filter_by(
                id_transportadora=current_user.id_transportadora, 
                status='REJEITADO'
            ).count()
        else:
            # Estatísticas gerais para admin
            total_docs = Documento.query.count()
            aprovados = Documento.query.filter_by(status='APROVADO').count()
            pendentes = Documento.query.filter_by(status='PENDENTE').count()
            rejeitados = Documento.query.filter_by(status='REJEITADO').count()
        
        conformidade = (aprovados / total_docs * 100) if total_docs > 0 else 0
        
        return jsonify({
            'total_documentos': total_docs,
            'aprovados': aprovados,
            'pendentes': pendentes,
            'rejeitados': rejeitados,
            'taxa_conformidade': round(conformidade, 1)
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Erro ao obter estatísticas: {str(e)}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

