from flask import Blueprint, jsonify
from src.models.database import db, Transportadora, Documento, TipoDocumento, Usuario
from sqlalchemy import func, and_
from datetime import datetime, timedelta
import jwt
from flask import request

dashboard_bp = Blueprint('dashboard', __name__)

def verify_token():
    """Verifica se o token é válido"""
    try:
        token = request.headers.get('Authorization')
        if not token or not token.startswith('Bearer '):
            return None
        
        token = token[7:]
        payload = jwt.decode(token, 'NimoEnergia2024JWT!@#$%', algorithms=['HS256'])
        return payload
    except:
        return None

@dashboard_bp.route('/admin', methods=['GET'])
def dashboard_admin():
    try:
        # Verificar se é admin
        payload = verify_token()
        if not payload or payload['tipo_usuario'] != 'ADMIN':
            return jsonify({'error': 'Acesso negado'}), 403
        
        # Métricas principais
        total_transportadoras = Transportadora.query.filter_by(status_cadastro='APROVADO').count()
        docs_aprovados = Documento.query.filter_by(status='APROVADO').count()
        docs_pendentes = Documento.query.filter_by(status='PENDENTE').count()
        docs_vencidos = Documento.query.filter_by(status='VENCIDO').count()
        
        # Documentos vencendo em 30 dias
        data_limite = datetime.now().date() + timedelta(days=30)
        docs_vencendo = Documento.query.filter(
            and_(
                Documento.data_vencimento <= data_limite,
                Documento.data_vencimento >= datetime.now().date(),
                Documento.status == 'APROVADO'
            )
        ).count()
        
        # Atividade recente (últimos 10 documentos)
        atividade_recente = db.session.query(
            Documento.id,
            Documento.nome_arquivo,
            Documento.status,
            Documento.data_upload,
            Documento.data_aprovacao,
            TipoDocumento.nome.label('tipo_documento_nome'),
            Transportadora.razao_social
        ).join(
            TipoDocumento, Documento.tipo_documento_id == TipoDocumento.id
        ).join(
            Transportadora, Documento.transportadora_id == Transportadora.id
        ).order_by(
            Documento.data_upload.desc()
        ).limit(10).all()
        
        atividade_formatada = []
        for item in atividade_recente:
            tempo_decorrido = datetime.utcnow() - item.data_upload
            if tempo_decorrido.days > 0:
                tempo_str = f"{tempo_decorrido.days} dia{'s' if tempo_decorrido.days > 1 else ''} atrás"
            elif tempo_decorrido.seconds > 3600:
                horas = tempo_decorrido.seconds // 3600
                tempo_str = f"{horas} hora{'s' if horas > 1 else ''} atrás"
            else:
                minutos = tempo_decorrido.seconds // 60
                tempo_str = f"{minutos} minuto{'s' if minutos > 1 else ''} atrás"
            
            atividade_formatada.append({
                'id': item.id,
                'descricao': f"Documento {item.tipo_documento_nome} {'aprovado' if item.status == 'APROVADO' else 'enviado'} para {item.razao_social}",
                'tempo': tempo_str,
                'status': item.status
            })
        
        # Distribuição por categoria
        distribuicao_categoria = db.session.query(
            TipoDocumento.categoria,
            func.count(Documento.id).label('total')
        ).join(
            Documento, TipoDocumento.id == Documento.tipo_documento_id
        ).group_by(TipoDocumento.categoria).all()
        
        # Transportadoras com mais documentos pendentes
        transportadoras_pendentes = db.session.query(
            Transportadora.razao_social,
            func.count(Documento.id).label('pendentes')
        ).join(
            Documento, Transportadora.id == Documento.transportadora_id
        ).filter(
            Documento.status == 'PENDENTE'
        ).group_by(
            Transportadora.id, Transportadora.razao_social
        ).order_by(
            func.count(Documento.id).desc()
        ).limit(5).all()
        
        dashboard_data = {
            'metricas': {
                'total_transportadoras': total_transportadoras,
                'docs_aprovados': docs_aprovados,
                'docs_pendentes': docs_pendentes,
                'docs_vencidos': docs_vencidos,
                'docs_vencendo': docs_vencendo
            },
            'atividade_recente': atividade_formatada,
            'distribuicao_categoria': [
                {'categoria': item.categoria, 'total': item.total}
                for item in distribuicao_categoria
            ],
            'transportadoras_pendentes': [
                {'razao_social': item.razao_social, 'pendentes': item.pendentes}
                for item in transportadoras_pendentes
            ]
        }
        
        return jsonify(dashboard_data), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@dashboard_bp.route('/transportadora', methods=['GET'])
def dashboard_transportadora():
    try:
        # Verificar token
        payload = verify_token()
        if not payload or payload['tipo_usuario'] != 'TRANSPORTADORA':
            return jsonify({'error': 'Acesso negado'}), 403
        
        transportadora_id = payload['transportadora_id']
        
        # Obter dados da transportadora
        transportadora = Transportadora.query.get(transportadora_id)
        if not transportadora:
            return jsonify({'error': 'Transportadora não encontrada'}), 404
        
        # Métricas da transportadora
        docs_enviados = Documento.query.filter_by(transportadora_id=transportadora_id).count()
        docs_aprovados = Documento.query.filter_by(transportadora_id=transportadora_id, status='APROVADO').count()
        docs_pendentes = Documento.query.filter_by(transportadora_id=transportadora_id, status='PENDENTE').count()
        docs_rejeitados = Documento.query.filter_by(transportadora_id=transportadora_id, status='REJEITADO').count()
        docs_vencidos = Documento.query.filter_by(transportadora_id=transportadora_id, status='VENCIDO').count()
        
        # Documentos vencendo em 30 dias
        data_limite = datetime.now().date() + timedelta(days=30)
        docs_vencendo = Documento.query.filter(
            and_(
                Documento.transportadora_id == transportadora_id,
                Documento.data_vencimento <= data_limite,
                Documento.data_vencimento >= datetime.now().date(),
                Documento.status == 'APROVADO'
            )
        ).count()
        
        # Documentos obrigatórios faltantes
        tipos_obrigatorios = TipoDocumento.query.filter_by(obrigatorio=True, ativo=True).all()
        tipos_enviados = db.session.query(Documento.tipo_documento_id).filter_by(
            transportadora_id=transportadora_id
        ).distinct().all()
        tipos_enviados_ids = [t[0] for t in tipos_enviados]
        
        docs_faltantes = []
        for tipo in tipos_obrigatorios:
            if tipo.id not in tipos_enviados_ids:
                docs_faltantes.append(tipo.to_dict())
        
        # Histórico recente dos documentos
        historico_recente = db.session.query(
            Documento.id,
            Documento.nome_arquivo,
            Documento.status,
            Documento.data_upload,
            Documento.observacoes,
            TipoDocumento.nome.label('tipo_documento_nome')
        ).join(
            TipoDocumento, Documento.tipo_documento_id == TipoDocumento.id
        ).filter(
            Documento.transportadora_id == transportadora_id
        ).order_by(
            Documento.data_upload.desc()
        ).limit(10).all()
        
        historico_formatado = []
        for item in historico_recente:
            tempo_decorrido = datetime.utcnow() - item.data_upload
            if tempo_decorrido.days > 0:
                tempo_str = f"{tempo_decorrido.days} dia{'s' if tempo_decorrido.days > 1 else ''} atrás"
            elif tempo_decorrido.seconds > 3600:
                horas = tempo_decorrido.seconds // 3600
                tempo_str = f"{horas} hora{'s' if horas > 1 else ''} atrás"
            else:
                minutos = tempo_decorrido.seconds // 60
                tempo_str = f"{minutos} minuto{'s' if minutos > 1 else ''} atrás"
            
            historico_formatado.append({
                'id': item.id,
                'tipo_documento': item.tipo_documento_nome,
                'nome_arquivo': item.nome_arquivo,
                'status': item.status,
                'tempo': tempo_str,
                'observacoes': item.observacoes
            })
        
        # Calcular percentual de compliance
        total_obrigatorios = len(tipos_obrigatorios)
        docs_aprovados_obrigatorios = db.session.query(Documento).join(
            TipoDocumento, Documento.tipo_documento_id == TipoDocumento.id
        ).filter(
            and_(
                Documento.transportadora_id == transportadora_id,
                Documento.status == 'APROVADO',
                TipoDocumento.obrigatorio == True
            )
        ).count()
        
        percentual_compliance = (docs_aprovados_obrigatorios / total_obrigatorios * 100) if total_obrigatorios > 0 else 0
        
        dashboard_data = {
            'transportadora': transportadora.to_dict(),
            'metricas': {
                'docs_enviados': docs_enviados,
                'docs_aprovados': docs_aprovados,
                'docs_pendentes': docs_pendentes,
                'docs_rejeitados': docs_rejeitados,
                'docs_vencidos': docs_vencidos,
                'docs_vencendo': docs_vencendo,
                'percentual_compliance': round(percentual_compliance, 2)
            },
            'docs_faltantes': docs_faltantes,
            'historico_recente': historico_formatado
        }
        
        return jsonify(dashboard_data), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@dashboard_bp.route('/performance', methods=['GET'])
def dashboard_performance():
    try:
        # Verificar token
        payload = verify_token()
        if not payload:
            return jsonify({'error': 'Token inválido'}), 401
        
        # Dados de performance por transportadora
        performance_data = db.session.query(
            Transportadora.id,
            Transportadora.razao_social,
            Transportadora.status_cadastro,
            func.count(Documento.id).label('total_documentos'),
            func.sum(func.case([(Documento.status == 'APROVADO', 1)], else_=0)).label('docs_aprovados'),
            func.sum(func.case([(Documento.status == 'PENDENTE', 1)], else_=0)).label('docs_pendentes'),
            func.sum(func.case([(Documento.status == 'REJEITADO', 1)], else_=0)).label('docs_rejeitados'),
            func.sum(func.case([(Documento.status == 'VENCIDO', 1)], else_=0)).label('docs_vencidos')
        ).outerjoin(
            Documento, Transportadora.id == Documento.transportadora_id
        ).group_by(
            Transportadora.id, Transportadora.razao_social, Transportadora.status_cadastro
        ).all()
        
        performance_formatada = []
        for item in performance_data:
            total_docs = item.total_documentos or 0
            docs_aprovados = item.docs_aprovados or 0
            
            percentual_aprovacao = (docs_aprovados / total_docs * 100) if total_docs > 0 else 0
            
            performance_formatada.append({
                'id': item.id,
                'razao_social': item.razao_social,
                'status_cadastro': item.status_cadastro,
                'total_documentos': total_docs,
                'docs_aprovados': docs_aprovados,
                'docs_pendentes': item.docs_pendentes or 0,
                'docs_rejeitados': item.docs_rejeitados or 0,
                'docs_vencidos': item.docs_vencidos or 0,
                'percentual_aprovacao': round(percentual_aprovacao, 2)
            })
        
        return jsonify(performance_formatada), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@dashboard_bp.route('/compliance', methods=['GET'])
def dashboard_compliance():
    try:
        # Verificar token
        payload = verify_token()
        if not payload:
            return jsonify({'error': 'Token inválido'}), 401
        
        # Compliance por transportadora
        tipos_obrigatorios = TipoDocumento.query.filter_by(obrigatorio=True, ativo=True).all()
        total_obrigatorios = len(tipos_obrigatorios)
        
        compliance_data = []
        transportadoras = Transportadora.query.filter_by(status_cadastro='APROVADO').all()
        
        for transportadora in transportadoras:
            docs_aprovados_obrigatorios = db.session.query(Documento).join(
                TipoDocumento, Documento.tipo_documento_id == TipoDocumento.id
            ).filter(
                and_(
                    Documento.transportadora_id == transportadora.id,
                    Documento.status == 'APROVADO',
                    TipoDocumento.obrigatorio == True
                )
            ).count()
            
            percentual_compliance = (docs_aprovados_obrigatorios / total_obrigatorios * 100) if total_obrigatorios > 0 else 0
            
            # Verificar documentos vencendo
            data_limite = datetime.now().date() + timedelta(days=30)
            docs_vencendo = Documento.query.filter(
                and_(
                    Documento.transportadora_id == transportadora.id,
                    Documento.data_vencimento <= data_limite,
                    Documento.data_vencimento >= datetime.now().date(),
                    Documento.status == 'APROVADO'
                )
            ).count()
            
            compliance_data.append({
                'id': transportadora.id,
                'razao_social': transportadora.razao_social,
                'cnpj': transportadora.cnpj,
                'total_obrigatorios': total_obrigatorios,
                'docs_aprovados_obrigatorios': docs_aprovados_obrigatorios,
                'percentual_compliance': round(percentual_compliance, 2),
                'docs_vencendo': docs_vencendo,
                'status_compliance': 'CONFORME' if percentual_compliance >= 100 else 'NAO_CONFORME'
            })
        
        return jsonify(compliance_data), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

