from flask import Blueprint, jsonify, request
from src.models.user import Transportadora, db
from src.routes.auth import token_required, admin_required
from datetime import datetime

transportadora_bp = Blueprint('transportadora', __name__)

@transportadora_bp.route('/transportadoras', methods=['GET'])
@token_required
def get_transportadoras(current_user):
    """Listar todas as transportadoras (admin) ou apenas a própria (transportadora)"""
    try:
        if current_user.role == 'admin':
            transportadoras = Transportadora.query.all()
        else:
            if not current_user.transportadora_id:
                return jsonify({'message': 'Usuário não vinculado a uma transportadora'}), 400
            transportadoras = [Transportadora.query.get(current_user.transportadora_id)]
        
        return jsonify({
            'transportadoras': [t.to_dict() for t in transportadoras if t]
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@transportadora_bp.route('/transportadoras', methods=['POST'])
@token_required
@admin_required
def create_transportadora(current_user):
    """Criar nova transportadora (apenas admin)"""
    try:
        data = request.get_json()
        
        # Validações
        required_fields = ['nome', 'cnpj', 'razao_social']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'Campo {field} é obrigatório'}), 400
        
        # Verificar se CNPJ já existe
        if Transportadora.query.filter_by(cnpj=data['cnpj']).first():
            return jsonify({'message': 'CNPJ já cadastrado'}), 400
        
        # Criar transportadora
        transportadora = Transportadora(
            nome=data['nome'],
            cnpj=data['cnpj'],
            razao_social=data['razao_social'],
            endereco=data.get('endereco'),
            telefone=data.get('telefone'),
            email=data.get('email'),
            responsavel=data.get('responsavel'),
            status=data.get('status', 'ativa')
        )
        
        db.session.add(transportadora)
        db.session.commit()
        
        return jsonify({
            'message': 'Transportadora criada com sucesso',
            'transportadora': transportadora.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@transportadora_bp.route('/transportadoras/<int:transportadora_id>', methods=['GET'])
@token_required
def get_transportadora(current_user, transportadora_id):
    """Obter dados de uma transportadora específica"""
    try:
        transportadora = Transportadora.query.get_or_404(transportadora_id)
        
        # Verificar permissão
        if current_user.role != 'admin' and current_user.transportadora_id != transportadora_id:
            return jsonify({'message': 'Acesso negado'}), 403
        
        return jsonify({
            'transportadora': transportadora.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@transportadora_bp.route('/transportadoras/<int:transportadora_id>', methods=['PUT'])
@token_required
def update_transportadora(current_user, transportadora_id):
    """Atualizar dados de uma transportadora"""
    try:
        transportadora = Transportadora.query.get_or_404(transportadora_id)
        
        # Verificar permissão
        if current_user.role != 'admin' and current_user.transportadora_id != transportadora_id:
            return jsonify({'message': 'Acesso negado'}), 403
        
        data = request.get_json()
        
        # Atualizar campos permitidos
        allowed_fields = ['nome', 'razao_social', 'endereco', 'telefone', 'email', 'responsavel']
        if current_user.role == 'admin':
            allowed_fields.extend(['cnpj', 'status'])
        
        for field in allowed_fields:
            if field in data:
                setattr(transportadora, field, data[field])
        
        transportadora.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Transportadora atualizada com sucesso',
            'transportadora': transportadora.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@transportadora_bp.route('/transportadoras/<int:transportadora_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_transportadora(current_user, transportadora_id):
    """Excluir uma transportadora (apenas admin)"""
    try:
        transportadora = Transportadora.query.get_or_404(transportadora_id)
        
        # Verificar se há documentos vinculados
        if transportadora.documentos:
            return jsonify({'message': 'Não é possível excluir transportadora com documentos vinculados'}), 400
        
        db.session.delete(transportadora)
        db.session.commit()
        
        return jsonify({'message': 'Transportadora excluída com sucesso'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@transportadora_bp.route('/transportadoras/stats', methods=['GET'])
@token_required
@admin_required
def get_transportadoras_stats(current_user):
    """Obter estatísticas das transportadoras (apenas admin)"""
    try:
        total = Transportadora.query.count()
        ativas = Transportadora.query.filter_by(status='ativa').count()
        inativas = Transportadora.query.filter_by(status='inativa').count()
        pendentes = Transportadora.query.filter_by(status='pendente').count()
        
        return jsonify({
            'stats': {
                'total': total,
                'ativas': ativas,
                'inativas': inativas,
                'pendentes': pendentes
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

