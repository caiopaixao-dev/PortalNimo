from flask import Blueprint, request, jsonify
import bcrypt
import jwt
from datetime import datetime, timedelta
from src.models.database import execute_query

auth_bp = Blueprint('auth', __name__)

def generate_token(user_data):
    """Gera token JWT para o usuário"""
    payload = {
        'user_id': user_data['id_usuario'],
        'email': user_data['email'],
        'tipo_usuario': user_data['tipo_usuario'],
        'id_transportadora': user_data.get('id_transportadora'),
        'exp': datetime.utcnow() + timedelta(hours=24)
    }
    
    return jwt.encode(payload, 'nimoenergia_secret_key_2024_mysql', algorithm='HS256')

def verify_password(password, hashed_password):
    """Verifica se a senha está correta"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

@auth_bp.route('/login', methods=['POST'])
def login():
    """Endpoint de login"""
    try:
        data = request.get_json()
        email = data.get('email')
        senha = data.get('senha')
        
        if not email or not senha:
            return jsonify({'error': 'Email e senha são obrigatórios'}), 400
        
        # Busca usuário no banco
        query = """
        SELECT u.*, t.razao_social, t.nome_fantasia 
        FROM usuarios u 
        LEFT JOIN transportadoras t ON u.id_transportadora = t.id_transportadora 
        WHERE u.email = %s AND u.status_ativo = TRUE
        """
        
        user = execute_query(query, (email,), fetch='one')
        
        if not user:
            return jsonify({'error': 'Usuário não encontrado ou inativo'}), 401
        
        # Verifica senha (para desenvolvimento, aceita senha123)
        if senha == 'senha123' or verify_password(senha, user['senha_hash']):
            # Atualiza último acesso
            update_query = """
            UPDATE usuarios 
            SET ultimo_acesso = NOW(), ip_ultimo_acesso = %s, tentativas_login = 0 
            WHERE id_usuario = %s
            """
            execute_query(update_query, (request.remote_addr, user['id_usuario']))
            
            # Gera token
            token = generate_token(user)
            
            # Prepara resposta
            response_data = {
                'token': token,
                'user': {
                    'id': user['id_usuario'],
                    'nome': user['nome_completo'],
                    'email': user['email'],
                    'tipo': user['tipo_usuario'],
                    'transportadora': {
                        'id': user['id_transportadora'],
                        'razao_social': user.get('razao_social'),
                        'nome_fantasia': user.get('nome_fantasia')
                    } if user['id_transportadora'] else None
                }
            }
            
            return jsonify(response_data), 200
        
        else:
            # Incrementa tentativas de login
            update_query = """
            UPDATE usuarios 
            SET tentativas_login = tentativas_login + 1 
            WHERE id_usuario = %s
            """
            execute_query(update_query, (user['id_usuario'],))
            
            return jsonify({'error': 'Senha incorreta'}), 401
    
    except Exception as e:
        print(f"Erro no login: {e}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

@auth_bp.route('/verify', methods=['POST'])
def verify_token():
    """Verifica se o token é válido"""
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return jsonify({'error': 'Token não fornecido'}), 400
        
        # Decodifica token
        payload = jwt.decode(token, 'nimoenergia_secret_key_2024_mysql', algorithms=['HS256'])
        
        # Busca dados atualizados do usuário
        query = """
        SELECT u.*, t.razao_social, t.nome_fantasia 
        FROM usuarios u 
        LEFT JOIN transportadoras t ON u.id_transportadora = t.id_transportadora 
        WHERE u.id_usuario = %s AND u.status_ativo = TRUE
        """
        
        user = execute_query(query, (payload['user_id'],), fetch='one')
        
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 401
        
        response_data = {
            'valid': True,
            'user': {
                'id': user['id_usuario'],
                'nome': user['nome_completo'],
                'email': user['email'],
                'tipo': user['tipo_usuario'],
                'transportadora': {
                    'id': user['id_transportadora'],
                    'razao_social': user.get('razao_social'),
                    'nome_fantasia': user.get('nome_fantasia')
                } if user['id_transportadora'] else None
            }
        }
        
        return jsonify(response_data), 200
    
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expirado'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Token inválido'}), 401
    except Exception as e:
        print(f"Erro na verificação do token: {e}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Endpoint de logout"""
    return jsonify({'message': 'Logout realizado com sucesso'}), 200

