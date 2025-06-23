-- =====================================================
-- PORTAL NIMOENERGIA - ESTRUTURA COMPLETA DO BANCO
-- =====================================================

-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS nimoenergia_portal 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE nimoenergia_portal;

-- =====================================================
-- TABELA: usuarios
-- =====================================================
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    tipo_usuario ENUM('admin', 'transportadora') NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_tipo_usuario (tipo_usuario),
    INDEX idx_ativo (ativo)
);

-- =====================================================
-- TABELA: transportadoras
-- =====================================================
CREATE TABLE transportadoras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    razao_social VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    inscricao_estadual VARCHAR(50),
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    telefone VARCHAR(20),
    email_contato VARCHAR(255),
    
    -- Representante Legal
    representante_nome VARCHAR(255) NOT NULL,
    representante_cpf VARCHAR(14) NOT NULL,
    representante_email VARCHAR(255) NOT NULL,
    representante_cargo VARCHAR(100),
    representante_telefone VARCHAR(20),
    poderes_assinatura BOOLEAN DEFAULT FALSE,
    
    -- Status e datas
    status ENUM('pendente', 'aprovado', 'rejeitado', 'suspenso') DEFAULT 'pendente',
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_aprovacao TIMESTAMP NULL,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_cnpj (cnpj),
    INDEX idx_status (status),
    INDEX idx_representante_email (representante_email)
);

-- =====================================================
-- TABELA: tipos_documento
-- =====================================================
CREATE TABLE tipos_documento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    obrigatorio BOOLEAN DEFAULT TRUE,
    tem_vencimento BOOLEAN DEFAULT TRUE,
    tem_garantia BOOLEAN DEFAULT FALSE,
    ordem_exibicao INT DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    
    INDEX idx_nome (nome),
    INDEX idx_obrigatorio (obrigatorio),
    INDEX idx_ativo (ativo)
);

-- =====================================================
-- TABELA: documentos
-- =====================================================
CREATE TABLE documentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transportadora_id INT NOT NULL,
    tipo_documento_id INT NOT NULL,
    nome_arquivo VARCHAR(255) NOT NULL,
    caminho_arquivo VARCHAR(500) NOT NULL,
    tamanho_arquivo INT,
    tipo_mime VARCHAR(100),
    
    -- Datas importantes
    data_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_vencimento DATE NULL,
    data_aprovacao TIMESTAMP NULL,
    data_rejeicao TIMESTAMP NULL,
    
    -- Status e observações
    status ENUM('pendente', 'aprovado', 'rejeitado', 'vencido') DEFAULT 'pendente',
    observacoes TEXT,
    valor_garantia DECIMAL(15,2) NULL,
    
    -- Auditoria
    aprovado_por INT NULL,
    rejeitado_por INT NULL,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (transportadora_id) REFERENCES transportadoras(id) ON DELETE CASCADE,
    FOREIGN KEY (tipo_documento_id) REFERENCES tipos_documento(id),
    FOREIGN KEY (aprovado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (rejeitado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_transportadora (transportadora_id),
    INDEX idx_tipo_documento (tipo_documento_id),
    INDEX idx_status (status),
    INDEX idx_data_vencimento (data_vencimento),
    INDEX idx_data_upload (data_upload)
);

-- =====================================================
-- TABELA: historico_documentos
-- =====================================================
CREATE TABLE historico_documentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    documento_id INT NOT NULL,
    usuario_id INT,
    acao ENUM('upload', 'aprovacao', 'rejeicao', 'atualizacao') NOT NULL,
    status_anterior VARCHAR(50),
    status_novo VARCHAR(50),
    observacoes TEXT,
    data_acao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (documento_id) REFERENCES documentos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_documento (documento_id),
    INDEX idx_usuario (usuario_id),
    INDEX idx_data_acao (data_acao)
);

-- =====================================================
-- TABELA: configuracoes_sistema
-- =====================================================
CREATE TABLE configuracoes_sistema (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    descricao TEXT,
    tipo ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_chave (chave)
);

-- =====================================================
-- TABELA: notificacoes
-- =====================================================
CREATE TABLE notificacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    transportadora_id INT,
    tipo ENUM('vencimento', 'aprovacao', 'rejeicao', 'sistema') NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    lida BOOLEAN DEFAULT FALSE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_leitura TIMESTAMP NULL,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (transportadora_id) REFERENCES transportadoras(id) ON DELETE CASCADE,
    
    INDEX idx_usuario (usuario_id),
    INDEX idx_transportadora (transportadora_id),
    INDEX idx_tipo (tipo),
    INDEX idx_lida (lida),
    INDEX idx_data_criacao (data_criacao)
);

-- =====================================================
-- INSERIR TIPOS DE DOCUMENTO
-- =====================================================
INSERT INTO tipos_documento (nome, descricao, obrigatorio, tem_vencimento, tem_garantia, ordem_exibicao) VALUES
('DOC SOCIETÁRIO', 'Estatuto, ATA ou Contrato Social', TRUE, FALSE, FALSE, 1),
('COMPROVANTE DE ENDEREÇO', 'Vencimento de 6 meses após emissão', TRUE, TRUE, FALSE, 2),
('DOCS SÓCIOS', 'RG/CPF ou CNH dos sócios', TRUE, FALSE, FALSE, 3),
('SEGURO RCF-DC', 'Seguro de Responsabilidade Civil do Transportador', TRUE, TRUE, TRUE, 4),
('SEGURO RCTR-C', 'Seguro de Responsabilidade Civil do Transportador Rodoviário', TRUE, TRUE, TRUE, 5),
('SEGURO AMBIENTAL', 'Seguro de Responsabilidade Ambiental', TRUE, TRUE, TRUE, 6),
('PGR', 'Programa de Gerenciamento de Riscos', TRUE, TRUE, FALSE, 7),
('PAE', 'Plano de Ação de Emergência', TRUE, TRUE, FALSE, 8),
('AATIPP (IBAMA)', 'Autorização Ambiental para Transporte de Produtos Perigosos', TRUE, TRUE, FALSE, 9),
('CR/IBAMA', 'Certificado de Regularidade do IBAMA', TRUE, TRUE, FALSE, 10),
('LICENÇA AMBIENTAL ESTADUAL', 'Licença ou Dispensa Ambiental Estadual', TRUE, TRUE, FALSE, 11),
('ALVARÁ DE FUNCIONAMENTO', 'Alvará de Funcionamento Municipal', TRUE, TRUE, FALSE, 12),
('ANTT - PJ', 'Registro na ANTT para Pessoa Jurídica', TRUE, FALSE, FALSE, 13);

-- =====================================================
-- INSERIR CONFIGURAÇÕES DO SISTEMA
-- =====================================================
INSERT INTO configuracoes_sistema (chave, valor, descricao, tipo) VALUES
('nome_portal', 'Portal NIMOENERGIA', 'Nome do portal', 'string'),
('email_contato', 'contato@nimoenergia.com.br', 'Email de contato', 'string'),
('telefone_contato', '(11) 3333-4444', 'Telefone de contato', 'string'),
('endereco_empresa', 'São Paulo, SP', 'Endereço da empresa', 'string'),
('cor_primaria', '#1e40af', 'Cor primária do sistema', 'string'),
('cor_secundaria', '#3b82f6', 'Cor secundária do sistema', 'string'),
('dias_alerta_vencimento', '30', 'Dias antes do vencimento para alertar', 'number'),
('tamanho_max_arquivo', '16777216', 'Tamanho máximo de arquivo em bytes (16MB)', 'number'),
('tipos_arquivo_permitidos', 'pdf,doc,docx,jpg,jpeg,png', 'Tipos de arquivo permitidos', 'string');

-- =====================================================
-- INSERIR USUÁRIOS PADRÃO
-- =====================================================
-- Senha: senha123 (hash bcrypt)
INSERT INTO usuarios (nome, email, senha_hash, tipo_usuario) VALUES
('Administrador NIMOENERGIA', 'admin@nimoenergia.com.br', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9u2', 'admin'),
('João Silva', 'silva@silvatransportes.com.br', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9u2', 'transportadora'),
('Maria Santos', 'maria@logisticasantos.com.br', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9u2', 'transportadora'),
('Carlos Admin', 'carlos@nimoenergia.com.br', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9u2', 'admin');

-- =====================================================
-- INSERIR TRANSPORTADORAS DE EXEMPLO
-- =====================================================
INSERT INTO transportadoras (
    usuario_id, razao_social, cnpj, inscricao_estadual, endereco, cidade, estado, cep, 
    telefone, email_contato, representante_nome, representante_cpf, representante_email, 
    representante_cargo, representante_telefone, poderes_assinatura, status, data_aprovacao
) VALUES
(2, 'Silva Transportes Ltda', '12.345.678/0001-90', '123456789', 
 'Rua das Transportadoras, 123', 'São Paulo', 'SP', '01234-567',
 '(11) 99999-9999', 'contato@silvatransportes.com.br', 'João Silva', '123.456.789-01', 
 'silva@silvatransportes.com.br', 'Diretor', '(11) 99999-9999', TRUE, 'aprovado', NOW()),

(3, 'Logística Santos S.A.', '98.765.432/0001-10', '987654321',
 'Av. Portuária, 456', 'Santos', 'SP', '11013-000',
 '(13) 88888-8888', 'contato@logisticasantos.com.br', 'Maria Santos', '987.654.321-09',
 'maria@logisticasantos.com.br', 'Gerente Geral', '(13) 88888-8888', TRUE, 'pendente', NULL);

-- =====================================================
-- INSERIR DOCUMENTOS DE EXEMPLO
-- =====================================================
INSERT INTO documentos (
    transportadora_id, tipo_documento_id, nome_arquivo, caminho_arquivo, 
    tamanho_arquivo, tipo_mime, data_vencimento, status, valor_garantia, aprovado_por, data_aprovacao
) VALUES
-- Documentos da Silva Transportes (aprovados)
(1, 1, 'contrato_social_silva.pdf', '/uploads/contrato_social_silva.pdf', 1024000, 'application/pdf', NULL, 'aprovado', NULL, 1, NOW()),
(1, 4, 'seguro_rcf_dc_silva.pdf', '/uploads/seguro_rcf_dc_silva.pdf', 856000, 'application/pdf', '2025-12-15', 'aprovado', 500000.00, 1, NOW()),
(1, 5, 'seguro_rctr_c_silva.pdf', '/uploads/seguro_rctr_c_silva.pdf', 742000, 'application/pdf', '2025-11-20', 'pendente', 1000000.00, NULL, NULL),

-- Documentos da Logística Santos (mistos)
(2, 1, 'contrato_social_santos.pdf', '/uploads/contrato_social_santos.pdf', 1200000, 'application/pdf', NULL, 'aprovado', NULL, 1, NOW()),
(2, 4, 'seguro_rcf_dc_santos.pdf', '/uploads/seguro_rcf_dc_santos.pdf', 890000, 'application/pdf', '2024-06-15', 'vencido', 750000.00, NULL, NULL),
(2, 6, 'seguro_ambiental_santos.pdf', '/uploads/seguro_ambiental_santos.pdf', 654000, 'application/pdf', '2025-08-30', 'rejeitado', 300000.00, 1, NULL);

-- =====================================================
-- INSERIR HISTÓRICO DE DOCUMENTOS
-- =====================================================
INSERT INTO historico_documentos (documento_id, usuario_id, acao, status_anterior, status_novo, observacoes) VALUES
(1, 2, 'upload', NULL, 'pendente', 'Documento enviado pela transportadora'),
(1, 1, 'aprovacao', 'pendente', 'aprovado', 'Documento aprovado conforme análise técnica'),
(2, 2, 'upload', NULL, 'pendente', 'Seguro RCF-DC enviado'),
(2, 1, 'aprovacao', 'pendente', 'aprovado', 'Seguro válido e em conformidade'),
(6, 3, 'upload', NULL, 'pendente', 'Seguro ambiental enviado'),
(6, 1, 'rejeicao', 'pendente', 'rejeitado', 'Documento ilegível - solicitar reenvio');

-- =====================================================
-- INSERIR NOTIFICAÇÕES DE EXEMPLO
-- =====================================================
INSERT INTO notificacoes (usuario_id, transportadora_id, tipo, titulo, mensagem) VALUES
(2, 1, 'vencimento', 'Documento próximo ao vencimento', 'Seu seguro RCTR-C vence em 30 dias. Providencie a renovação.'),
(3, 2, 'rejeicao', 'Documento rejeitado', 'Seu seguro ambiental foi rejeitado. Verifique a qualidade do arquivo e reenvie.'),
(1, NULL, 'sistema', 'Novo cadastro pendente', 'Nova transportadora aguarda aprovação de cadastro.'),
(2, 1, 'aprovacao', 'Documento aprovado', 'Seu contrato social foi aprovado com sucesso.');

-- =====================================================
-- CRIAR VIEWS PARA RELATÓRIOS
-- =====================================================

-- View para dashboard administrativo
CREATE VIEW vw_dashboard_admin AS
SELECT 
    (SELECT COUNT(*) FROM transportadoras WHERE status = 'aprovado') as transportadoras_ativas,
    (SELECT COUNT(*) FROM documentos WHERE status = 'aprovado') as documentos_aprovados,
    (SELECT COUNT(*) FROM documentos WHERE status = 'pendente') as documentos_pendentes,
    (SELECT COUNT(*) FROM documentos WHERE status = 'vencido' OR (data_vencimento IS NOT NULL AND data_vencimento <= CURDATE())) as documentos_vencidos,
    (SELECT COUNT(*) FROM documentos WHERE status = 'rejeitado') as documentos_rejeitados;

-- View para compliance por transportadora
CREATE VIEW vw_compliance_transportadora AS
SELECT 
    t.id,
    t.razao_social,
    t.cnpj,
    COUNT(td.id) as total_documentos_obrigatorios,
    COUNT(CASE WHEN d.status = 'aprovado' THEN 1 END) as documentos_aprovados,
    ROUND((COUNT(CASE WHEN d.status = 'aprovado' THEN 1 END) * 100.0 / COUNT(td.id)), 2) as percentual_compliance
FROM transportadoras t
CROSS JOIN tipos_documento td
LEFT JOIN documentos d ON t.id = d.transportadora_id AND td.id = d.tipo_documento_id AND d.status = 'aprovado'
WHERE t.status = 'aprovado' AND td.obrigatorio = TRUE
GROUP BY t.id, t.razao_social, t.cnpj;

-- =====================================================
-- ÍNDICES ADICIONAIS PARA PERFORMANCE
-- =====================================================
CREATE INDEX idx_documentos_status_vencimento ON documentos(status, data_vencimento);
CREATE INDEX idx_transportadoras_status_data ON transportadoras(status, data_cadastro);
CREATE INDEX idx_historico_data_acao ON historico_documentos(data_acao DESC);
CREATE INDEX idx_notificacoes_usuario_lida ON notificacoes(usuario_id, lida);

-- =====================================================
-- TRIGGERS PARA AUDITORIA
-- =====================================================

DELIMITER //

-- Trigger para atualizar histórico quando documento muda de status
CREATE TRIGGER tr_documento_status_change 
AFTER UPDATE ON documentos
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO historico_documentos (
            documento_id, usuario_id, acao, status_anterior, status_novo, observacoes
        ) VALUES (
            NEW.id, 
            CASE 
                WHEN NEW.status = 'aprovado' THEN NEW.aprovado_por
                WHEN NEW.status = 'rejeitado' THEN NEW.rejeitado_por
                ELSE NULL
            END,
            CASE 
                WHEN NEW.status = 'aprovado' THEN 'aprovacao'
                WHEN NEW.status = 'rejeitado' THEN 'rejeicao'
                ELSE 'atualizacao'
            END,
            OLD.status,
            NEW.status,
            NEW.observacoes
        );
    END IF;
END//

-- Trigger para marcar documentos como vencidos
CREATE EVENT ev_marcar_documentos_vencidos
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
BEGIN
    UPDATE documentos 
    SET status = 'vencido' 
    WHERE data_vencimento IS NOT NULL 
    AND data_vencimento <= CURDATE() 
    AND status IN ('aprovado', 'pendente');
END//

DELIMITER ;

-- =====================================================
-- COMENTÁRIOS FINAIS
-- =====================================================
-- Este script cria a estrutura completa do Portal NIMOENERGIA
-- Inclui todas as tabelas, relacionamentos, dados iniciais e otimizações
-- Para usar: execute este script em um servidor MySQL 8.0+

