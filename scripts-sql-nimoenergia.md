# 💾 SCRIPTS SQL - PORTAL NIMOENERGIA
## ESTRUTURA COMPLETA DO BANCO DE DADOS

---

## 🗄️ SCRIPT DE CRIAÇÃO DO BANCO

```sql
-- =====================================================
-- PORTAL NIMOENERGIA - GESTÃO DE TRANSPORTADORAS
-- Script de Criação do Banco de Dados
-- Versão: 1.0
-- Data: 2024-06-16
-- =====================================================

-- Criação do banco de dados
CREATE DATABASE portal_nimoenergia
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE portal_nimoenergia;

-- =====================================================
-- TABELA: TIPOS_DOCUMENTO
-- Descrição: Categorização dos 13 tipos de documentos
-- =====================================================

CREATE TABLE tipos_documento (
    id_tipo INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    categoria ENUM('SOCIETARIO', 'SEGURO', 'AMBIENTAL', 'OUTROS') NOT NULL,
    requer_vencimento BOOLEAN DEFAULT FALSE,
    requer_garantia BOOLEAN DEFAULT FALSE,
    status ENUM('ATIVO', 'INATIVO') DEFAULT 'ATIVO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_tipos_categoria (categoria),
    INDEX idx_tipos_status (status)
);

-- =====================================================
-- TABELA: TRANSPORTADORAS
-- Descrição: Empresas cadastradas no sistema
-- =====================================================

CREATE TABLE transportadoras (
    id_transportadora INT AUTO_INCREMENT PRIMARY KEY,
    cnpj VARCHAR(18) NOT NULL UNIQUE,
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    
    -- Endereço
    cep VARCHAR(9),
    endereco VARCHAR(255),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    
    -- Contatos
    telefone VARCHAR(20),
    email VARCHAR(255),
    
    -- Controle
    status ENUM('ATIVA', 'INATIVA', 'PENDENTE', 'SUSPENSA') DEFAULT 'PENDENTE',
    taxa_conformidade DECIMAL(5,2) DEFAULT 0.00,
    ultima_atualizacao DATE,
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_transportadoras_cnpj (cnpj),
    INDEX idx_transportadoras_status (status),
    INDEX idx_transportadoras_conformidade (taxa_conformidade),
    INDEX idx_transportadoras_cidade (cidade, estado)
);

-- =====================================================
-- TABELA: USUARIOS
-- Descrição: Usuários do sistema (Admin e Transportadoras)
-- =====================================================

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    tipo ENUM('ADMIN', 'TRANSPORTADORA') NOT NULL,
    
    -- Relacionamento com transportadora (apenas para tipo TRANSPORTADORA)
    id_transportadora INT NULL,
    
    -- Controle de acesso
    status ENUM('ATIVO', 'INATIVO', 'BLOQUEADO') DEFAULT 'ATIVO',
    ultimo_acesso TIMESTAMP NULL,
    tentativas_login INT DEFAULT 0,
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_transportadora) REFERENCES transportadoras(id_transportadora) 
        ON DELETE SET NULL ON UPDATE CASCADE,
    
    INDEX idx_usuarios_email (email),
    INDEX idx_usuarios_tipo (tipo),
    INDEX idx_usuarios_status (status),
    INDEX idx_usuarios_transportadora (id_transportadora)
);

-- =====================================================
-- TABELA: SOCIOS
-- Descrição: Sócios/responsáveis das transportadoras
-- =====================================================

CREATE TABLE socios (
    id_socio INT AUTO_INCREMENT PRIMARY KEY,
    id_transportadora INT NOT NULL,
    
    -- Dados pessoais
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) NOT NULL,
    rg VARCHAR(20),
    funcao VARCHAR(100),
    
    -- Controle
    status ENUM('ATIVO', 'INATIVO') DEFAULT 'ATIVO',
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_transportadora) REFERENCES transportadoras(id_transportadora) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    UNIQUE KEY uk_socios_cpf_transportadora (cpf, id_transportadora),
    INDEX idx_socios_transportadora (id_transportadora),
    INDEX idx_socios_cpf (cpf)
);

-- =====================================================
-- TABELA: DOCUMENTOS
-- Descrição: Documentos enviados pelas transportadoras
-- =====================================================

CREATE TABLE documentos (
    id_documento INT AUTO_INCREMENT PRIMARY KEY,
    id_transportadora INT NOT NULL,
    id_tipo INT NOT NULL,
    
    -- Arquivo
    nome_arquivo VARCHAR(255) NOT NULL,
    arquivo_path VARCHAR(500) NOT NULL,
    tamanho_arquivo BIGINT,
    tipo_mime VARCHAR(100),
    
    -- Datas
    data_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_vencimento DATE NULL,
    
    -- Valores (para seguros)
    valor_garantia DECIMAL(15,2) NULL,
    
    -- Status e controle
    status ENUM('PENDENTE', 'APROVADO', 'REJEITADO', 'VENCIDO', 'VENCENDO') DEFAULT 'PENDENTE',
    observacoes TEXT,
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_transportadora) REFERENCES transportadoras(id_transportadora) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_tipo) REFERENCES tipos_documento(id_tipo) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    
    INDEX idx_documentos_transportadora (id_transportadora),
    INDEX idx_documentos_tipo (id_tipo),
    INDEX idx_documentos_status (status),
    INDEX idx_documentos_vencimento (data_vencimento),
    INDEX idx_documentos_upload (data_upload)
);

-- =====================================================
-- TABELA: APROVACOES
-- Descrição: Histórico de aprovações/rejeições
-- =====================================================

CREATE TABLE aprovacoes (
    id_aprovacao INT AUTO_INCREMENT PRIMARY KEY,
    id_documento INT NOT NULL,
    id_usuario INT NOT NULL,
    
    -- Ação realizada
    acao ENUM('APROVADO', 'REJEITADO', 'SOLICITADO_CORRECAO') NOT NULL,
    status_anterior ENUM('PENDENTE', 'APROVADO', 'REJEITADO', 'VENCIDO', 'VENCENDO'),
    status_novo ENUM('PENDENTE', 'APROVADO', 'REJEITADO', 'VENCIDO', 'VENCENDO'),
    
    -- Detalhes
    observacoes TEXT,
    data_acao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_documento) REFERENCES documentos(id_documento) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    
    INDEX idx_aprovacoes_documento (id_documento),
    INDEX idx_aprovacoes_usuario (id_usuario),
    INDEX idx_aprovacoes_data (data_acao),
    INDEX idx_aprovacoes_acao (acao)
);

-- =====================================================
-- TABELA: USUARIO_TRANSPORTADORA (N:N)
-- Descrição: Relacionamento para admins gerenciarem múltiplas transportadoras
-- =====================================================

CREATE TABLE usuario_transportadora (
    id_relacao INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_transportadora INT NOT NULL,
    
    -- Permissões
    permissao ENUM('LEITURA', 'ESCRITA', 'ADMIN') DEFAULT 'LEITURA',
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_transportadora) REFERENCES transportadoras(id_transportadora) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    UNIQUE KEY uk_usuario_transportadora (id_usuario, id_transportadora),
    INDEX idx_ut_usuario (id_usuario),
    INDEX idx_ut_transportadora (id_transportadora)
);
```

---

## 🔧 SCRIPT DE INSERÇÃO DE DADOS INICIAIS

```sql
-- =====================================================
-- DADOS INICIAIS - TIPOS DE DOCUMENTO
-- =====================================================

INSERT INTO tipos_documento (nome, descricao, categoria, requer_vencimento, requer_garantia) VALUES
('DOC SOCIETÁRIO', 'Estatuto / ATA / Contrato Social', 'SOCIETARIO', FALSE, FALSE),
('COMPROVANTE DE ENDEREÇO', 'Vencimento 6 meses após emissão', 'SOCIETARIO', TRUE, FALSE),
('DOCS SÓCIOS', 'RG/CPF ou CNH dos sócios', 'SOCIETARIO', FALSE, FALSE),
('SEGURO RCF-DC', 'Seguro de Responsabilidade Civil Facultativa', 'SEGURO', TRUE, TRUE),
('SEGURO RCTR-C', 'Seguro de Responsabilidade Civil do Transportador', 'SEGURO', TRUE, TRUE),
('SEGURO AMBIENTAL', 'Seguro de Responsabilidade Ambiental', 'SEGURO', TRUE, TRUE),
('PGR', 'Programa de Gerenciamento de Riscos', 'AMBIENTAL', TRUE, FALSE),
('PAE', 'Plano de Ação de Emergência', 'AMBIENTAL', TRUE, FALSE),
('AATIPP (IBAMA)', 'Autorização Ambiental para Transporte', 'AMBIENTAL', TRUE, FALSE),
('CR/IBAMA', 'Certificado de Regularidade IBAMA', 'AMBIENTAL', TRUE, FALSE),
('LICENÇA AMBIENTAL ESTADUAL', 'Licença ou Dispensa Ambiental', 'AMBIENTAL', TRUE, FALSE),
('ALVARÁ DE FUNCIONAMENTO', 'Alvará Municipal de Funcionamento', 'OUTROS', TRUE, FALSE),
('ANTT - PJ', 'Registro na Agência Nacional de Transportes', 'OUTROS', FALSE, FALSE);

-- =====================================================
-- USUÁRIO ADMINISTRADOR INICIAL
-- =====================================================

INSERT INTO usuarios (email, senha_hash, nome, tipo, status) VALUES
('admin@nimoenergia.com.br', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador NIMOENERGIA', 'ADMIN', 'ATIVO');

-- Senha padrão: NimoAdmin2024 (deve ser alterada no primeiro acesso)
```



---

## 🔍 VIEWS RECOMENDADAS

```sql
-- =====================================================
-- VIEW: DASHBOARD_METRICAS
-- Descrição: Métricas principais para o dashboard
-- =====================================================

CREATE VIEW dashboard_metricas AS
SELECT 
    (SELECT COUNT(*) FROM transportadoras WHERE status = 'ATIVA') as total_transportadoras,
    (SELECT COUNT(*) FROM documentos WHERE status = 'APROVADO') as docs_aprovados,
    (SELECT COUNT(*) FROM documentos WHERE status = 'PENDENTE') as docs_pendentes,
    (SELECT COUNT(*) FROM documentos WHERE status = 'VENCIDO') as docs_vencidos,
    (SELECT COUNT(*) FROM documentos 
     WHERE data_vencimento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)) as docs_vencendo,
    (SELECT ROUND(AVG(taxa_conformidade), 2) FROM transportadoras WHERE status = 'ATIVA') as taxa_conformidade_media;

-- =====================================================
-- VIEW: PERFORMANCE_TRANSPORTADORAS
-- Descrição: Ranking de performance das transportadoras
-- =====================================================

CREATE VIEW performance_transportadoras AS
SELECT 
    t.id_transportadora,
    t.razao_social,
    t.nome_fantasia,
    t.taxa_conformidade,
    COUNT(d.id_documento) as total_documentos,
    COUNT(CASE WHEN d.status = 'APROVADO' THEN 1 END) as docs_aprovados,
    COUNT(CASE WHEN d.status = 'VENCIDO' THEN 1 END) as docs_vencidos,
    t.ultima_atualizacao,
    CASE 
        WHEN t.taxa_conformidade >= 90 THEN 'EXCELENTE'
        WHEN t.taxa_conformidade >= 80 THEN 'BOM'
        WHEN t.taxa_conformidade >= 70 THEN 'REGULAR'
        ELSE 'CRÍTICO'
    END as classificacao
FROM transportadoras t
LEFT JOIN documentos d ON t.id_transportadora = d.id_transportadora
WHERE t.status = 'ATIVA'
GROUP BY t.id_transportadora, t.razao_social, t.nome_fantasia, t.taxa_conformidade, t.ultima_atualizacao
ORDER BY t.taxa_conformidade DESC, t.ultima_atualizacao DESC;

-- =====================================================
-- VIEW: ALERTAS_COMPLIANCE
-- Descrição: Alertas críticos para o sistema de compliance
-- =====================================================

CREATE VIEW alertas_compliance AS
SELECT 
    'VENCIMENTO' as tipo_alerta,
    CONCAT(COUNT(*), ' documentos vencem em 30 dias') as descricao,
    t.razao_social as transportadora,
    'ALTA' as prioridade,
    MIN(d.data_vencimento) as data_limite
FROM documentos d
JOIN transportadoras t ON d.id_transportadora = t.id_transportadora
WHERE d.data_vencimento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
  AND d.status IN ('APROVADO', 'PENDENTE')
GROUP BY t.id_transportadora, t.razao_social
HAVING COUNT(*) > 0

UNION ALL

SELECT 
    'CONFORMIDADE' as tipo_alerta,
    'Taxa abaixo de 80%' as descricao,
    t.razao_social as transportadora,
    CASE 
        WHEN t.taxa_conformidade < 70 THEN 'ALTA'
        ELSE 'MÉDIA'
    END as prioridade,
    NULL as data_limite
FROM transportadoras t
WHERE t.taxa_conformidade < 80 AND t.status = 'ATIVA'

UNION ALL

SELECT 
    'PENDÊNCIA' as tipo_alerta,
    CONCAT(COUNT(*), ' documentos aguardam aprovação há 5+ dias') as descricao,
    t.razao_social as transportadora,
    'ALTA' as prioridade,
    MIN(d.data_upload) as data_limite
FROM documentos d
JOIN transportadoras t ON d.id_transportadora = t.id_transportadora
WHERE d.status = 'PENDENTE' 
  AND d.data_upload < DATE_SUB(CURDATE(), INTERVAL 5 DAY)
GROUP BY t.id_transportadora, t.razao_social
HAVING COUNT(*) > 0

ORDER BY 
    CASE prioridade 
        WHEN 'ALTA' THEN 1 
        WHEN 'MÉDIA' THEN 2 
        ELSE 3 
    END,
    data_limite ASC;

-- =====================================================
-- VIEW: ATIVIDADE_RECENTE
-- Descrição: Últimas atividades do sistema
-- =====================================================

CREATE VIEW atividade_recente AS
SELECT 
    'DOCUMENTO' as tipo,
    CONCAT('Documento ', td.nome, ' ', 
           CASE d.status 
               WHEN 'APROVADO' THEN 'aprovado'
               WHEN 'REJEITADO' THEN 'rejeitado'
               WHEN 'PENDENTE' THEN 'enviado'
               ELSE d.status
           END,
           ' para ', t.razao_social) as descricao,
    d.updated_at as data_atividade,
    CASE d.status
        WHEN 'APROVADO' THEN 'success'
        WHEN 'REJEITADO' THEN 'error'
        WHEN 'VENCIDO' THEN 'error'
        ELSE 'info'
    END as tipo_cor
FROM documentos d
JOIN transportadoras t ON d.id_transportadora = t.id_transportadora
JOIN tipos_documento td ON d.id_tipo = td.id_tipo

UNION ALL

SELECT 
    'TRANSPORTADORA' as tipo,
    CONCAT('Nova transportadora cadastrada: ', t.razao_social) as descricao,
    t.created_at as data_atividade,
    'info' as tipo_cor
FROM transportadoras t
WHERE t.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)

ORDER BY data_atividade DESC
LIMIT 20;

-- =====================================================
-- VIEW: RESUMO_DOCUMENTOS_TRANSPORTADORA
-- Descrição: Resumo de documentos por transportadora
-- =====================================================

CREATE VIEW resumo_documentos_transportadora AS
SELECT 
    t.id_transportadora,
    t.razao_social,
    t.nome_fantasia,
    COUNT(d.id_documento) as total_documentos,
    COUNT(CASE WHEN d.status = 'APROVADO' THEN 1 END) as aprovados,
    COUNT(CASE WHEN d.status = 'PENDENTE' THEN 1 END) as pendentes,
    COUNT(CASE WHEN d.status = 'REJEITADO' THEN 1 END) as rejeitados,
    COUNT(CASE WHEN d.status = 'VENCIDO' THEN 1 END) as vencidos,
    COUNT(CASE WHEN d.data_vencimento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as vencendo,
    ROUND((COUNT(CASE WHEN d.status = 'APROVADO' THEN 1 END) * 100.0 / NULLIF(COUNT(d.id_documento), 0)), 2) as percentual_aprovacao
FROM transportadoras t
LEFT JOIN documentos d ON t.id_transportadora = d.id_transportadora
WHERE t.status = 'ATIVA'
GROUP BY t.id_transportadora, t.razao_social, t.nome_fantasia
ORDER BY percentual_aprovacao DESC, t.razao_social;
```

---

## ⚡ STORED PROCEDURES

```sql
-- =====================================================
-- PROCEDURE: ATUALIZAR_TAXA_CONFORMIDADE
-- Descrição: Atualiza a taxa de conformidade de uma transportadora
-- =====================================================

DELIMITER //

CREATE PROCEDURE AtualizarTaxaConformidade(IN p_id_transportadora INT)
BEGIN
    DECLARE v_total_docs INT DEFAULT 0;
    DECLARE v_docs_aprovados INT DEFAULT 0;
    DECLARE v_taxa DECIMAL(5,2) DEFAULT 0.00;
    
    -- Conta total de documentos
    SELECT COUNT(*) INTO v_total_docs
    FROM documentos 
    WHERE id_transportadora = p_id_transportadora;
    
    -- Conta documentos aprovados
    SELECT COUNT(*) INTO v_docs_aprovados
    FROM documentos 
    WHERE id_transportadora = p_id_transportadora 
      AND status = 'APROVADO';
    
    -- Calcula taxa de conformidade
    IF v_total_docs > 0 THEN
        SET v_taxa = (v_docs_aprovados * 100.0) / v_total_docs;
    END IF;
    
    -- Atualiza a transportadora
    UPDATE transportadoras 
    SET taxa_conformidade = v_taxa,
        ultima_atualizacao = CURDATE()
    WHERE id_transportadora = p_id_transportadora;
    
END //

DELIMITER ;

-- =====================================================
-- PROCEDURE: VERIFICAR_VENCIMENTOS
-- Descrição: Atualiza status de documentos vencidos
-- =====================================================

DELIMITER //

CREATE PROCEDURE VerificarVencimentos()
BEGIN
    -- Atualiza documentos vencidos
    UPDATE documentos 
    SET status = 'VENCIDO'
    WHERE data_vencimento < CURDATE() 
      AND status IN ('APROVADO', 'PENDENTE');
    
    -- Atualiza documentos vencendo (próximos 30 dias)
    UPDATE documentos 
    SET status = 'VENCENDO'
    WHERE data_vencimento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
      AND status = 'APROVADO';
    
    -- Atualiza taxa de conformidade de todas as transportadoras afetadas
    CALL AtualizarTaxaConformidade(NULL);
    
END //

DELIMITER ;
```

---

## 🔧 TRIGGERS

```sql
-- =====================================================
-- TRIGGER: AFTER_DOCUMENTO_UPDATE
-- Descrição: Atualiza taxa de conformidade após mudança em documento
-- =====================================================

DELIMITER //

CREATE TRIGGER after_documento_update
    AFTER UPDATE ON documentos
    FOR EACH ROW
BEGIN
    -- Atualiza taxa de conformidade da transportadora
    CALL AtualizarTaxaConformidade(NEW.id_transportadora);
    
    -- Se mudou para aprovado/rejeitado, registra na tabela de aprovações
    IF OLD.status != NEW.status AND NEW.status IN ('APROVADO', 'REJEITADO') THEN
        INSERT INTO aprovacoes (id_documento, id_usuario, acao, status_anterior, status_novo, data_acao)
        VALUES (NEW.id_documento, @current_user_id, NEW.status, OLD.status, NEW.status, NOW());
    END IF;
END //

DELIMITER ;

-- =====================================================
-- TRIGGER: AFTER_DOCUMENTO_INSERT
-- Descrição: Atualiza taxa de conformidade após inserção de documento
-- =====================================================

DELIMITER //

CREATE TRIGGER after_documento_insert
    AFTER INSERT ON documentos
    FOR EACH ROW
BEGIN
    -- Atualiza taxa de conformidade da transportadora
    CALL AtualizarTaxaConformidade(NEW.id_transportadora);
END //

DELIMITER ;
```

