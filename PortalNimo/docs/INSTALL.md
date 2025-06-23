# 📖 Guia de Instalação - Portal NIMOENERGIA

## 🎯 Pré-requisitos

### Sistema Operacional
- **Linux:** Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **Windows:** Windows 10+ com WSL2
- **macOS:** macOS 11+

### Software Necessário
- **Node.js:** 16.0.0 ou superior
- **Python:** 3.8 ou superior
- **MySQL:** 8.0 ou superior
- **Git:** 2.0 ou superior

## 🚀 Instalação Rápida

### 1. Clone o Repositório
```bash
git clone https://github.com/seu-usuario/portal-nimoenergia.git
cd portal-nimoenergia
```

### 2. Execute o Script de Setup
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 3. Configure as Variáveis de Ambiente
```bash
# Copie o arquivo de exemplo
cp backend/.env.example backend/.env

# Edite com suas configurações
nano backend/.env
```

### 4. Inicie o Sistema
```bash
./scripts/start-dev.sh
```

## 🔧 Instalação Manual

### 1. Configurar o Banco de Dados

#### Instalar MySQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server

# CentOS/RHEL
sudo yum install mysql-server

# macOS
brew install mysql
```

#### Criar o Banco de Dados
```bash
# Conectar ao MySQL
mysql -u root -p

# Executar o script de criação
mysql -u root -p < database/schema.sql
```

### 2. Configurar o Backend

#### Instalar Python e Dependências
```bash
cd backend

# Criar ambiente virtual
python3 -m venv venv

# Ativar ambiente virtual
# Linux/macOS:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt
```

#### Configurar Variáveis de Ambiente
```bash
# Criar arquivo .env
cat > .env << EOF
# Configuração do Flask
FLASK_ENV=development
SECRET_KEY=sua-chave-secreta-aqui
JWT_SECRET_KEY=sua-chave-jwt-aqui

# Configuração do Banco de Dados
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua-senha-mysql
DB_NAME=nimoenergia_portal

# Configuração de Upload
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216

# CORS
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
EOF
```

### 3. Configurar o Frontend

#### Instalar Node.js e Dependências
```bash
cd frontend

# Instalar dependências
npm install

# Ou usando yarn
yarn install
```

#### Configurar Variáveis de Ambiente (Opcional)
```bash
# Criar arquivo .env.local
cat > .env.local << EOF
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Portal NIMOENERGIA
EOF
```

## 🏃‍♂️ Executar o Sistema

### Modo Desenvolvimento

#### Backend
```bash
cd backend
source venv/bin/activate  # Linux/macOS
# ou venv\Scripts\activate  # Windows
python main.py
```

#### Frontend
```bash
cd frontend
npm run dev
# ou yarn dev
```

### Modo Produção

#### Backend
```bash
cd backend
source venv/bin/activate
gunicorn -w 4 -b 0.0.0.0:5000 main:app
```

#### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## 🌐 URLs de Acesso

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Documentação API:** http://localhost:5000/docs

## 🔐 Credenciais Padrão

### Administrador NIMOENERGIA
- **Email:** admin@nimoenergia.com.br
- **Senha:** senha123

### Transportadora de Teste
- **Email:** silva@silvatransportes.com.br
- **Senha:** senha123

## 🔧 Configurações Avançadas

### Configuração do MySQL

#### Otimizações Recomendadas
```sql
-- Configurações no arquivo my.cnf
[mysqld]
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
max_connections = 200
query_cache_size = 64M
```

#### Backup Automático
```bash
# Adicionar ao crontab
0 2 * * * mysqldump -u root -p nimoenergia_portal > /backup/portal_$(date +\%Y\%m\%d).sql
```

### Configuração do Nginx (Produção)

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    # Frontend
    location / {
        root /var/www/portal-nimoenergia/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Upload de arquivos
    client_max_body_size 16M;
}
```

### Configuração SSL/HTTPS

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d seu-dominio.com

# Renovação automática
sudo crontab -e
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🐳 Docker (Opcional)

### Dockerfile - Backend
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "main:app"]
```

### Dockerfile - Frontend
```dockerfile
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

### Docker Compose
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: senha123
      MYSQL_DATABASE: nimoenergia_portal
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "3306:3306"

  backend:
    build: ./backend
    environment:
      DB_HOST: mysql
      DB_USER: root
      DB_PASSWORD: senha123
      DB_NAME: nimoenergia_portal
    ports:
      - "5000:5000"
    depends_on:
      - mysql

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mysql_data:
```

## 🔍 Solução de Problemas

### Problemas Comuns

#### Erro de Conexão com MySQL
```bash
# Verificar se o MySQL está rodando
sudo systemctl status mysql

# Verificar logs
sudo tail -f /var/log/mysql/error.log

# Testar conexão
mysql -u root -p -h localhost
```

#### Erro de Permissão de Arquivos
```bash
# Ajustar permissões
sudo chown -R $USER:$USER portal-nimoenergia/
chmod -R 755 portal-nimoenergia/
```

#### Porta já em uso
```bash
# Verificar processos na porta
sudo lsof -i :5000
sudo lsof -i :5173

# Matar processo
sudo kill -9 PID
```

### Logs e Debugging

#### Backend
```bash
# Logs do Flask
tail -f backend/logs/app.log

# Debug mode
export FLASK_ENV=development
export FLASK_DEBUG=1
python main.py
```

#### Frontend
```bash
# Logs do Vite
npm run dev -- --debug

# Build com source maps
npm run build -- --sourcemap
```

## 📊 Monitoramento

### Métricas do Sistema
```bash
# CPU e Memória
htop

# Espaço em disco
df -h

# Conexões MySQL
mysql -e "SHOW PROCESSLIST;"
```

### Logs de Acesso
```bash
# Nginx
tail -f /var/log/nginx/access.log

# Apache
tail -f /var/log/apache2/access.log
```

## 🔄 Atualizações

### Atualizar o Sistema
```bash
# Fazer backup
./scripts/backup.sh

# Atualizar código
git pull origin main

# Atualizar dependências
cd backend && pip install -r requirements.txt
cd frontend && npm install

# Executar migrações (se houver)
python scripts/migrate.py

# Reiniciar serviços
./scripts/restart.sh
```

## 📞 Suporte

Para problemas técnicos:
- **Email:** suporte@nimoenergia.com.br
- **Telefone:** (11) 3333-4444
- **Documentação:** [docs/](../docs/)
- **Issues:** GitHub Issues

