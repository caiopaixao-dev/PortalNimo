import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.database import db
from src.routes.auth import auth_bp
from src.routes.transportadoras import transportadoras_bp
from src.routes.documentos import documentos_bp
from src.routes.dashboard import dashboard_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))

# Configurações de segurança
app.config['SECRET_KEY'] = 'NimoEnergia2024!@#$%SecretKey'
app.config['JWT_SECRET_KEY'] = 'NimoEnergia2024JWT!@#$%'

# Configuração CORS para permitir frontend
CORS(app, origins=['*'], supports_credentials=True)

# Configuração do banco de dados SQLite
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'nimoenergia.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configuração de upload
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Criar diretório de uploads se não existir
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Registrar blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(transportadoras_bp, url_prefix='/api/transportadoras')
app.register_blueprint(documentos_bp, url_prefix='/api/documentos')
app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')

# Inicializar banco de dados
db.init_app(app)

with app.app_context():
    db.create_all()
    
    # Importar e executar dados iniciais
    from src.utils.seed_data import seed_database
    seed_database()

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

@app.errorhandler(404)
def not_found(error):
    return {"error": "Endpoint não encontrado"}, 404

@app.errorhandler(500)
def internal_error(error):
    return {"error": "Erro interno do servidor"}, 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)

