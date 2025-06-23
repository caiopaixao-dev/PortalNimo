from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='transportadora')  # 'admin' ou 'transportadora'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relacionamento com transportadora (se for usuário de transportadora)
    transportadora_id = db.Column(db.Integer, db.ForeignKey('transportadora.id'), nullable=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.username}>'

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_active': self.is_active,
            'transportadora_id': self.transportadora_id
        }

class Transportadora(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(200), nullable=False)
    cnpj = db.Column(db.String(18), unique=True, nullable=False)
    razao_social = db.Column(db.String(200), nullable=False)
    endereco = db.Column(db.Text, nullable=True)
    telefone = db.Column(db.String(20), nullable=True)
    email = db.Column(db.String(120), nullable=True)
    responsavel = db.Column(db.String(100), nullable=True)
    status = db.Column(db.String(20), default='ativa')  # 'ativa', 'inativa', 'pendente'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    usuarios = db.relationship('User', backref='transportadora', lazy=True)
    documentos = db.relationship('Documento', backref='transportadora', lazy=True)

    def __repr__(self):
        return f'<Transportadora {self.nome}>'

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'cnpj': self.cnpj,
            'razao_social': self.razao_social,
            'endereco': self.endereco,
            'telefone': self.telefone,
            'email': self.email,
            'responsavel': self.responsavel,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class TipoDocumento(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    descricao = db.Column(db.Text, nullable=True)
    obrigatorio = db.Column(db.Boolean, default=True)
    categoria = db.Column(db.String(50), nullable=False)  # 'veiculo', 'motorista', 'societario', 'seguro', 'certificacao'
    validade_dias = db.Column(db.Integer, nullable=True)  # Quantos dias antes do vencimento alertar
    formatos_aceitos = db.Column(db.String(200), default='pdf,jpg,jpeg,png,docx')
    tamanho_max_mb = db.Column(db.Integer, default=5)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    documentos = db.relationship('Documento', backref='tipo_documento', lazy=True)

    def __repr__(self):
        return f'<TipoDocumento {self.nome}>'

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'descricao': self.descricao,
            'obrigatorio': self.obrigatorio,
            'categoria': self.categoria,
            'validade_dias': self.validade_dias,
            'formatos_aceitos': self.formatos_aceitos.split(',') if self.formatos_aceitos else [],
            'tamanho_max_mb': self.tamanho_max_mb,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Documento(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome_arquivo = db.Column(db.String(255), nullable=False)
    nome_original = db.Column(db.String(255), nullable=False)
    caminho_arquivo = db.Column(db.String(500), nullable=False)
    tamanho_bytes = db.Column(db.Integer, nullable=False)
    tipo_mime = db.Column(db.String(100), nullable=False)
    
    # Relacionamentos
    transportadora_id = db.Column(db.Integer, db.ForeignKey('transportadora.id'), nullable=False)
    tipo_documento_id = db.Column(db.Integer, db.ForeignKey('tipo_documento.id'), nullable=False)
    
    # Datas
    data_upload = db.Column(db.DateTime, default=datetime.utcnow)
    data_vencimento = db.Column(db.Date, nullable=True)
    data_aprovacao = db.Column(db.DateTime, nullable=True)
    data_rejeicao = db.Column(db.DateTime, nullable=True)
    
    # Status e aprovação
    status = db.Column(db.String(20), default='pendente')  # 'pendente', 'aprovado', 'rejeitado', 'vencido'
    observacoes = db.Column(db.Text, nullable=True)
    aprovado_por = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    
    # Metadados
    hash_arquivo = db.Column(db.String(64), nullable=True)  # Para verificar integridade
    versao = db.Column(db.Integer, default=1)

    def __repr__(self):
        return f'<Documento {self.nome_original}>'

    def to_dict(self):
        return {
            'id': self.id,
            'nome_arquivo': self.nome_arquivo,
            'nome_original': self.nome_original,
            'tamanho_bytes': self.tamanho_bytes,
            'tipo_mime': self.tipo_mime,
            'transportadora_id': self.transportadora_id,
            'tipo_documento_id': self.tipo_documento_id,
            'data_upload': self.data_upload.isoformat() if self.data_upload else None,
            'data_vencimento': self.data_vencimento.isoformat() if self.data_vencimento else None,
            'data_aprovacao': self.data_aprovacao.isoformat() if self.data_aprovacao else None,
            'data_rejeicao': self.data_rejeicao.isoformat() if self.data_rejeicao else None,
            'status': self.status,
            'observacoes': self.observacoes,
            'aprovado_por': self.aprovado_por,
            'versao': self.versao,
            'transportadora': self.transportadora.to_dict() if self.transportadora else None,
            'tipo_documento': self.tipo_documento.to_dict() if self.tipo_documento else None
        }

class Notificacao(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)
    mensagem = db.Column(db.Text, nullable=False)
    tipo = db.Column(db.String(20), nullable=False)  # 'vencimento', 'aprovacao', 'rejeicao', 'sistema'
    
    # Relacionamentos
    usuario_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    documento_id = db.Column(db.Integer, db.ForeignKey('documento.id'), nullable=True)
    
    # Status
    lida = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    usuario = db.relationship('User', backref='notificacoes')
    documento = db.relationship('Documento', backref='notificacoes')

    def __repr__(self):
        return f'<Notificacao {self.titulo}>'

    def to_dict(self):
        return {
            'id': self.id,
            'titulo': self.titulo,
            'mensagem': self.mensagem,
            'tipo': self.tipo,
            'usuario_id': self.usuario_id,
            'documento_id': self.documento_id,
            'lida': self.lida,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

