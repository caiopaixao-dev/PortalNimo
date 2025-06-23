from flask import Blueprint, request, jsonify
from src.models.database import db, Transportadora, Usuario
from werkzeug.security import generate_password_hash
import jwt
from datetime import datetime

transportadoras_bp = Blueprint('transportadoras', __name__)

def verify_token_admin():
    """Verifica se o token é válido e se o usuário é admin"""
    try:
        token = request.headers.get('Authorization')
        if not token or not token.startswith('Bearer '):
            return None
        
        token = token[7:]
        payload = jwt.decode(token, 'NimoEnergia2024JWT!@#$%', algorithms=['HS256'])
        
        if payload.get('tipo_usuario') != 'ADMIN':
            return None
            
        return payload
    except:
        return None

@transportadoras_bp.route('/', methods=['GET'])
def listar_transportadoras():
    try:
        # Verificar se é admin
        payload = verify_token_admin()
        if not payload:
            return jsonify({'error': 'Acesso negado'}), 403
        
        transportadoras = Transportadora.query.all()
        return jsonify([t.to_dict() for t in transportadoras]), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@transportadoras_bp.route('/<int:transportadora_id>', methods=['GET'])
def obter_transportadora(transportadora_id):
    try:
        # Verificar token
        token = request.headers.get('Authorization')
        if not token or not token.startswith('Bearer '):
            return jsonify({'error': 'Token não fornecido'}), 401
        
        token = token[7:]
        payload = jwt.decode(token, 'NimoEnergia2024JWT!@#$%', algorithms=['HS256'])
        
        # Admin pode ver qualquer transportadora, usuário só pode ver a própria
        if payload.get('tipo_usuario') != 'ADMIN' and payload.get('transportadora_id') != transportadora_id:
            return jsonify({'error': 'Acesso negado'}), 403
        
        transportadora = Transportadora.query.get_or_404(transportadora_id)
        return jsonify(transportadora.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@transportadoras_bp.route('/', methods=['POST'])
def criar_transportadora():
    try:
        data = request.get_json()
        
        # Validar campos obrigatórios
        campos_obrigatorios = ['cnpj', 'razao_social', 'responsavel_nome', 'responsavel_cpf', 'email_contato']
        for campo in campos_obrigatorios:
            if not data.get(campo):
                return jsonify({'error': f'Campo {campo} é obrigatório'}), 400
        
        # Verificar se CNPJ já existe
        if Transportadora.query.filter_by(cnpj=data['cnpj']).first():
            return jsonify({'error': 'CNPJ já cadastrado'}), 400
        
        # Criar transportadora
        transportadora = Transportadora(
            cnpj=data['cnpj'],
            razao_social=data['razao_social'],
            nome_fantasia=data.get('nome_fantasia'),
            endereco=data.get('endereco'),
            cidade=data.get('cidade'),
            estado=data.get('estado'),
            cep=data.get('cep'),
            telefone=data.get('telefone'),
            email_contato=data['email_contato'],
            responsavel_nome=data['responsavel_nome'],
            responsavel_cpf=data['responsavel_cpf'],
            responsavel_cargo=data.get('responsavel_cargo'),
            status_cadastro='PENDENTE'
        )
        
        db.session.add(transportadora)
        db.session.flush()  # Para obter o ID
        
        # Criar usuário para a transportadora
        if data.get('senha_usuario'):
            usuario = Usuario(
                email=data['email_contato'],
                senha_hash=generate_password_hash(data['senha_usuario']),
                nome=data['responsavel_nome'],
                tipo_usuario='TRANSPORTADORA',
                transportadora_id=transportadora.id
            )
            db.session.add(usuario)
        
        db.session.commit()
        
        return jsonify(transportadora.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@transportadoras_bp.route('/<int:transportadora_id>/aprovar', methods=['PUT'])
def aprovar_transportadora(transportadora_id):
    try:
        # Verificar se é admin
        payload = verify_token_admin()
        if not payload:
            return jsonify({'error': 'Acesso negado'}), 403
        
        transportadora = Transportadora.query.get_or_404(transportadora_id)
        transportadora.status_cadastro = 'APROVADO'
        transportadora.data_aprovacao = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify(transportadora.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@transportadoras_bp.route('/<int:transportadora_id>/suspender', methods=['PUT'])
def suspender_transportadora(transportadora_id):
    try:
        # Verificar se é admin
        payload = verify_token_admin()
        if not payload:
            return jsonify({'error': 'Acesso negado'}), 403
        
        transportadora = Transportadora.query.get_or_404(transportadora_id)
        transportadora.status_cadastro = 'SUSPENSO'
        
        db.session.commit()
        
        return jsonify(transportadora.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

