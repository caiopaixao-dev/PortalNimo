from flask import Blueprint, request, jsonify
from src.models.database import execute_query
from datetime import datetime, date
import os
import hashlib

documentos_bp = Blueprint('documentos', __name__)

@documentos_bp.route('/tipos', methods=['GET'])
def listar_tipos_documento():
    """Lista todos os tipos de documento disponíveis"""
    try:
        query = """
        SELECT * FROM tipos_documento 
        WHERE ativo = TRUE 
        ORDER BY categoria, ordem_exibicao
        """
        tipos = execute_query(query, fetch='all')
        
        # Agrupa por categoria
        categorias = {}
        for tipo in tipos:
            categoria = tipo['categoria']
            if categoria not in categorias:
                categorias[categoria] = []
            categorias[categoria].append(tipo)
        
        return jsonify({
            'tipos': tipos,
            'categorias': categorias
        }), 200
    
    except Exception as e:
        print(f"Erro ao listar tipos de documento: {e}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

@documentos_bp.route('/upload', methods=['POST'])
def upload_documento():
    """Upload de documento"""
    try:
        # Verifica se há arquivo
        if 'arquivo' not in request.files:
            return jsonify({'error': 'Nenhum arquivo enviado'}), 400
        
        arquivo = request.files['arquivo']
        if arquivo.filename == '':
            return jsonify({'error': 'Nenhum arquivo selecionado'}), 400
        
        # Dados do formulário
        id_transportadora = request.form.get('id_transportadora')
        id_tipo_documento = request.form.get('id_tipo_documento')
        id_usuario_upload = request.form.get('id_usuario_upload')
        data_vencimento = request.form.get('data_vencimento')
        valor_garantia = request.form.get('valor_garantia')
        
        if not all([id_transportadora, id_tipo_documento, id_usuario_upload]):
            return jsonify({'error': 'Dados obrigatórios não fornecidos'}), 400
        
        # Gera hash do arquivo
        arquivo_content = arquivo.read()
        arquivo.seek(0)  # Reset para salvar
        hash_arquivo = hashlib.sha256(arquivo_content).hexdigest()
        
        # Gera nome único para o arquivo
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        nome_arquivo_sistema = f"{timestamp}_{hash_arquivo[:8]}_{arquivo.filename}"
        
        # Simula salvamento (em produção, salvaria no disco/cloud)
        caminho_arquivo = f"/uploads/{nome_arquivo_sistema}"
        
        # Gera protocolo automático
        ano_atual = datetime.now().year
        query = """
        SELECT COALESCE(MAX(CAST(SUBSTRING(numero_protocolo, 5, 6) AS UNSIGNED)), 0) + 1 as proximo
        FROM documentos
        WHERE numero_protocolo LIKE %s
        """
        result = execute_query(query, (f"{ano_atual}%",), fetch='one')
        sequencial = result['proximo']
        protocolo = f"{ano_atual}{sequencial:06d}"
        
        # Insere documento no banco
        query = """
        INSERT INTO documentos (
            numero_protocolo, id_transportadora, id_tipo_documento, id_usuario_upload,
            nome_arquivo_original, nome_arquivo_sistema, caminho_arquivo,
            tamanho_arquivo, hash_arquivo, mime_type, data_vencimento, valor_garantia,
            ip_upload, user_agent
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        params = (
            protocolo, id_transportadora, id_tipo_documento, id_usuario_upload,
            arquivo.filename, nome_arquivo_sistema, caminho_arquivo,
            len(arquivo_content), hash_arquivo, arquivo.mimetype,
            data_vencimento if data_vencimento else None,
            float(valor_garantia) if valor_garantia else None,
            request.remote_addr, request.headers.get('User-Agent')
        )
        
        execute_query(query, params)
        
        return jsonify({
            'message': 'Documento enviado com sucesso',
            'protocolo': protocolo,
            'nome_arquivo': arquivo.filename,
            'tamanho': len(arquivo_content)
        }), 201
    
    except Exception as e:
        print(f"Erro no upload: {e}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

@documentos_bp.route('/transportadora/<int:id_transportadora>', methods=['GET'])
def listar_documentos_transportadora(id_transportadora):
    """Lista documentos de uma transportadora"""
    try:
        query = """
        SELECT 
            d.*,
            td.nome_tipo,
            td.categoria,
            u.nome_completo as usuario_upload
        FROM documentos d
        JOIN tipos_documento td ON d.id_tipo_documento = td.id_tipo
        JOIN usuarios u ON d.id_usuario_upload = u.id_usuario
        WHERE d.id_transportadora = %s
        ORDER BY d.data_upload DESC
        """
        
        documentos = execute_query(query, (id_transportadora,), fetch='all')
        
        # Converte datas para string
        for doc in documentos:
            if isinstance(doc['data_upload'], datetime):
                doc['data_upload'] = doc['data_upload'].isoformat()
            if isinstance(doc['data_vencimento'], date):
                doc['data_vencimento'] = doc['data_vencimento'].isoformat()
            if isinstance(doc['data_aprovacao'], datetime):
                doc['data_aprovacao'] = doc['data_aprovacao'].isoformat()
        
        return jsonify({'documentos': documentos}), 200
    
    except Exception as e:
        print(f"Erro ao listar documentos: {e}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

@documentos_bp.route('/<int:id_documento>/aprovar', methods=['POST'])
def aprovar_documento(id_documento):
    """Aprova um documento"""
    try:
        data = request.get_json()
        id_usuario_aprovacao = data.get('id_usuario_aprovacao')
        observacoes = data.get('observacoes', '')
        
        if not id_usuario_aprovacao:
            return jsonify({'error': 'ID do usuário aprovador é obrigatório'}), 400
        
        query = """
        UPDATE documentos 
        SET status_documento = 'APROVADO',
            data_aprovacao = NOW(),
            id_usuario_aprovacao = %s,
            observacoes_analista = %s
        WHERE id_documento = %s
        """
        
        execute_query(query, (id_usuario_aprovacao, observacoes, id_documento))
        
        return jsonify({'message': 'Documento aprovado com sucesso'}), 200
    
    except Exception as e:
        print(f"Erro ao aprovar documento: {e}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

@documentos_bp.route('/<int:id_documento>/rejeitar', methods=['POST'])
def rejeitar_documento(id_documento):
    """Rejeita um documento"""
    try:
        data = request.get_json()
        id_usuario_aprovacao = data.get('id_usuario_aprovacao')
        motivo_rejeicao = data.get('motivo_rejeicao', '')
        
        if not id_usuario_aprovacao:
            return jsonify({'error': 'ID do usuário aprovador é obrigatório'}), 400
        
        if not motivo_rejeicao:
            return jsonify({'error': 'Motivo da rejeição é obrigatório'}), 400
        
        query = """
        UPDATE documentos 
        SET status_documento = 'REJEITADO',
            data_aprovacao = NOW(),
            id_usuario_aprovacao = %s,
            motivo_rejeicao = %s
        WHERE id_documento = %s
        """
        
        execute_query(query, (id_usuario_aprovacao, motivo_rejeicao, id_documento))
        
        return jsonify({'message': 'Documento rejeitado com sucesso'}), 200
    
    except Exception as e:
        print(f"Erro ao rejeitar documento: {e}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

