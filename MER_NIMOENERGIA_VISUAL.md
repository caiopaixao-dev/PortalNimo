# MER - Portal NIMOENERGIA
## Modelo de Entidade-Relacionamento Completo

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           PORTAL NIMOENERGIA - MER                             │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────┐         ┌─────────────────────────┐
│      CONFIGURACOES      │         │     TIPOS_DOCUMENTO     │
├─────────────────────────┤         ├─────────────────────────┤
│ id_configuracao (PK)    │         │ id_tipo (PK)            │
│ chave                   │         │ nome_tipo               │
│ valor                   │         │ descricao               │
│ descricao               │         │ categoria               │
│ tipo_valor              │         │ subcategoria            │
│ data_criacao            │         │ obrigatorio_vencimento  │
│ data_atualizacao        │         │ obrigatorio_garantia    │
└─────────────────────────┘         │ formatos_aceitos        │
                                    │ tamanho_maximo_mb       │
                                    │ aprovacao_automatica    │
                                    │ dias_aviso_vencimento   │
                                    │ dias_tolerancia         │
                                    │ ativo                   │
                                    │ ordem_exibicao          │
                                    │ icone                   │
                                    │ data_criacao            │
                                    └─────────────────────────┘
                                                │
                                                │ 1:N
                                                ▼
┌─────────────────────────┐         ┌─────────────────────────┐
│     TRANSPORTADORAS     │         │       DOCUMENTOS        │
├─────────────────────────┤         ├─────────────────────────┤
│ id_transportadora (PK)  │◄────────┤ id_documento (PK)       │
│ cnpj                    │ 1:N     │ numero_protocolo        │
│ razao_social            │         │ id_transportadora (FK)  │
│ nome_fantasia           │         │ id_tipo_documento (FK)  │
│ inscricao_estadual      │         │ id_usuario_upload (FK)  │
│ inscricao_municipal     │         │ nome_arquivo_original   │
│ antt                    │         │ nome_arquivo_sistema    │
│ endereco_logradouro     │         │ caminho_arquivo         │
│ endereco_numero         │         │ tamanho_arquivo         │
│ endereco_complemento    │         │ hash_arquivo            │
│ endereco_bairro         │         │ mime_type               │
│ endereco_cidade         │         │ data_upload             │
│ endereco_estado         │         │ data_vencimento         │
│ endereco_cep            │         │ valor_garantia          │
│ endereco_pais           │         │ status_documento        │
│ telefone_principal      │         │ data_aprovacao          │
│ telefone_secundario     │         │ id_usuario_aprovacao(FK)│
│ email_corporativo       │         │ observacoes_analista    │
│ email_financeiro        │         │ motivo_rejeicao         │
│ site                    │         │ versao_documento        │
│ responsavel_tecnico     │         │ id_documento_anterior(FK)│
│ responsavel_financeiro  │         │ ip_upload               │
│ banco                   │         │ user_agent              │
│ agencia                 │         │ data_atualizacao        │
│ conta                   │         └─────────────────────────┘
│ status_ativo            │                       │
│ classificacao_risco     │                       │ 1:N
│ limite_credito          │                       ▼
│ observacoes             │         ┌─────────────────────────┐
│ data_cadastro           │         │   HISTORICO_DOCUMENTOS  │
│ data_atualizacao        │         ├─────────────────────────┤
└─────────────────────────┘         │ id_historico (PK)       │
            │                       │ id_documento (FK)       │
            │ 1:N                   │ id_usuario (FK)         │
            ▼                       │ acao                    │
┌─────────────────────────┐         │ status_anterior         │
│        USUARIOS         │         │ status_novo             │
├─────────────────────────┤         │ observacoes             │
│ id_usuario (PK)         │         │ dados_alteracao         │
│ id_transportadora (FK)  │         │ ip_origem               │
│ nome_completo           │         │ data_acao               │
│ email                   │         └─────────────────────────┘
│ senha_hash              │
│ salt                    │
│ telefone                │         ┌─────────────────────────┐
│ tipo_usuario            │         │      NOTIFICACOES       │
│ status_ativo            │         ├─────────────────────────┤
│ ultimo_acesso           │◄────────┤ id_notificacao (PK)     │
│ ip_ultimo_acesso        │ 1:N     │ id_usuario (FK)         │
│ tentativas_login        │         │ id_documento (FK)       │
│ bloqueado_ate           │         │ tipo_notificacao        │
│ preferencias_notificacao│         │ titulo                  │
│ timezone                │         │ mensagem                │
│ idioma                  │         │ canal                   │
│ data_criacao            │         │ status_envio            │
│ data_atualizacao        │         │ data_envio              │
└─────────────────────────┘         │ data_leitura            │
                                    │ tentativas_envio        │
                                    │ erro_envio              │
                                    │ dados_extras            │
                                    │ data_criacao            │
                                    └─────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              RELACIONAMENTOS                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│ TRANSPORTADORAS (1) ──── (N) USUARIOS                                          │
│ TRANSPORTADORAS (1) ──── (N) DOCUMENTOS                                        │
│ TIPOS_DOCUMENTO (1) ──── (N) DOCUMENTOS                                        │
│ USUARIOS (1) ──── (N) DOCUMENTOS (upload)                                      │
│ USUARIOS (1) ──── (N) DOCUMENTOS (aprovacao)                                   │
│ DOCUMENTOS (1) ──── (N) HISTORICO_DOCUMENTOS                                   │
│ USUARIOS (1) ──── (N) HISTORICO_DOCUMENTOS                                     │
│ USUARIOS (1) ──── (N) NOTIFICACOES                                             │
│ DOCUMENTOS (1) ──── (N) NOTIFICACOES                                           │
│ DOCUMENTOS (1) ──── (1) DOCUMENTOS (versao_anterior) [AUTO-RELACIONAMENTO]     │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                            TIPOS DE USUÁRIO                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│ ADMIN         - Administradores da NIMOENERGIA (acesso total)                  │
│ ANALISTA      - Analistas da NIMOENERGIA (aprovação de documentos)             │
│ TRANSPORTADORA - Usuários das transportadoras (upload e consulta)              │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                         STATUS DE DOCUMENTOS                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│ PENDENTE      - Documento enviado, aguardando análise                          │
│ APROVADO      - Documento aprovado pela NIMOENERGIA                            │
│ REJEITADO     - Documento rejeitado (necessita correção)                       │
│ VENCIDO       - Documento com data de vencimento expirada                      │
│ RENOVACAO     - Documento em processo de renovação                             │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                      CATEGORIAS DE DOCUMENTOS                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│ EMPRESA       - Documentos societários e cadastrais                            │
│ SEGUROS       - Seguros obrigatórios (RCF-DC, RCTR-C, Ambiental)              │
│ AMBIENTAL     - Licenças e certificados ambientais                             │
└─────────────────────────────────────────────────────────────────────────────────┘
```

