from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class Usuario(db.Model):
    __tablename__ = 'usuarios'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    senha_hash = db.Column(db.String(255), nullable=False)
    nome = db.Column(db.String(100), nullable=False)
    tipo = db.Column(db.Enum('ADMIN', 'TRANSPORTADORA', name='tipo_usuario'), nullable=False)
    id_transportadora = db.Column(db.Integer, db.ForeignKey('transportadoras.id'), nullable=True)
    ativo = db.Column(db.Boolean, default=True)
    data_criacao = db.Column(db.DateTime, default=datetime.now)
    ultimo_login = db.Column(db.DateTime)
    
    # Relacionamentos
    transportadora = db.relationship('Transportadora', backref='usuarios')
    
    def set_password(self, password):
        self.senha_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.senha_hash, password)

class Transportadora(db.Model):
    __tablename__ = 'transportadoras'
    
    id = db.Column(db.Integer, primary_key=True)
    cnpj = db.Column(db.String(18), unique=True, nullable=False)
    razao_social = db.Column(db.String(200), nullable=False)
    nome_fantasia = db.Column(db.String(200))
    endereco = db.Column(db.Text)
    telefone = db.Column(db.String(20))
    email = db.Column(db.String(120))
    responsavel_nome = db.Column(db.String(100))
    responsavel_cpf = db.Column(db.String(14))
    responsavel_telefone = db.Column(db.String(20))
    status = db.Column(db.Enum('ATIVA', 'INATIVA', 'PENDENTE', name='status_transportadora'), default='PENDENTE')
    data_cadastro = db.Column(db.DateTime, default=datetime.now)
    data_ultima_atualizacao = db.Column(db.DateTime, default=datetime.now)

class TipoDocumento(db.Model):
    __tablename__ = 'tipos_documento'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    descricao = db.Column(db.Text)
    requer_vencimento = db.Column(db.Boolean, default=False)
    requer_garantia = db.Column(db.Boolean, default=False)
    ativo = db.Column(db.Boolean, default=True)
    ordem_exibicao = db.Column(db.Integer, default=0)

class Documento(db.Model):
    __tablename__ = 'documentos'
    
    id = db.Column(db.Integer, primary_key=True)
    id_transportadora = db.Column(db.Integer, db.ForeignKey('transportadoras.id'), nullable=False)
    id_tipo_documento = db.Column(db.Integer, db.ForeignKey('tipos_documento.id'), nullable=False)
    nome_original = db.Column(db.String(255), nullable=False)
    nome_arquivo = db.Column(db.String(255), nullable=False)  # Nome criptografado
    caminho_arquivo = db.Column(db.String(500), nullable=False)
    tamanho_arquivo = db.Column(db.Integer)
    hash_arquivo = db.Column(db.String(64))  # SHA-256
    data_upload = db.Column(db.DateTime, default=datetime.now)
    data_vencimento = db.Column(db.Date)
    valor_garantia = db.Column(db.Numeric(15, 2))
    observacoes = db.Column(db.Text)
    status = db.Column(db.Enum('PENDENTE', 'APROVADO', 'REJEITADO', 'VENCIDO', name='status_documento'), default='PENDENTE')
    data_aprovacao = db.Column(db.DateTime)
    id_usuario_aprovacao = db.Column(db.Integer, db.ForeignKey('usuarios.id'))
    observacoes_aprovacao = db.Column(db.Text)
    
    # Relacionamentos
    transportadora = db.relationship('Transportadora', backref='documentos')
    tipo_documento = db.relationship('TipoDocumento', backref='documentos')
    usuario_aprovacao = db.relationship('Usuario', backref='documentos_aprovados')

class LogAcesso(db.Model):
    __tablename__ = 'logs_acesso'
    
    id = db.Column(db.Integer, primary_key=True)
    id_usuario = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    id_documento = db.Column(db.Integer, db.ForeignKey('documentos.id'))
    acao = db.Column(db.String(50), nullable=False)  # LOGIN, UPLOAD, DOWNLOAD, APROVACAO, etc.
    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.Text)
    data_acao = db.Column(db.DateTime, default=datetime.now)
    detalhes = db.Column(db.Text)
    
    # Relacionamentos
    usuario = db.relationship('Usuario', backref='logs_acesso')
    documento = db.relationship('Documento', backref='logs_acesso')


    def to_dict(self):
        """Converte objeto para dicionário"""
        return {
            'id': self.id,
            'razao_social': self.razao_social,
            'nome_fantasia': self.nome_fantasia,
            'cnpj': self.cnpj,
            'email': self.email,
            'telefone': self.telefone,
            'endereco': self.endereco,
            'cidade': self.cidade,
            'estado': self.estado,
            'cep': self.cep,
            'data_cadastro': self.data_cadastro.isoformat() if self.data_cadastro else None,
            'ativo': self.ativo
        }

