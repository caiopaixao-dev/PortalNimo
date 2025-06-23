import mysql.connector
from mysql.connector import Error
import sys

def conectar_mysql():
    """Conecta ao banco MySQL e executa o script de criação"""
    try:
        # Configurações de conexão
        config = {
            'host': 'fugfonv8odxxolj8.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
            'user': 'edttq20pfaonerfj',
            'password': 'h7ct54kqdpnjjvzm',
            'database': 'mzjro6x26vwcuwql',
            'charset': 'utf8mb4',
            'collation': 'utf8mb4_unicode_ci',
            'autocommit': False
        }
        
        print("🔌 Conectando ao MySQL...")
        connection = mysql.connector.connect(**config)
        
        if connection.is_connected():
            print("✅ Conexão estabelecida com sucesso!")
            
            cursor = connection.cursor()
            
            # Lê o script SQL
            print("📄 Lendo script SQL...")
            with open('/home/ubuntu/ESTRUTURA_MYSQL_NIMOENERGIA.sql', 'r', encoding='utf-8') as file:
                sql_script = file.read()
            
            # Divide o script em comandos individuais
            print("⚙️ Executando comandos SQL...")
            commands = sql_script.split(';')
            
            success_count = 0
            error_count = 0
            
            for i, command in enumerate(commands):
                command = command.strip()
                if command and not command.startswith('--') and command != '':
                    try:
                        cursor.execute(command)
                        success_count += 1
                        if i % 10 == 0:
                            print(f"   Executados {i+1}/{len(commands)} comandos...")
                    except Error as e:
                        error_count += 1
                        print(f"❌ Erro no comando {i+1}: {e}")
                        # Continua executando outros comandos
            
            # Commit das alterações
            connection.commit()
            print(f"✅ Script executado! {success_count} comandos bem-sucedidos, {error_count} erros")
            
            # Verifica se as tabelas foram criadas
            print("\n📋 Verificando tabelas criadas...")
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            
            print("Tabelas encontradas:")
            for table in tables:
                print(f"  - {table[0]}")
            
            # Verifica dados iniciais
            print("\n📊 Verificando dados iniciais...")
            cursor.execute("SELECT COUNT(*) FROM tipos_documento")
            tipos_count = cursor.fetchone()[0]
            print(f"  - Tipos de documento: {tipos_count}")
            
            cursor.execute("SELECT COUNT(*) FROM usuarios")
            usuarios_count = cursor.fetchone()[0]
            print(f"  - Usuários: {usuarios_count}")
            
            cursor.execute("SELECT COUNT(*) FROM transportadoras")
            transportadoras_count = cursor.fetchone()[0]
            print(f"  - Transportadoras: {transportadoras_count}")
            
            return True
            
    except Error as e:
        print(f"❌ Erro de conexão: {e}")
        return False
    
    finally:
        if 'connection' in locals() and connection.is_connected():
            cursor.close()
            connection.close()
            print("🔌 Conexão fechada")

if __name__ == "__main__":
    success = conectar_mysql()
    sys.exit(0 if success else 1)

