from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Usuario(db.Model):
    __tablename__ = 'usuarios'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    senha_hash = db.Column(db.String(255), nullable=False)
    nome = db.Column(db.String(255), nullable=False)
    tipo_usuario = db.Column(db.Enum('ADMIN', 'TRANSPORTADORA', name='tipo_usuario_enum'), nullable=False)
    ativo = db.Column(db.Boolean, default=True)
    transportadora_id = db.Column(db.Integer, db.ForeignKey('transportadoras.id'), nullable=True)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    data_ultimo_acesso = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    transportadora = db.relationship('Transportadora', backref='usuarios')
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'nome': self.nome,
            'tipo_usuario': self.tipo_usuario,
            'ativo': self.ativo,
            'transportadora_id': self.transportadora_id,
            'data_criacao': self.data_criacao.isoformat() if self.data_criacao else None,
            'data_ultimo_acesso': self.data_ultimo_acesso.isoformat() if self.data_ultimo_acesso else None
        }

class Transportadora(db.Model):
    __tablename__ = 'transportadoras'
    
    id = db.Column(db.Integer, primary_key=True)
    cnpj = db.Column(db.String(18), unique=True, nullable=False)
    razao_social = db.Column(db.String(255), nullable=False)
    nome_fantasia = db.Column(db.String(255))
    endereco = db.Column(db.Text)
    cidade = db.Column(db.String(100))
    estado = db.Column(db.String(2))
    cep = db.Column(db.String(10))
    telefone = db.Column(db.String(20))
    email_contato = db.Column(db.String(255))
    responsavel_nome = db.Column(db.String(255))
    responsavel_cpf = db.Column(db.String(14))
    responsavel_cargo = db.Column(db.String(100))
    status_cadastro = db.Column(db.Enum('PENDENTE', 'APROVADO', 'SUSPENSO', name='status_cadastro_enum'), default='PENDENTE')
    data_cadastro = db.Column(db.DateTime, default=datetime.utcnow)
    data_aprovacao = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'cnpj': self.cnpj,
            'razao_social': self.razao_social,
            'nome_fantasia': self.nome_fantasia,
            'endereco': self.endereco,
            'cidade': self.cidade,
            'estado': self.estado,
            'cep': self.cep,
            'telefone': self.telefone,
            'email_contato': self.email_contato,
            'responsavel_nome': self.responsavel_nome,
            'responsavel_cpf': self.responsavel_cpf,
            'responsavel_cargo': self.responsavel_cargo,
            'status_cadastro': self.status_cadastro,
            'data_cadastro': self.data_cadastro.isoformat() if self.data_cadastro else None,
            'data_aprovacao': self.data_aprovacao.isoformat() if self.data_aprovacao else None
        }

class TipoDocumento(db.Model):
    __tablename__ = 'tipos_documento'
    
    id = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(50), unique=True, nullable=False)
    nome = db.Column(db.String(255), nullable=False)
    descricao = db.Column(db.Text)
    tem_vencimento = db.Column(db.Boolean, default=False)
    tem_garantia = db.Column(db.Boolean, default=False)
    obrigatorio = db.Column(db.Boolean, default=True)
    categoria = db.Column(db.Enum('EMPRESA', 'SEGURO', 'AMBIENTAL', name='categoria_enum'), nullable=False)
    ativo = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'codigo': self.codigo,
            'nome': self.nome,
            'descricao': self.descricao,
            'tem_vencimento': self.tem_vencimento,
            'tem_garantia': self.tem_garantia,
            'obrigatorio': self.obrigatorio,
            'categoria': self.categoria,
            'ativo': self.ativo
        }

class Documento(db.Model):
    __tablename__ = 'documentos'
    
    id = db.Column(db.Integer, primary_key=True)
    transportadora_id = db.Column(db.Integer, db.ForeignKey('transportadoras.id'), nullable=False)
    tipo_documento_id = db.Column(db.Integer, db.ForeignKey('tipos_documento.id'), nullable=False)
    nome_arquivo = db.Column(db.String(255), nullable=False)
    caminho_arquivo = db.Column(db.String(500), nullable=False)
    tamanho_arquivo = db.Column(db.BigInteger, nullable=False)
    tipo_mime = db.Column(db.String(100), nullable=False)
    data_upload = db.Column(db.DateTime, default=datetime.utcnow)
    data_vencimento = db.Column(db.Date, nullable=True)
    valor_garantia = db.Column(db.Numeric(15, 2), nullable=True)
    status = db.Column(db.Enum('PENDENTE', 'APROVADO', 'REJEITADO', 'VENCIDO', name='status_documento_enum'), default='PENDENTE')
    observacoes = db.Column(db.Text)
    aprovado_por = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=True)
    data_aprovacao = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    transportadora = db.relationship('Transportadora', backref='documentos')
    tipo_documento = db.relationship('TipoDocumento', backref='documentos')
    aprovador = db.relationship('Usuario', backref='documentos_aprovados')
    
    def to_dict(self):
        return {
            'id': self.id,
            'transportadora_id': self.transportadora_id,
            'tipo_documento_id': self.tipo_documento_id,
            'nome_arquivo': self.nome_arquivo,
            'tamanho_arquivo': self.tamanho_arquivo,
            'tipo_mime': self.tipo_mime,
            'data_upload': self.data_upload.isoformat() if self.data_upload else None,
            'data_vencimento': self.data_vencimento.isoformat() if self.data_vencimento else None,
            'valor_garantia': float(self.valor_garantia) if self.valor_garantia else None,
            'status': self.status,
            'observacoes': self.observacoes,
            'aprovado_por': self.aprovado_por,
            'data_aprovacao': self.data_aprovacao.isoformat() if self.data_aprovacao else None,
            'tipo_documento': self.tipo_documento.to_dict() if self.tipo_documento else None,
            'transportadora': self.transportadora.to_dict() if self.transportadora else None
        }

class HistoricoDocumento(db.Model):
    __tablename__ = 'historico_documentos'
    
    id = db.Column(db.Integer, primary_key=True)
    documento_id = db.Column(db.Integer, db.ForeignKey('documentos.id'), nullable=False)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    acao = db.Column(db.Enum('UPLOAD', 'APROVACAO', 'REJEICAO', 'VENCIMENTO', 'EDICAO', name='acao_enum'), nullable=False)
    status_anterior = db.Column(db.String(50))
    status_novo = db.Column(db.String(50))
    observacoes = db.Column(db.Text)
    data_acao = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    documento = db.relationship('Documento', backref='historico')
    usuario = db.relationship('Usuario', backref='acoes_historico')
    
    def to_dict(self):
        return {
            'id': self.id,
            'documento_id': self.documento_id,
            'usuario_id': self.usuario_id,
            'acao': self.acao,
            'status_anterior': self.status_anterior,
            'status_novo': self.status_novo,
            'observacoes': self.observacoes,
            'data_acao': self.data_acao.isoformat() if self.data_acao else None,
            'usuario': self.usuario.to_dict() if self.usuario else None
        }

class Notificacao(db.Model):
    __tablename__ = 'notificacoes'
    
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    transportadora_id = db.Column(db.Integer, db.ForeignKey('transportadoras.id'), nullable=True)
    documento_id = db.Column(db.Integer, db.ForeignKey('documentos.id'), nullable=True)
    tipo = db.Column(db.Enum('VENCIMENTO', 'APROVACAO', 'REJEICAO', 'CADASTRO', 'SISTEMA', name='tipo_notificacao_enum'), nullable=False)
    titulo = db.Column(db.String(255), nullable=False)
    mensagem = db.Column(db.Text, nullable=False)
    lida = db.Column(db.Boolean, default=False)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    data_leitura = db.Column(db.DateTime, nullable=True)
    
    # Relacionamentos
    usuario = db.relationship('Usuario', backref='notificacoes')
    transportadora = db.relationship('Transportadora', backref='notificacoes')
    documento = db.relationship('Documento', backref='notificacoes')
    
    def to_dict(self):
        return {
            'id': self.id,
            'usuario_id': self.usuario_id,
            'transportadora_id': self.transportadora_id,
            'documento_id': self.documento_id,
            'tipo': self.tipo,
            'titulo': self.titulo,
            'mensagem': self.mensagem,
            'lida': self.lida,
            'data_criacao': self.data_criacao.isoformat() if self.data_criacao else None,
            'data_leitura': self.data_leitura.isoformat() if self.data_leitura else None
        }

