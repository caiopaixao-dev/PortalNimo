from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os

# Importar configurações
from config import config

# Importar blueprints
from src.routes.auth import auth_bp
from src.routes.dashboard import dashboard_bp
from src.routes.documentos_completo import documentos_bp
from src.routes.transportadoras import transportadoras_bp

def create_app(config_name=None):
    """Factory function para criar a aplicação Flask"""
    app = Flask(__name__)
    
    # Configuração
    config_name = config_name or os.environ.get('FLASK_ENV', 'development')
    app.config.from_object(config[config_name])
    
    # Extensões
    CORS(app, origins=app.config['CORS_ORIGINS'])
    jwt = JWTManager(app)
    
    # Criar diretório de uploads
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Registrar blueprints
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(dashboard_bp, url_prefix='/api')
    app.register_blueprint(documentos_bp, url_prefix='/api')
    app.register_blueprint(transportadoras_bp, url_prefix='/api')
    
    # Rota de health check
    @app.route('/api/health')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'message': 'Portal NIMOENERGIA API está funcionando',
            'version': '1.0.0'
        })
    
    # Rota raiz
    @app.route('/')
    def index():
        return jsonify({
            'message': 'Portal NIMOENERGIA API',
            'version': '1.0.0',
            'endpoints': {
                'health': '/api/health',
                'auth': '/api/auth/*',
                'dashboard': '/api/dashboard/*',
                'documentos': '/api/documentos/*',
                'transportadoras': '/api/transportadoras/*'
            }
        })
    
    # Handler de erro para JWT
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({'message': 'Token expirado'}), 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({'message': 'Token inválido'}), 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({'message': 'Token de autorização necessário'}), 401
    
    return app

# Para desenvolvimento direto
if __name__ == '__main__':
    app = create_app()
    app.run(
        host='0.0.0.0',
        port=int(os.environ.get('PORT', 5000)),
        debug=True
    )

