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
        data_vencimento = request.form.get('data_vencimento')
        valor_garantia = request.form.get('valor_garantia')
        observacoes = request.form.get('observacoes', '')
        
        if not id_transportadora or not id_tipo_documento:
            return jsonify({'error': 'Dados obrigatórios não informados'}), 400
        
        # Gera nome único para o arquivo
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        nome_arquivo = f"{timestamp}_{arquivo.filename}"
        
        # Simula salvamento do arquivo (em produção, salvar em storage)
        caminho_arquivo = f"/uploads/{nome_arquivo}"
        
        # Insere documento no banco
        query = """
        INSERT INTO documentos (
            id_transportadora, id_tipo_documento, nome_arquivo, 
            caminho_arquivo, data_vencimento, valor_garantia, 
            observacoes, status, data_envio
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, 'PENDENTE', NOW())
        """
        
        params = (
            id_transportadora, id_tipo_documento, nome_arquivo,
            caminho_arquivo, data_vencimento, valor_garantia, observacoes
        )
        
        result = execute_query(query, params, fetch='none')
        
        return jsonify({
            'message': 'Documento enviado com sucesso!',
            'arquivo': nome_arquivo
        }), 201
    
    except Exception as e:
        print(f"Erro no upload: {e}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

@documentos_bp.route('/transportadora/<int:id_transportadora>', methods=['GET'])
def listar_documentos_transportadora(id_transportadora):
    """Lista documentos de uma transportadora"""
    try:
        query = """
        SELECT d.*, td.nome as tipo_nome, td.categoria,
               t.razao_social as transportadora_nome
        FROM documentos d
        JOIN tipos_documento td ON d.id_tipo_documento = td.id
        JOIN transportadoras t ON d.id_transportadora = t.id
        WHERE d.id_transportadora = %s
        ORDER BY d.data_envio DESC
        """
        
        documentos = execute_query(query, (id_transportadora,), fetch='all')
        
        return jsonify({'documentos': documentos}), 200
    
    except Exception as e:
        print(f"Erro ao listar documentos: {e}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

@documentos_bp.route('/', methods=['GET'])
def listar_todos_documentos():
    """Lista todos os documentos (para admin)"""
    try:
        # Parâmetros de filtro
        status = request.args.get('status', '')
        tipo = request.args.get('tipo', '')
        busca = request.args.get('busca', '')
        
        query = """
        SELECT d.*, td.nome as tipo_nome, td.categoria,
               t.razao_social as transportadora_nome
        FROM documentos d
        JOIN tipos_documento td ON d.id_tipo_documento = td.id
        JOIN transportadoras t ON d.id_transportadora = t.id
        WHERE 1=1
        """
        params = []
        
        if status:
            query += " AND d.status = %s"
            params.append(status)
        
        if tipo:
            query += " AND td.categoria = %s"
            params.append(tipo)
        
        if busca:
            query += " AND (td.nome LIKE %s OR t.razao_social LIKE %s)"
            params.extend([f"%{busca}%", f"%{busca}%"])
        
        query += " ORDER BY d.data_envio DESC"
        
        documentos = execute_query(query, params, fetch='all')
        
        return jsonify({'documentos': documentos}), 200
    
    except Exception as e:
        print(f"Erro ao listar documentos: {e}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

@documentos_bp.route('/<int:id_documento>/aprovar', methods=['POST'])
def aprovar_documento(id_documento):
    """Aprova um documento"""
    try:
        data = request.get_json()
        observacoes = data.get('observacoes', 'Documento aprovado')
        
        query = """
        UPDATE documentos 
        SET status = 'APROVADO', 
            data_aprovacao = NOW(),
            observacoes_aprovacao = %s
        WHERE id = %s
        """
        
        execute_query(query, (observacoes, id_documento), fetch='none')
        
        # Registra no histórico
        query_historico = """
        INSERT INTO historico_documentos (
            id_documento, acao, observacoes, data_acao
        ) VALUES (%s, 'APROVADO', %s, NOW())
        """
        
        execute_query(query_historico, (id_documento, observacoes), fetch='none')
        
        return jsonify({'message': 'Documento aprovado com sucesso!'}), 200
    
    except Exception as e:
        print(f"Erro ao aprovar documento: {e}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

@documentos_bp.route('/<int:id_documento>/rejeitar', methods=['POST'])
def rejeitar_documento(id_documento):
    """Rejeita um documento"""
    try:
        data = request.get_json()
        motivo = data.get('motivo', 'Documento rejeitado')
        
        query = """
        UPDATE documentos 
        SET status = 'REJEITADO', 
            data_rejeicao = NOW(),
            motivo_rejeicao = %s
        WHERE id = %s
        """
        
        execute_query(query, (motivo, id_documento), fetch='none')
        
        # Registra no histórico
        query_historico = """
        INSERT INTO historico_documentos (
            id_documento, acao, observacoes, data_acao
        ) VALUES (%s, 'REJEITADO', %s, NOW())
        """
        
        execute_query(query_historico, (id_documento, motivo), fetch='none')
        
        return jsonify({'message': 'Documento rejeitado'}), 200
    
    except Exception as e:
        print(f"Erro ao rejeitar documento: {e}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

@documentos_bp.route('/estatisticas', methods=['GET'])
def estatisticas_documentos():
    """Retorna estatísticas dos documentos"""
    try:
        # Total por status
        query_status = """
        SELECT status, COUNT(*) as total
        FROM documentos
        GROUP BY status
        """
        stats_status = execute_query(query_status, fetch='all')
        
        # Total por tipo
        query_tipo = """
        SELECT td.categoria, COUNT(*) as total
        FROM documentos d
        JOIN tipos_documento td ON d.id_tipo_documento = td.id
        GROUP BY td.categoria
        """
        stats_tipo = execute_query(query_tipo, fetch='all')
        
        # Documentos vencendo (próximos 30 dias)
        query_vencendo = """
        SELECT COUNT(*) as total
        FROM documentos
        WHERE data_vencimento BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY)
        AND status = 'APROVADO'
        """
        vencendo = execute_query(query_vencendo, fetch='one')
        
        return jsonify({
            'por_status': stats_status,
            'por_tipo': stats_tipo,
            'vencendo_30_dias': vencendo['total'] if vencendo else 0
        }), 200
    
    except Exception as e:
        print(f"Erro ao obter estatísticas: {e}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

