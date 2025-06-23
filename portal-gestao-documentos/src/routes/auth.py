from flask import Blueprint, jsonify, request
from src.models.user import User, db
from werkzeug.security import check_password_hash
import jwt
from datetime import datetime, timedelta
from functools import wraps

auth_bp = Blueprint('auth', __name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token é obrigatório'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, 'asdf#FGSgvasgf$5$WGT', algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({'message': 'Token inválido'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expirado'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token inválido'}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if current_user.role != 'admin':
            return jsonify({'message': 'Acesso negado. Apenas administradores.'}), 403
        return f(current_user, *args, **kwargs)
    return decorated

@auth_bp.route('/login', methods=['POST'])
def login():
    """Endpoint para autenticação de usuários"""
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'message': 'Email e senha são obrigatórios'}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'message': 'Credenciais inválidas'}), 401
        
        if not user.is_active:
            return jsonify({'message': 'Usuário inativo'}), 401
        
        # Gerar token JWT
        token = jwt.encode({
            'user_id': user.id,
            'email': user.email,
            'role': user.role,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, 'asdf#FGSgvasgf$5$WGT', algorithm='HS256')
        
        return jsonify({
            'message': 'Login realizado com sucesso',
            'token': token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@auth_bp.route('/register', methods=['POST'])
def register():
    """Endpoint para registro de novos usuários"""
    try:
        data = request.get_json()
        
        # Validações
        required_fields = ['username', 'email', 'password', 'role']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'Campo {field} é obrigatório'}), 400
        
        # Verificar se usuário já existe
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'message': 'Email já cadastrado'}), 400
        
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'message': 'Username já cadastrado'}), 400
        
        # Criar novo usuário
        user = User(
            username=data['username'],
            email=data['email'],
            role=data['role'],
            transportadora_id=data.get('transportadora_id')
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'message': 'Usuário criado com sucesso',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    """Endpoint para obter dados do usuário logado"""
    return jsonify({
        'user': current_user.to_dict()
    }), 200

@auth_bp.route('/demo-login', methods=['POST'])
def demo_login():
    """Endpoint para login de demonstração"""
    try:
        # Criar ou buscar usuário demo
        demo_user = User.query.filter_by(email='demo@nimoenergia.com.br').first()
        
        if not demo_user:
            demo_user = User(
                username='demo_admin',
                email='demo@nimoenergia.com.br',
                role='admin'
            )
            demo_user.set_password('demo123')
            db.session.add(demo_user)
            db.session.commit()
        
        # Gerar token
        token = jwt.encode({
            'user_id': demo_user.id,
            'email': demo_user.email,
            'role': demo_user.role,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, 'asdf#FGSgvasgf$5$WGT', algorithm='HS256')
        
        return jsonify({
            'message': 'Acesso de demonstração ativado',
            'token': token,
            'user': demo_user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

