import mysql.connector
from mysql.connector import Error

def corrigir_banco():
    """Corrige e completa a estrutura do banco"""
    try:
        config = {
            'host': 'fugfonv8odxxolj8.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
            'user': 'edttq20pfaonerfj',
            'password': 'h7ct54kqdpnjjvzm',
            'database': 'mzjro6x26vwcuwql',
            'charset': 'utf8mb4',
            'autocommit': False
        }
        
        print("🔌 Conectando ao MySQL...")
        connection = mysql.connector.connect(**config)
        cursor = connection.cursor()
        
        print("🧹 Limpando tabelas com problemas...")
        # Remove tabelas que podem ter problemas
        try:
            cursor.execute("DROP TABLE IF EXISTS tipos_documento")
            cursor.execute("DROP TABLE IF EXISTS usuarios")
            print("✅ Tabelas problemáticas removidas")
        except:
            pass
        
        print("🔧 Criando tabelas corrigidas...")
        
        # Cria tipos_documento sem valor padrão problemático
        cursor.execute("""
        CREATE TABLE tipos_documento (
            id_tipo INT AUTO_INCREMENT PRIMARY KEY,
            nome_tipo VARCHAR(100) NOT NULL,
            descricao TEXT,
            categoria VARCHAR(50) NOT NULL,
            subcategoria VARCHAR(50),
            obrigatorio_vencimento BOOLEAN DEFAULT FALSE,
            obrigatorio_garantia BOOLEAN DEFAULT FALSE,
            formatos_aceitos TEXT,
            tamanho_maximo_mb INT DEFAULT 10,
            aprovacao_automatica BOOLEAN DEFAULT FALSE,
            dias_aviso_vencimento INT DEFAULT 30,
            dias_tolerancia INT DEFAULT 5,
            ativo BOOLEAN DEFAULT TRUE,
            ordem_exibicao INT DEFAULT 0,
            icone VARCHAR(50),
            data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        print("✅ Tabela tipos_documento criada")
        
        # Cria usuarios sem valor padrão problemático
        cursor.execute("""
        CREATE TABLE usuarios (
            id_usuario INT AUTO_INCREMENT PRIMARY KEY,
            id_transportadora INT,
            nome_completo VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            senha_hash VARCHAR(255) NOT NULL,
            salt VARCHAR(50) NOT NULL,
            telefone VARCHAR(20),
            tipo_usuario VARCHAR(20) NOT NULL,
            status_ativo BOOLEAN DEFAULT TRUE,
            ultimo_acesso TIMESTAMP NULL,
            ip_ultimo_acesso VARCHAR(45),
            tentativas_login INT DEFAULT 0,
            bloqueado_ate TIMESTAMP NULL,
            preferencias_notificacao TEXT,
            timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
            idioma VARCHAR(5) DEFAULT 'pt-BR',
            data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (id_transportadora) REFERENCES transportadoras(id_transportadora) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        print("✅ Tabela usuarios criada")
        
        print("📊 Inserindo dados iniciais...")
        
        # Insere tipos de documento
        tipos_documento = [
            ('DOC SOCIETÁRIO', 'Estatuto Social, ATA de Assembleia ou Contrato Social', 'EMPRESA', False, False, 1),
            ('COMPROVANTE DE ENDEREÇO', 'Comprovante de endereço da sede da empresa', 'EMPRESA', True, False, 2),
            ('DOCS SÓCIOS', 'RG e CPF ou CNH dos sócios', 'EMPRESA', False, False, 3),
            ('ALVARÁ DE FUNCIONAMENTO', 'Alvará de funcionamento da empresa', 'EMPRESA', True, False, 4),
            ('ANTT - PJ', 'Registro na ANTT para pessoa jurídica', 'EMPRESA', True, False, 5),
            ('SEGURO RCF-DC', 'Seguro de Responsabilidade Civil Facultativo por Danos Causados', 'SEGUROS', True, True, 6),
            ('SEGURO RCTR-C', 'Seguro de Responsabilidade Civil do Transportador Rodoviário de Carga', 'SEGUROS', True, True, 7),
            ('SEGURO AMBIENTAL', 'Seguro de Responsabilidade Civil por Danos Ambientais', 'SEGUROS', True, True, 8),
            ('PGR', 'Programa de Gerenciamento de Riscos', 'AMBIENTAL', True, False, 9),
            ('PAE', 'Plano de Ação de Emergência', 'AMBIENTAL', True, False, 10),
            ('AATIPP (IBAMA)', 'Autorização Ambiental para Transporte de Produtos Perigosos', 'AMBIENTAL', True, False, 11),
            ('Certificado de Regularidade - CR/IBAMA', 'Certificado de Regularidade do IBAMA', 'AMBIENTAL', True, False, 12),
            ('LICENÇA AMBIENTAL ESTADUAL', 'Licença ambiental emitida pelo órgão estadual', 'AMBIENTAL', True, False, 13)
        ]
        
        for tipo in tipos_documento:
            cursor.execute("""
            INSERT INTO tipos_documento (nome_tipo, descricao, categoria, obrigatorio_vencimento, obrigatorio_garantia, ordem_exibicao, formatos_aceitos)
            VALUES (%s, %s, %s, %s, %s, %s, 'PDF,DOCX,JPG,PNG')
            """, tipo)
        
        print("✅ Tipos de documento inseridos")
        
        # Insere usuários
        cursor.execute("""
        INSERT INTO usuarios (nome_completo, email, senha_hash, salt, tipo_usuario, id_transportadora, preferencias_notificacao)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, ('Administrador NIMOENERGIA', 'admin@nimoenergia.com.br', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXzgVrncDAaa', 'salt_admin_2024', 'ADMIN', None, '{"email": true, "sms": false, "push": true}'))
        
        cursor.execute("""
        INSERT INTO usuarios (nome_completo, email, senha_hash, salt, tipo_usuario, id_transportadora, preferencias_notificacao)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, ('João Silva', 'silva@silvatransportes.com.br', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXzgVrncDAaa', 'salt_silva_2024', 'TRANSPORTADORA', 1, '{"email": true, "sms": false, "push": true}'))
        
        print("✅ Usuários inseridos")
        
        # Cria índices
        indices = [
            "CREATE INDEX idx_tipos_documento_categoria ON tipos_documento(categoria)",
            "CREATE INDEX idx_tipos_documento_ativo ON tipos_documento(ativo)",
            "CREATE INDEX idx_usuarios_email ON usuarios(email)",
            "CREATE INDEX idx_usuarios_tipo ON usuarios(tipo_usuario)",
            "CREATE INDEX idx_usuarios_transportadora ON usuarios(id_transportadora)"
        ]
        
        for indice in indices:
            try:
                cursor.execute(indice)
            except Error as e:
                print(f"⚠️ Índice já existe: {e}")
        
        print("✅ Índices criados")
        
        connection.commit()
        
        # Verifica resultado final
        print("\n📋 Verificação final...")
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        print(f"Total de tabelas: {len(tables)}")
        
        for table in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table[0]}")
            count = cursor.fetchone()[0]
            print(f"  📊 {table[0]}: {count} registros")
        
        print("\n🎉 BANCO DE DADOS CONFIGURADO COM SUCESSO!")
        return True
        
    except Error as e:
        print(f"❌ Erro: {e}")
        return False
    
    finally:
        if 'connection' in locals() and connection.is_connected():
            cursor.close()
            connection.close()
            print("🔌 Conexão fechada")

if __name__ == "__main__":
    corrigir_banco()

