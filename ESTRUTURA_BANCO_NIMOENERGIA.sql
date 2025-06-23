-- =====================================================
-- PORTAL NIMOENERGIA - ESTRUTURA DE BANCO DE DADOS
-- Sistema de Gestão de Documentos para Transportadoras
-- =====================================================

-- Criação do schema principal
CREATE SCHEMA IF NOT EXISTS nimoenergia;
SET search_path TO nimoenergia;

-- =====================================================
-- TABELA: CONFIGURACOES
-- Armazena configurações gerais do sistema
-- =====================================================
CREATE TABLE configuracoes (
    id_configuracao SERIAL PRIMARY KEY,
    chave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    descricao TEXT,
    tipo_valor VARCHAR(20) DEFAULT 'string' CHECK (tipo_valor IN ('string', 'integer', 'boolean', 'json')),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para configurações
CREATE INDEX idx_configuracoes_chave ON configuracoes(chave);

-- =====================================================
-- TABELA: TIPOS_DOCUMENTO
-- Define os tipos de documentos aceitos no sistema
-- =====================================================
CREATE TABLE tipos_documento (
    id_tipo SERIAL PRIMARY KEY,
    nome_tipo VARCHAR(100) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('EMPRESA', 'SEGUROS', 'AMBIENTAL')),
    subcategoria VARCHAR(50),
    obrigatorio_vencimento BOOLEAN DEFAULT FALSE,
    obrigatorio_garantia BOOLEAN DEFAULT FALSE,
    formatos_aceitos TEXT[] DEFAULT ARRAY['PDF', 'DOCX', 'JPG', 'PNG'],
    tamanho_maximo_mb INTEGER DEFAULT 10,
    aprovacao_automatica BOOLEAN DEFAULT FALSE,
    dias_aviso_vencimento INTEGER DEFAULT 30,
    dias_tolerancia INTEGER DEFAULT 5,
    ativo BOOLEAN DEFAULT TRUE,
    ordem_exibicao INTEGER DEFAULT 0,
    icone VARCHAR(50),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para tipos de documento
CREATE INDEX idx_tipos_documento_categoria ON tipos_documento(categoria);
CREATE INDEX idx_tipos_documento_ativo ON tipos_documento(ativo);

-- =====================================================
-- TABELA: TRANSPORTADORAS
-- Armazena dados das empresas transportadoras
-- =====================================================
CREATE TABLE transportadoras (
    id_transportadora SERIAL PRIMARY KEY,
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
    classificacao_risco VARCHAR(10) DEFAULT 'BAIXO' CHECK (classificacao_risco IN ('BAIXO', 'MEDIO', 'ALTO')),
    limite_credito DECIMAL(15,2),
    observacoes TEXT,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para transportadoras
CREATE INDEX idx_transportadoras_cnpj ON transportadoras(cnpj);
CREATE INDEX idx_transportadoras_razao_social ON transportadoras(razao_social);
CREATE INDEX idx_transportadoras_status_ativo ON transportadoras(status_ativo);
CREATE INDEX idx_transportadoras_data_cadastro ON transportadoras(data_cadastro);

-- =====================================================
-- TABELA: USUARIOS
-- Armazena dados dos usuários do sistema
-- =====================================================
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    id_transportadora INTEGER REFERENCES transportadoras(id_transportadora) ON DELETE SET NULL,
    nome_completo VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(50) NOT NULL,
    telefone VARCHAR(20),
    tipo_usuario VARCHAR(20) NOT NULL CHECK (tipo_usuario IN ('ADMIN', 'ANALISTA', 'TRANSPORTADORA')),
    status_ativo BOOLEAN DEFAULT TRUE,
    ultimo_acesso TIMESTAMP,
    ip_ultimo_acesso INET,
    tentativas_login INTEGER DEFAULT 0,
    bloqueado_ate TIMESTAMP,
    preferencias_notificacao JSONB DEFAULT '{"email": true, "sms": false, "push": true}',
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    idioma VARCHAR(5) DEFAULT 'pt-BR',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para usuários
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_tipo ON usuarios(tipo_usuario);
CREATE INDEX idx_usuarios_transportadora ON usuarios(id_transportadora);
CREATE INDEX idx_usuarios_status_ativo ON usuarios(status_ativo);

-- =====================================================
-- TABELA: DOCUMENTOS
-- Armazena informações dos documentos enviados
-- =====================================================
CREATE TABLE documentos (
    id_documento SERIAL PRIMARY KEY,
    numero_protocolo VARCHAR(20) UNIQUE NOT NULL,
    id_transportadora INTEGER NOT NULL REFERENCES transportadoras(id_transportadora) ON DELETE CASCADE,
    id_tipo_documento INTEGER NOT NULL REFERENCES tipos_documento(id_tipo) ON DELETE RESTRICT,
    id_usuario_upload INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE RESTRICT,
    nome_arquivo_original VARCHAR(255) NOT NULL,
    nome_arquivo_sistema VARCHAR(255) NOT NULL,
    caminho_arquivo TEXT NOT NULL,
    tamanho_arquivo BIGINT NOT NULL,
    hash_arquivo VARCHAR(64) NOT NULL,
    mime_type VARCHAR(100),
    data_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_vencimento DATE,
    valor_garantia DECIMAL(15,2),
    status_documento VARCHAR(20) DEFAULT 'PENDENTE' CHECK (status_documento IN ('PENDENTE', 'APROVADO', 'REJEITADO', 'VENCIDO', 'RENOVACAO')),
    data_aprovacao TIMESTAMP,
    id_usuario_aprovacao INTEGER REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    observacoes_analista TEXT,
    motivo_rejeicao TEXT,
    versao_documento INTEGER DEFAULT 1,
    id_documento_anterior INTEGER REFERENCES documentos(id_documento) ON DELETE SET NULL,
    ip_upload INET,
    user_agent TEXT,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para documentos
CREATE INDEX idx_documentos_protocolo ON documentos(numero_protocolo);
CREATE INDEX idx_documentos_transportadora ON documentos(id_transportadora);
CREATE INDEX idx_documentos_tipo ON documentos(id_tipo_documento);
CREATE INDEX idx_documentos_status ON documentos(status_documento);
CREATE INDEX idx_documentos_data_upload ON documentos(data_upload);
CREATE INDEX idx_documentos_data_vencimento ON documentos(data_vencimento);
CREATE INDEX idx_documentos_hash ON documentos(hash_arquivo);
-- Índice composto para consultas frequentes
CREATE INDEX idx_documentos_transportadora_status_vencimento ON documentos(id_transportadora, status_documento, data_vencimento);

-- =====================================================
-- TABELA: HISTORICO_DOCUMENTOS
-- Registra todas as ações realizadas nos documentos
-- =====================================================
CREATE TABLE historico_documentos (
    id_historico SERIAL PRIMARY KEY,
    id_documento INTEGER NOT NULL REFERENCES documentos(id_documento) ON DELETE CASCADE,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE RESTRICT,
    acao VARCHAR(50) NOT NULL,
    status_anterior VARCHAR(20),
    status_novo VARCHAR(20),
    observacoes TEXT,
    dados_alteracao JSONB,
    ip_origem INET,
    data_acao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para histórico
CREATE INDEX idx_historico_documento ON historico_documentos(id_documento);
CREATE INDEX idx_historico_usuario ON historico_documentos(id_usuario);
CREATE INDEX idx_historico_data_acao ON historico_documentos(data_acao);
CREATE INDEX idx_historico_acao ON historico_documentos(acao);

-- =====================================================
-- TABELA: NOTIFICACOES
-- Gerencia notificações enviadas aos usuários
-- =====================================================
CREATE TABLE notificacoes (
    id_notificacao SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    id_documento INTEGER REFERENCES documentos(id_documento) ON DELETE SET NULL,
    tipo_notificacao VARCHAR(50) NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    mensagem TEXT NOT NULL,
    canal VARCHAR(20) DEFAULT 'EMAIL' CHECK (canal IN ('EMAIL', 'SMS', 'PUSH', 'SISTEMA')),
    status_envio VARCHAR(20) DEFAULT 'PENDENTE' CHECK (status_envio IN ('PENDENTE', 'ENVIADO', 'ERRO', 'LIDO')),
    data_envio TIMESTAMP,
    data_leitura TIMESTAMP,
    tentativas_envio INTEGER DEFAULT 0,
    erro_envio TEXT,
    dados_extras JSONB,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para notificações
CREATE INDEX idx_notificacoes_usuario ON notificacoes(id_usuario);
CREATE INDEX idx_notificacoes_documento ON notificacoes(id_documento);
CREATE INDEX idx_notificacoes_status_envio ON notificacoes(status_envio);
CREATE INDEX idx_notificacoes_data_criacao ON notificacoes(data_criacao);
CREATE INDEX idx_notificacoes_tipo ON notificacoes(tipo_notificacao);

-- =====================================================
-- TRIGGERS PARA AUDITORIA E AUTOMAÇÃO
-- =====================================================

-- Função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_atualizacao = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicação do trigger em tabelas relevantes
CREATE TRIGGER trigger_atualizar_transportadoras
    BEFORE UPDATE ON transportadoras
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_atualizar_usuarios
    BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_atualizar_documentos
    BEFORE UPDATE ON documentos
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_atualizar_configuracoes
    BEFORE UPDATE ON configuracoes
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

-- Função para auditoria automática de documentos
CREATE OR REPLACE FUNCTION auditar_documento()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO historico_documentos (
            id_documento, id_usuario, acao, status_anterior, 
            status_novo, observacoes, dados_alteracao
        ) VALUES (
            NEW.id_documento,
            COALESCE(NEW.id_usuario_aprovacao, OLD.id_usuario_upload),
            'ATUALIZACAO',
            OLD.status_documento,
            NEW.status_documento,
            NEW.observacoes_analista,
            jsonb_build_object(
                'campos_alterados', 
                (SELECT jsonb_object_agg(key, jsonb_build_object('anterior', old_val, 'novo', new_val))
                 FROM (
                     SELECT key, to_jsonb(OLD) -> key as old_val, to_jsonb(NEW) -> key as new_val
                     FROM jsonb_object_keys(to_jsonb(NEW)) as key
                     WHERE to_jsonb(NEW) -> key != to_jsonb(OLD) -> key
                 ) as changes)
            )
        );
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO historico_documentos (
            id_documento, id_usuario, acao, status_novo, observacoes
        ) VALUES (
            NEW.id_documento,
            NEW.id_usuario_upload,
            'CRIACAO',
            NEW.status_documento,
            'Documento criado no sistema'
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditar_documento
    AFTER INSERT OR UPDATE ON documentos
    FOR EACH ROW EXECUTE FUNCTION auditar_documento();

-- Função para geração automática de protocolo
CREATE OR REPLACE FUNCTION gerar_protocolo()
RETURNS TRIGGER AS $$
DECLARE
    ano_atual INTEGER;
    sequencial INTEGER;
    protocolo VARCHAR(20);
BEGIN
    ano_atual := EXTRACT(YEAR FROM CURRENT_DATE);
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_protocolo FROM 5 FOR 6) AS INTEGER)), 0) + 1
    INTO sequencial
    FROM documentos
    WHERE numero_protocolo LIKE ano_atual::TEXT || '%';
    
    protocolo := ano_atual::TEXT || LPAD(sequencial::TEXT, 6, '0');
    NEW.numero_protocolo := protocolo;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_gerar_protocolo
    BEFORE INSERT ON documentos
    FOR EACH ROW 
    WHEN (NEW.numero_protocolo IS NULL OR NEW.numero_protocolo = '')
    EXECUTE FUNCTION gerar_protocolo();

-- Função para verificar documentos vencidos
CREATE OR REPLACE FUNCTION verificar_documentos_vencidos()
RETURNS void AS $$
BEGIN
    UPDATE documentos 
    SET status_documento = 'VENCIDO'
    WHERE status_documento = 'APROVADO' 
      AND data_vencimento IS NOT NULL 
      AND data_vencimento < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VIEWS MATERIALIZADAS PARA PERFORMANCE
-- =====================================================

-- View para dashboard administrativo
CREATE MATERIALIZED VIEW vw_dashboard_admin AS
SELECT 
    COUNT(DISTINCT t.id_transportadora) as total_transportadoras,
    COUNT(DISTINCT CASE WHEN t.status_ativo THEN t.id_transportadora END) as transportadoras_ativas,
    COUNT(d.id_documento) as total_documentos,
    COUNT(CASE WHEN d.status_documento = 'APROVADO' THEN 1 END) as documentos_aprovados,
    COUNT(CASE WHEN d.status_documento = 'PENDENTE' THEN 1 END) as documentos_pendentes,
    COUNT(CASE WHEN d.status_documento = 'REJEITADO' THEN 1 END) as documentos_rejeitados,
    COUNT(CASE WHEN d.status_documento = 'VENCIDO' OR d.data_vencimento < CURRENT_DATE THEN 1 END) as documentos_vencidos,
    ROUND(AVG(EXTRACT(DAY FROM (d.data_aprovacao - d.data_upload))), 1) as tempo_medio_aprovacao_dias,
    COUNT(CASE WHEN d.data_upload >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as documentos_ultimo_mes,
    CURRENT_TIMESTAMP as ultima_atualizacao
FROM transportadoras t
LEFT JOIN documentos d ON t.id_transportadora = d.id_transportadora
WHERE t.data_cadastro <= CURRENT_TIMESTAMP;

-- View para compliance por transportadora
CREATE MATERIALIZED VIEW vw_compliance_transportadora AS
SELECT 
    t.id_transportadora,
    t.razao_social,
    t.cnpj,
    t.status_ativo,
    COUNT(td.id_tipo) as tipos_obrigatorios,
    COUNT(DISTINCT CASE WHEN d.status_documento = 'APROVADO' AND (d.data_vencimento IS NULL OR d.data_vencimento >= CURRENT_DATE) THEN d.id_tipo_documento END) as tipos_conformes,
    COUNT(CASE WHEN d.status_documento = 'APROVADO' THEN 1 END) as documentos_aprovados,
    COUNT(CASE WHEN d.data_vencimento < CURRENT_DATE THEN 1 END) as documentos_vencidos,
    COUNT(CASE WHEN d.status_documento = 'PENDENTE' THEN 1 END) as documentos_pendentes,
    ROUND(
        CASE 
            WHEN COUNT(td.id_tipo) > 0 THEN
                (COUNT(DISTINCT CASE WHEN d.status_documento = 'APROVADO' AND (d.data_vencimento IS NULL OR d.data_vencimento >= CURRENT_DATE) THEN d.id_tipo_documento END)::DECIMAL / 
                 COUNT(td.id_tipo)::DECIMAL) * 100
            ELSE 0
        END, 2
    ) as percentual_compliance,
    CURRENT_TIMESTAMP as ultima_atualizacao
FROM transportadoras t
CROSS JOIN tipos_documento td
LEFT JOIN documentos d ON t.id_transportadora = d.id_transportadora AND td.id_tipo = d.id_tipo_documento
WHERE t.status_ativo = TRUE AND td.ativo = TRUE
GROUP BY t.id_transportadora, t.razao_social, t.cnpj, t.status_ativo;

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
    EXTRACT(DAY FROM (d.data_vencimento - CURRENT_DATE)) as dias_para_vencimento,
    CASE 
        WHEN d.data_vencimento < CURRENT_DATE THEN 'VENCIDO'
        WHEN d.data_vencimento <= CURRENT_DATE + INTERVAL '7 days' THEN 'CRITICO'
        WHEN d.data_vencimento <= CURRENT_DATE + INTERVAL '30 days' THEN 'ALERTA'
        ELSE 'OK'
    END as status_vencimento,
    td.dias_aviso_vencimento,
    td.dias_tolerancia
FROM documentos d
JOIN transportadoras t ON d.id_transportadora = t.id_transportadora
JOIN tipos_documento td ON d.id_tipo_documento = td.id_tipo
WHERE d.status_documento = 'APROVADO' 
  AND d.data_vencimento IS NOT NULL
  AND d.data_vencimento <= CURRENT_DATE + INTERVAL '60 days'
  AND t.status_ativo = TRUE
ORDER BY d.data_vencimento ASC;

-- =====================================================
-- ÍNDICES ÚNICOS COMPOSTOS
-- =====================================================

-- Evita documentos duplicados por transportadora e tipo
CREATE UNIQUE INDEX idx_documentos_unique_ativo 
ON documentos(id_transportadora, id_tipo_documento) 
WHERE status_documento IN ('APROVADO', 'PENDENTE');

-- =====================================================
-- FUNÇÃO PARA REFRESH DAS VIEWS MATERIALIZADAS
-- =====================================================
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW vw_dashboard_admin;
    REFRESH MATERIALIZED VIEW vw_compliance_transportadora;
    
    -- Log da atualização
    INSERT INTO configuracoes (chave, valor, descricao) 
    VALUES ('ultima_atualizacao_views', CURRENT_TIMESTAMP::text, 'Última atualização das views materializadas')
    ON CONFLICT (chave) DO UPDATE SET 
        valor = EXCLUDED.valor,
        data_atualizacao = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

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

-- Usuário administrador padrão
INSERT INTO usuarios (nome_completo, email, senha_hash, salt, tipo_usuario) VALUES
('Administrador NIMOENERGIA', 'admin@nimoenergia.com.br', 
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXzgVrncDAaa', -- senha: admin123
 'salt_admin_2024', 'ADMIN');

-- =====================================================
-- COMENTÁRIOS FINAIS
-- =====================================================

-- Este script cria a estrutura completa do banco de dados para o Portal NIMOENERGIA
-- Inclui todas as tabelas, índices, triggers, views e dados iniciais necessários
-- Para executar: psql -d nome_do_banco -f estrutura_nimoenergia.sql

-- Comandos úteis para manutenção:
-- SELECT refresh_materialized_views(); -- Atualiza views materializadas
-- SELECT verificar_documentos_vencidos(); -- Verifica documentos vencidos
-- SELECT * FROM vw_dashboard_admin; -- Visualiza métricas do dashboard
-- SELECT * FROM vw_compliance_transportadora; -- Visualiza compliance das transportadoras

