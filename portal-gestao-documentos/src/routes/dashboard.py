from flask import Blueprint, jsonify, request
from src.models.user import Documento, Transportadora, User, TipoDocumento, db
from src.routes.auth import token_required, admin_required
from datetime import datetime, date, timedelta
from sqlalchemy import func, and_

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/dashboard/stats', methods=['GET'])
@token_required
def get_dashboard_stats(current_user):
    """Obter estatísticas principais do dashboard"""
    try:
        stats = {}
        
        if current_user.role == 'admin':
            # Estatísticas para administrador
            stats['transportadoras'] = {
                'total': Transportadora.query.count(),
                'ativas': Transportadora.query.filter_by(status='ativa').count(),
                'inativas': Transportadora.query.filter_by(status='inativa').count(),
                'pendentes': Transportadora.query.filter_by(status='pendente').count()
            }
            
            stats['documentos'] = {
                'total': Documento.query.count(),
                'aprovados': Documento.query.filter_by(status='aprovado').count(),
                'pendentes': Documento.query.filter_by(status='pendente').count(),
                'rejeitados': Documento.query.filter_by(status='rejeitado').count(),
                'vencidos': Documento.query.filter(
                    Documento.data_vencimento.isnot(None),
                    Documento.data_vencimento < date.today()
                ).count()
            }
            
            stats['usuarios'] = {
                'total': User.query.count(),
                'admins': User.query.filter_by(role='admin').count(),
                'transportadoras': User.query.filter_by(role='transportadora').count(),
                'ativos': User.query.filter_by(is_active=True).count()
            }
            
        else:
            # Estatísticas para transportadora
            if not current_user.transportadora_id:
                return jsonify({'message': 'Usuário não vinculado a uma transportadora'}), 400
            
            transportadora_docs = Documento.query.filter_by(transportadora_id=current_user.transportadora_id)
            
            stats['documentos'] = {
                'total': transportadora_docs.count(),
                'aprovados': transportadora_docs.filter_by(status='aprovado').count(),
                'pendentes': transportadora_docs.filter_by(status='pendente').count(),
                'rejeitados': transportadora_docs.filter_by(status='rejeitado').count(),
                'vencidos': transportadora_docs.filter(
                    Documento.data_vencimento.isnot(None),
                    Documento.data_vencimento < date.today()
                ).count()
            }
        
        # Documentos vencendo nos próximos 30 dias
        data_limite = date.today() + timedelta(days=30)
        vencendo_query = Documento.query.filter(
            Documento.data_vencimento.isnot(None),
            Documento.data_vencimento <= data_limite,
            Documento.data_vencimento >= date.today(),
            Documento.status == 'aprovado'
        )
        
        if current_user.role != 'admin':
            vencendo_query = vencendo_query.filter_by(transportadora_id=current_user.transportadora_id)
        
        stats['vencimentos'] = {
            'proximos_30_dias': vencendo_query.count()
        }
        
        return jsonify({'stats': stats}), 200
        
    except Exception as e:
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@dashboard_bp.route('/dashboard/atividade-recente', methods=['GET'])
@token_required
def get_atividade_recente(current_user):
    """Obter atividades recentes do sistema"""
    try:
        limit = request.args.get('limit', 10, type=int)
        
        # Query base para documentos
        query = Documento.query
        
        if current_user.role != 'admin':
            if not current_user.transportadora_id:
                return jsonify({'message': 'Usuário não vinculado a uma transportadora'}), 400
            query = query.filter_by(transportadora_id=current_user.transportadora_id)
        
        # Buscar documentos recentes
        documentos_recentes = query.order_by(Documento.data_upload.desc()).limit(limit).all()
        
        atividades = []
        for doc in documentos_recentes:
            atividade = {
                'id': doc.id,
                'tipo': 'documento',
                'acao': 'upload',
                'titulo': f'Upload de {doc.tipo_documento.nome}',
                'descricao': f'Documento enviado por {doc.transportadora.nome}',
                'data': doc.data_upload.isoformat(),
                'status': doc.status,
                'documento_id': doc.id,
                'transportadora': doc.transportadora.nome
            }
            atividades.append(atividade)
            
            # Adicionar atividade de aprovação/rejeição se existir
            if doc.data_aprovacao:
                atividade_aprovacao = {
                    'id': f"{doc.id}_aprovacao",
                    'tipo': 'aprovacao',
                    'acao': 'aprovado',
                    'titulo': f'Documento aprovado',
                    'descricao': f'{doc.tipo_documento.nome} da {doc.transportadora.nome} foi aprovado',
                    'data': doc.data_aprovacao.isoformat(),
                    'status': 'aprovado',
                    'documento_id': doc.id,
                    'transportadora': doc.transportadora.nome
                }
                atividades.append(atividade_aprovacao)
            
            elif doc.data_rejeicao:
                atividade_rejeicao = {
                    'id': f"{doc.id}_rejeicao",
                    'tipo': 'rejeicao',
                    'acao': 'rejeitado',
                    'titulo': f'Documento rejeitado',
                    'descricao': f'{doc.tipo_documento.nome} da {doc.transportadora.nome} foi rejeitado',
                    'data': doc.data_rejeicao.isoformat(),
                    'status': 'rejeitado',
                    'documento_id': doc.id,
                    'transportadora': doc.transportadora.nome
                }
                atividades.append(atividade_rejeicao)
        
        # Ordenar por data (mais recente primeiro)
        atividades.sort(key=lambda x: x['data'], reverse=True)
        
        return jsonify({
            'atividades': atividades[:limit]
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@dashboard_bp.route('/dashboard/metricas-mensais', methods=['GET'])
@token_required
@admin_required
def get_metricas_mensais(current_user):
    """Obter métricas mensais (apenas admin)"""
    try:
        meses = request.args.get('meses', 6, type=int)
        
        # Calcular datas
        data_fim = date.today()
        data_inicio = data_fim - timedelta(days=30 * meses)
        
        # Documentos por mês
        documentos_por_mes = db.session.query(
            func.strftime('%Y-%m', Documento.data_upload).label('mes'),
            func.count(Documento.id).label('total'),
            func.sum(func.case([(Documento.status == 'aprovado', 1)], else_=0)).label('aprovados'),
            func.sum(func.case([(Documento.status == 'pendente', 1)], else_=0)).label('pendentes'),
            func.sum(func.case([(Documento.status == 'rejeitado', 1)], else_=0)).label('rejeitados')
        ).filter(
            Documento.data_upload >= data_inicio
        ).group_by(
            func.strftime('%Y-%m', Documento.data_upload)
        ).order_by('mes').all()
        
        # Transportadoras por mês
        transportadoras_por_mes = db.session.query(
            func.strftime('%Y-%m', Transportadora.created_at).label('mes'),
            func.count(Transportadora.id).label('total')
        ).filter(
            Transportadora.created_at >= data_inicio
        ).group_by(
            func.strftime('%Y-%m', Transportadora.created_at)
        ).order_by('mes').all()
        
        return jsonify({
            'metricas': {
                'documentos_por_mes': [
                    {
                        'mes': row.mes,
                        'total': row.total,
                        'aprovados': row.aprovados or 0,
                        'pendentes': row.pendentes or 0,
                        'rejeitados': row.rejeitados or 0
                    } for row in documentos_por_mes
                ],
                'transportadoras_por_mes': [
                    {
                        'mes': row.mes,
                        'total': row.total
                    } for row in transportadoras_por_mes
                ]
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@dashboard_bp.route('/dashboard/alertas', methods=['GET'])
@token_required
def get_alertas(current_user):
    """Obter alertas importantes do sistema"""
    try:
        alertas = []
        
        # Documentos vencidos
        query_vencidos = Documento.query.filter(
            Documento.data_vencimento.isnot(None),
            Documento.data_vencimento < date.today(),
            Documento.status == 'aprovado'
        )
        
        if current_user.role != 'admin':
            if not current_user.transportadora_id:
                return jsonify({'message': 'Usuário não vinculado a uma transportadora'}), 400
            query_vencidos = query_vencidos.filter_by(transportadora_id=current_user.transportadora_id)
        
        vencidos = query_vencidos.count()
        if vencidos > 0:
            alertas.append({
                'tipo': 'erro',
                'titulo': 'Documentos Vencidos',
                'mensagem': f'{vencidos} documento(s) vencido(s) encontrado(s)',
                'acao': 'Renovar documentos',
                'prioridade': 'alta'
            })
        
        # Documentos vencendo em 7 dias
        data_limite_7 = date.today() + timedelta(days=7)
        query_vencendo_7 = Documento.query.filter(
            Documento.data_vencimento.isnot(None),
            Documento.data_vencimento <= data_limite_7,
            Documento.data_vencimento >= date.today(),
            Documento.status == 'aprovado'
        )
        
        if current_user.role != 'admin':
            query_vencendo_7 = query_vencendo_7.filter_by(transportadora_id=current_user.transportadora_id)
        
        vencendo_7 = query_vencendo_7.count()
        if vencendo_7 > 0:
            alertas.append({
                'tipo': 'aviso',
                'titulo': 'Documentos Vencendo',
                'mensagem': f'{vencendo_7} documento(s) vencendo em 7 dias',
                'acao': 'Preparar renovação',
                'prioridade': 'media'
            })
        
        # Documentos pendentes (apenas para admin)
        if current_user.role == 'admin':
            pendentes = Documento.query.filter_by(status='pendente').count()
            if pendentes > 0:
                alertas.append({
                    'tipo': 'info',
                    'titulo': 'Documentos Pendentes',
                    'mensagem': f'{pendentes} documento(s) aguardando aprovação',
                    'acao': 'Revisar documentos',
                    'prioridade': 'media'
                })
        
        return jsonify({'alertas': alertas}), 200
        
    except Exception as e:
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

