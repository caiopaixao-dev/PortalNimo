import os
import sys
# DON'T CHANGE THIS LINE
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from flask_cors import CORS
from models.user import db, Usuario, Transportadora, TipoDocumento, Documento
from routes.auth import auth_bp
from routes.user import user_bp
from routes.upload import upload_bp
from datetime import datetime

def create_app():
    app = Flask(__name__)
    
    # Configurações
    app.config['SECRET_KEY'] = 'nimoenergia-secret-key-2024'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///nimoenergia.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
    
    # Inicializar extensões
    db.init_app(app)
    CORS(app, origins="*")
    
    # Registrar blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(user_bp, url_prefix='/api/users')
    app.register_blueprint(upload_bp, url_prefix='/api/upload')
    
    return app

def init_database():
    """Inicializa o banco de dados com dados de teste"""
    db.create_all()
    
    # Verificar se já existem dados
    if Usuario.query.first():
        return
    
    # Criar transportadoras de teste
    transportadora1 = Transportadora(
        cnpj='12.345.678/0001-90',
        razao_social='Transportes Silva Ltda',
        nome_fantasia='Silva Transportes',
        endereco='Rua das Flores, 123 - São Paulo/SP',
        telefone='(11) 99999-9999',
        email='contato@silvatransportes.com.br',
        responsavel_nome='João Silva',
        responsavel_cpf='123.456.789-00',
        responsavel_telefone='(11) 88888-8888',
        status='ATIVA'
    )
    
    transportadora2 = Transportadora(
        cnpj='98.765.432/0001-10',
        razao_social='Logística Santos S.A.',
        nome_fantasia='Santos Log',
        endereco='Av. Industrial, 456 - Santos/SP',
        telefone='(13) 77777-7777',
        email='contato@santoslog.com.br',
        responsavel_nome='Maria Santos',
        responsavel_cpf='987.654.321-00',
        responsavel_telefone='(13) 66666-6666',
        status='ATIVA'
    )
    
    transportadora3 = Transportadora(
        cnpj='11.222.333/0001-44',
        razao_social='Frota Rápida Transportes',
        nome_fantasia='Frota Rápida',
        endereco='Rod. BR-101, Km 50 - Guarulhos/SP',
        telefone='(11) 55555-5555',
        email='contato@frotarapida.com.br',
        responsavel_nome='Carlos Oliveira',
        responsavel_cpf='111.222.333-44',
        responsavel_telefone='(11) 44444-4444',
        status='ATIVA'
    )
    
    db.session.add_all([transportadora1, transportadora2, transportadora3])
    db.session.commit()
    
    # Criar tipos de documento
    tipos_documento = [
        TipoDocumento(nome='DOC SOCIETÁRIO', descricao='Estatuto / ATA / Contrato Social', ordem_exibicao=1),
        TipoDocumento(nome='COMPROVANTE DE ENDEREÇO', descricao='Vencimento 6 meses após emissão', requer_vencimento=True, ordem_exibicao=2),
        TipoDocumento(nome='DOCS SÓCIOS', descricao='RG/CPF ou CNH', ordem_exibicao=3),
        TipoDocumento(nome='SEGURO RCF-DC', descricao='Vencimento da apólice e garantia', requer_vencimento=True, requer_garantia=True, ordem_exibicao=4),
        TipoDocumento(nome='SEGURO RCTR-C', descricao='Vencimento da apólice e garantia', requer_vencimento=True, requer_garantia=True, ordem_exibicao=5),
        TipoDocumento(nome='SEGURO AMBIENTAL', descricao='Vencimento da apólice e garantia', requer_vencimento=True, requer_garantia=True, ordem_exibicao=6),
        TipoDocumento(nome='PGR', descricao='Programa de Gerenciamento de Riscos', requer_vencimento=True, ordem_exibicao=7),
        TipoDocumento(nome='PAE', descricao='Plano de Emergência', requer_vencimento=True, ordem_exibicao=8),
        TipoDocumento(nome='AATIPP (IBAMA)', descricao='Vencimento AATIPP', requer_vencimento=True, ordem_exibicao=9),
        TipoDocumento(nome='CR/IBAMA', descricao='Certificado de Regularidade', requer_vencimento=True, ordem_exibicao=10),
        TipoDocumento(nome='LICENÇA AMBIENTAL ESTADUAL', descricao='Vencimento da licença', requer_vencimento=True, ordem_exibicao=11),
        TipoDocumento(nome='ALVARÁ DE FUNCIONAMENTO', descricao='Vencimento do alvará', requer_vencimento=True, ordem_exibicao=12),
        TipoDocumento(nome='ANTT - PJ', descricao='Registro ANTT Pessoa Jurídica', ordem_exibicao=13)
    ]
    
    db.session.add_all(tipos_documento)
    db.session.commit()
    
    # Criar usuários de teste
    admin = Usuario(
        email='admin@nimoenergia.com.br',
        nome='Administrador NIMOENERGIA',
        tipo='ADMIN'
    )
    admin.set_password('senha123')
    
    user1 = Usuario(
        email='silva@silvatransportes.com.br',
        nome='João Silva',
        tipo='TRANSPORTADORA',
        id_transportadora=transportadora1.id
    )
    user1.set_password('senha123')
    
    user2 = Usuario(
        email='santos@santoslog.com.br',
        nome='Maria Santos',
        tipo='TRANSPORTADORA',
        id_transportadora=transportadora2.id
    )
    user2.set_password('senha123')
    
    user3 = Usuario(
        email='frota@frotarapida.com.br',
        nome='Carlos Oliveira',
        tipo='TRANSPORTADORA',
        id_transportadora=transportadora3.id
    )
    user3.set_password('senha123')
    
    db.session.add_all([admin, user1, user2, user3])
    db.session.commit()
    
    print("✅ Banco de dados inicializado com dados de teste!")
    print("👤 Usuários criados:")
    print("   Admin: admin@nimoenergia.com.br / senha123")
    print("   Transportadora 1: silva@silvatransportes.com.br / senha123")
    print("   Transportadora 2: santos@santoslog.com.br / senha123")
    print("   Transportadora 3: frota@frotarapida.com.br / senha123")

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        init_database()
    
    app.run(host='0.0.0.0', port=5000, debug=True)

