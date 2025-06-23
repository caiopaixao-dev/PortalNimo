import mysql.connector
from mysql.connector import Error
from flask import current_app, g
import threading

# Thread-local storage para conexões
_local = threading.local()

def get_db_config():
    """Retorna configuração do banco de dados"""
    return {
        'host': current_app.config['MYSQL_HOST'],
        'user': current_app.config['MYSQL_USER'],
        'password': current_app.config['MYSQL_PASSWORD'],
        'database': current_app.config['MYSQL_DATABASE'],
        'charset': 'utf8mb4',
        'collation': 'utf8mb4_unicode_ci',
        'autocommit': False
    }

def get_db():
    """Obtém conexão com o banco de dados"""
    if not hasattr(_local, 'connection') or not _local.connection.is_connected():
        try:
            _local.connection = mysql.connector.connect(**get_db_config())
        except Error as e:
            print(f"Erro ao conectar ao MySQL: {e}")
            raise
    
    return _local.connection

def close_db():
    """Fecha conexão com o banco de dados"""
    if hasattr(_local, 'connection') and _local.connection.is_connected():
        _local.connection.close()

def init_db(app):
    """Inicializa configuração do banco de dados"""
    @app.teardown_appcontext
    def close_db_connection(error):
        close_db()

def execute_query(query, params=None, fetch=False):
    """Executa uma query no banco de dados"""
    connection = get_db()
    cursor = connection.cursor(dictionary=True)
    
    try:
        cursor.execute(query, params or ())
        
        if fetch:
            if fetch == 'one':
                result = cursor.fetchone()
            else:
                result = cursor.fetchall()
        else:
            connection.commit()
            result = cursor.rowcount
        
        return result
    
    except Error as e:
        connection.rollback()
        print(f"Erro na query: {e}")
        raise
    
    finally:
        cursor.close()

def execute_many(query, params_list):
    """Executa múltiplas queries com diferentes parâmetros"""
    connection = get_db()
    cursor = connection.cursor()
    
    try:
        cursor.executemany(query, params_list)
        connection.commit()
        return cursor.rowcount
    
    except Error as e:
        connection.rollback()
        print(f"Erro na query executemany: {e}")
        raise
    
    finally:
        cursor.close()

