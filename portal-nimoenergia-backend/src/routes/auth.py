from flask import Blueprint, request, jsonify, session
from werkzeug.security import check_password_hash
from datetime import datetime, timedelta
import jwt
import os
from models.user import db, Usuario, Transportadora, TipoDocumento, Documento

auth_bp = Blueprint('auth', __name__)

# Chave secreta para JWT (em produção, usar variável de ambiente)
JWT_SECRET = os.environ.get('JWT_SECRET', 'nimoenergia-secret-key-2024')
JWT_EXPIRATION_HOURS = 24

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Endpoint de login único
    Identifica automaticamente o tipo de usuário e retorna dados apropriados
    """
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({
                'success': False,
                'message': 'Email e senha são obrigatórios'
            }), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        
        # Buscar usuário no banco
        usuario = Usuario.query.filter_by(email=email).first()
        
        if not usuario:
            return jsonify({
                'success': False,
                'message': 'Credenciais inválidas'
            }), 401
        
        # Verificar se usuário está ativo
        if not usuario.ativo:
            return jsonify({
                'success': False,
                'message': 'Usuário inativo ou bloqueado'
            }), 401
        
        # Verificar senha
        if not usuario.check_password(password):
            # Incrementar tentativas de login
            usuario.tentativas_login += 1
            if usuario.tentativas_login >= 5:
                usuario.status = 'BLOQUEADO'
            db.session.commit()
            
            return jsonify({
                'success': False,
                'message': 'Credenciais inválidas'
            }), 401
        
        # Login bem-sucedido - resetar tentativas e atualizar último acesso
        usuario.tentativas_login = 0
        usuario.ultimo_acesso = datetime.utcnow()
        db.session.commit()
        
        # Gerar token JWT
        payload = {
            'user_id': usuario.id,
            'email': usuario.email,
            'tipo': usuario.tipo,
            'id_transportadora': usuario.id_transportadora,
            'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
        }
        
        token = jwt.encode(payload, JWT_SECRET, algorithm='HS256')
        
        # Preparar resposta baseada no tipo de usuário
        response_data = {
            'success': True,
            'message': 'Login realizado com sucesso',
            'token': token,
            'user': {
                'id': usuario.id,
                'email': usuario.email,
                'nome': usuario.nome,
                'tipo': usuario.tipo,
                'id_transportadora': usuario.id_transportadora
            }
        }
        
        # Se for transportadora, incluir dados da empresa
        if usuario.tipo == 'TRANSPORTADORA' and usuario.id_transportadora:
            transportadora = Transportadora.query.get(usuario.id_transportadora)
            if transportadora:
                response_data['transportadora'] = transportadora.to_dict()
        
        return jsonify(response_data), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Erro interno do servidor: {str(e)}'
        }), 500

@auth_bp.route('/verify-token', methods=['POST'])
def verify_token():
    """
    Verifica se o token JWT é válido
    """
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return jsonify({
                'success': False,
                'message': 'Token não fornecido'
            }), 401
        
        # Decodificar token
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        
        # Verificar se usuário ainda existe e está ativo
        usuario = Usuario.query.get(payload['user_id'])
        if not usuario or not usuario.ativo:
            return jsonify({
                'success': False,
                'message': 'Token inválido'
            }), 401
        
        return jsonify({
            'success': True,
            'user': {
                'id': usuario.id,
                'email': usuario.email,
                'nome': usuario.nome,
                'tipo': usuario.tipo,
                'id_transportadora': usuario.id_transportadora
            }
        }), 200
        
    except jwt.ExpiredSignatureError:
        return jsonify({
            'success': False,
            'message': 'Token expirado'
        }), 401
    except jwt.InvalidTokenError:
        return jsonify({
            'success': False,
            'message': 'Token inválido'
        }), 401
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Erro interno: {str(e)}'
        }), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """
    Endpoint de logout (principalmente para limpar dados do frontend)
    """
    return jsonify({
        'success': True,
        'message': 'Logout realizado com sucesso'
    }), 200

@auth_bp.route('/dashboard-data', methods=['GET'])
def get_dashboard_data():
    """
    Retorna dados do dashboard baseado no tipo de usuário
    """
    try:
        # Verificar token no header Authorization
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'success': False,
                'message': 'Token de autorização necessário'
            }), 401
        
        token = auth_header.split(' ')[1]
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        
        usuario = Usuario.query.get(payload['user_id'])
        if not usuario or usuario.status != 'ATIVO':
            return jsonify({
                'success': False,
                'message': 'Usuário inválido'
            }), 401
        
        if usuario.tipo == 'ADMIN':
            # Dados para dashboard administrativo
            dashboard_data = {
                'tipo': 'ADMIN',
                'metricas': {
                    'total_transportadoras': Transportadora.query.filter_by(status='ATIVA').count(),
                    'docs_aprovados': 12847,  # Dados simulados baseados no portal
                    'docs_pendentes': 23,
                    'taxa_conformidade': 94.2
                },
                'transportadoras_performance': [
                    {
                        'id': 1,
                        'razao_social': 'Transportes Silva Ltda',
                        'taxa_conformidade': 98.5,
                        'classificacao': 'EXCELENTE',
                        'ultima_atualizacao': '2024-06-15'
                    },
                    {
                        'id': 2,
                        'razao_social': 'Logística Santos S.A.',
                        'taxa_conformidade': 85.2,
                        'classificacao': 'BOM',
                        'ultima_atualizacao': '2024-06-10'
                    },
                    {
                        'id': 3,
                        'razao_social': 'Frota Rápida Transportes',
                        'taxa_conformidade': 76.8,
                        'classificacao': 'REGULAR',
                        'ultima_atualizacao': '2024-06-08'
                    }
                ],
                'alertas_compliance': [
                    {
                        'tipo': 'VENCIMENTO',
                        'descricao': '3 documentos vencem em 30 dias',
                        'transportadora': 'Frota Rápida Transportes',
                        'prioridade': 'ALTA'
                    },
                    {
                        'tipo': 'CONFORMIDADE',
                        'descricao': 'Taxa abaixo de 80%',
                        'transportadora': 'Frota Rápida Transportes',
                        'prioridade': 'MÉDIA'
                    }
                ]
            }
        else:
            # Dados para dashboard da transportadora
            transportadora = Transportadora.query.get(usuario.id_transportadora)
            dashboard_data = {
                'tipo': 'TRANSPORTADORA',
                'transportadora': transportadora.to_dict() if transportadora else None,
                'metricas': {
                    'docs_enviados': 8,
                    'docs_aprovados': 6,
                    'docs_pendentes': 1,
                    'docs_vencendo': 1,
                    'taxa_conformidade': transportadora.taxa_conformidade if transportadora else 0
                },
                'documentos_recentes': [
                    {
                        'nome': 'Seguro RCF-DC',
                        'status': 'APROVADO',
                        'data_upload': '2024-06-01',
                        'data_vencimento': '2025-06-01'
                    },
                    {
                        'nome': 'PGR',
                        'status': 'PENDENTE',
                        'data_upload': '2024-06-10',
                        'data_vencimento': '2025-06-10'
                    }
                ]
            }
        
        return jsonify({
            'success': True,
            'data': dashboard_data
        }), 200
        
    except jwt.ExpiredSignatureError:
        return jsonify({
            'success': False,
            'message': 'Token expirado'
        }), 401
    except jwt.InvalidTokenError:
        return jsonify({
            'success': False,
            'message': 'Token inválido'
        }), 401
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Erro interno: {str(e)}'
        }), 500



# Decorator para proteger rotas que requerem autenticação
def token_required(f):
    """
    Decorator para proteger rotas que requerem autenticação
    """
    from functools import wraps
    
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Verificar se token está no header Authorization
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # Bearer TOKEN
            except IndexError:
                return jsonify({'error': 'Token malformado'}), 401
        
        if not token:
            return jsonify({'error': 'Token não fornecido'}), 401
        
        try:
            # Decodificar token
            payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            current_user = Usuario.query.get(payload['user_id'])
            
            if not current_user or not current_user.ativo:
                return jsonify({'error': 'Token inválido'}), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expirado'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token inválido'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

