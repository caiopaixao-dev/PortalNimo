export PS1="[CMD_BEGIN]\n\u@\h:\w\n[CMD_END]"; export PS2=""
export TERM=xterm-256color
cd /home/ubuntu && manus-md-to-pdf /home/ubuntu/RELATORIO_REEMBOLSO_PONTOS_SEGUNDA_OCORRENCIA.md /home/ubuntu/RELATORIO_REEMBOLSO_PONTOS_SEGUNDA_OCORRENCIA.pdf
export PS1="[CMD_BEGIN]\n\u@\h:\w\n[CMD_END]"; export PS2=""
export TERM=xterm-256color
cd /home/ubuntu && manus-create-react-app portal-nimoenergia
cd /home/ubuntu && ls -la /home/ubuntu/portal-nimoenergia-backend/
cd /home/ubuntu && ls -la /home/ubuntu/portal-nimoenergia-backend/src/
cd /home/ubuntu && manus-create-react-app portal-nimoenergia-final
export PS1="[CMD_BEGIN]\n\u@\h:\w\n[CMD_END]"; export PS2=""
export TERM=xterm-256color
cd /home/ubuntu && cd portal-nimoenergia-backend && source venv/bin/activate && python src/main.py &
cd /home/ubuntu && manus-create-flask-app nimoenergia-backend-completo
cd /home/ubuntu && cd nimoenergia-backend-completo && source venv/bin/activate && pip install flask-cors PyJWT bcrypt python-dotenv
cd /home/ubuntu/nimoenergia-backend-completo && mkdir -p src/utils
cd /home/ubuntu && cd nimoenergia-backend-completo && source venv/bin/activate && pip freeze > requirements.txt
cd /home/ubuntu && cd nimoenergia-backend-completo && source venv/bin/activate && python src/main.py &
cd /home/ubuntu && manus-create-flask-app nimoenergia-backend-mysql
cd /home/ubuntu && cd nimoenergia-backend-mysql && source venv/bin/activate && pip install mysql-connector-python PyMySQL flask-cors PyJWT bcrypt
cd /home/ubuntu && cd nimoenergia-backend-mysql && source venv/bin/activate && pip freeze > requirements.txt
cd /home/ubuntu && cd nimoenergia-backend-mysql && source venv/bin/activate && python src/main.py &
export PS1="[CMD_BEGIN]\n\u@\h:\w\n[CMD_END]"; export PS2=""
export TERM=xterm-256color
cd /home/ubuntu && curl -X POST http://localhost:5001/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@nimoenergia.com.br","senha":"senha123"}' --connect-timeout 5
export PS1="[CMD_BEGIN]\n\u@\h:\w\n[CMD_END]"; export PS2=""
export TERM=xterm-256color
cd /home/ubuntu && curl -s http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@nimoenergia.com.br","password":"senha123"}'
cd /home/ubuntu && curl -X POST http://localhost:5001/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@nimoenergia.com.br","senha":"senha123"}'
export PS1="[CMD_BEGIN]\n\u@\h:\w\n[CMD_END]"; export PS2=""
export TERM=xterm-256color
cd /home/ubuntu && cd portal-nimoenergia-final && pnpm run dev --host
export PS1="[CMD_BEGIN]\n\u@\h:\w\n[CMD_END]"; export PS2=""
export TERM=xterm-256color
cd /home/ubuntu/portal-nimoenergia-enterprise && cd /home/ubuntu/portal-nimoenergia-enterprise && pnpm run dev --host
export PS1="[CMD_BEGIN]\n\u@\h:\w\n[CMD_END]"; export PS2=""
export TERM=xterm-256color
cd /home/ubuntu && cd /home/ubuntu && manus-create-react-app portal-nimoenergia-corrigido
cd /home/ubuntu && rm -rf /home/ubuntu/portal-nimoenergia-corrigido && manus-create-react-app portal-nimoenergia-corrigido
cd /home/ubuntu/portal-nimoenergia-corrigido && cd /home/ubuntu/portal-nimoenergia-corrigido && pnpm run dev --host
export PS1="[CMD_BEGIN]\n\u@\h:\w\n[CMD_END]"; export PS2=""
export TERM=xterm-256color
cd /home/ubuntu && cd portal-nimoenergia-simples && pnpm run dev --host
export PS1="[CMD_BEGIN]\n\u@\h:\w\n[CMD_END]"; export PS2=""
export TERM=xterm-256color
cd /home/ubuntu && cd portal-nimoenergia && pnpm run dev --host
export PS1="[CMD_BEGIN]\n\u@\h:\w\n[CMD_END]"; export PS2=""
export TERM=xterm-256color
cd /home/ubuntu && cd portal-nimoenergia-frontend && pnpm run dev --host
export PS1="[CMD_BEGIN]\n\u@\h:\w\n[CMD_END]"; export PS2=""
export TERM=xterm-256color
cd /home/ubuntu && cd nimoenergia-backend-completo && source venv/bin/activate && python src/main.py
cd /home/ubuntu && cd nimoenergia-backend-mysql && source venv/bin/activate && python src/main.py
