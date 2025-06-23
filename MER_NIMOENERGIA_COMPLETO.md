# Modelo de Entidade-Relacionamento (MER) - Portal NIMOENERGIA

## Visão Geral do Sistema

O Portal de Gestão de Documentos da NIMOENERGIA é um sistema robusto projetado para gerenciar o cadastro de transportadoras e o controle rigoroso de documentos obrigatórios no setor de transporte de combustíveis. Este documento apresenta a estrutura de banco de dados relacional e o Modelo de Entidade-Relacionamento (MER) que sustenta toda a arquitetura do sistema.

## Entidades Principais

### 1. USUARIOS
Entidade central que gerencia todos os usuários do sistema, incluindo administradores da NIMOENERGIA e representantes das transportadoras.

**Atributos:**
- `id` (PK): Identificador único do usuário
- `email`: Email único para autenticação
- `senha_hash`: Senha criptografada
- `nome`: Nome completo do usuário
- `tipo_usuario`: ENUM('ADMIN', 'TRANSPORTADORA')
- `ativo`: Status do usuário (ativo/inativo)
- `data_criacao`: Timestamp de criação
- `data_ultimo_acesso`: Último acesso ao sistema
- `transportadora_id` (FK): Referência à transportadora (apenas para tipo TRANSPORTADORA)

### 2. TRANSPORTADORAS
Entidade que armazena informações das empresas transportadoras cadastradas no sistema.

**Atributos:**
- `id` (PK): Identificador único da transportadora
- `cnpj`: CNPJ único da empresa
- `razao_social`: Razão social completa
- `nome_fantasia`: Nome fantasia da empresa
- `endereco`: Endereço completo
- `cidade`: Cidade da sede
- `estado`: Estado da sede
- `cep`: CEP do endereço
- `telefone`: Telefone de contato
- `email_contato`: Email principal de contato
- `responsavel_nome`: Nome do responsável legal
- `responsavel_cpf`: CPF do responsável
- `responsavel_cargo`: Cargo do responsável
- `status_cadastro`: ENUM('PENDENTE', 'APROVADO', 'SUSPENSO')
- `data_cadastro`: Data de cadastro no sistema
- `data_aprovacao`: Data de aprovação do cadastro

### 3. TIPOS_DOCUMENTO
Entidade que define os tipos de documentos obrigatórios para transportadoras.

**Atributos:**
- `id` (PK): Identificador único do tipo
- `codigo`: Código único do documento (ex: 'DOC_SOCIETARIO')
- `nome`: Nome descritivo do documento
- `descricao`: Descrição detalhada
- `tem_vencimento`: Boolean indicando se possui data de vencimento
- `tem_garantia`: Boolean indicando se possui valor de garantia
- `obrigatorio`: Boolean indicando se é obrigatório
- `categoria`: ENUM('EMPRESA', 'SEGURO', 'AMBIENTAL')
- `ativo`: Status do tipo de documento

### 4. DOCUMENTOS
Entidade central que armazena todos os documentos enviados pelas transportadoras.

**Atributos:**
- `id` (PK): Identificador único do documento
- `transportadora_id` (FK): Referência à transportadora
- `tipo_documento_id` (FK): Referência ao tipo de documento
- `nome_arquivo`: Nome original do arquivo
- `caminho_arquivo`: Caminho do arquivo no sistema
- `tamanho_arquivo`: Tamanho em bytes
- `tipo_mime`: Tipo MIME do arquivo
- `data_upload`: Data e hora do upload
- `data_vencimento`: Data de vencimento (quando aplicável)
- `valor_garantia`: Valor da garantia (quando aplicável)
- `status`: ENUM('PENDENTE', 'APROVADO', 'REJEITADO', 'VENCIDO')
- `observacoes`: Observações sobre o documento
- `aprovado_por` (FK): Usuário que aprovou/rejeitou
- `data_aprovacao`: Data da aprovação/rejeição

### 5. HISTORICO_DOCUMENTOS
Entidade que mantém o histórico de alterações nos documentos.

**Atributos:**
- `id` (PK): Identificador único do histórico
- `documento_id` (FK): Referência ao documento
- `usuario_id` (FK): Usuário que fez a alteração
- `acao`: ENUM('UPLOAD', 'APROVACAO', 'REJEICAO', 'VENCIMENTO')
- `status_anterior`: Status anterior do documento
- `status_novo`: Novo status do documento
- `observacoes`: Observações da ação
- `data_acao`: Data e hora da ação

### 6. NOTIFICACOES
Entidade para gerenciar notificações automáticas do sistema.

**Atributos:**
- `id` (PK): Identificador único da notificação
- `usuario_id` (FK): Usuário destinatário
- `transportadora_id` (FK): Transportadora relacionada
- `documento_id` (FK): Documento relacionado (opcional)
- `tipo`: ENUM('VENCIMENTO', 'APROVACAO', 'REJEICAO', 'CADASTRO')
- `titulo`: Título da notificação
- `mensagem`: Conteúdo da notificação
- `lida`: Boolean indicando se foi lida
- `data_criacao`: Data de criação
- `data_leitura`: Data de leitura

## Relacionamentos

### Relacionamentos Principais

1. **USUARIOS ↔ TRANSPORTADORAS**
   - Relacionamento: 1:N (Uma transportadora pode ter múltiplos usuários)
   - Chave estrangeira: `transportadora_id` em USUARIOS

2. **TRANSPORTADORAS ↔ DOCUMENTOS**
   - Relacionamento: 1:N (Uma transportadora possui múltiplos documentos)
   - Chave estrangeira: `transportadora_id` em DOCUMENTOS

3. **TIPOS_DOCUMENTO ↔ DOCUMENTOS**
   - Relacionamento: 1:N (Um tipo pode ter múltiplos documentos)
   - Chave estrangeira: `tipo_documento_id` em DOCUMENTOS

4. **DOCUMENTOS ↔ HISTORICO_DOCUMENTOS**
   - Relacionamento: 1:N (Um documento possui múltiplos históricos)
   - Chave estrangeira: `documento_id` em HISTORICO_DOCUMENTOS

5. **USUARIOS ↔ HISTORICO_DOCUMENTOS**
   - Relacionamento: 1:N (Um usuário pode ter múltiplas ações)
   - Chave estrangeira: `usuario_id` em HISTORICO_DOCUMENTOS

6. **USUARIOS ↔ NOTIFICACOES**
   - Relacionamento: 1:N (Um usuário pode ter múltiplas notificações)
   - Chave estrangeira: `usuario_id` em NOTIFICACOES

## Índices e Performance

### Índices Primários
- Todas as tabelas possuem chaves primárias auto-incrementais
- Índices únicos em campos como CNPJ, email de usuários

### Índices Secundários
- `idx_documentos_status` em DOCUMENTOS(status)
- `idx_documentos_vencimento` em DOCUMENTOS(data_vencimento)
- `idx_transportadoras_status` em TRANSPORTADORAS(status_cadastro)
- `idx_notificacoes_usuario_lida` em NOTIFICACOES(usuario_id, lida)
- `idx_historico_documento_data` em HISTORICO_DOCUMENTOS(documento_id, data_acao)

## Regras de Negócio

### Validações de Integridade

1. **CNPJ Único**: Cada transportadora deve ter um CNPJ único no sistema
2. **Email Único**: Cada usuário deve ter um email único
3. **Documentos Obrigatórios**: Transportadoras devem possuir todos os documentos marcados como obrigatórios
4. **Vencimentos**: Documentos com vencimento devem ser monitorados automaticamente
5. **Status Sequencial**: Documentos seguem fluxo: PENDENTE → APROVADO/REJEITADO → VENCIDO

### Triggers e Procedures

1. **Trigger de Vencimento**: Atualiza automaticamente status para VENCIDO quando data_vencimento < CURRENT_DATE
2. **Trigger de Notificação**: Cria notificações automáticas para vencimentos próximos (30, 15, 7 dias)
3. **Trigger de Histórico**: Registra automaticamente mudanças de status em HISTORICO_DOCUMENTOS

## Segurança e Auditoria

### Controle de Acesso
- Usuários ADMIN: Acesso completo ao sistema
- Usuários TRANSPORTADORA: Acesso apenas aos próprios dados

### Auditoria
- Todas as ações são registradas em HISTORICO_DOCUMENTOS
- Timestamps em todas as operações críticas
- Rastreabilidade completa de aprovações e rejeições

## Escalabilidade

### Particionamento
- Tabela HISTORICO_DOCUMENTOS pode ser particionada por data
- Tabela NOTIFICACOES pode ser particionada por status (lida/não lida)

### Arquivamento
- Documentos antigos podem ser movidos para storage de arquivamento
- Histórico pode ser compactado após períodos definidos

Este MER garante a integridade, performance e escalabilidade necessárias para o Portal NIMOENERGIA, atendendo aos requisitos específicos do setor de transporte de combustíveis e proporcionando uma base sólida para o crescimento futuro do sistema.

