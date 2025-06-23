import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.database import init_db
from src.routes.auth import auth_bp
from src.routes.documentos_completo import documentos_bp
from src.routes.transportadoras import transportadoras_bp
from src.routes.dashboard import dashboard_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'nimoenergia_secret_key_2024_mysql'

# Configuração CORS para permitir acesso do frontend
CORS(app, origins=['*'])

# Configuração do banco MySQL
app.config['MYSQL_HOST'] = 'fugfonv8odxxolj8.cbetxkdyhwsb.us-east-1.rds.amazonaws.com'
app.config['MYSQL_USER'] = 'edttq20pfaonerfj'
app.config['MYSQL_PASSWORD'] = 'h7ct54kqdpnjjvzm'
app.config['MYSQL_DATABASE'] = 'mzjro6x26vwcuwql'

# Inicializa conexão com banco
init_db(app)

# Registra blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(documentos_bp, url_prefix='/api/documentos')
app.register_blueprint(transportadoras_bp, url_prefix='/api/transportadoras')
app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')

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

@app.route('/api/health')
def health_check():
    return {'status': 'ok', 'message': 'Portal NIMOENERGIA Backend funcionando!'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

