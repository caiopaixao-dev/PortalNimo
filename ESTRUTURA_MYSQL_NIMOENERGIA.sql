-- =====================================================
-- PORTAL NIMOENERGIA - ESTRUTURA MYSQL
-- Sistema de Gestão de Documentos para Transportadoras
-- Adaptado para MySQL 8.0+
-- =====================================================

-- Configurações iniciais
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

-- =====================================================
-- TABELA: configuracoes
-- Armazena configurações gerais do sistema
-- =====================================================
CREATE TABLE configuracoes (
    id_configuracao INT AUTO_INCREMENT PRIMARY KEY,
    chave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    descricao TEXT,
    tipo_valor VARCHAR(20) DEFAULT 'string',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHECK (tipo_valor IN ('string', 'integer', 'boolean', 'json'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para configurações
CREATE INDEX idx_configuracoes_chave ON configuracoes(chave);

-- =====================================================
-- TABELA: tipos_documento
-- Define os tipos de documentos aceitos no sistema
-- =====================================================
CREATE TABLE tipos_documento (
    id_tipo INT AUTO_INCREMENT PRIMARY KEY,
    nome_tipo VARCHAR(100) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(50) NOT NULL,
    subcategoria VARCHAR(50),
    obrigatorio_vencimento BOOLEAN DEFAULT FALSE,
    obrigatorio_garantia BOOLEAN DEFAULT FALSE,
    formatos_aceitos JSON DEFAULT ('["PDF", "DOCX", "JPG", "PNG"]'),
    tamanho_maximo_mb INT DEFAULT 10,
    aprovacao_automatica BOOLEAN DEFAULT FALSE,
    dias_aviso_vencimento INT DEFAULT 30,
    dias_tolerancia INT DEFAULT 5,
    ativo BOOLEAN DEFAULT TRUE,
    ordem_exibicao INT DEFAULT 0,
    icone VARCHAR(50),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (categoria IN ('EMPRESA', 'SEGUROS', 'AMBIENTAL'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para tipos de documento
CREATE INDEX idx_tipos_documento_categoria ON tipos_documento(categoria);
CREATE INDEX idx_tipos_documento_ativo ON tipos_documento(ativo);

-- =====================================================
-- TABELA: transportadoras
-- Armazena dados das empresas transportadoras
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
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHECK (classificacao_risco IN ('BAIXO', 'MEDIO', 'ALTO'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para transportadoras
CREATE INDEX idx_transportadoras_cnpj ON transportadoras(cnpj);
CREATE INDEX idx_transportadoras_razao_social ON transportadoras(razao_social);
CREATE INDEX idx_transportadoras_status_ativo ON transportadoras(status_ativo);
CREATE INDEX idx_transportadoras_data_cadastro ON transportadoras(data_cadastro);

-- =====================================================
-- TABELA: usuarios
-- Armazena dados dos usuários do sistema
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
    preferencias_notificacao JSON DEFAULT ('{"email": true, "sms": false, "push": true}'),
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    idioma VARCHAR(5) DEFAULT 'pt-BR',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHECK (tipo_usuario IN ('ADMIN', 'ANALISTA', 'TRANSPORTADORA')),
    FOREIGN KEY (id_transportadora) REFERENCES transportadoras(id_transportadora) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para usuários
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_tipo ON usuarios(tipo_usuario);
CREATE INDEX idx_usuarios_transportadora ON usuarios(id_transportadora);
CREATE INDEX idx_usuarios_status_ativo ON usuarios(status_ativo);

-- =====================================================
-- TABELA: documentos
-- Armazena informações dos documentos enviados
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
    CHECK (status_documento IN ('PENDENTE', 'APROVADO', 'REJEITADO', 'VENCIDO', 'RENOVACAO')),
    FOREIGN KEY (id_transportadora) REFERENCES transportadoras(id_transportadora) ON DELETE CASCADE,
    FOREIGN KEY (id_tipo_documento) REFERENCES tipos_documento(id_tipo) ON DELETE RESTRICT,
    FOREIGN KEY (id_usuario_upload) REFERENCES usuarios(id_usuario) ON DELETE RESTRICT,
    FOREIGN KEY (id_usuario_aprovacao) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    FOREIGN KEY (id_documento_anterior) REFERENCES documentos(id_documento) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para documentos
CREATE INDEX idx_documentos_protocolo ON documentos(numero_protocolo);
CREATE INDEX idx_documentos_transportadora ON documentos(id_transportadora);
CREATE INDEX idx_documentos_tipo ON documentos(id_tipo_documento);
CREATE INDEX idx_documentos_status ON documentos(status_documento);
CREATE INDEX idx_documentos_data_upload ON documentos(data_upload);
CREATE INDEX idx_documentos_data_vencimento ON documentos(data_vencimento);
CREATE INDEX idx_documentos_hash ON documentos(hash_arquivo);
CREATE INDEX idx_documentos_transportadora_status_vencimento ON documentos(id_transportadora, status_documento, data_vencimento);

-- =====================================================
-- TABELA: historico_documentos
-- Registra todas as ações realizadas nos documentos
-- =====================================================
CREATE TABLE historico_documentos (
    id_historico INT AUTO_INCREMENT PRIMARY KEY,
    id_documento INT NOT NULL,
    id_usuario INT NOT NULL,
    acao VARCHAR(50) NOT NULL,
    status_anterior VARCHAR(20),
    status_novo VARCHAR(20),
    observacoes TEXT,
    dados_alteracao JSON,
    ip_origem VARCHAR(45),
    data_acao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_documento) REFERENCES documentos(id_documento) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para histórico
CREATE INDEX idx_historico_documento ON historico_documentos(id_documento);
CREATE INDEX idx_historico_usuario ON historico_documentos(id_usuario);
CREATE INDEX idx_historico_data_acao ON historico_documentos(data_acao);
CREATE INDEX idx_historico_acao ON historico_documentos(acao);

-- =====================================================
-- TABELA: notificacoes
-- Gerencia notificações enviadas aos usuários
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
    dados_extras JSON,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (canal IN ('EMAIL', 'SMS', 'PUSH', 'SISTEMA')),
    CHECK (status_envio IN ('PENDENTE', 'ENVIADO', 'ERRO', 'LIDO')),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_documento) REFERENCES documentos(id_documento) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para notificações
CREATE INDEX idx_notificacoes_usuario ON notificacoes(id_usuario);
CREATE INDEX idx_notificacoes_documento ON notificacoes(id_documento);
CREATE INDEX idx_notificacoes_status_envio ON notificacoes(status_envio);
CREATE INDEX idx_notificacoes_data_criacao ON notificacoes(data_criacao);
CREATE INDEX idx_notificacoes_tipo ON notificacoes(tipo_notificacao);

-- =====================================================
-- TRIGGERS PARA AUDITORIA E AUTOMAÇÃO
-- =====================================================

-- Trigger para auditoria de documentos
DELIMITER $$
CREATE TRIGGER trigger_auditar_documento_insert
AFTER INSERT ON documentos
FOR EACH ROW
BEGIN
    INSERT INTO historico_documentos (
        id_documento, id_usuario, acao, status_novo, observacoes
    ) VALUES (
        NEW.id_documento,
        NEW.id_usuario_upload,
        'CRIACAO',
        NEW.status_documento,
        'Documento criado no sistema'
    );
END$$

CREATE TRIGGER trigger_auditar_documento_update
AFTER UPDATE ON documentos
FOR EACH ROW
BEGIN
    IF OLD.status_documento != NEW.status_documento THEN
        INSERT INTO historico_documentos (
            id_documento, id_usuario, acao, status_anterior, 
            status_novo, observacoes
        ) VALUES (
            NEW.id_documento,
            COALESCE(NEW.id_usuario_aprovacao, OLD.id_usuario_upload),
            'ATUALIZACAO_STATUS',
            OLD.status_documento,
            NEW.status_documento,
            NEW.observacoes_analista
        );
    END IF;
END$$

-- Trigger para geração automática de protocolo
CREATE TRIGGER trigger_gerar_protocolo
BEFORE INSERT ON documentos
FOR EACH ROW
BEGIN
    DECLARE ano_atual INT;
    DECLARE sequencial INT;
    DECLARE protocolo VARCHAR(20);
    
    IF NEW.numero_protocolo IS NULL OR NEW.numero_protocolo = '' THEN
        SET ano_atual = YEAR(CURDATE());
        
        SELECT COALESCE(MAX(CAST(SUBSTRING(numero_protocolo, 5, 6) AS UNSIGNED)), 0) + 1
        INTO sequencial
        FROM documentos
        WHERE numero_protocolo LIKE CONCAT(ano_atual, '%');
        
        SET protocolo = CONCAT(ano_atual, LPAD(sequencial, 6, '0'));
        SET NEW.numero_protocolo = protocolo;
    END IF;
END$$

DELIMITER ;

-- =====================================================
-- PROCEDURES PARA OPERAÇÕES ESPECIALIZADAS
-- =====================================================

DELIMITER $$

-- Procedure para verificar documentos vencidos
CREATE PROCEDURE verificar_documentos_vencidos()
BEGIN
    UPDATE documentos 
    SET status_documento = 'VENCIDO'
    WHERE status_documento = 'APROVADO' 
      AND data_vencimento IS NOT NULL 
      AND data_vencimento < CURDATE();
END$$

-- Procedure para calcular compliance de transportadora
CREATE PROCEDURE calcular_compliance_transportadora(IN p_id_transportadora INT)
BEGIN
    SELECT 
        t.razao_social,
        COUNT(td.id_tipo) as tipos_obrigatorios,
        COUNT(DISTINCT CASE 
            WHEN d.status_documento = 'APROVADO' 
            AND (d.data_vencimento IS NULL OR d.data_vencimento >= CURDATE()) 
            THEN d.id_tipo_documento 
        END) as tipos_conformes,
        ROUND(
            CASE 
                WHEN COUNT(td.id_tipo) > 0 THEN
                    (COUNT(DISTINCT CASE 
                        WHEN d.status_documento = 'APROVADO' 
                        AND (d.data_vencimento IS NULL OR d.data_vencimento >= CURDATE()) 
                        THEN d.id_tipo_documento 
                    END) / COUNT(td.id_tipo)) * 100
                ELSE 0
            END, 2
        ) as percentual_compliance
    FROM transportadoras t
    CROSS JOIN tipos_documento td
    LEFT JOIN documentos d ON t.id_transportadora = d.id_transportadora 
        AND td.id_tipo = d.id_tipo_documento
    WHERE t.id_transportadora = p_id_transportadora
      AND t.status_ativo = TRUE 
      AND td.ativo = TRUE
    GROUP BY t.id_transportadora, t.razao_social;
END$$

DELIMITER ;

-- =====================================================
-- VIEWS PARA CONSULTAS OTIMIZADAS
-- =====================================================

-- View para dashboard administrativo
CREATE VIEW vw_dashboard_admin AS
SELECT 
    COUNT(DISTINCT t.id_transportadora) as total_transportadoras,
    COUNT(DISTINCT CASE WHEN t.status_ativo THEN t.id_transportadora END) as transportadoras_ativas,
    COUNT(d.id_documento) as total_documentos,
    COUNT(CASE WHEN d.status_documento = 'APROVADO' THEN 1 END) as documentos_aprovados,
    COUNT(CASE WHEN d.status_documento = 'PENDENTE' THEN 1 END) as documentos_pendentes,
    COUNT(CASE WHEN d.status_documento = 'REJEITADO' THEN 1 END) as documentos_rejeitados,
    COUNT(CASE WHEN d.status_documento = 'VENCIDO' OR d.data_vencimento < CURDATE() THEN 1 END) as documentos_vencidos,
    ROUND(AVG(DATEDIFF(d.data_aprovacao, d.data_upload)), 1) as tempo_medio_aprovacao_dias,
    COUNT(CASE WHEN d.data_upload >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as documentos_ultimo_mes,
    NOW() as ultima_atualizacao
FROM transportadoras t
LEFT JOIN documentos d ON t.id_transportadora = d.id_transportadora;

-- View para documentos próximos ao vencimento
CREATE VIEW vw_documentos_vencimento AS
SELECT 
    d.id_documento,
    d.numero_protocolo,
    t.id_transportadora,
    t.razao_social,
    t.email_corporativo,
    td.nome_tipo,
    td.categoria,
    d.data_vencimento,
    DATEDIFF(d.data_vencimento, CURDATE()) as dias_para_vencimento,
    CASE 
        WHEN d.data_vencimento < CURDATE() THEN 'VENCIDO'
        WHEN d.data_vencimento <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 'CRITICO'
        WHEN d.data_vencimento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'ALERTA'
        ELSE 'OK'
    END as status_vencimento,
    td.dias_aviso_vencimento,
    td.dias_tolerancia
FROM documentos d
JOIN transportadoras t ON d.id_transportadora = t.id_transportadora
JOIN tipos_documento td ON d.id_tipo_documento = td.id_tipo
WHERE d.status_documento = 'APROVADO' 
  AND d.data_vencimento IS NOT NULL
  AND d.data_vencimento <= DATE_ADD(CURDATE(), INTERVAL 60 DAY)
  AND t.status_ativo = TRUE
ORDER BY d.data_vencimento ASC;

-- =====================================================
-- DADOS INICIAIS (SEED DATA)
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
-- Documentos da Empresa
('DOC SOCIETÁRIO', 'Estatuto Social, ATA de Assembleia ou Contrato Social', 'EMPRESA', false, false, 1),
('COMPROVANTE DE ENDEREÇO', 'Comprovante de endereço da sede da empresa', 'EMPRESA', true, false, 2),
('DOCS SÓCIOS', 'RG e CPF ou CNH dos sócios', 'EMPRESA', false, false, 3),
('ALVARÁ DE FUNCIONAMENTO', 'Alvará de funcionamento da empresa', 'EMPRESA', true, false, 4),
('ANTT - PJ', 'Registro na ANTT para pessoa jurídica', 'EMPRESA', true, false, 5),

-- Seguros Obrigatórios
('SEGURO RCF-DC', 'Seguro de Responsabilidade Civil Facultativo por Danos Causados', 'SEGUROS', true, true, 6),
('SEGURO RCTR-C', 'Seguro de Responsabilidade Civil do Transportador Rodoviário de Carga', 'SEGUROS', true, true, 7),
('SEGURO AMBIENTAL', 'Seguro de Responsabilidade Civil por Danos Ambientais', 'SEGUROS', true, true, 8),

-- Documentos Ambientais
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
COMMIT;

-- =====================================================
-- COMANDOS ÚTEIS PARA MANUTENÇÃO
-- =====================================================

-- CALL verificar_documentos_vencidos(); -- Verifica documentos vencidos
-- CALL calcular_compliance_transportadora(1); -- Calcula compliance de uma transportadora
-- SELECT * FROM vw_dashboard_admin; -- Visualiza métricas do dashboard
-- SELECT * FROM vw_documentos_vencimento; -- Visualiza documentos próximos ao vencimento

