#!/bin/bash

# =====================================================
# PORTAL NIMOENERGIA - SCRIPT DE SETUP AUTOMÁTICO
# =====================================================

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[AVISO] $1${NC}"
}

error() {
    echo -e "${RED}[ERRO] $1${NC}"
    exit 1
}

# Banner
echo -e "${BLUE}"
echo "=================================================="
echo "    PORTAL NIMOENERGIA - SETUP AUTOMÁTICO"
echo "=================================================="
echo -e "${NC}"

# Verificar se está no diretório correto
if [ ! -f "README.md" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    error "Execute este script no diretório raiz do projeto!"
fi

log "Iniciando setup do Portal NIMOENERGIA..."

# =====================================================
# VERIFICAR PRÉ-REQUISITOS
# =====================================================

log "Verificando pré-requisitos..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    error "Node.js não encontrado! Instale Node.js 16+ antes de continuar."
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    error "Node.js versão 16+ é necessária. Versão atual: $(node -v)"
fi

log "✓ Node.js $(node -v) encontrado"

# Verificar Python
if ! command -v python3 &> /dev/null; then
    error "Python3 não encontrado! Instale Python 3.8+ antes de continuar."
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
log "✓ Python $PYTHON_VERSION encontrado"

# Verificar MySQL
if ! command -v mysql &> /dev/null; then
    warn "MySQL não encontrado. Você precisará instalar e configurar o MySQL manualmente."
    echo "Instruções: https://dev.mysql.com/doc/mysql-installation-excerpt/8.0/en/"
else
    log "✓ MySQL encontrado"
fi

# Verificar Git
if ! command -v git &> /dev/null; then
    error "Git não encontrado! Instale Git antes de continuar."
fi

log "✓ Git $(git --version | cut -d' ' -f3) encontrado"

# =====================================================
# CONFIGURAR BACKEND
# =====================================================

log "Configurando backend Python..."

cd backend

# Criar ambiente virtual se não existir
if [ ! -d "venv" ]; then
    log "Criando ambiente virtual Python..."
    python3 -m venv venv
fi

# Ativar ambiente virtual
log "Ativando ambiente virtual..."
source venv/bin/activate

# Atualizar pip
log "Atualizando pip..."
pip install --upgrade pip

# Instalar dependências
log "Instalando dependências Python..."
pip install -r requirements.txt

# Criar arquivo .env se não existir
if [ ! -f ".env" ]; then
    log "Criando arquivo de configuração .env..."
    cat > .env << EOF
# Configuração do Flask
FLASK_ENV=development
SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_hex(32))')
JWT_SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_hex(32))')

# Configuração do Banco de Dados
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=nimoenergia_portal

# Configuração de Upload
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216

# CORS
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
EOF
    warn "Arquivo .env criado. EDITE as configurações do banco de dados!"
fi

# Criar diretório de uploads
mkdir -p uploads

cd ..

# =====================================================
# CONFIGURAR FRONTEND
# =====================================================

log "Configurando frontend React..."

cd frontend

# Verificar se package.json existe
if [ ! -f "package.json" ]; then
    error "package.json não encontrado no diretório frontend!"
fi

# Instalar dependências
log "Instalando dependências Node.js..."
if command -v yarn &> /dev/null; then
    yarn install
else
    npm install
fi

cd ..

# =====================================================
# CONFIGURAR BANCO DE DADOS
# =====================================================

log "Configuração do banco de dados..."

if command -v mysql &> /dev/null; then
    echo -e "${YELLOW}"
    echo "=================================================="
    echo "           CONFIGURAÇÃO DO BANCO DE DADOS"
    echo "=================================================="
    echo -e "${NC}"
    
    echo "Para configurar o banco de dados, execute:"
    echo "1. mysql -u root -p"
    echo "2. source database/schema.sql"
    echo ""
    echo "Ou execute diretamente:"
    echo "mysql -u root -p < database/schema.sql"
    echo ""
    
    read -p "Deseja executar o script do banco agora? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log "Executando script do banco de dados..."
        read -p "Digite a senha do MySQL root: " -s MYSQL_PASSWORD
        echo
        mysql -u root -p$MYSQL_PASSWORD < database/schema.sql && log "✓ Banco de dados configurado com sucesso!" || warn "Erro ao configurar banco de dados"
    fi
else
    warn "MySQL não encontrado. Configure o banco manualmente usando database/schema.sql"
fi

# =====================================================
# CRIAR SCRIPTS DE CONVENIÊNCIA
# =====================================================

log "Criando scripts de conveniência..."

# Script para iniciar desenvolvimento
cat > start-dev.sh << 'EOF'
#!/bin/bash

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Iniciando Portal NIMOENERGIA em modo desenvolvimento...${NC}"

# Função para cleanup
cleanup() {
    echo -e "\n${GREEN}Parando serviços...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Iniciar backend
echo -e "${GREEN}Iniciando backend...${NC}"
cd backend
source venv/bin/activate
python main.py &
BACKEND_PID=$!
cd ..

# Aguardar backend inicializar
sleep 3

# Iniciar frontend
echo -e "${GREEN}Iniciando frontend...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo -e "${GREEN}"
echo "=================================================="
echo "    PORTAL NIMOENERGIA INICIADO COM SUCESSO!"
echo "=================================================="
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:5000"
echo "API Docs: http://localhost:5000/docs"
echo ""
echo "Credenciais de teste:"
echo "Admin: admin@nimoenergia.com.br / senha123"
echo "Transportadora: silva@silvatransportes.com.br / senha123"
echo ""
echo "Pressione Ctrl+C para parar os serviços"
echo -e "${NC}"

# Aguardar
wait
EOF

chmod +x start-dev.sh

# Script para build de produção
cat > build-prod.sh << 'EOF'
#!/bin/bash

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Fazendo build de produção...${NC}"

# Build do frontend
echo -e "${GREEN}Building frontend...${NC}"
cd frontend
npm run build
cd ..

# Preparar backend para produção
echo -e "${GREEN}Preparando backend...${NC}"
cd backend
source venv/bin/activate
pip install gunicorn
cd ..

echo -e "${GREEN}Build concluído!${NC}"
echo "Frontend: frontend/dist/"
echo "Backend: backend/ (use: gunicorn -w 4 -b 0.0.0.0:5000 main:app)"
EOF

chmod +x build-prod.sh

# =====================================================
# FINALIZAÇÃO
# =====================================================

log "Setup concluído com sucesso!"

echo -e "${GREEN}"
echo "=================================================="
echo "           SETUP CONCLUÍDO COM SUCESSO!"
echo "=================================================="
echo -e "${NC}"

echo "Próximos passos:"
echo ""
echo "1. Configure o banco de dados MySQL:"
echo "   mysql -u root -p < database/schema.sql"
echo ""
echo "2. Edite as configurações em backend/.env"
echo ""
echo "3. Inicie o sistema:"
echo "   ./start-dev.sh"
echo ""
echo "4. Acesse o portal:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:5000"
echo ""
echo "Credenciais de teste:"
echo "• Admin: admin@nimoenergia.com.br / senha123"
echo "• Transportadora: silva@silvatransportes.com.br / senha123"
echo ""
echo "Para mais informações, consulte docs/INSTALL.md"

echo -e "${BLUE}"
echo "=================================================="
echo "    Desenvolvido com ❤️  para NIMOENERGIA"
echo "=================================================="
echo -e "${NC}"

