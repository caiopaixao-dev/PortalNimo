from flask import Blueprint, request, jsonify
from src.models.database import execute_query
from datetime import datetime

transportadoras_bp = Blueprint('transportadoras', __name__)

@transportadoras_bp.route('/', methods=['GET'])
def listar_transportadoras():
    """Lista todas as transportadoras"""
    try:
        query = """
        SELECT 
            t.*,
            COUNT(d.id_documento) as total_documentos,
            SUM(CASE WHEN d.status_documento = 'APROVADO' THEN 1 ELSE 0 END) as docs_aprovados,
            SUM(CASE WHEN d.status_documento = 'PENDENTE' THEN 1 ELSE 0 END) as docs_pendentes
        FROM transportadoras t
        LEFT JOIN documentos d ON t.id_transportadora = d.id_transportadora
        WHERE t.status_ativo = TRUE
        GROUP BY t.id_transportadora
        ORDER BY t.razao_social
        """
        
        transportadoras = execute_query(query, fetch='all')
        
        # Converte datas para string
        for transp in transportadoras:
            if isinstance(transp['data_cadastro'], datetime):
                transp['data_cadastro'] = transp['data_cadastro'].isoformat()
        
        return jsonify({'transportadoras': transportadoras}), 200
    
    except Exception as e:
        print(f"Erro ao listar transportadoras: {e}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

@transportadoras_bp.route('/<int:id_transportadora>', methods=['GET'])
def obter_transportadora(id_transportadora):
    """Obtém dados de uma transportadora específica"""
    try:
        query = """
        SELECT * FROM transportadoras 
        WHERE id_transportadora = %s AND status_ativo = TRUE
        """
        
        transportadora = execute_query(query, (id_transportadora,), fetch='one')
        
        if not transportadora:
            return jsonify({'error': 'Transportadora não encontrada'}), 404
        
        # Converte data para string
        if isinstance(transportadora['data_cadastro'], datetime):
            transportadora['data_cadastro'] = transportadora['data_cadastro'].isoformat()
        
        return jsonify({'transportadora': transportadora}), 200
    
    except Exception as e:
        print(f"Erro ao obter transportadora: {e}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

@transportadoras_bp.route('/', methods=['POST'])
def criar_transportadora():
    """Cria uma nova transportadora"""
    try:
        data = request.get_json()
        
        # Campos obrigatórios
        campos_obrigatorios = ['cnpj', 'razao_social', 'email_corporativo', 'telefone_principal']
        for campo in campos_obrigatorios:
            if not data.get(campo):
                return jsonify({'error': f'Campo {campo} é obrigatório'}), 400
        
        # Verifica se CNPJ já existe
        query = "SELECT id_transportadora FROM transportadoras WHERE cnpj = %s"
        existe = execute_query(query, (data['cnpj'],), fetch='one')
        
        if existe:
            return jsonify({'error': 'CNPJ já cadastrado'}), 400
        
        # Insere nova transportadora
        query = """
        INSERT INTO transportadoras (
            cnpj, razao_social, nome_fantasia, inscricao_estadual,
            email_corporativo, telefone_principal, telefone_secundario,
            endereco_completo, cidade, estado, cep,
            responsavel_nome, responsavel_cpf, responsavel_cargo,
            responsavel_email, responsavel_telefone,
            observacoes
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        params = (
            data['cnpj'], data['razao_social'], data.get('nome_fantasia'),
            data.get('inscricao_estadual'), data['email_corporativo'],
            data['telefone_principal'], data.get('telefone_secundario'),
            data.get('endereco_completo'), data.get('cidade'),
            data.get('estado'), data.get('cep'),
            data.get('responsavel_nome'), data.get('responsavel_cpf'),
            data.get('responsavel_cargo'), data.get('responsavel_email'),
            data.get('responsavel_telefone'), data.get('observacoes')
        )
        
        execute_query(query, params)
        
        return jsonify({'message': 'Transportadora criada com sucesso'}), 201
    
    except Exception as e:
        print(f"Erro ao criar transportadora: {e}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

@transportadoras_bp.route('/<int:id_transportadora>', methods=['PUT'])
def atualizar_transportadora(id_transportadora):
    """Atualiza dados de uma transportadora"""
    try:
        data = request.get_json()
        
        # Verifica se transportadora existe
        query = "SELECT id_transportadora FROM transportadoras WHERE id_transportadora = %s"
        existe = execute_query(query, (id_transportadora,), fetch='one')
        
        if not existe:
            return jsonify({'error': 'Transportadora não encontrada'}), 404
        
        # Monta query de atualização dinamicamente
        campos_atualizacao = []
        valores = []
        
        campos_permitidos = [
            'razao_social', 'nome_fantasia', 'inscricao_estadual',
            'email_corporativo', 'telefone_principal', 'telefone_secundario',
            'endereco_completo', 'cidade', 'estado', 'cep',
            'responsavel_nome', 'responsavel_cpf', 'responsavel_cargo',
            'responsavel_email', 'responsavel_telefone', 'observacoes'
        ]
        
        for campo in campos_permitidos:
            if campo in data:
                campos_atualizacao.append(f"{campo} = %s")
                valores.append(data[campo])
        
        if not campos_atualizacao:
            return jsonify({'error': 'Nenhum campo para atualizar'}), 400
        
        valores.append(id_transportadora)
        
        query = f"""
        UPDATE transportadoras 
        SET {', '.join(campos_atualizacao)}, data_atualizacao = NOW()
        WHERE id_transportadora = %s
        """
        
        execute_query(query, valores)
        
        return jsonify({'message': 'Transportadora atualizada com sucesso'}), 200
    
    except Exception as e:
        print(f"Erro ao atualizar transportadora: {e}")
        return jsonify({'error': 'Erro interno do servidor'}), 500



@transportadoras_bp.route('/cadastrar', methods=['POST'])
def cadastrar_transportadora():
    """Cadastra nova transportadora com representante legal"""
    try:
        data = request.get_json()
        
        # Validações obrigatórias
        campos_obrigatorios = [
            'razaoSocial', 'cnpj', 'endereco', 'cidade', 'estado', 'cep', 'telefone',
            'nomeRepresentante', 'cpfRepresentante', 'emailRepresentante', 
            'cargoRepresentante', 'poderesAssinatura'
        ]
        
        for campo in campos_obrigatorios:
            if not data.get(campo):
                return jsonify({'error': f'Campo obrigatório: {campo}'}), 400
        
        # Validação específica de poderes de assinatura
        if not data.get('poderesAssinatura'):
            return jsonify({'error': 'Representante legal deve ter poderes para assinatura'}), 400
        
        # Verificar se CNPJ já existe
        query_cnpj = "SELECT id_transportadora FROM transportadoras WHERE cnpj = %s"
        cnpj_existente = execute_query(query_cnpj, (data['cnpj'],), fetch='one')
        
        if cnpj_existente:
            return jsonify({'error': 'CNPJ já cadastrado no sistema'}), 409
        
        # Verificar se email do representante já existe
        query_email = "SELECT id_transportadora FROM transportadoras WHERE email_representante = %s"
        email_existente = execute_query(query_email, (data['emailRepresentante'],), fetch='one')
        
        if email_existente:
            return jsonify({'error': 'Email do representante já cadastrado'}), 409
        
        # Inserir nova transportadora
        query_insert = """
        INSERT INTO transportadoras (
            razao_social, cnpj, inscricao_estadual, endereco, cidade, estado, cep, telefone,
            nome_representante, cpf_representante, email_representante, telefone_representante,
            cargo_representante, poderes_assinatura, status_cadastro, data_cadastro, status_ativo
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'PENDENTE', NOW(), TRUE
        )
        """
        
        valores = (
            data['razaoSocial'],
            data['cnpj'],
            data.get('inscricaoEstadual', ''),
            data['endereco'],
            data['cidade'],
            data['estado'],
            data['cep'],
            data['telefone'],
            data['nomeRepresentante'],
            data['cpfRepresentante'],
            data['emailRepresentante'],
            data.get('telefoneRepresentante', ''),
            data['cargoRepresentante'],
            data['poderesAssinatura']
        )
        
        id_transportadora = execute_query(query_insert, valores, fetch='lastrowid')
        
        # Log da ação
        print(f"Nova transportadora cadastrada: ID {id_transportadora}, CNPJ: {data['cnpj']}")
        
        # Aqui seria enviado email para o representante legal
        # enviar_email_boas_vindas(data['emailRepresentante'], data['nomeRepresentante'])
        
        return jsonify({
            'message': 'Transportadora cadastrada com sucesso',
            'id_transportadora': id_transportadora,
            'status': 'PENDENTE',
            'proximos_passos': [
                'Análise da documentação pela equipe NIMOENERGIA',
                'Envio de credenciais de acesso por email',
                'Solicitação de documentos complementares'
            ]
        }), 201
        
    except Exception as e:
        print(f"Erro ao cadastrar transportadora: {e}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

@transportadoras_bp.route('/<int:id_transportadora>/aprovar', methods=['PUT'])
def aprovar_transportadora(id_transportadora):
    """Aprova cadastro de transportadora"""
    try:
        # Verificar se transportadora existe
        query_check = "SELECT * FROM transportadoras WHERE id_transportadora = %s"
        transportadora = execute_query(query_check, (id_transportadora,), fetch='one')
        
        if not transportadora:
            return jsonify({'error': 'Transportadora não encontrada'}), 404
        
        # Atualizar status para aprovado
        query_update = """
        UPDATE transportadoras 
        SET status_cadastro = 'APROVADO', data_aprovacao = NOW()
        WHERE id_transportadora = %s
        """
        
        execute_query(query_update, (id_transportadora,))
        
        # Aqui seria enviado email com credenciais de acesso
        # gerar_credenciais_acesso(transportadora['email_representante'])
        
        return jsonify({
            'message': 'Transportadora aprovada com sucesso',
            'status': 'APROVADO'
        }), 200
        
    except Exception as e:
        print(f"Erro ao aprovar transportadora: {e}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

@transportadoras_bp.route('/<int:id_transportadora>/rejeitar', methods=['PUT'])
def rejeitar_transportadora(id_transportadora):
    """Rejeita cadastro de transportadora"""
    try:
        data = request.get_json()
        motivo = data.get('motivo', 'Não especificado')
        
        # Verificar se transportadora existe
        query_check = "SELECT * FROM transportadoras WHERE id_transportadora = %s"
        transportadora = execute_query(query_check, (id_transportadora,), fetch='one')
        
        if not transportadora:
            return jsonify({'error': 'Transportadora não encontrada'}), 404
        
        # Atualizar status para rejeitado
        query_update = """
        UPDATE transportadoras 
        SET status_cadastro = 'REJEITADO', motivo_rejeicao = %s, data_rejeicao = NOW()
        WHERE id_transportadora = %s
        """
        
        execute_query(query_update, (motivo, id_transportadora))
        
        # Aqui seria enviado email informando a rejeição
        # enviar_email_rejeicao(transportadora['email_representante'], motivo)
        
        return jsonify({
            'message': 'Transportadora rejeitada',
            'status': 'REJEITADO',
            'motivo': motivo
        }), 200
        
    except Exception as e:
        print(f"Erro ao rejeitar transportadora: {e}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

