from werkzeug.security import generate_password_hash
from src.models.database import db, Usuario, Transportadora, TipoDocumento, Documento
from datetime import datetime, date

def seed_database():
    """Popula o banco de dados com dados iniciais"""
    
    # Verificar se já existem dados
    if Usuario.query.first():
        return  # Dados já existem
    
    try:
        # Criar tipos de documento
        tipos_documento = [
            # Documentos da Empresa
            {
                'codigo': 'DOC_SOCIETARIO',
                'nome': 'DOC SOCIETÁRIO (Estatuto/ATA/Contrato Social)',
                'descricao': 'Documento societário da empresa: Estatuto, ATA ou Contrato Social',
                'tem_vencimento': False,
                'tem_garantia': False,
                'categoria': 'EMPRESA'
            },
            {
                'codigo': 'COMPROVANTE_ENDERECO',
                'nome': 'COMPROVANTE DE ENDEREÇO',
                'descricao': 'Comprovante de endereço com vencimento de 6 meses',
                'tem_vencimento': True,
                'tem_garantia': False,
                'categoria': 'EMPRESA'
            },
            {
                'codigo': 'DOCS_SOCIOS',
                'nome': 'DOCS SÓCIOS (RG/CPF ou CNH)',
                'descricao': 'Documentos dos sócios: RG/CPF ou CNH',
                'tem_vencimento': False,
                'tem_garantia': False,
                'categoria': 'EMPRESA'
            },
            {
                'codigo': 'ALVARA_FUNCIONAMENTO',
                'nome': 'ALVARÁ DE FUNCIONAMENTO',
                'descricao': 'Alvará de funcionamento da empresa',
                'tem_vencimento': True,
                'tem_garantia': False,
                'categoria': 'EMPRESA'
            },
            {
                'codigo': 'ANTT_PJ',
                'nome': 'ANTT - PJ',
                'descricao': 'Registro na ANTT para pessoa jurídica',
                'tem_vencimento': False,
                'tem_garantia': False,
                'categoria': 'EMPRESA'
            },
            # Seguros Obrigatórios
            {
                'codigo': 'SEGURO_RCF_DC',
                'nome': 'SEGURO RCF-DC',
                'descricao': 'Seguro de Responsabilidade Civil Facultativo - Danos Causados',
                'tem_vencimento': True,
                'tem_garantia': True,
                'categoria': 'SEGURO'
            },
            {
                'codigo': 'SEGURO_RCTR_C',
                'nome': 'SEGURO RCTR-C',
                'descricao': 'Seguro de Responsabilidade Civil do Transportador Rodoviário - Carga',
                'tem_vencimento': True,
                'tem_garantia': True,
                'categoria': 'SEGURO'
            },
            {
                'codigo': 'SEGURO_AMBIENTAL',
                'nome': 'SEGURO AMBIENTAL',
                'descricao': 'Seguro de Responsabilidade Civil por Danos Ambientais',
                'tem_vencimento': True,
                'tem_garantia': True,
                'categoria': 'SEGURO'
            },
            # Documentos Ambientais
            {
                'codigo': 'PGR',
                'nome': 'PGR (Programa de Gerenciamento de Riscos)',
                'descricao': 'Programa de Gerenciamento de Riscos',
                'tem_vencimento': True,
                'tem_garantia': False,
                'categoria': 'AMBIENTAL'
            },
            {
                'codigo': 'PAE',
                'nome': 'PAE (Plano de Emergência)',
                'descricao': 'Plano de Ação de Emergência',
                'tem_vencimento': True,
                'tem_garantia': False,
                'categoria': 'AMBIENTAL'
            },
            {
                'codigo': 'AATIPP',
                'nome': 'AATIPP (IBAMA)',
                'descricao': 'Autorização Ambiental para Transporte Interestadual de Produtos Perigosos',
                'tem_vencimento': True,
                'tem_garantia': False,
                'categoria': 'AMBIENTAL'
            },
            {
                'codigo': 'CR_IBAMA',
                'nome': 'Certificado de Regularidade - CR/IBAMA',
                'descricao': 'Certificado de Regularidade do IBAMA',
                'tem_vencimento': True,
                'tem_garantia': False,
                'categoria': 'AMBIENTAL'
            },
            {
                'codigo': 'LICENCA_AMBIENTAL',
                'nome': 'LICENÇA AMBIENTAL ESTADUAL',
                'descricao': 'Licença ou Dispensa Ambiental Estadual',
                'tem_vencimento': True,
                'tem_garantia': False,
                'categoria': 'AMBIENTAL'
            }
        ]
        
        for tipo_data in tipos_documento:
            tipo = TipoDocumento(**tipo_data)
            db.session.add(tipo)
        
        # Criar usuário admin
        admin = Usuario(
            email='admin@nimoenergia.com.br',
            senha_hash=generate_password_hash('senha123'),
            nome='Admin NIMOENERGIA',
            tipo_usuario='ADMIN'
        )
        db.session.add(admin)
        
        # Criar transportadoras de exemplo
        transportadoras_data = [
            {
                'cnpj': '12.345.678/0001-90',
                'razao_social': 'Silva Transportes Ltda',
                'nome_fantasia': 'Silva Transportes',
                'endereco': 'Rua das Flores, 123',
                'cidade': 'São Paulo',
                'estado': 'SP',
                'cep': '01234-567',
                'telefone': '(11) 1234-5678',
                'email_contato': 'silva@silvatransportes.com.br',
                'responsavel_nome': 'João Silva',
                'responsavel_cpf': '123.456.789-00',
                'responsavel_cargo': 'Diretor',
                'status_cadastro': 'APROVADO'
            },
            {
                'cnpj': '98.765.432/0001-10',
                'razao_social': 'Logística Santos S.A.',
                'nome_fantasia': 'Santos Log',
                'endereco': 'Av. Portuária, 456',
                'cidade': 'Santos',
                'estado': 'SP',
                'cep': '11013-000',
                'telefone': '(13) 9876-5432',
                'email_contato': 'santos@santoslog.com.br',
                'responsavel_nome': 'Maria Santos',
                'responsavel_cpf': '987.654.321-00',
                'responsavel_cargo': 'Gerente',
                'status_cadastro': 'APROVADO'
            },
            {
                'cnpj': '11.222.333/0001-44',
                'razao_social': 'Frota Rápida Transportes',
                'nome_fantasia': 'Frota Rápida',
                'endereco': 'Rod. BR-101, Km 50',
                'cidade': 'Rio de Janeiro',
                'estado': 'RJ',
                'cep': '20000-000',
                'telefone': '(21) 1111-2222',
                'email_contato': 'carlos@frotarapida.com.br',
                'responsavel_nome': 'Carlos Oliveira',
                'responsavel_cpf': '111.222.333-44',
                'responsavel_cargo': 'Proprietário',
                'status_cadastro': 'PENDENTE'
            }
        ]
        
        transportadoras = []
        for transp_data in transportadoras_data:
            transportadora = Transportadora(**transp_data)
            db.session.add(transportadora)
            transportadoras.append(transportadora)
        
        db.session.flush()  # Para obter os IDs
        
        # Criar usuários das transportadoras
        usuarios_transportadoras = [
            {
                'email': 'silva@silvatransportes.com.br',
                'senha_hash': generate_password_hash('senha123'),
                'nome': 'João Silva',
                'tipo_usuario': 'TRANSPORTADORA',
                'transportadora_id': transportadoras[0].id
            },
            {
                'email': 'santos@santoslog.com.br',
                'senha_hash': generate_password_hash('senha123'),
                'nome': 'Maria Santos',
                'tipo_usuario': 'TRANSPORTADORA',
                'transportadora_id': transportadoras[1].id
            },
            {
                'email': 'carlos@frotarapida.com.br',
                'senha_hash': generate_password_hash('senha123'),
                'nome': 'Carlos Oliveira',
                'tipo_usuario': 'TRANSPORTADORA',
                'transportadora_id': transportadoras[2].id
            }
        ]
        
        for user_data in usuarios_transportadoras:
            usuario = Usuario(**user_data)
            db.session.add(usuario)
        
        # Criar alguns documentos de exemplo
        documentos_exemplo = [
            {
                'transportadora_id': transportadoras[0].id,
                'tipo_documento_id': 6,  # SEGURO RCF-DC
                'nome_arquivo': 'seguro_rcf_dc_silva.pdf',
                'caminho_arquivo': '/uploads/exemplo_seguro_rcf_dc.pdf',
                'tamanho_arquivo': 1024000,
                'tipo_mime': 'application/pdf',
                'data_vencimento': date(2024, 12, 15),
                'valor_garantia': 500000.00,
                'status': 'APROVADO',
                'aprovado_por': admin.id,
                'data_aprovacao': datetime.utcnow()
            },
            {
                'transportadora_id': transportadoras[0].id,
                'tipo_documento_id': 4,  # ALVARÁ DE FUNCIONAMENTO
                'nome_arquivo': 'alvara_funcionamento_silva.pdf',
                'caminho_arquivo': '/uploads/exemplo_alvara.pdf',
                'tamanho_arquivo': 512000,
                'tipo_mime': 'application/pdf',
                'data_vencimento': date(2024, 8, 20),
                'status': 'PENDENTE'
            },
            {
                'transportadora_id': transportadoras[0].id,
                'tipo_documento_id': 8,  # SEGURO AMBIENTAL
                'nome_arquivo': 'seguro_ambiental_silva.pdf',
                'caminho_arquivo': '/uploads/exemplo_seguro_ambiental.pdf',
                'tamanho_arquivo': 768000,
                'tipo_mime': 'application/pdf',
                'data_vencimento': date(2024, 7, 10),
                'valor_garantia': 1000000.00,
                'status': 'VENCIDO'
            }
        ]
        
        for doc_data in documentos_exemplo:
            documento = Documento(**doc_data)
            db.session.add(documento)
        
        db.session.commit()
        print("Banco de dados populado com dados iniciais!")
        
    except Exception as e:
        db.session.rollback()
        print(f"Erro ao popular banco de dados: {str(e)}")
        raise

