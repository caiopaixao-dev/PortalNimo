# Portal NIMOENERGIA - Sistema Completo de Gestão de Documentos

## 🎯 Sobre o Projeto

Portal completo para gestão de documentos de transportadoras, desenvolvido para a NIMOENERGIA. Sistema com autenticação diferenciada, upload de documentos, aprovação/rejeição e dashboard administrativo.

## 🚀 Funcionalidades

### 👨‍💼 Painel Administrativo (NIMOENERGIA)
- ✅ Dashboard com métricas em tempo real
- ✅ Gestão de transportadoras
- ✅ Aprovação/rejeição de documentos
- ✅ Sistema de configurações
- ✅ Monitoramento de compliance
- ✅ Análise de performance
- ✅ Cadastro de novas transportadoras

### 🚛 Portal da Transportadora
- ✅ Dashboard personalizado
- ✅ Upload de documentos (drag-and-drop)
- ✅ Acompanhamento de status
- ✅ Histórico de documentos
- ✅ Perfil da empresa
- ✅ Notificações de vencimento

### 📄 Tipos de Documentos Suportados
1. **DOC SOCIETÁRIO** (Estatuto/ATA/Contrato Social)
2. **COMPROVANTE DE ENDEREÇO** (6 meses)
3. **DOCS SÓCIOS** (RG/CPF/CNH)
4. **SEGURO RCF-DC** (com vencimento e garantia)
5. **SEGURO RCTR-C** (com vencimento e garantia)
6. **SEGURO AMBIENTAL** (com vencimento e garantia)
7. **PGR** (Programa de Gerenciamento de Riscos)
8. **PAE** (Plano de Emergência)
9. **AATIPP (IBAMA)** (com vencimento)
10. **CR/IBAMA** (Certificado de Regularidade)
11. **LICENÇA AMBIENTAL ESTADUAL** (com vencimento)
12. **ALVARÁ DE FUNCIONAMENTO** (com vencimento)
13. **ANTT - PJ**

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** com Vite
- **CSS3** moderno e responsivo
- **JavaScript ES6+**
- **Fetch API** para comunicação

### Backend
- **Python 3.11** com Flask
- **MySQL 8.0** para banco de dados
- **JWT** para autenticação
- **CORS** habilitado
- **Bcrypt** para senhas

### Banco de Dados
- **MySQL** com 7 tabelas relacionais
- **Índices otimizados** para performance
- **Dados iniciais** para teste
- **Backup automático**

## 📁 Estrutura do Projeto

```
portal-nimoenergia-github/
├── frontend/                 # Aplicação React
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── styles/          # Arquivos CSS
│   │   └── App.jsx          # Componente principal
│   ├── public/              # Arquivos estáticos
│   ├── package.json         # Dependências do frontend
│   └── vite.config.js       # Configuração do Vite
├── backend/                 # API Flask
│   ├── src/
│   │   ├── models/          # Modelos de dados
│   │   ├── routes/          # Rotas da API
│   │   └── utils/           # Utilitários
│   ├── requirements.txt     # Dependências Python
│   └── main.py              # Servidor principal
├── database/                # Scripts do banco
│   ├── schema.sql           # Estrutura das tabelas
│   ├── data.sql             # Dados iniciais
│   └── backup.sql           # Backup completo
├── docs/                    # Documentação
│   ├── INSTALL.md           # Guia de instalação
│   ├── API.md               # Documentação da API
│   └── DEPLOY.md            # Guia de deploy
├── scripts/                 # Scripts de automação
│   ├── setup.sh             # Setup completo
│   ├── start-dev.sh         # Ambiente de desenvolvimento
│   └── deploy.sh            # Script de deploy
└── README.md                # Este arquivo
```

## ⚡ Instalação Rápida

### 1. Clone o Repositório
```bash
git clone https://github.com/seu-usuario/portal-nimoenergia.git
cd portal-nimoenergia
```

### 2. Execute o Setup Automático
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 3. Configure o Banco de Dados
```bash
# Edite o arquivo backend/src/models/database.py
# Insira suas credenciais MySQL
```

### 4. Inicie o Sistema
```bash
./scripts/start-dev.sh
```

## 🌐 URLs de Acesso

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Documentação:** http://localhost:5000/docs

## 🔐 Credenciais de Teste

### Administrador NIMOENERGIA
- **Email:** admin@nimoenergia.com.br
- **Senha:** senha123

### Transportadora
- **Email:** silva@silvatransportes.com.br
- **Senha:** senha123

## 📚 Documentação Completa

- [📖 Guia de Instalação](docs/INSTALL.md)
- [🔌 Documentação da API](docs/API.md)
- [🚀 Guia de Deploy](docs/DEPLOY.md)

## 🚀 Deploy em Produção

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Upload da pasta dist/
```

### Backend (Railway/Heroku)
```bash
cd backend
# Configure as variáveis de ambiente
# Deploy via Git ou CLI
```

### Banco de Dados
- **MySQL:** AWS RDS, Google Cloud SQL, DigitalOcean
- **Configuração:** Importe database/schema.sql e data.sql

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte técnico, entre em contato:
- **Email:** suporte@nimoenergia.com.br
- **Telefone:** (11) 3333-4444

---

**Desenvolvido com ❤️ para NIMOENERGIA**

