from flask import Blueprint, jsonify, request
from src.models.user import TipoDocumento, db
from src.routes.auth import token_required, admin_required

tipo_documento_bp = Blueprint('tipo_documento', __name__)

@tipo_documento_bp.route('/tipos-documento', methods=['GET'])
@token_required
def get_tipos_documento(current_user):
    """Listar todos os tipos de documento"""
    try:
        tipos = TipoDocumento.query.order_by(TipoDocumento.categoria, TipoDocumento.nome).all()
        
        return jsonify({
            'tipos_documento': [tipo.to_dict() for tipo in tipos]
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@tipo_documento_bp.route('/tipos-documento', methods=['POST'])
@token_required
@admin_required
def create_tipo_documento(current_user):
    """Criar novo tipo de documento (apenas admin)"""
    try:
        data = request.get_json()
        
        # Validações
        required_fields = ['nome', 'categoria']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'Campo {field} é obrigatório'}), 400
        
        # Verificar se já existe
        if TipoDocumento.query.filter_by(nome=data['nome']).first():
            return jsonify({'message': 'Tipo de documento já existe'}), 400
        
        # Criar tipo de documento
        tipo_documento = TipoDocumento(
            nome=data['nome'],
            descricao=data.get('descricao'),
            obrigatorio=data.get('obrigatorio', True),
            categoria=data['categoria'],
            validade_dias=data.get('validade_dias'),
            formatos_aceitos=data.get('formatos_aceitos', 'pdf,jpg,jpeg,png,docx'),
            tamanho_max_mb=data.get('tamanho_max_mb', 5)
        )
        
        db.session.add(tipo_documento)
        db.session.commit()
        
        return jsonify({
            'message': 'Tipo de documento criado com sucesso',
            'tipo_documento': tipo_documento.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@tipo_documento_bp.route('/tipos-documento/<int:tipo_id>', methods=['PUT'])
@token_required
@admin_required
def update_tipo_documento(current_user, tipo_id):
    """Atualizar tipo de documento (apenas admin)"""
    try:
        tipo_documento = TipoDocumento.query.get_or_404(tipo_id)
        data = request.get_json()
        
        # Atualizar campos
        allowed_fields = ['nome', 'descricao', 'obrigatorio', 'categoria', 'validade_dias', 'formatos_aceitos', 'tamanho_max_mb']
        for field in allowed_fields:
            if field in data:
                setattr(tipo_documento, field, data[field])
        
        db.session.commit()
        
        return jsonify({
            'message': 'Tipo de documento atualizado com sucesso',
            'tipo_documento': tipo_documento.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

@tipo_documento_bp.route('/tipos-documento/seed', methods=['POST'])
@token_required
@admin_required
def seed_tipos_documento(current_user):
    """Criar tipos de documento padrão (apenas admin)"""
    try:
        tipos_padrao = [
            # Documentos do Veículo
            {'nome': 'CIPP - Certificado de Inspeção para Transporte de Produtos Perigosos', 'categoria': 'veiculo', 'obrigatorio': True, 'validade_dias': 30},
            {'nome': 'CIV - Certificado de Inspeção Veicular', 'categoria': 'veiculo', 'obrigatorio': True, 'validade_dias': 30},
            {'nome': 'Autorização ANP para Transporte', 'categoria': 'veiculo', 'obrigatorio': True, 'validade_dias': 60},
            {'nome': 'Licença Ambiental para Transporte', 'categoria': 'veiculo', 'obrigatorio': True, 'validade_dias': 60},
            
            # Documentos do Motorista
            {'nome': 'CNH com Atividade Remunerada', 'categoria': 'motorista', 'obrigatorio': True, 'validade_dias': 30},
            {'nome': 'Curso MOPP', 'categoria': 'motorista', 'obrigatorio': True, 'validade_dias': 60},
            {'nome': 'DIM - Documento de Identificação do Motorista', 'categoria': 'motorista', 'obrigatorio': True, 'validade_dias': 30},
            {'nome': 'Certificado de Treinamento em Segurança', 'categoria': 'motorista', 'obrigatorio': True, 'validade_dias': 90},
            
            # Documentos Societários
            {'nome': 'Contrato Social', 'categoria': 'societario', 'obrigatorio': True, 'validade_dias': None},
            {'nome': 'Licença de Funcionamento', 'categoria': 'societario', 'obrigatorio': True, 'validade_dias': 90},
            {'nome': 'CNPJ', 'categoria': 'societario', 'obrigatorio': True, 'validade_dias': None},
            {'nome': 'Inscrição Estadual', 'categoria': 'societario', 'obrigatorio': True, 'validade_dias': None},
            {'nome': 'Certidão Negativa Federal', 'categoria': 'societario', 'obrigatorio': True, 'validade_dias': 90},
            {'nome': 'Certidão Negativa Estadual', 'categoria': 'societario', 'obrigatorio': True, 'validade_dias': 90},
            {'nome': 'Certidão Negativa Municipal', 'categoria': 'societario', 'obrigatorio': True, 'validade_dias': 90},
            
            # Seguros
            {'nome': 'Seguro de Responsabilidade Civil', 'categoria': 'seguro', 'obrigatorio': True, 'validade_dias': 30},
            {'nome': 'Seguro de Carga', 'categoria': 'seguro', 'obrigatorio': False, 'validade_dias': 30},
            {'nome': 'RCTRC - Responsabilidade Civil do Transportador', 'categoria': 'seguro', 'obrigatorio': True, 'validade_dias': 30},
            
            # Certificações Técnicas
            {'nome': 'Certificado de Conformidade dos Equipamentos', 'categoria': 'certificacao', 'obrigatorio': True, 'validade_dias': 180},
            {'nome': 'Laudo de Vistoria dos Tanques', 'categoria': 'certificacao', 'obrigatorio': True, 'validade_dias': 180},
            {'nome': 'Certificado de Calibração dos Instrumentos', 'categoria': 'certificacao', 'obrigatorio': True, 'validade_dias': 365},
        ]
        
        created_count = 0
        for tipo_data in tipos_padrao:
            # Verificar se já existe
            if not TipoDocumento.query.filter_by(nome=tipo_data['nome']).first():
                tipo_documento = TipoDocumento(**tipo_data)
                db.session.add(tipo_documento)
                created_count += 1
        
        db.session.commit()
        
        return jsonify({
            'message': f'{created_count} tipos de documento criados com sucesso'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erro interno: {str(e)}'}), 500

