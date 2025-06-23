# 🗄️ ESTRUTURA DE BANCO DE DADOS - PORTAL NIMOENERGIA

## 📋 ANÁLISE DE ENTIDADES E RELACIONAMENTOS

### 🎯 OBJETIVO
Criar uma estrutura de banco de dados relacional robusta e escalável para substituir o Google Forms, proporcionando controle total sobre o cadastro e gestão de transportadoras de combustíveis.

---

## 🔍 ANÁLISE DE ENTIDADES IDENTIFICADAS

### 1. **TRANSPORTADORAS** 
**Descrição:** Empresas cadastradas no sistema
**Atributos principais:**
- Dados societários (CNPJ, Razão Social, Nome Fantasia)
- Endereço completo
- Contatos (telefone, email)
- Status (Ativa, Inativa, Pendente)
- Data de cadastro
- Última atualização

### 2. **TIPOS_DOCUMENTO**
**Descrição:** Categorização dos 13 tipos de documentos específicos
**Atributos principais:**
- Nome do tipo (SEGURO RCF-DC, ALVARÁ, etc.)
- Descrição
- Requer vencimento (Sim/Não)
- Requer garantia (Sim/Não)
- Categoria (Societário, Seguro, Ambiental)

### 3. **DOCUMENTOS**
**Descrição:** Documentos enviados pelas transportadoras
**Atributos principais:**
- Arquivo (path/URL)
- Data de upload
- Data de vencimento
- Valor da garantia (para seguros)
- Status (Pendente, Aprovado, Rejeitado, Vencido)
- Observações

### 4. **USUARIOS**
**Descrição:** Usuários do sistema (Admin NIMOENERGIA e Transportadoras)
**Atributos principais:**
- Email, senha (hash)
- Nome completo
- Tipo (Admin, Transportadora)
- Status (Ativo, Inativo)
- Último acesso

### 5. **APROVACOES**
**Descrição:** Histórico de aprovações/rejeições
**Atributos principais:**
- Data da ação
- Observações
- Status anterior
- Status novo

### 6. **SOCIOS**
**Descrição:** Sócios/responsáveis das transportadoras
**Atributos principais:**
- Nome completo
- CPF
- RG
- Função na empresa

---

## 🔗 RELACIONAMENTOS IDENTIFICADOS

### **1:N (Um para Muitos)**
- **TRANSPORTADORAS → DOCUMENTOS**
  - Uma transportadora possui muitos documentos
  
- **TIPOS_DOCUMENTO → DOCUMENTOS**
  - Um tipo de documento pode ter muitas instâncias
  
- **TRANSPORTADORAS → SOCIOS**
  - Uma transportadora pode ter muitos sócios
  
- **USUARIOS → APROVACOES**
  - Um usuário pode fazer muitas aprovações
  
- **DOCUMENTOS → APROVACOES**
  - Um documento pode ter muitas aprovações (histórico)

### **1:1 (Um para Um)**
- **TRANSPORTADORAS → USUARIOS**
  - Cada transportadora tem um usuário de acesso

### **N:N (Muitos para Muitos)**
- **USUARIOS ↔ TRANSPORTADORAS** (para admins)
  - Admins podem gerenciar múltiplas transportadoras
  - Implementado via tabela intermediária: USUARIO_TRANSPORTADORA

---

## 📊 REGRAS DE NEGÓCIO IDENTIFICADAS

### **Integridade Referencial:**
1. Não é possível excluir uma transportadora que possui documentos
2. Não é possível excluir um tipo de documento que está sendo usado
3. Todo documento deve pertencer a uma transportadora válida
4. Toda aprovação deve referenciar um documento e usuário válidos

### **Validações:**
1. CNPJ deve ser único no sistema
2. Email de usuário deve ser único
3. CPF de sócio deve ser único por transportadora
4. Documentos com vencimento devem ter data futura
5. Seguros devem ter valor de garantia > 0

### **Triggers/Procedures Necessárias:**
1. Atualização automática de status de documentos vencidos
2. Cálculo automático de taxa de conformidade
3. Geração de alertas de vencimento
4. Log de auditoria para alterações críticas

---

## 🎨 PREPARAÇÃO PARA MER

### **Entidades Principais:** 6
### **Relacionamentos:** 7
### **Tabelas Estimadas:** 8 (incluindo intermediárias)
### **Índices Necessários:** 15+
### **Views Recomendadas:** 5

---

*Próximo passo: Criação do MER (Modelo Entidade-Relacionamento) visual*

