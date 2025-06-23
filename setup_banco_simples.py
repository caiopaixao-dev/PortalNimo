import mysql.connector
from mysql.connector import Error
import sys

def conectar_mysql_simples():
    """Conecta ao banco MySQL e executa o script simplificado"""
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
            
            # Lê o script SQL simplificado
            print("📄 Lendo script SQL simplificado...")
            with open('/home/ubuntu/ESTRUTURA_MYSQL_SIMPLES.sql', 'r', encoding='utf-8') as file:
                sql_script = file.read()
            
            # Executa comando por comando
            print("⚙️ Executando comandos SQL...")
            
            # Remove comentários e linhas vazias
            lines = sql_script.split('\n')
            commands = []
            current_command = ""
            
            for line in lines:
                line = line.strip()
                if line and not line.startswith('--'):
                    current_command += line + " "
                    if line.endswith(';'):
                        commands.append(current_command.strip())
                        current_command = ""
            
            success_count = 0
            error_count = 0
            
            for i, command in enumerate(commands):
                if command:
                    try:
                        cursor.execute(command)
                        success_count += 1
                        print(f"✅ Comando {i+1}: OK")
                    except Error as e:
                        error_count += 1
                        print(f"❌ Erro no comando {i+1}: {e}")
                        print(f"   Comando: {command[:100]}...")
            
            # Commit das alterações
            connection.commit()
            print(f"\n🎉 Script executado! {success_count} comandos bem-sucedidos, {error_count} erros")
            
            # Verifica se as tabelas foram criadas
            print("\n📋 Verificando tabelas criadas...")
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            
            print("Tabelas encontradas:")
            for table in tables:
                print(f"  ✅ {table[0]}")
            
            # Verifica dados iniciais
            print("\n📊 Verificando dados iniciais...")
            
            try:
                cursor.execute("SELECT COUNT(*) FROM tipos_documento")
                tipos_count = cursor.fetchone()[0]
                print(f"  📄 Tipos de documento: {tipos_count}")
                
                cursor.execute("SELECT COUNT(*) FROM usuarios")
                usuarios_count = cursor.fetchone()[0]
                print(f"  👥 Usuários: {usuarios_count}")
                
                cursor.execute("SELECT COUNT(*) FROM transportadoras")
                transportadoras_count = cursor.fetchone()[0]
                print(f"  🚛 Transportadoras: {transportadoras_count}")
                
                cursor.execute("SELECT COUNT(*) FROM configuracoes")
                config_count = cursor.fetchone()[0]
                print(f"  ⚙️ Configurações: {config_count}")
                
                # Lista os tipos de documento
                print("\n📋 Tipos de documento cadastrados:")
                cursor.execute("SELECT nome_tipo, categoria FROM tipos_documento ORDER BY ordem_exibicao")
                tipos = cursor.fetchall()
                for tipo in tipos:
                    print(f"  - {tipo[0]} ({tipo[1]})")
                
                print("\n🎉 BANCO DE DADOS CONFIGURADO COM SUCESSO!")
                return True
                
            except Error as e:
                print(f"❌ Erro ao verificar dados: {e}")
                return False
            
    except Error as e:
        print(f"❌ Erro de conexão: {e}")
        return False
    
    finally:
        if 'connection' in locals() and connection.is_connected():
            cursor.close()
            connection.close()
            print("🔌 Conexão fechada")

if __name__ == "__main__":
    success = conectar_mysql_simples()
    sys.exit(0 if success else 1)

