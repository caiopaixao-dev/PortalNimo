from flask import Blueprint, request, jsonify
from src.models.database import execute_query
from datetime import datetime, date

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/admin', methods=['GET'])
def dashboard_admin():
    """Dashboard administrativo com métricas gerais"""
    try:
        # Métricas principais
        metricas = {}
        
        # Total de transportadoras
        query = "SELECT COUNT(*) as total FROM transportadoras WHERE status_ativo = TRUE"
        result = execute_query(query, fetch='one')
        metricas['total_transportadoras'] = result['total']
        
        # Total de documentos por status
        query = """
        SELECT 
            status_documento,
            COUNT(*) as total
        FROM documentos 
        GROUP BY status_documento
        """
        docs_status = execute_query(query, fetch='all')
        
        metricas['documentos'] = {
            'total': sum(doc['total'] for doc in docs_status),
            'aprovados': next((doc['total'] for doc in docs_status if doc['status_documento'] == 'APROVADO'), 0),
            'pendentes': next((doc['total'] for doc in docs_status if doc['status_documento'] == 'PENDENTE'), 0),
            'rejeitados': next((doc['total'] for doc in docs_status if doc['status_documento'] == 'REJEITADO'), 0),
            'vencidos': next((doc['total'] for doc in docs_status if doc['status_documento'] == 'VENCIDO'), 0)
        }
        
        # Documentos do último mês
        query = """
        SELECT COUNT(*) as total 
        FROM documentos 
        WHERE data_upload >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        """
        result = execute_query(query, fetch='one')
        metricas['documentos_ultimo_mes'] = result['total']
        
        # Atividade recente
        query = """
        SELECT 
            h.acao,
            h.data_acao,
            u.nome_completo as usuario,
            t.razao_social as transportadora,
            td.nome_tipo as tipo_documento
        FROM historico_documentos h
        JOIN usuarios u ON h.id_usuario = u.id_usuario
        JOIN documentos d ON h.id_documento = d.id_documento
        JOIN transportadoras t ON d.id_transportadora = t.id_transportadora
        JOIN tipos_documento td ON d.id_tipo_documento = td.id_tipo
        ORDER BY h.data_acao DESC
        LIMIT 10
        """
        atividade_recente = execute_query(query, fetch='all')
        
        # Converte datetime para string
        for atividade in atividade_recente:
            if isinstance(atividade['data_acao'], datetime):
                atividade['data_acao'] = atividade['data_acao'].isoformat()
        
        return jsonify({
            'metricas': metricas,
            'atividade_recente': atividade_recente,
            'ultima_atualizacao': datetime.now().isoformat()
        }), 200
    
    except Exception as e:
        print(f"Erro no dashboard admin: {e}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

@dashboard_bp.route('/transportadora/<int:id_transportadora>', methods=['GET'])
def dashboard_transportadora(id_transportadora):
    """Dashboard específico da transportadora"""
    try:
        # Dados da transportadora
        query = """
        SELECT * FROM transportadoras 
        WHERE id_transportadora = %s AND status_ativo = TRUE
        """
        transportadora = execute_query(query, (id_transportadora,), fetch='one')
        
        if not transportadora:
            return jsonify({'error': 'Transportadora não encontrada'}), 404
        
        # Documentos da transportadora por status
        query = """
        SELECT 
            status_documento,
            COUNT(*) as total
        FROM documentos 
        WHERE id_transportadora = %s
        GROUP BY status_documento
        """
        docs_status = execute_query(query, (id_transportadora,), fetch='all')
        
        documentos = {
            'total': sum(doc['total'] for doc in docs_status),
            'aprovados': next((doc['total'] for doc in docs_status if doc['status_documento'] == 'APROVADO'), 0),
            'pendentes': next((doc['total'] for doc in docs_status if doc['status_documento'] == 'PENDENTE'), 0),
            'rejeitados': next((doc['total'] for doc in docs_status if doc['status_documento'] == 'REJEITADO'), 0),
            'vencidos': next((doc['total'] for doc in docs_status if doc['status_documento'] == 'VENCIDO'), 0)
        }
        
        # Calcula compliance
        query = "SELECT COUNT(*) as total FROM tipos_documento WHERE ativo = TRUE"
        tipos_total = execute_query(query, fetch='one')['total']
        
        query = """
        SELECT COUNT(DISTINCT d.id_tipo_documento) as conformes
        FROM documentos d
        WHERE d.id_transportadora = %s 
          AND d.status_documento = 'APROVADO'
          AND (d.data_vencimento IS NULL OR d.data_vencimento >= CURDATE())
        """
        conformes = execute_query(query, (id_transportadora,), fetch='one')['conformes']
        
        compliance_percentual = round((conformes / tipos_total) * 100, 1) if tipos_total > 0 else 0
        
        # Documentos próximos ao vencimento
        query = """
        SELECT 
            d.numero_protocolo,
            td.nome_tipo,
            d.data_vencimento,
            DATEDIFF(d.data_vencimento, CURDATE()) as dias_para_vencimento
        FROM documentos d
        JOIN tipos_documento td ON d.id_tipo_documento = td.id_tipo
        WHERE d.id_transportadora = %s 
          AND d.status_documento = 'APROVADO'
          AND d.data_vencimento IS NOT NULL
          AND d.data_vencimento <= DATE_ADD(CURDATE(), INTERVAL 60 DAY)
        ORDER BY d.data_vencimento ASC
        LIMIT 5
        """
        vencimentos = execute_query(query, (id_transportadora,), fetch='all')
        
        # Converte datas para string
        for venc in vencimentos:
            if isinstance(venc['data_vencimento'], date):
                venc['data_vencimento'] = venc['data_vencimento'].isoformat()
        
        return jsonify({
            'transportadora': {
                'id': transportadora['id_transportadora'],
                'razao_social': transportadora['razao_social'],
                'nome_fantasia': transportadora['nome_fantasia'],
                'cnpj': transportadora['cnpj'],
                'email': transportadora['email_corporativo'],
                'telefone': transportadora['telefone_principal']
            },
            'documentos': documentos,
            'compliance': {
                'percentual': compliance_percentual,
                'conformes': conformes,
                'total_tipos': tipos_total
            },
            'vencimentos_proximos': vencimentos,
            'ultima_atualizacao': datetime.now().isoformat()
        }), 200
    
    except Exception as e:
        print(f"Erro no dashboard transportadora: {e}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

