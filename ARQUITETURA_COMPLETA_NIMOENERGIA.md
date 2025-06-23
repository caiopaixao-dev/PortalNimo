# Arquitetura Completa do Portal NIMOENERGIA
## Modelo de Entidade-Relacionamento (MER) e Estrutura de Dados Profissional

**Autor:** Manus AI  
**Data:** 18 de Junho de 2025  
**Projeto:** Portal de Gestão de Documentos NIMOENERGIA  
**Versão:** 1.0

---

## Sumário Executivo

O Portal NIMOENERGIA requer uma arquitetura robusta e escalável para gerenciar eficientemente o cadastro de transportadoras, controle de documentos e compliance regulatório. Este documento apresenta uma estrutura de dados completa baseada em princípios de engenharia de software e melhores práticas de desenvolvimento de sistemas corporativos.

A arquitetura proposta utiliza um modelo relacional normalizado que garante integridade referencial, escalabilidade e performance otimizada para operações de alta frequência. O sistema foi projetado para suportar milhares de transportadoras simultâneas, com processamento eficiente de documentos e monitoramento em tempo real de compliance.

---

## 1. Modelo de Entidade-Relacionamento (MER) Completo

### 1.1 Entidades Principais

O sistema NIMOENERGIA é estruturado em torno de sete entidades principais que representam os elementos fundamentais do negócio. Cada entidade foi cuidadosamente modelada para capturar todos os atributos necessários e suas relações interdependentes.

**USUARIOS** representa todos os usuários do sistema, incluindo administradores da NIMOENERGIA, analistas e usuários das transportadoras. Esta entidade centraliza a autenticação e autorização, permitindo controle granular de acesso baseado em perfis específicos. Os atributos incluem informações básicas de identificação, credenciais de acesso, dados de contato e metadados de auditoria como timestamps de criação e último acesso.

**TRANSPORTADORAS** constitui o núcleo do sistema, armazenando todas as informações corporativas das empresas parceiras. Esta entidade mantém dados cadastrais completos incluindo razão social, CNPJ, inscrições estaduais, endereços completos, dados de contato, informações bancárias e status operacional. Campos específicos como data de cadastro, responsável técnico e observações administrativas permitem gestão eficiente do relacionamento comercial.

**TIPOS_DOCUMENTO** define a taxonomia completa de documentos exigidos pela NIMOENERGIA. Esta entidade parametriza o sistema, permitindo flexibilidade na configuração de novos tipos documentais sem alterações estruturais. Cada tipo possui características específicas como obrigatoriedade de vencimento, necessidade de garantia (para seguros), categoria de classificação e regras de validação automática.

**DOCUMENTOS** representa o repositório central de todos os arquivos enviados pelas transportadoras. Esta entidade mantém metadados completos incluindo informações do arquivo original, dados de processamento, status de aprovação, observações de análise e histórico de alterações. A estrutura permite versionamento de documentos e rastreabilidade completa do ciclo de vida documental.

**HISTORICO_DOCUMENTOS** implementa auditoria completa de todas as operações realizadas nos documentos. Esta entidade registra cronologicamente todas as ações, alterações de status, comentários de analistas e decisões administrativas. O histórico garante transparência total do processo e permite análises retrospectivas para melhoria contínua dos procedimentos.

**NOTIFICACOES** gerencia toda a comunicação automatizada do sistema. Esta entidade controla o envio de alertas de vencimento, notificações de aprovação/rejeição, lembretes de renovação e comunicados administrativos. O sistema de notificações suporta múltiplos canais (email, SMS, push) e permite personalização baseada em preferências do usuário.

**CONFIGURACOES** centraliza todos os parâmetros operacionais do sistema. Esta entidade permite configuração dinâmica de regras de negócio, prazos de vencimento, limites de arquivo, formatos aceitos e políticas de compliance. A parametrização via banco de dados elimina necessidade de alterações de código para ajustes operacionais.

### 1.2 Relacionamentos e Cardinalidades

Os relacionamentos entre entidades foram modelados seguindo princípios de normalização e integridade referencial. Cada relacionamento possui cardinalidade específica que reflete as regras de negócio da NIMOENERGIA.

O relacionamento **USUARIOS ↔ TRANSPORTADORAS** estabelece a associação entre usuários e suas respectivas empresas. Um usuário pode estar vinculado a apenas uma transportadora (1:N), mas uma transportadora pode ter múltiplos usuários cadastrados. Esta estrutura permite gestão hierárquica de acesso, onde administradores da transportadora podem gerenciar usuários subordinados.

A relação **TRANSPORTADORAS ↔ DOCUMENTOS** representa o core do sistema documental. Uma transportadora pode possuir múltiplos documentos (1:N), mas cada documento pertence exclusivamente a uma transportadora. Esta cardinalidade garante isolamento de dados e segurança informacional entre diferentes empresas.

O vínculo **TIPOS_DOCUMENTO ↔ DOCUMENTOS** estabelece a classificação documental. Cada documento deve estar associado a exatamente um tipo (N:1), enquanto um tipo pode ser utilizado por múltiplos documentos. Esta estrutura permite padronização e facilita análises estatísticas por categoria documental.

A conexão **DOCUMENTOS ↔ HISTORICO_DOCUMENTOS** implementa auditoria completa. Cada documento pode ter múltiplas entradas de histórico (1:N), registrando todas as operações realizadas. Esta relação é fundamental para compliance regulatório e rastreabilidade de processos.

O relacionamento **USUARIOS ↔ NOTIFICACOES** gerencia a comunicação personalizada. Um usuário pode receber múltiplas notificações (1:N), permitindo controle granular de preferências de comunicação e histórico de mensagens enviadas.

### 1.3 Atributos Detalhados por Entidade

Cada entidade possui conjunto específico de atributos projetados para capturar completamente as informações necessárias para operação eficiente do sistema.

A entidade **USUARIOS** inclui campos de identificação única (id_usuario), dados pessoais (nome_completo, email, telefone), credenciais de acesso (senha_hash, salt), informações de perfil (tipo_usuario, status_ativo), dados de auditoria (data_criacao, ultimo_acesso, ip_ultimo_acesso) e configurações personalizadas (preferencias_notificacao, timezone, idioma).

**TRANSPORTADORAS** contém identificadores corporativos (id_transportadora, cnpj, razao_social, nome_fantasia), dados de localização (endereco_completo, cep, cidade, estado, pais), informações de contato (telefone_principal, email_corporativo, site), dados regulatórios (inscricao_estadual, inscricao_municipal, antt), informações bancárias (banco, agencia, conta), dados operacionais (status_ativo, data_cadastro, responsavel_tecnico) e campos administrativos (observacoes, classificacao_risco, limite_credito).

A entidade **TIPOS_DOCUMENTO** especifica características documentais através de campos como identificador único (id_tipo), denominação (nome_tipo, descricao), categorização (categoria, subcategoria), regras de validação (obrigatorio_vencimento, obrigatorio_garantia, formatos_aceitos, tamanho_maximo), configurações de processo (aprovacao_automatica, dias_aviso_vencimento, dias_tolerancia) e metadados (ativo, ordem_exibicao, icone).

**DOCUMENTOS** mantém informações completas através de campos de identificação (id_documento, numero_protocolo), associações (id_transportadora, id_tipo_documento, id_usuario_upload), dados do arquivo (nome_arquivo_original, nome_arquivo_sistema, tamanho_arquivo, hash_arquivo), informações temporais (data_upload, data_vencimento, data_aprovacao), dados de processo (status_documento, observacoes_analista, motivo_rejeicao) e metadados de auditoria (versao_documento, ip_upload, user_agent).

### 1.4 Índices e Otimizações

Para garantir performance otimizada em operações de alta frequência, o modelo inclui estratégia abrangente de indexação. Índices primários são criados automaticamente para chaves primárias, enquanto índices secundários são estrategicamente posicionados em campos de consulta frequente.

Índices compostos são implementados para consultas complexas envolvendo múltiplos critérios de filtro. Por exemplo, um índice composto em (id_transportadora, status_documento, data_vencimento) otimiza consultas de documentos por empresa e status com ordenação por vencimento.

Índices parciais são utilizados para otimizar consultas específicas, como documentos ativos ou vencidos. Estes índices reduzem significativamente o espaço de armazenamento e melhoram performance de consultas especializadas.

---

## 2. Estrutura de Banco de Dados SQL

### 2.1 Scripts de Criação de Tabelas

A implementação física do modelo utiliza PostgreSQL como sistema de gerenciamento de banco de dados, escolhido por sua robustez, escalabilidade e recursos avançados de integridade referencial.

```sql
-- Criação do schema principal
CREATE SCHEMA nimoenergia;
SET search_path TO nimoenergia;

-- Tabela de configurações do sistema
CREATE TABLE configuracoes (
    id_configuracao SERIAL PRIMARY KEY,
    chave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    descricao TEXT,
    tipo_valor VARCHAR(20) DEFAULT 'string',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de tipos de documento
CREATE TABLE tipos_documento (
    id_tipo SERIAL PRIMARY KEY,
    nome_tipo VARCHAR(100) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(50) NOT NULL,
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

-- Tabela de transportadoras
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
    classificacao_risco VARCHAR(10) DEFAULT 'BAIXO',
    limite_credito DECIMAL(15,2),
    observacoes TEXT,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de usuários
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    id_transportadora INTEGER REFERENCES transportadoras(id_transportadora),
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
    preferencias_notificacao JSONB DEFAULT '{}',
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    idioma VARCHAR(5) DEFAULT 'pt-BR',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de documentos
CREATE TABLE documentos (
    id_documento SERIAL PRIMARY KEY,
    numero_protocolo VARCHAR(20) UNIQUE NOT NULL,
    id_transportadora INTEGER NOT NULL REFERENCES transportadoras(id_transportadora),
    id_tipo_documento INTEGER NOT NULL REFERENCES tipos_documento(id_tipo),
    id_usuario_upload INTEGER NOT NULL REFERENCES usuarios(id_usuario),
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
    id_usuario_aprovacao INTEGER REFERENCES usuarios(id_usuario),
    observacoes_analista TEXT,
    motivo_rejeicao TEXT,
    versao_documento INTEGER DEFAULT 1,
    id_documento_anterior INTEGER REFERENCES documentos(id_documento),
    ip_upload INET,
    user_agent TEXT,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de histórico de documentos
CREATE TABLE historico_documentos (
    id_historico SERIAL PRIMARY KEY,
    id_documento INTEGER NOT NULL REFERENCES documentos(id_documento),
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    acao VARCHAR(50) NOT NULL,
    status_anterior VARCHAR(20),
    status_novo VARCHAR(20),
    observacoes TEXT,
    dados_alteracao JSONB,
    ip_origem INET,
    data_acao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de notificações
CREATE TABLE notificacoes (
    id_notificacao SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    id_documento INTEGER REFERENCES documentos(id_documento),
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
```

### 2.2 Triggers e Procedures

O sistema implementa triggers automáticos para manutenção de integridade e auditoria. Estes mecanismos garantem consistência de dados e rastreabilidade completa de operações.

```sql
-- Trigger para atualização automática de timestamps
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

-- Trigger para auditoria automática de documentos
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
                (SELECT jsonb_object_agg(key, value) 
                 FROM jsonb_each(to_jsonb(NEW)) 
                 WHERE to_jsonb(NEW) -> key != to_jsonb(OLD) -> key)
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

-- Procedure para geração automática de protocolo
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
    FOR EACH ROW EXECUTE FUNCTION gerar_protocolo();
```

### 2.3 Views e Consultas Otimizadas

Views materializadas são implementadas para consultas complexas frequentes, melhorando significativamente a performance de relatórios e dashboards.

```sql
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
    AVG(EXTRACT(DAY FROM (d.data_aprovacao - d.data_upload))) as tempo_medio_aprovacao,
    COUNT(CASE WHEN d.data_upload >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as documentos_ultimo_mes
FROM transportadoras t
LEFT JOIN documentos d ON t.id_transportadora = d.id_transportadora
WHERE t.data_cadastro <= CURRENT_TIMESTAMP;

-- View para compliance por transportadora
CREATE MATERIALIZED VIEW vw_compliance_transportadora AS
SELECT 
    t.id_transportadora,
    t.razao_social,
    t.cnpj,
    COUNT(td.id_tipo) as tipos_obrigatorios,
    COUNT(DISTINCT d.id_tipo_documento) as tipos_enviados,
    COUNT(CASE WHEN d.status_documento = 'APROVADO' THEN 1 END) as documentos_aprovados,
    COUNT(CASE WHEN d.data_vencimento < CURRENT_DATE THEN 1 END) as documentos_vencidos,
    ROUND(
        (COUNT(CASE WHEN d.status_documento = 'APROVADO' AND (d.data_vencimento IS NULL OR d.data_vencimento >= CURRENT_DATE) THEN 1 END)::DECIMAL / 
         COUNT(td.id_tipo)::DECIMAL) * 100, 2
    ) as percentual_compliance
FROM transportadoras t
CROSS JOIN tipos_documento td
LEFT JOIN documentos d ON t.id_transportadora = d.id_transportadora AND td.id_tipo = d.id_tipo_documento
WHERE t.status_ativo = TRUE AND td.ativo = TRUE
GROUP BY t.id_transportadora, t.razao_social, t.cnpj;

-- View para documentos próximos ao vencimento
CREATE VIEW vw_documentos_vencimento AS
SELECT 
    d.id_documento,
    d.numero_protocolo,
    t.razao_social,
    t.email_corporativo,
    td.nome_tipo,
    d.data_vencimento,
    EXTRACT(DAY FROM (d.data_vencimento - CURRENT_DATE)) as dias_para_vencimento,
    CASE 
        WHEN d.data_vencimento < CURRENT_DATE THEN 'VENCIDO'
        WHEN d.data_vencimento <= CURRENT_DATE + INTERVAL '7 days' THEN 'CRITICO'
        WHEN d.data_vencimento <= CURRENT_DATE + INTERVAL '30 days' THEN 'ALERTA'
        ELSE 'OK'
    END as status_vencimento
FROM documentos d
JOIN transportadoras t ON d.id_transportadora = t.id_transportadora
JOIN tipos_documento td ON d.id_tipo_documento = td.id_tipo
WHERE d.status_documento = 'APROVADO' 
  AND d.data_vencimento IS NOT NULL
  AND d.data_vencimento <= CURRENT_DATE + INTERVAL '60 days'
ORDER BY d.data_vencimento ASC;

-- Refresh automático das views materializadas
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW vw_dashboard_admin;
    REFRESH MATERIALIZED VIEW vw_compliance_transportadora;
END;
$$ LANGUAGE plpgsql;

-- Agendamento para refresh das views (executar via cron)
SELECT cron.schedule('refresh-views', '0 */6 * * *', 'SELECT refresh_materialized_views();');
```

---

## 3. Arquitetura de Backend

### 3.1 Estrutura da API REST

O backend utiliza Flask como framework principal, implementando arquitetura RESTful com padrões de mercado para APIs corporativas. A estrutura modular permite escalabilidade e manutenibilidade do código.

A organização do projeto segue padrões de Clean Architecture, separando responsabilidades em camadas distintas: apresentação (controllers), aplicação (services), domínio (models) e infraestrutura (repositories). Esta separação garante baixo acoplamento e alta coesão entre componentes.

O sistema de roteamento implementa versionamento de API, permitindo evolução controlada sem quebra de compatibilidade. Todas as rotas seguem convenções RESTful com verbos HTTP apropriados e códigos de status padronizados.

Middleware de autenticação e autorização protege endpoints sensíveis, implementando JWT (JSON Web Tokens) para sessões stateless. O sistema suporta diferentes níveis de acesso baseados em perfis de usuário.

### 3.2 Camada de Serviços

A camada de serviços encapsula regras de negócio complexas, mantendo controllers enxutos e focados em responsabilidades de apresentação. Cada serviço implementa operações específicas do domínio com validações apropriadas.

O serviço de documentos gerencia todo o ciclo de vida documental, desde upload até aprovação final. Implementa validações de formato, tamanho, integridade e regras específicas por tipo de documento. O processamento assíncrono permite upload de arquivos grandes sem bloqueio da interface.

Serviços de notificação implementam padrão Observer, disparando alertas automáticos baseados em eventos do sistema. O sistema suporta múltiplos canais de comunicação com fallback automático em caso de falha.

O serviço de compliance calcula automaticamente percentuais de conformidade, identifica documentos vencidos e gera relatórios de auditoria. Algoritmos otimizados garantem performance mesmo com grandes volumes de dados.

### 3.3 Integração com Banco de Dados

A camada de persistência utiliza SQLAlchemy como ORM, proporcionando abstração robusta sobre operações de banco de dados. Modelos de dados implementam validações automáticas e relacionamentos complexos.

Connection pooling otimiza utilização de recursos de banco, com configurações específicas para ambientes de produção. Transações são gerenciadas automaticamente com rollback em caso de erro.

Migrations automáticas permitem evolução controlada do schema de banco, mantendo versionamento e rastreabilidade de alterações estruturais. Scripts de migração são testados em ambientes de desenvolvimento antes da aplicação em produção.

### 3.4 Sistema de Upload e Armazenamento

O sistema de upload implementa múltiplas camadas de validação e segurança. Arquivos são escaneados para detecção de malware, validados quanto a formato e integridade, e armazenados com nomenclatura padronizada.

Armazenamento utiliza estrutura hierárquica baseada em data e tipo de documento, facilitando organização e backup. Metadados são extraídos automaticamente e armazenados no banco para consultas eficientes.

Versionamento de documentos permite manutenção de histórico completo, com links para versões anteriores. Compressão automática reduz espaço de armazenamento sem perda de qualidade.

Sistema de backup implementa replicação automática para múltiplas localizações, garantindo disponibilidade e recuperação em caso de falha. Políticas de retenção são configuráveis por tipo de documento.

---

## 4. Integração Frontend-Backend

### 4.1 Arquitetura de Comunicação

A comunicação entre frontend e backend utiliza protocolo HTTPS com autenticação baseada em tokens JWT. Todas as requisições incluem headers de segurança apropriados e validação de origem.

Estado da aplicação é gerenciado através de store centralizado, mantendo sincronização entre interface e dados do servidor. Atualizações em tempo real são implementadas via WebSockets para notificações instantâneas.

Cache inteligente reduz requisições desnecessárias, com invalidação automática baseada em eventos de alteração. Estratégias de cache são específicas por tipo de dados e frequência de atualização.

### 4.2 Tratamento de Erros e Fallbacks

Sistema robusto de tratamento de erros implementa retry automático para falhas temporárias, com backoff exponencial para evitar sobrecarga do servidor. Mensagens de erro são padronizadas e user-friendly.

Fallbacks garantem funcionalidade básica mesmo com conectividade limitada. Dados críticos são armazenados localmente com sincronização automática quando conexão é restabelecida.

Monitoramento de performance identifica gargalos e otimiza automaticamente requisições. Métricas são coletadas em tempo real para análise proativa de problemas.

### 4.3 Segurança e Validação

Validação dupla (frontend e backend) garante integridade de dados e previne ataques de manipulação. Sanitização automática previne injeção de código malicioso.

CORS é configurado restritivamente, permitindo apenas origens autorizadas. Headers de segurança implementam proteções contra ataques comuns como XSS e CSRF.

Auditoria completa registra todas as operações sensíveis, mantendo logs detalhados para análise forense em caso de incidentes de segurança.

---

## 5. Monitoramento e Performance

### 5.1 Métricas de Sistema

Sistema de monitoramento coleta métricas abrangentes de performance, incluindo tempo de resposta, throughput, utilização de recursos e taxa de erro. Dashboards em tempo real permitem acompanhamento proativo.

Alertas automáticos são configurados para thresholds críticos, notificando equipe técnica imediatamente em caso de degradação de performance ou falhas de sistema.

Análise de tendências identifica padrões de uso e permite planejamento de capacidade. Relatórios automatizados fornecem insights para otimização contínua.

### 5.2 Otimização de Performance

Índices de banco de dados são otimizados baseado em padrões de consulta reais. Análise de query plans identifica oportunidades de melhoria e gargalos de performance.

Cache distribuído implementa estratégias multi-layer, com cache de aplicação, banco de dados e CDN para recursos estáticos. TTL é configurado dinamicamente baseado em padrões de acesso.

Compressão de dados reduz tráfego de rede, com algoritmos específicos para diferentes tipos de conteúdo. Minificação de assets frontend reduz tempo de carregamento.

### 5.3 Escalabilidade

Arquitetura horizontal permite adição de instâncias conforme demanda. Load balancer distribui requisições automaticamente entre servidores disponíveis.

Microserviços podem ser implementados para componentes específicos, permitindo escalabilidade independente de funcionalidades com diferentes padrões de uso.

Auto-scaling baseado em métricas de CPU, memória e throughput ajusta automaticamente capacidade conforme demanda, otimizando custos operacionais.

---

## Conclusão

A arquitetura proposta para o Portal NIMOENERGIA implementa melhores práticas de engenharia de software, garantindo robustez, escalabilidade e manutenibilidade. O modelo de dados normalizado suporta operações complexas com performance otimizada, enquanto a arquitetura de backend modular permite evolução controlada do sistema.

A integração frontend-backend utiliza padrões modernos de desenvolvimento, proporcionando experiência de usuário fluida e responsiva. Sistemas de monitoramento e otimização garantem operação confiável em ambiente de produção.

Esta estrutura fornece base sólida para crescimento futuro, suportando expansão de funcionalidades e aumento de volume de dados sem comprometimento de performance ou estabilidade.

