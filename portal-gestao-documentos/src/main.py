import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.user import db
from src.routes.user import user_bp
from src.routes.auth import auth_bp
from src.routes.transportadora import transportadora_bp
from src.routes.documento import documento_bp
from src.routes.tipo_documento import tipo_documento_bp
from src.routes.dashboard import dashboard_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

# Configurar CORS para permitir acesso do frontend
CORS(app, origins="*", allow_headers=["Content-Type", "Authorization"])

# Registrar blueprints
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(transportadora_bp, url_prefix='/api')
app.register_blueprint(documento_bp, url_prefix='/api')
app.register_blueprint(tipo_documento_bp, url_prefix='/api')
app.register_blueprint(dashboard_bp, url_prefix='/api')

# Configuração do banco de dados
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

db.init_app(app)

# Criar tabelas e dados iniciais
with app.app_context():
    db.create_all()
    
    # Criar usuário admin padrão se não existir
    from src.models.user import User, TipoDocumento
    
    admin_user = User.query.filter_by(email='admin@nimoenergia.com.br').first()
    if not admin_user:
        admin_user = User(
            username='admin_nimoenergia',
            email='admin@nimoenergia.com.br',
            role='admin'
        )
        admin_user.set_password('NimoAdmin2024')
        db.session.add(admin_user)
        db.session.commit()
        print("✅ Usuário admin criado: admin@nimoenergia.com.br / NimoAdmin2024")
    
    # Criar tipos de documento padrão se não existirem
    if TipoDocumento.query.count() == 0:
        tipos_padrao = [
            # Documentos do Veículo
            {'nome': 'CIPP - Certificado de Inspeção para Transporte de Produtos Perigosos', 'categoria': 'veiculo', 'obrigatorio': True, 'validade_dias': 30},
            {'nome': 'CIV - Certificado de Inspeção Veicular', 'categoria': 'veiculo', 'obrigatorio': True, 'validade_dias': 30},
            {'nome': 'Autorização ANP para Transporte', 'categoria': 'veiculo', 'obrigatorio': True, 'validade_dias': 60},
            {'nome': 'Licença Ambiental para Transporte', 'categoria': 'veiculo', 'obrigatorio': True, 'validade_dias': 60},
            
            # Documentos do Motorista
            {'nome': 'CNH com Atividade Remunerada', 'categoria': 'motorista', 'obrigatorio': True, 'validade_dias': 30},
            {'nome': 'Curso MOPP', 'categoria': 'motorista', 'obrigatorio': True, 'validade_dias': 60},
            {'nome': 'DIM - Documento de Identificação do Motorista', 'categoria': 'motorista', 'obrigatorio': True, 'validade_dias': 30},
            {'nome': 'Certificado de Treinamento em Segurança', 'categoria': 'motorista', 'obrigatorio': True, 'validade_dias': 90},
            
            # Documentos Societários
            {'nome': 'Contrato Social', 'categoria': 'societario', 'obrigatorio': True, 'validade_dias': None},
            {'nome': 'Licença de Funcionamento', 'categoria': 'societario', 'obrigatorio': True, 'validade_dias': 90},
            {'nome': 'CNPJ', 'categoria': 'societario', 'obrigatorio': True, 'validade_dias': None},
            {'nome': 'Inscrição Estadual', 'categoria': 'societario', 'obrigatorio': True, 'validade_dias': None},
            {'nome': 'Certidão Negativa Federal', 'categoria': 'societario', 'obrigatorio': True, 'validade_dias': 90},
            
            # Seguros
            {'nome': 'Seguro de Responsabilidade Civil', 'categoria': 'seguro', 'obrigatorio': True, 'validade_dias': 30},
            {'nome': 'RCTRC - Responsabilidade Civil do Transportador', 'categoria': 'seguro', 'obrigatorio': True, 'validade_dias': 30},
            
            # Certificações Técnicas
            {'nome': 'Certificado de Conformidade dos Equipamentos', 'categoria': 'certificacao', 'obrigatorio': True, 'validade_dias': 180},
            {'nome': 'Laudo de Vistoria dos Tanques', 'categoria': 'certificacao', 'obrigatorio': True, 'validade_dias': 180},
        ]
        
        for tipo_data in tipos_padrao:
            tipo_documento = TipoDocumento(**tipo_data)
            db.session.add(tipo_documento)
        
        db.session.commit()
        print("✅ Tipos de documento padrão criados")

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

@app.route('/api/health', methods=['GET'])
def health_check():
    """Endpoint para verificar saúde da API"""
    return {
        'status': 'healthy',
        'message': 'Portal de Gestão de Documentos NIMOENERGIA',
        'version': '1.0.0',
        'endpoints': {
            'auth': '/api/auth/login',
            'dashboard': '/api/dashboard/stats',
            'transportadoras': '/api/transportadoras',
            'documentos': '/api/documentos',
            'tipos_documento': '/api/tipos-documento'
        }
    }, 200

if __name__ == '__main__':
    # Criar diretório de uploads se não existir
    upload_dir = '/home/ubuntu/portal-gestao-documentos/uploads'
    os.makedirs(upload_dir, exist_ok=True)
    
    print("🚀 Portal de Gestão de Documentos NIMOENERGIA")
    print("📊 Dashboard: http://localhost:5000")
    print("🔑 Admin: admin@nimoenergia.com.br / NimoAdmin2024")
    print("🎯 Demo: Clique em 'Acesso de Demonstração'")
    
    app.run(host='0.0.0.0', port=5000, debug=True)

