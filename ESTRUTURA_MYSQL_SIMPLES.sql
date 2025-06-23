-- =====================================================
-- PORTAL NIMOENERGIA - ESTRUTURA MYSQL SIMPLIFICADA
-- Sistema de Gestão de Documentos para Transportadoras
-- =====================================================

-- Configurações iniciais
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- TABELA: configuracoes
-- =====================================================
CREATE TABLE configuracoes (
    id_configuracao INT AUTO_INCREMENT PRIMARY KEY,
    chave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    descricao TEXT,
    tipo_valor VARCHAR(20) DEFAULT 'string',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: tipos_documento
-- =====================================================
CREATE TABLE tipos_documento (
    id_tipo INT AUTO_INCREMENT PRIMARY KEY,
    nome_tipo VARCHAR(100) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(50) NOT NULL,
    subcategoria VARCHAR(50),
    obrigatorio_vencimento BOOLEAN DEFAULT FALSE,
    obrigatorio_garantia BOOLEAN DEFAULT FALSE,
    formatos_aceitos TEXT DEFAULT 'PDF,DOCX,JPG,PNG',
    tamanho_maximo_mb INT DEFAULT 10,
    aprovacao_automatica BOOLEAN DEFAULT FALSE,
    dias_aviso_vencimento INT DEFAULT 30,
    dias_tolerancia INT DEFAULT 5,
    ativo BOOLEAN DEFAULT TRUE,
    ordem_exibicao INT DEFAULT 0,
    icone VARCHAR(50),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: transportadoras
-- =====================================================
CREATE TABLE transportadoras (
    id_transportadora INT AUTO_INCREMENT PRIMARY KEY,
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    razao_social VARCHAR(200) NOT NULL,
    nome_fantasia VARCHAR(200),
    inscricao_estadual VARCHAR(20),
    inscricao_municipal VARCHAR(20),
    antt VARCHAR(20),
    endereco_logradouro VARCHAR(200),
    endereco_numero VARCHAR(10),
    endereco_complemento VARCHAR(100),
    endereco_bairro VARCHAR(100),
    endereco_cidade VARCHAR(100),
    endereco_estado VARCHAR(2),
    endereco_cep VARCHAR(9),
    endereco_pais VARCHAR(50) DEFAULT 'Brasil',
    telefone_principal VARCHAR(20),
    telefone_secundario VARCHAR(20),
    email_corporativo VARCHAR(100),
    email_financeiro VARCHAR(100),
    site VARCHAR(100),
    responsavel_tecnico VARCHAR(100),
    responsavel_financeiro VARCHAR(100),
    banco VARCHAR(100),
    agencia VARCHAR(10),
    conta VARCHAR(20),
    status_ativo BOOLEAN DEFAULT TRUE,
    classificacao_risco VARCHAR(10) DEFAULT 'BAIXO',
    limite_credito DECIMAL(15,2),
    observacoes TEXT,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: usuarios
-- =====================================================
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    id_transportadora INT,
    nome_completo VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(50) NOT NULL,
    telefone VARCHAR(20),
    tipo_usuario VARCHAR(20) NOT NULL,
    status_ativo BOOLEAN DEFAULT TRUE,
    ultimo_acesso TIMESTAMP NULL,
    ip_ultimo_acesso VARCHAR(45),
    tentativas_login INT DEFAULT 0,
    bloqueado_ate TIMESTAMP NULL,
    preferencias_notificacao TEXT DEFAULT '{"email": true, "sms": false, "push": true}',
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    idioma VARCHAR(5) DEFAULT 'pt-BR',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_transportadora) REFERENCES transportadoras(id_transportadora) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: documentos
-- =====================================================
CREATE TABLE documentos (
    id_documento INT AUTO_INCREMENT PRIMARY KEY,
    numero_protocolo VARCHAR(20) UNIQUE NOT NULL,
    id_transportadora INT NOT NULL,
    id_tipo_documento INT NOT NULL,
    id_usuario_upload INT NOT NULL,
    nome_arquivo_original VARCHAR(255) NOT NULL,
    nome_arquivo_sistema VARCHAR(255) NOT NULL,
    caminho_arquivo TEXT NOT NULL,
    tamanho_arquivo BIGINT NOT NULL,
    hash_arquivo VARCHAR(64) NOT NULL,
    mime_type VARCHAR(100),
    data_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_vencimento DATE,
    valor_garantia DECIMAL(15,2),
    status_documento VARCHAR(20) DEFAULT 'PENDENTE',
    data_aprovacao TIMESTAMP NULL,
    id_usuario_aprovacao INT,
    observacoes_analista TEXT,
    motivo_rejeicao TEXT,
    versao_documento INT DEFAULT 1,
    id_documento_anterior INT,
    ip_upload VARCHAR(45),
    user_agent TEXT,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_transportadora) REFERENCES transportadoras(id_transportadora) ON DELETE CASCADE,
    FOREIGN KEY (id_tipo_documento) REFERENCES tipos_documento(id_tipo) ON DELETE RESTRICT,
    FOREIGN KEY (id_usuario_upload) REFERENCES usuarios(id_usuario) ON DELETE RESTRICT,
    FOREIGN KEY (id_usuario_aprovacao) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    FOREIGN KEY (id_documento_anterior) REFERENCES documentos(id_documento) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: historico_documentos
-- =====================================================
CREATE TABLE historico_documentos (
    id_historico INT AUTO_INCREMENT PRIMARY KEY,
    id_documento INT NOT NULL,
    id_usuario INT NOT NULL,
    acao VARCHAR(50) NOT NULL,
    status_anterior VARCHAR(20),
    status_novo VARCHAR(20),
    observacoes TEXT,
    dados_alteracao TEXT,
    ip_origem VARCHAR(45),
    data_acao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_documento) REFERENCES documentos(id_documento) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: notificacoes
-- =====================================================
CREATE TABLE notificacoes (
    id_notificacao INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_documento INT,
    tipo_notificacao VARCHAR(50) NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    mensagem TEXT NOT NULL,
    canal VARCHAR(20) DEFAULT 'EMAIL',
    status_envio VARCHAR(20) DEFAULT 'PENDENTE',
    data_envio TIMESTAMP NULL,
    data_leitura TIMESTAMP NULL,
    tentativas_envio INT DEFAULT 0,
    erro_envio TEXT,
    dados_extras TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_documento) REFERENCES documentos(id_documento) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- ÍNDICES
-- =====================================================
CREATE INDEX idx_configuracoes_chave ON configuracoes(chave);
CREATE INDEX idx_tipos_documento_categoria ON tipos_documento(categoria);
CREATE INDEX idx_tipos_documento_ativo ON tipos_documento(ativo);
CREATE INDEX idx_transportadoras_cnpj ON transportadoras(cnpj);
CREATE INDEX idx_transportadoras_razao_social ON transportadoras(razao_social);
CREATE INDEX idx_transportadoras_status_ativo ON transportadoras(status_ativo);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_tipo ON usuarios(tipo_usuario);
CREATE INDEX idx_usuarios_transportadora ON usuarios(id_transportadora);
CREATE INDEX idx_documentos_protocolo ON documentos(numero_protocolo);
CREATE INDEX idx_documentos_transportadora ON documentos(id_transportadora);
CREATE INDEX idx_documentos_tipo ON documentos(id_tipo_documento);
CREATE INDEX idx_documentos_status ON documentos(status_documento);
CREATE INDEX idx_documentos_data_upload ON documentos(data_upload);
CREATE INDEX idx_historico_documento ON historico_documentos(id_documento);
CREATE INDEX idx_historico_usuario ON historico_documentos(id_usuario);
CREATE INDEX idx_notificacoes_usuario ON notificacoes(id_usuario);
CREATE INDEX idx_notificacoes_documento ON notificacoes(id_documento);

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Configurações iniciais do sistema
INSERT INTO configuracoes (chave, valor, descricao, tipo_valor) VALUES
('nome_sistema', 'Portal NIMOENERGIA', 'Nome do sistema', 'string'),
('versao_sistema', '1.0.0', 'Versão atual do sistema', 'string'),
('email_contato', 'contato@nimoenergia.com.br', 'Email de contato principal', 'string'),
('telefone_contato', '(11) 3333-4444', 'Telefone de contato principal', 'string'),
('tamanho_maximo_arquivo_mb', '50', 'Tamanho máximo de arquivo em MB', 'integer'),
('dias_aviso_vencimento_padrao', '30', 'Dias de aviso padrão para vencimento', 'integer'),
('tentativas_login_maximo', '5', 'Número máximo de tentativas de login', 'integer'),
('tempo_bloqueio_minutos', '30', 'Tempo de bloqueio após tentativas excessivas', 'integer');

-- Tipos de documentos específicos da NIMOENERGIA
INSERT INTO tipos_documento (nome_tipo, descricao, categoria, obrigatorio_vencimento, obrigatorio_garantia, ordem_exibicao) VALUES
('DOC SOCIETÁRIO', 'Estatuto Social, ATA de Assembleia ou Contrato Social', 'EMPRESA', false, false, 1),
('COMPROVANTE DE ENDEREÇO', 'Comprovante de endereço da sede da empresa', 'EMPRESA', true, false, 2),
('DOCS SÓCIOS', 'RG e CPF ou CNH dos sócios', 'EMPRESA', false, false, 3),
('ALVARÁ DE FUNCIONAMENTO', 'Alvará de funcionamento da empresa', 'EMPRESA', true, false, 4),
('ANTT - PJ', 'Registro na ANTT para pessoa jurídica', 'EMPRESA', true, false, 5),
('SEGURO RCF-DC', 'Seguro de Responsabilidade Civil Facultativo por Danos Causados', 'SEGUROS', true, true, 6),
('SEGURO RCTR-C', 'Seguro de Responsabilidade Civil do Transportador Rodoviário de Carga', 'SEGUROS', true, true, 7),
('SEGURO AMBIENTAL', 'Seguro de Responsabilidade Civil por Danos Ambientais', 'SEGUROS', true, true, 8),
('PGR', 'Programa de Gerenciamento de Riscos', 'AMBIENTAL', true, false, 9),
('PAE', 'Plano de Ação de Emergência', 'AMBIENTAL', true, false, 10),
('AATIPP (IBAMA)', 'Autorização Ambiental para Transporte de Produtos Perigosos', 'AMBIENTAL', true, false, 11),
('Certificado de Regularidade - CR/IBAMA', 'Certificado de Regularidade do IBAMA', 'AMBIENTAL', true, false, 12),
('LICENÇA AMBIENTAL ESTADUAL', 'Licença ambiental emitida pelo órgão estadual', 'AMBIENTAL', true, false, 13);

-- Transportadora de exemplo
INSERT INTO transportadoras (cnpj, razao_social, nome_fantasia, email_corporativo, telefone_principal, endereco_cidade, endereco_estado, status_ativo) VALUES
('12.345.678/0001-90', 'Silva Transportes Ltda', 'Silva Transportes', 'contato@silvatransportes.com.br', '(11) 9999-8888', 'São Paulo', 'SP', true);

-- Usuários iniciais
INSERT INTO usuarios (nome_completo, email, senha_hash, salt, tipo_usuario, id_transportadora) VALUES
('Administrador NIMOENERGIA', 'admin@nimoenergia.com.br', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXzgVrncDAaa', 'salt_admin_2024', 'ADMIN', NULL),
('João Silva', 'silva@silvatransportes.com.br', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXzgVrncDAaa', 'salt_silva_2024', 'TRANSPORTADORA', 1);

-- =====================================================
-- CONFIGURAÇÕES FINAIS
-- =====================================================
SET FOREIGN_KEY_CHECKS = 1;

