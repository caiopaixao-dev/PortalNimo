# Scripts SQL - Portal NIMOENERGIA
# Estrutura Completa do Banco de Dados

-- =====================================================
-- CRIAÇÃO DO BANCO DE DADOS
-- =====================================================

CREATE DATABASE IF NOT EXISTS nimoenergia_portal 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE nimoenergia_portal;

-- =====================================================
-- TABELA: TRANSPORTADORAS
-- =====================================================

CREATE TABLE transportadoras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cnpj VARCHAR(18) NOT NULL UNIQUE,
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    telefone VARCHAR(20),
    email_contato VARCHAR(255),
    responsavel_nome VARCHAR(255),
    responsavel_cpf VARCHAR(14),
    responsavel_cargo VARCHAR(100),
    status_cadastro ENUM('PENDENTE', 'APROVADO', 'SUSPENSO') DEFAULT 'PENDENTE',
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_aprovacao TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_cnpj (cnpj),
    INDEX idx_status (status_cadastro),
    INDEX idx_data_cadastro (data_cadastro)
);

-- =====================================================
-- TABELA: USUARIOS
-- =====================================================

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    tipo_usuario ENUM('ADMIN', 'TRANSPORTADORA') NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    transportadora_id INT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_ultimo_acesso TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (transportadora_id) REFERENCES transportadoras(id) ON DELETE CASCADE,
    INDEX idx_email (email),
    INDEX idx_tipo (tipo_usuario),
    INDEX idx_transportadora (transportadora_id)
);

-- =====================================================
-- TABELA: TIPOS_DOCUMENTO
-- =====================================================

CREATE TABLE tipos_documento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    tem_vencimento BOOLEAN DEFAULT FALSE,
    tem_garantia BOOLEAN DEFAULT FALSE,
    obrigatorio BOOLEAN DEFAULT TRUE,
    categoria ENUM('EMPRESA', 'SEGURO', 'AMBIENTAL') NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_codigo (codigo),
    INDEX idx_categoria (categoria),
    INDEX idx_obrigatorio (obrigatorio)
);

-- =====================================================
-- TABELA: DOCUMENTOS
-- =====================================================

CREATE TABLE documentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transportadora_id INT NOT NULL,
    tipo_documento_id INT NOT NULL,
    nome_arquivo VARCHAR(255) NOT NULL,
    caminho_arquivo VARCHAR(500) NOT NULL,
    tamanho_arquivo BIGINT NOT NULL,
    tipo_mime VARCHAR(100) NOT NULL,
    data_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_vencimento DATE NULL,
    valor_garantia DECIMAL(15,2) NULL,
    status ENUM('PENDENTE', 'APROVADO', 'REJEITADO', 'VENCIDO') DEFAULT 'PENDENTE',
    observacoes TEXT,
    aprovado_por INT NULL,
    data_aprovacao TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (transportadora_id) REFERENCES transportadoras(id) ON DELETE CASCADE,
    FOREIGN KEY (tipo_documento_id) REFERENCES tipos_documento(id) ON DELETE RESTRICT,
    FOREIGN KEY (aprovado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_transportadora (transportadora_id),
    INDEX idx_tipo_documento (tipo_documento_id),
    INDEX idx_status (status),
    INDEX idx_vencimento (data_vencimento),
    INDEX idx_data_upload (data_upload)
);

-- =====================================================
-- TABELA: HISTORICO_DOCUMENTOS
-- =====================================================

CREATE TABLE historico_documentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    documento_id INT NOT NULL,
    usuario_id INT NOT NULL,
    acao ENUM('UPLOAD', 'APROVACAO', 'REJEICAO', 'VENCIMENTO', 'EDICAO') NOT NULL,
    status_anterior VARCHAR(50),
    status_novo VARCHAR(50),
    observacoes TEXT,
    data_acao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (documento_id) REFERENCES documentos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    
    INDEX idx_documento (documento_id),
    INDEX idx_usuario (usuario_id),
    INDEX idx_data_acao (data_acao),
    INDEX idx_acao (acao)
);

-- =====================================================
-- TABELA: NOTIFICACOES
-- =====================================================

CREATE TABLE notificacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    transportadora_id INT NULL,
    documento_id INT NULL,
    tipo ENUM('VENCIMENTO', 'APROVACAO', 'REJEICAO', 'CADASTRO', 'SISTEMA') NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    lida BOOLEAN DEFAULT FALSE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_leitura TIMESTAMP NULL,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (transportadora_id) REFERENCES transportadoras(id) ON DELETE CASCADE,
    FOREIGN KEY (documento_id) REFERENCES documentos(id) ON DELETE CASCADE,
    
    INDEX idx_usuario_lida (usuario_id, lida),
    INDEX idx_tipo (tipo),
    INDEX idx_data_criacao (data_criacao)
);

-- =====================================================
-- INSERÇÃO DOS TIPOS DE DOCUMENTO
-- =====================================================

INSERT INTO tipos_documento (codigo, nome, descricao, tem_vencimento, tem_garantia, categoria) VALUES
-- Documentos da Empresa
('DOC_SOCIETARIO', 'DOC SOCIETÁRIO (Estatuto/ATA/Contrato Social)', 'Documento societário da empresa: Estatuto, ATA ou Contrato Social', FALSE, FALSE, 'EMPRESA'),
('COMPROVANTE_ENDERECO', 'COMPROVANTE DE ENDEREÇO', 'Comprovante de endereço com vencimento de 6 meses', TRUE, FALSE, 'EMPRESA'),
('DOCS_SOCIOS', 'DOCS SÓCIOS (RG/CPF ou CNH)', 'Documentos dos sócios: RG/CPF ou CNH', FALSE, FALSE, 'EMPRESA'),
('ALVARA_FUNCIONAMENTO', 'ALVARÁ DE FUNCIONAMENTO', 'Alvará de funcionamento da empresa', TRUE, FALSE, 'EMPRESA'),
('ANTT_PJ', 'ANTT - PJ', 'Registro na ANTT para pessoa jurídica', FALSE, FALSE, 'EMPRESA'),

-- Seguros Obrigatórios
('SEGURO_RCF_DC', 'SEGURO RCF-DC', 'Seguro de Responsabilidade Civil Facultativo - Danos Causados', TRUE, TRUE, 'SEGURO'),
('SEGURO_RCTR_C', 'SEGURO RCTR-C', 'Seguro de Responsabilidade Civil do Transportador Rodoviário - Carga', TRUE, TRUE, 'SEGURO'),
('SEGURO_AMBIENTAL', 'SEGURO AMBIENTAL', 'Seguro de Responsabilidade Civil por Danos Ambientais', TRUE, TRUE, 'SEGURO'),

-- Documentos Ambientais
('PGR', 'PGR (Programa de Gerenciamento de Riscos)', 'Programa de Gerenciamento de Riscos', TRUE, FALSE, 'AMBIENTAL'),
('PAE', 'PAE (Plano de Emergência)', 'Plano de Ação de Emergência', TRUE, FALSE, 'AMBIENTAL'),
('AATIPP', 'AATIPP (IBAMA)', 'Autorização Ambiental para Transporte Interestadual de Produtos Perigosos', TRUE, FALSE, 'AMBIENTAL'),
('CR_IBAMA', 'Certificado de Regularidade - CR/IBAMA', 'Certificado de Regularidade do IBAMA', TRUE, FALSE, 'AMBIENTAL'),
('LICENCA_AMBIENTAL', 'LICENÇA AMBIENTAL ESTADUAL', 'Licença ou Dispensa Ambiental Estadual', TRUE, FALSE, 'AMBIENTAL');

-- =====================================================
-- INSERÇÃO DE USUÁRIOS PADRÃO
-- =====================================================

-- Usuário Admin (senha: senha123)
INSERT INTO usuarios (email, senha_hash, nome, tipo_usuario) VALUES
('admin@nimoenergia.com.br', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmvlJO', 'Admin NIMOENERGIA', 'ADMIN');

-- =====================================================
-- INSERÇÃO DE TRANSPORTADORAS DE EXEMPLO
-- =====================================================

INSERT INTO transportadoras (
    cnpj, razao_social, nome_fantasia, endereco, cidade, estado, cep, 
    telefone, email_contato, responsavel_nome, responsavel_cpf, responsavel_cargo, status_cadastro
) VALUES
('12.345.678/0001-90', 'Silva Transportes Ltda', 'Silva Transportes', 'Rua das Flores, 123', 'São Paulo', 'SP', '01234-567', '(11) 1234-5678', 'contato@silvatransportes.com.br', 'João Silva', '123.456.789-00', 'Diretor', 'APROVADO'),
('98.765.432/0001-10', 'Logística Santos S.A.', 'Santos Log', 'Av. Portuária, 456', 'Santos', 'SP', '11013-000', '(13) 9876-5432', 'contato@santoslog.com.br', 'Maria Santos', '987.654.321-00', 'Gerente', 'APROVADO'),
('11.222.333/0001-44', 'Frota Rápida Transportes', 'Frota Rápida', 'Rod. BR-101, Km 50', 'Rio de Janeiro', 'RJ', '20000-000', '(21) 1111-2222', 'contato@frotarapida.com.br', 'Carlos Oliveira', '111.222.333-44', 'Proprietário', 'PENDENTE');

-- =====================================================
-- INSERÇÃO DE USUÁRIOS DAS TRANSPORTADORAS
-- =====================================================

INSERT INTO usuarios (email, senha_hash, nome, tipo_usuario, transportadora_id) VALUES
('silva@silvatransportes.com.br', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmvlJO', 'João Silva', 'TRANSPORTADORA', 1),
('santos@santoslog.com.br', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmvlJO', 'Maria Santos', 'TRANSPORTADORA', 2),
('carlos@frotarapida.com.br', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmvlJO', 'Carlos Oliveira', 'TRANSPORTADORA', 3);

-- =====================================================
-- TRIGGERS PARA AUDITORIA E AUTOMAÇÃO
-- =====================================================

-- Trigger para atualizar documentos vencidos
DELIMITER //
CREATE TRIGGER tr_check_vencimento 
BEFORE UPDATE ON documentos
FOR EACH ROW
BEGIN
    IF NEW.data_vencimento IS NOT NULL AND NEW.data_vencimento < CURDATE() AND NEW.status = 'APROVADO' THEN
        SET NEW.status = 'VENCIDO';
    END IF;
END//
DELIMITER ;

-- Trigger para registrar histórico de mudanças
DELIMITER //
CREATE TRIGGER tr_historico_documentos 
AFTER UPDATE ON documentos
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO historico_documentos (
            documento_id, usuario_id, acao, status_anterior, status_novo, observacoes
        ) VALUES (
            NEW.id, 
            COALESCE(NEW.aprovado_por, 1), 
            CASE 
                WHEN NEW.status = 'APROVADO' THEN 'APROVACAO'
                WHEN NEW.status = 'REJEITADO' THEN 'REJEICAO'
                WHEN NEW.status = 'VENCIDO' THEN 'VENCIMENTO'
                ELSE 'EDICAO'
            END,
            OLD.status,
            NEW.status,
            NEW.observacoes
        );
    END IF;
END//
DELIMITER ;

-- =====================================================
-- VIEWS PARA RELATÓRIOS
-- =====================================================

-- View para dashboard administrativo
CREATE VIEW vw_dashboard_admin AS
SELECT 
    (SELECT COUNT(*) FROM transportadoras WHERE status_cadastro = 'APROVADO') as total_transportadoras,
    (SELECT COUNT(*) FROM documentos WHERE status = 'APROVADO') as docs_aprovados,
    (SELECT COUNT(*) FROM documentos WHERE status = 'PENDENTE') as docs_pendentes,
    (SELECT COUNT(*) FROM documentos WHERE status = 'VENCIDO') as docs_vencidos,
    (SELECT COUNT(*) FROM documentos WHERE data_vencimento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)) as docs_vencendo;

-- View para documentos por transportadora
CREATE VIEW vw_documentos_transportadora AS
SELECT 
    d.id,
    d.transportadora_id,
    t.razao_social,
    td.nome as tipo_documento,
    d.nome_arquivo,
    d.status,
    d.data_upload,
    d.data_vencimento,
    d.valor_garantia,
    CASE 
        WHEN d.data_vencimento IS NOT NULL AND d.data_vencimento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'VENCENDO'
        ELSE 'OK'
    END as alerta_vencimento
FROM documentos d
JOIN transportadoras t ON d.transportadora_id = t.id
JOIN tipos_documento td ON d.tipo_documento_id = td.id;

-- View para compliance por transportadora
CREATE VIEW vw_compliance_transportadora AS
SELECT 
    t.id,
    t.razao_social,
    t.cnpj,
    COUNT(td.id) as total_documentos_obrigatorios,
    COUNT(d.id) as documentos_enviados,
    COUNT(CASE WHEN d.status = 'APROVADO' THEN 1 END) as documentos_aprovados,
    ROUND((COUNT(CASE WHEN d.status = 'APROVADO' THEN 1 END) * 100.0 / COUNT(td.id)), 2) as percentual_compliance
FROM transportadoras t
CROSS JOIN tipos_documento td
LEFT JOIN documentos d ON t.id = d.transportadora_id AND td.id = d.tipo_documento_id
WHERE td.obrigatorio = TRUE AND t.status_cadastro = 'APROVADO'
GROUP BY t.id, t.razao_social, t.cnpj;

-- =====================================================
-- PROCEDURES PARA OPERAÇÕES COMPLEXAS
-- =====================================================

-- Procedure para verificar documentos vencidos
DELIMITER //
CREATE PROCEDURE sp_verificar_vencimentos()
BEGIN
    -- Atualizar documentos vencidos
    UPDATE documentos 
    SET status = 'VENCIDO' 
    WHERE data_vencimento < CURDATE() 
    AND status = 'APROVADO';
    
    -- Criar notificações para documentos vencendo em 30 dias
    INSERT INTO notificacoes (usuario_id, transportadora_id, documento_id, tipo, titulo, mensagem)
    SELECT 
        u.id,
        d.transportadora_id,
        d.id,
        'VENCIMENTO',
        'Documento vencendo em breve',
        CONCAT('O documento ', td.nome, ' vence em ', DATEDIFF(d.data_vencimento, CURDATE()), ' dias.')
    FROM documentos d
    JOIN tipos_documento td ON d.tipo_documento_id = td.id
    JOIN usuarios u ON u.transportadora_id = d.transportadora_id
    WHERE d.data_vencimento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
    AND d.status = 'APROVADO'
    AND NOT EXISTS (
        SELECT 1 FROM notificacoes n 
        WHERE n.documento_id = d.id 
        AND n.tipo = 'VENCIMENTO' 
        AND DATE(n.data_criacao) = CURDATE()
    );
END//
DELIMITER ;

-- =====================================================
-- ÍNDICES ADICIONAIS PARA PERFORMANCE
-- =====================================================

-- Índices compostos para consultas frequentes
CREATE INDEX idx_documentos_transportadora_status ON documentos(transportadora_id, status);
CREATE INDEX idx_documentos_tipo_status ON documentos(tipo_documento_id, status);
CREATE INDEX idx_notificacoes_usuario_tipo_lida ON notificacoes(usuario_id, tipo, lida);

-- =====================================================
-- CONFIGURAÇÕES DE SEGURANÇA
-- =====================================================

-- Criar usuário específico para a aplicação
CREATE USER IF NOT EXISTS 'nimoenergia_app'@'%' IDENTIFIED BY 'NimoApp2024!@#';
GRANT SELECT, INSERT, UPDATE, DELETE ON nimoenergia_portal.* TO 'nimoenergia_app'@'%';
GRANT EXECUTE ON PROCEDURE nimoenergia_portal.sp_verificar_vencimentos TO 'nimoenergia_app'@'%';
FLUSH PRIVILEGES;

-- =====================================================
-- COMENTÁRIOS FINAIS
-- =====================================================

/*
Este script SQL cria uma estrutura completa e robusta para o Portal NIMOENERGIA:

1. ESTRUTURA RELACIONAL: Tabelas bem normalizadas com relacionamentos claros
2. INTEGRIDADE: Chaves estrangeiras e constraints para manter consistência
3. PERFORMANCE: Índices otimizados para consultas frequentes
4. AUDITORIA: Triggers automáticos para rastrear mudanças
5. AUTOMAÇÃO: Procedures para tarefas recorrentes
6. SEGURANÇA: Usuário específico com permissões limitadas
7. RELATÓRIOS: Views pré-configuradas para dashboards

A estrutura suporta:
- Múltiplas transportadoras com usuários específicos
- 13 tipos de documentos obrigatórios
- Sistema de aprovação/rejeição
- Controle de vencimentos automático
- Notificações inteligentes
- Histórico completo de ações
- Métricas de compliance em tempo real
*/

