from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
import jwt
from datetime import datetime, timedelta
from src.models.database import db, Usuario

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('senha'):
            return jsonify({'error': 'Email e senha são obrigatórios'}), 400
        
        email = data['email'].lower().strip()
        senha = data['senha']
        
        # Buscar usuário
        usuario = Usuario.query.filter_by(email=email, ativo=True).first()
        
        if not usuario:
            return jsonify({'error': 'Credenciais inválidas'}), 401
        
        # Verificar senha
        if not check_password_hash(usuario.senha_hash, senha):
            return jsonify({'error': 'Credenciais inválidas'}), 401
        
        # Atualizar último acesso
        usuario.data_ultimo_acesso = datetime.utcnow()
        db.session.commit()
        
        # Gerar token JWT
        payload = {
            'user_id': usuario.id,
            'email': usuario.email,
            'tipo_usuario': usuario.tipo_usuario,
            'transportadora_id': usuario.transportadora_id,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }
        
        token = jwt.encode(payload, 'NimoEnergia2024JWT!@#$%', algorithm='HS256')
        
        response_data = {
            'token': token,
            'usuario': usuario.to_dict(),
            'tipo_usuario': usuario.tipo_usuario,
            'transportadora_id': usuario.transportadora_id
        }
        
        return jsonify(response_data), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@auth_bp.route('/verify', methods=['POST'])
def verify_token():
    try:
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'error': 'Token não fornecido'}), 401
        
        if token.startswith('Bearer '):
            token = token[7:]
        
        payload = jwt.decode(token, 'NimoEnergia2024JWT!@#$%', algorithms=['HS256'])
        
        usuario = Usuario.query.get(payload['user_id'])
        if not usuario or not usuario.ativo:
            return jsonify({'error': 'Usuário inválido'}), 401
        
        return jsonify({
            'valid': True,
            'usuario': usuario.to_dict()
        }), 200
        
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expirado'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Token inválido'}), 401
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    # Em uma implementação real, você poderia invalidar o token
    return jsonify({'message': 'Logout realizado com sucesso'}), 200

