import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

config = load_dotenv(".env.example") 

class Config:
    """Configuração base"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key-change-in-production'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    
    # Configuração do banco de dados
    MYSQL_HOST = os.environ.get('DB_HOST') or 'localhost'
    MYSQL_USER = os.environ.get('DB_USER') or 'root'
    MYSQL_PASSWORD = os.environ.get('DB_PASSWORD') or ''
    MYSQL_DATABASE = os.environ.get('DB_NAME') or 'nimoenergia_portal'
    
    # Upload de arquivos
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER') or 'uploads'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    
    # CORS
    CORS_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"]

class DevelopmentConfig(Config):
    """Configuração para desenvolvimento"""
    DEBUG = True
    TESTING = False

class ProductionConfig(Config):
    """Configuração para produção"""
    DEBUG = False
    TESTING = False
    
    # Em produção, use variáveis de ambiente
    MYSQL_HOST = os.environ.get('DB_HOST')
    MYSQL_USER = os.environ.get('DB_USER')
    MYSQL_PASSWORD = os.environ.get('DB_PASSWORD')
    MYSQL_DATABASE = os.environ.get('DB_NAME')
    
    # CORS para produção
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '').split(',')

class TestingConfig(Config):
    """Configuração para testes"""
    DEBUG = True
    TESTING = True
    MYSQL_DATABASE = 'nimoenergia_portal_test'

# Configurações disponíveis
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

