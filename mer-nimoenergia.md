# 🎨 MER - MODELO ENTIDADE-RELACIONAMENTO
## PORTAL NIMOENERGIA - GESTÃO DE TRANSPORTADORAS

```
                                    PORTAL NIMOENERGIA
                              Sistema de Gestão de Transportadoras
                                  Modelo Entidade-Relacionamento

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                         │
│  ┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐          │
│  │    USUARIOS     │         │ TRANSPORTADORAS │         │     SOCIOS      │          │
│  │─────────────────│         │─────────────────│         │─────────────────│          │
│  │ PK id_usuario   │    1:1  │ PK id_transp    │    1:N  │ PK id_socio     │          │
│  │    email        │◄────────│    cnpj         │────────►│    nome         │          │
│  │    senha_hash   │         │    razao_social │         │    cpf          │          │
│  │    nome         │         │    nome_fantasia│         │    rg           │          │
│  │    tipo         │         │    endereco     │         │    funcao       │          │
│  │    status       │         │    telefone     │         │ FK id_transp    │          │
│  │    ultimo_acesso│         │    email        │         │    created_at   │          │
│  │    created_at   │         │    status       │         └─────────────────┘          │
│  │    updated_at   │         │    created_at   │                                      │
│  └─────────────────┘         │    updated_at   │                                      │
│           │                  └─────────────────┘                                      │
│           │                           │                                               │
│           │                           │ 1:N                                          │
│           │                           ▼                                               │
│           │                  ┌─────────────────┐         ┌─────────────────┐          │
│           │                  │   DOCUMENTOS    │   N:1   │ TIPOS_DOCUMENTO │          │
│           │                  │─────────────────│         │─────────────────│          │
│           │                  │ PK id_documento │────────►│ PK id_tipo      │          │
│           │                  │ FK id_transp    │         │    nome         │          │
│           │                  │ FK id_tipo      │         │    descricao    │          │
│           │                  │    arquivo_path │         │    req_vencimento│          │
│           │                  │    data_upload  │         │    req_garantia │          │
│           │                  │    data_vencto  │         │    categoria    │          │
│           │                  │    vlr_garantia │         │    created_at   │          │
│           │                  │    status       │         └─────────────────┘          │
│           │                  │    observacoes  │                                      │
│           │                  │    created_at   │                                      │
│           │                  │    updated_at   │                                      │
│           │                  └─────────────────┘                                      │
│           │                           │                                               │
│           │                           │ 1:N                                          │
│           │                           ▼                                               │
│           │                  ┌─────────────────┐                                      │
│           │                  │   APROVACOES    │                                      │
│           │                  │─────────────────│                                      │
│           │                  │ PK id_aprovacao │                                      │
│           │ 1:N              │ FK id_documento │                                      │
│           └─────────────────►│ FK id_usuario   │                                      │
│                              │    data_acao    │                                      │
│                              │    status_ant   │                                      │
│                              │    status_novo  │                                      │
│                              │    observacoes  │                                      │
│                              │    created_at   │                                      │
│                              └─────────────────┘                                      │
│                                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │                          TABELA INTERMEDIÁRIA N:N                              │ │
│  │  ┌─────────────────┐                                                           │ │
│  │  │USUARIO_TRANSP   │  Para admins gerenciarem múltiplas transportadoras       │ │
│  │  │─────────────────│                                                           │ │
│  │  │ PK id_rel       │                                                           │ │
│  │  │ FK id_usuario   │                                                           │ │
│  │  │ FK id_transp    │                                                           │ │
│  │  │    permissao    │                                                           │ │
│  │  │    created_at   │                                                           │ │
│  │  └─────────────────┘                                                           │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                       │
└─────────────────────────────────────────────────────────────────────────────────────────┘

LEGENDA:
PK = Primary Key (Chave Primária)
FK = Foreign Key (Chave Estrangeira)
1:1 = Relacionamento Um para Um
1:N = Relacionamento Um para Muitos
N:N = Relacionamento Muitos para Muitos

RELACIONAMENTOS DETALHADOS:

1. USUARIOS (1:1) TRANSPORTADORAS
   - Cada transportadora tem um usuário de acesso exclusivo
   - Admins NIMOENERGIA não têm transportadora associada

2. TRANSPORTADORAS (1:N) SOCIOS
   - Uma transportadora pode ter múltiplos sócios/responsáveis
   - Cada sócio pertence a apenas uma transportadora

3. TRANSPORTADORAS (1:N) DOCUMENTOS
   - Uma transportadora pode enviar múltiplos documentos
   - Cada documento pertence a apenas uma transportadora

4. TIPOS_DOCUMENTO (1:N) DOCUMENTOS
   - Um tipo pode ter múltiplas instâncias de documentos
   - Cada documento é de apenas um tipo

5. DOCUMENTOS (1:N) APROVACOES
   - Um documento pode ter múltiplas aprovações (histórico)
   - Cada aprovação refere-se a apenas um documento

6. USUARIOS (1:N) APROVACOES
   - Um usuário pode fazer múltiplas aprovações
   - Cada aprovação é feita por apenas um usuário

7. USUARIOS (N:N) TRANSPORTADORAS (via USUARIO_TRANSP)
   - Admins podem gerenciar múltiplas transportadoras
   - Transportadoras podem ser gerenciadas por múltiplos admins

ÍNDICES RECOMENDADOS:
- idx_transportadoras_cnpj (UNIQUE)
- idx_usuarios_email (UNIQUE)
- idx_documentos_status
- idx_documentos_vencimento
- idx_socios_cpf
- idx_aprovacoes_data
```

