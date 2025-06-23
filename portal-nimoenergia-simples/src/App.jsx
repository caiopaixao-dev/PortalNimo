import { useState } from 'react'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('login')
  const [userType, setUserType] = useState('')
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({})
  const [activeTab, setActiveTab] = useState('dashboard')

  // Dados mockados para demonstração
  const mockData = {
    stats: {
      totalTransportadoras: 45,
      documentosAprovados: 234,
      documentosPendentes: 12,
      documentosVencidos: 3
    },
    transportadoras: [
      { id: 1, nome: 'Transportes Silva Ltda', status: 'Ativa', documentos: 8, vencimentos: 1 },
      { id: 2, nome: 'Logística Santos S.A.', status: 'Pendente', documentos: 6, vencimentos: 0 },
      { id: 3, nome: 'Frota Rápida Transportes', status: 'Ativa', documentos: 9, vencimentos: 2 }
    ],
    documentos: [
      { id: 1, transportadora: 'Transportes Silva Ltda', tipo: 'SEGURO RCF-DC', status: 'Aprovado', vencimento: '2024-08-15', garantia: 'R$ 500.000' },
      { id: 2, transportadora: 'Logística Santos S.A.', tipo: 'ANTT - PJ', status: 'Pendente', vencimento: '2024-12-30', garantia: '-' },
      { id: 3, transportadora: 'Frota Rápida Transportes', tipo: 'SEGURO AMBIENTAL', status: 'Vencido', vencimento: '2024-06-10', garantia: 'R$ 200.000' },
      { id: 4, transportadora: 'Transportes Silva Ltda', tipo: 'PGR', status: 'Aprovado', vencimento: '2024-09-20', garantia: '-' }
    ]
  }

  // Lista específica de documentos fornecida pelo usuário
  const documentosEspecificos = [
    {
      categoria: 'Documentos da Empresa',
      icon: '🏢',
      documentos: [
        {
          nome: 'DOC SOCIETÁRIO',
          descricao: 'Estatuto / ATA / Contrato Social',
          obrigatorio: true,
          temVencimento: false,
          temGarantia: false
        },
        {
          nome: 'COMPROVANTE DE ENDEREÇO',
          descricao: 'Vencimento: 6 meses após a emissão (contrato social serve de último caso)',
          obrigatorio: true,
          temVencimento: true,
          temGarantia: false,
          vencimentoInfo: '6 meses após emissão'
        },
        {
          nome: 'DOCS SÓCIOS',
          descricao: 'RG/CPF ou CNH dos sócios',
          obrigatorio: true,
          temVencimento: false,
          temGarantia: false
        },
        {
          nome: 'ALVARÁ DE FUNCIONAMENTO',
          descricao: 'Alvará municipal de funcionamento',
          obrigatorio: true,
          temVencimento: true,
          temGarantia: false
        },
        {
          nome: 'ANTT - PJ',
          descricao: 'Registro na Agência Nacional de Transportes Terrestres',
          obrigatorio: true,
          temVencimento: false,
          temGarantia: false
        }
      ]
    },
    {
      categoria: 'Seguros Obrigatórios',
      icon: '🛡️',
      documentos: [
        {
          nome: 'SEGURO RCF-DC',
          descricao: 'Responsabilidade Civil Facultativa - Danos Causados',
          obrigatorio: true,
          temVencimento: true,
          temGarantia: true,
          vencimentoInfo: 'Vencimento da apólice'
        },
        {
          nome: 'SEGURO RCTR-C',
          descricao: 'Responsabilidade Civil do Transportador Rodoviário - Carga',
          obrigatorio: true,
          temVencimento: true,
          temGarantia: true,
          vencimentoInfo: 'Vencimento da apólice'
        },
        {
          nome: 'SEGURO AMBIENTAL',
          descricao: 'Seguro de responsabilidade ambiental',
          obrigatorio: true,
          temVencimento: true,
          temGarantia: true,
          vencimentoInfo: 'Vencimento da apólice'
        }
      ]
    },
    {
      categoria: 'Documentos Ambientais',
      icon: '🌱',
      documentos: [
        {
          nome: 'PGR',
          descricao: 'Programa de Gerenciamento de Riscos',
          obrigatorio: true,
          temVencimento: true,
          temGarantia: false,
          vencimentoInfo: 'Vencimento do PGR'
        },
        {
          nome: 'PAE',
          descricao: 'Plano de Emergência',
          obrigatorio: true,
          temVencimento: true,
          temGarantia: false,
          vencimentoInfo: 'Vencimento do PAE'
        },
        {
          nome: 'AATIPP (IBAMA)',
          descricao: 'Autorização Ambiental para Transporte Interestadual de Produtos Perigosos',
          obrigatorio: true,
          temVencimento: true,
          temGarantia: false,
          vencimentoInfo: 'Vencimento AATIPP'
        },
        {
          nome: 'Certificado de Regularidade - CR/IBAMA',
          descricao: 'Certificado de Regularidade do IBAMA',
          obrigatorio: true,
          temVencimento: true,
          temGarantia: false,
          vencimentoInfo: 'Vencimento do CR'
        },
        {
          nome: 'LICENÇA OU DISPENSA AMBIENTAL ESTADUAL',
          descricao: 'Licença ambiental estadual para operação',
          obrigatorio: true,
          temVencimento: true,
          temGarantia: false,
          vencimentoInfo: 'Vencimento da licença'
        }
      ]
    }
  ]

  const handleLogin = (type) => {
    setUserType(type)
    setCurrentView('dashboard')
  }

  const handleLogout = () => {
    setCurrentView('login')
    setUserType('')
    setActiveTab('dashboard')
  }

  const handleCadastroStep = (step) => {
    setCurrentStep(step)
  }

  const handleCadastroSubmit = () => {
    alert('Cadastro enviado com sucesso! Você receberá um email com o status da aprovação em até 2 dias úteis.')
    setCurrentView('login')
    setCurrentStep(1)
  }

  if (currentView === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="text-4xl">📊</div>
              <div className="text-4xl">📈</div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              NIMO <span className="text-orange-400">ENERGIA</span>
            </h1>
            <p className="text-blue-200 text-lg">Portal de Gestão de Documentos</p>
            <p className="text-blue-300 text-sm mt-1">Sistema para Cadastro e Controle de Transportadoras</p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Acesso ao Portal</h2>
            <p className="text-gray-600 text-center mb-6">Entre com suas credenciais para acessar o sistema</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input 
                  type="email" 
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  defaultValue="admin@nimoenergia.com.br"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  defaultValue="NimoAdmin2024"
                />
              </div>
            </div>

            <button 
              onClick={() => handleLogin('admin')}
              className="w-full bg-slate-700 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors mb-4"
            >
              Entrar como Admin
            </button>

            <div className="text-center text-gray-500 mb-4">OU</div>

            <button 
              onClick={() => handleLogin('admin')}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors mb-4"
            >
              Acesso de Demonstração (Admin)
            </button>

            <div className="text-center text-gray-500 mb-4">OU</div>

            <button 
              onClick={() => handleLogin('transportadora')}
              className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors mb-6"
            >
              🚛 Acesso Transportadora (Demo)
            </button>

            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
              <p className="font-medium mb-2">Credenciais de teste:</p>
              <p><strong>Admin:</strong> admin@nimoenergia.com.br / NimoAdmin2024</p>
              <p><strong>Transportadora:</strong> Use o botão "Acesso Transportadora"</p>
            </div>
          </div>

          {/* Cadastro Link */}
          <div className="text-center mt-6">
            <button 
              onClick={() => setCurrentView('cadastro')}
              className="text-orange-400 hover:text-orange-300 font-medium underline"
            >
              🚛 Primeira vez? Cadastre sua transportadora
            </button>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-blue-200">
            <h3 className="font-semibold mb-2">Sistema de Gestão de Documentos para Transportadoras</h3>
            <p className="text-sm">Automatização de processos • Controle de vencimentos • Dashboard em tempo real</p>
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <span>✓ Upload com drag-and-drop</span>
              <span>✓ Notificações automáticas</span>
              <span>✓ Controle de acesso</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (currentView === 'cadastro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              NIMO <span className="text-orange-400">ENERGIA</span>
            </h1>
            <p className="text-blue-200 text-lg">Cadastro de Transportadora</p>
            <p className="text-blue-300 text-sm">Processo completo de credenciamento</p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep >= 1 ? 'bg-orange-500 text-white' : 'bg-gray-300 text-gray-600'}`}>1</div>
              <div className={`w-16 h-1 ${currentStep > 1 ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep >= 2 ? 'bg-orange-500 text-white' : 'bg-gray-300 text-gray-600'}`}>2</div>
              <div className={`w-16 h-1 ${currentStep > 2 ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep >= 3 ? 'bg-orange-500 text-white' : 'bg-gray-300 text-gray-600'}`}>3</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {currentStep === 1 && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Dados da Empresa</h2>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Dados da Empresa</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Razão Social *</label>
                      <input type="text" placeholder="Nome oficial da empresa" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nome Fantasia</label>
                      <input type="text" placeholder="Nome comercial" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CNPJ *</label>
                      <input type="text" placeholder="00.000.000/0000-00" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Inscrição Estadual *</label>
                      <input type="text" placeholder="000.000.000.000" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Corporativo *</label>
                      <input type="email" placeholder="contato@empresa.com.br" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Telefone *</label>
                      <input type="tel" placeholder="(11) 99999-9999" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Endereço Completo *</label>
                      <input type="text" placeholder="Rua, número, bairro" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cidade *</label>
                      <input type="text" placeholder="Nome da cidade" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Estado *</label>
                      <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option>Selecione o estado</option>
                        <option>São Paulo</option>
                        <option>Rio de Janeiro</option>
                        <option>Minas Gerais</option>
                        <option>Rio Grande do Sul</option>
                        <option>Paraná</option>
                        <option>Santa Catarina</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CEP *</label>
                      <input type="text" placeholder="00000-000" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mt-8">Dados do Responsável</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Responsável Legal *</label>
                      <input type="text" placeholder="Nome completo do responsável" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CPF do Responsável *</label>
                      <input type="text" placeholder="000.000.000-00" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cargo do Responsável *</label>
                      <input type="text" placeholder="Ex: Diretor, Sócio, Gerente" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mt-8">Acesso ao Sistema</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Senha de Acesso *</label>
                      <input type="password" placeholder="Mínimo 8 caracteres" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Senha *</label>
                      <input type="password" placeholder="Repita a senha" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="text-blue-500 mr-3">ℹ️</div>
                      <div>
                        <h4 className="font-medium text-blue-800">Informações Importantes</h4>
                        <p className="text-blue-700 text-sm mt-1">Todos os dados serão verificados pela equipe NIMOENERGIA. Certifique-se de que as informações estão corretas para agilizar o processo de aprovação.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button 
                    onClick={() => setCurrentView('login')}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Voltar ao Login
                  </button>
                  <button 
                    onClick={() => handleCadastroStep(2)}
                    className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Próxima Etapa
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload de Documentos</h2>
                  <p className="text-gray-600">Envie os documentos obrigatórios da sua transportadora</p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <p className="text-sm text-blue-800">
                      <strong>📋 Importante:</strong> Para documentos com vencimento, informe a data exata. 
                      Para seguros, informe também o valor da garantia pago.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {documentosEspecificos.map((categoria, catIndex) => (
                    <div key={catIndex} className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-2xl">{categoria.icon}</span>
                        {categoria.categoria}
                        <span className="text-sm text-gray-500">({categoria.documentos.length} documentos)</span>
                      </h3>
                      
                      <div className="space-y-4">
                        {categoria.documentos.map((doc, docIndex) => (
                          <div key={docIndex} className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-400">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                                  {doc.nome}
                                  {doc.obrigatorio && <span className="text-red-500 text-sm font-bold">*</span>}
                                  {doc.temVencimento && <span className="text-orange-500 text-xs">📅 VENCIMENTO</span>}
                                  {doc.temGarantia && <span className="text-green-600 text-xs">💰 GARANTIA</span>}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">{doc.descricao}</p>
                                {doc.vencimentoInfo && (
                                  <p className="text-xs text-blue-600 mt-1 font-medium">📅 {doc.vencimentoInfo}</p>
                                )}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className={doc.temVencimento || doc.temGarantia ? 'md:col-span-1' : 'md:col-span-3'}>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Arquivo {doc.obrigatorio && <span className="text-red-500">*</span>}
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer bg-white">
                                  <div className="text-gray-500 text-sm">
                                    📎 Clique ou arraste o arquivo aqui
                                  </div>
                                  <div className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, JPG, PNG (máx. 10MB)</div>
                                </div>
                              </div>
                              
                              {doc.temVencimento && (
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Data de Vencimento <span className="text-red-500">*</span>
                                  </label>
                                  <input 
                                    type="date" 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                    required
                                  />
                                  <p className="text-xs text-gray-500 mt-1">Informe a data exata do vencimento</p>
                                </div>
                              )}
                              
                              {doc.temGarantia && (
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Valor da Garantia <span className="text-red-500">*</span>
                                  </label>
                                  <input 
                                    type="text" 
                                    placeholder="R$ 500.000,00"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                    required
                                  />
                                  <p className="text-xs text-gray-500 mt-1">Valor pago pelo seguro</p>
                                </div>
                              )}
                            </div>
                            
                            {/* Status visual do documento */}
                            <div className="mt-3 flex items-center gap-2">
                              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                              <span className="text-xs text-gray-500">Aguardando upload</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                  <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Observações Importantes:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Todos os documentos marcados com (*) são obrigatórios</li>
                    <li>• Para seguros, informe sempre a data de vencimento da apólice e o valor da garantia</li>
                    <li>• Documentos ambientais devem estar dentro da validade</li>
                    <li>• O sistema criará alertas automáticos 30 dias antes do vencimento</li>
                  </ul>
                </div>

                <div className="flex justify-between mt-8">
                  <button 
                    onClick={() => handleCadastroStep(1)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    ← Voltar
                  </button>
                  <button 
                    onClick={() => handleCadastroStep(3)}
                    className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Continuar →
                  </button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Revisão e Envio</h2>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumo do Cadastro</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Razão Social:</span>
                        <p className="text-gray-800">Não informado</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">CNPJ:</span>
                        <p className="text-gray-800">Não informado</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Email:</span>
                        <p className="text-gray-800">Não informado</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Responsável:</span>
                        <p className="text-gray-800">Não informado</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Checklist de Documentos</h3>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <span className="text-green-500 mr-2">✅</span>
                        <span>Documentos da empresa (5/5 enviados)</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="text-green-500 mr-2">✅</span>
                        <span>Seguros obrigatórios (3/3 enviados)</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="text-green-500 mr-2">✅</span>
                        <span>Documentos ambientais (5/5 enviados)</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4">Processo de Aprovação</h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1">1</div>
                        <div>
                          <h4 className="font-medium text-blue-800">Análise Documental</h4>
                          <p className="text-blue-700 text-sm">Verificação de todos os documentos enviados (1-2 dias úteis)</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1">2</div>
                        <div>
                          <h4 className="font-medium text-blue-800">Validação Técnica</h4>
                          <p className="text-blue-700 text-sm">Conferência das certificações e habilitações (1 dia útil)</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1">3</div>
                        <div>
                          <h4 className="font-medium text-blue-800">Aprovação Final</h4>
                          <p className="text-blue-700 text-sm">Liberação do acesso e envio das credenciais por email</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <label className="flex items-start">
                      <input type="checkbox" className="mt-1 mr-3" />
                      <span className="text-sm text-gray-700">
                        Declaro que todas as informações fornecidas são verdadeiras e estou ciente de que documentos falsos ou adulterados resultarão no cancelamento imediato do cadastro. Concordo com os{' '}
                        <a href="#" className="text-blue-600 underline">termos de uso</a> e{' '}
                        <a href="#" className="text-blue-600 underline">política de privacidade</a> da NIMOENERGIA.
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button 
                    onClick={() => handleCadastroStep(2)}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Etapa Anterior
                  </button>
                  <button 
                    onClick={handleCadastroSubmit}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Enviar Cadastro
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Dashboard views
  if (userType === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">
                  NIMO <span className="text-orange-500">ENERGIA</span>
                </h1>
                <span className="text-gray-500">|</span>
                <span className="text-gray-600">Portal Administrativo</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <button className="p-2 text-gray-600 hover:text-gray-800">
                    <span className="text-xl">🔔</span>
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Admin NIMOENERGIA</span>
                  <button 
                    onClick={handleLogout}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Sair
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside className="w-64 bg-white shadow-sm h-screen">
            <nav className="p-4">
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => setActiveTab('dashboard')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    📊 Dashboard
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab('documentos')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'documentos' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    📄 Documentos
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab('transportadoras')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'transportadoras' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    🚛 Transportadoras
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab('usuarios')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'usuarios' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    👥 Usuários
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab('configuracoes')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'configuracoes' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    ⚙️ Configurações
                  </button>
                </li>
              </ul>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-6">
            {activeTab === 'dashboard' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Administrativo</h2>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Transportadoras</p>
                        <p className="text-2xl font-bold text-gray-800">{mockData.stats.totalTransportadoras}</p>
                      </div>
                      <div className="text-3xl">🚛</div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Docs Aprovados</p>
                        <p className="text-2xl font-bold text-green-600">{mockData.stats.documentosAprovados}</p>
                      </div>
                      <div className="text-3xl">✅</div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Docs Pendentes</p>
                        <p className="text-2xl font-bold text-yellow-600">{mockData.stats.documentosPendentes}</p>
                      </div>
                      <div className="text-3xl">⏳</div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Docs Vencidos</p>
                        <p className="text-2xl font-bold text-red-600">{mockData.stats.documentosVencidos}</p>
                      </div>
                      <div className="text-3xl">❌</div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">Atividade Recente</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Documento SEGURO RCF-DC aprovado para Transportes Silva Ltda</span>
                        <span className="text-xs text-gray-400">2 horas atrás</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Nova transportadora cadastrada: Logística Santos S.A.</span>
                        <span className="text-xs text-gray-400">4 horas atrás</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Documento SEGURO AMBIENTAL vencido - Frota Rápida Transportes</span>
                        <span className="text-xs text-gray-400">1 dia atrás</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'documentos' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Gestão de Documentos</h2>
                  <div className="flex gap-2">
                    <select className="px-4 py-2 border border-gray-300 rounded-lg">
                      <option>Todos os status</option>
                      <option>Aprovados</option>
                      <option>Pendentes</option>
                      <option>Vencidos</option>
                    </select>
                    <input type="text" placeholder="Buscar..." className="px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transportadora</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo de Documento</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vencimento</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Garantia</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {mockData.documentos.map((doc) => (
                        <tr key={doc.id}>
                          <td className="px-6 py-4 text-sm text-gray-900">{doc.transportadora}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{doc.tipo}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              doc.status === 'Aprovado' ? 'bg-green-100 text-green-800' :
                              doc.status === 'Pendente' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {doc.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{doc.vencimento}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{doc.garantia}</td>
                          <td className="px-6 py-4 text-sm">
                            <button className="text-blue-600 hover:text-blue-800 mr-2">Ver</button>
                            <button className="text-green-600 hover:text-green-800 mr-2">Aprovar</button>
                            <button className="text-red-600 hover:text-red-800">Rejeitar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'transportadoras' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Transportadoras Cadastradas</h2>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    + Nova Transportadora
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockData.transportadoras.map((transportadora) => (
                    <div key={transportadora.id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-semibold text-gray-800">{transportadora.nome}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          transportadora.status === 'Ativa' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {transportadora.status}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>📄 {transportadora.documentos} documentos</p>
                        <p>⚠️ {transportadora.vencimentos} vencimentos próximos</p>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200">
                          Ver Detalhes
                        </button>
                        <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200">
                          Editar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'usuarios' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Gestão de Usuários</h2>
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-600">Funcionalidade de gestão de usuários em desenvolvimento...</p>
                </div>
              </div>
            )}

            {activeTab === 'configuracoes' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Configurações do Sistema</h2>
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-600">Configurações do sistema em desenvolvimento...</p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    )
  }

  // Dashboard Transportadora
  if (userType === 'transportadora') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">
                  NIMO <span className="text-orange-500">ENERGIA</span>
                </h1>
                <span className="text-gray-500">|</span>
                <span className="text-gray-600">Portal da Transportadora</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <button className="p-2 text-gray-600 hover:text-gray-800">
                    <span className="text-xl">🔔</span>
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">2</span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Transportes Silva Ltda</span>
                  <button 
                    onClick={handleLogout}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Sair
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside className="w-64 bg-white shadow-sm h-screen">
            <nav className="p-4">
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => setActiveTab('dashboard')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    📊 Meus Documentos
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab('enviar')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'enviar' ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    📤 Enviar Documentos
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab('historico')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'historico' ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    📋 Histórico
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab('perfil')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'perfil' ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    👤 Meu Perfil
                  </button>
                </li>
              </ul>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-6">
            {activeTab === 'dashboard' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Meus Documentos</h2>
                
                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Documentos Aprovados</p>
                        <p className="text-2xl font-bold text-green-600">8</p>
                      </div>
                      <div className="text-3xl">✅</div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Pendentes</p>
                        <p className="text-2xl font-bold text-yellow-600">2</p>
                      </div>
                      <div className="text-3xl">⏳</div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Vencendo em 30 dias</p>
                        <p className="text-2xl font-bold text-orange-600">1</p>
                      </div>
                      <div className="text-3xl">⚠️</div>
                    </div>
                  </div>
                </div>

                {/* Documents List */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">Status dos Documentos</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {mockData.documentos.filter(doc => doc.transportadora === 'Transportes Silva Ltda').map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-800">{doc.tipo}</h4>
                            <p className="text-sm text-gray-600">Vencimento: {doc.vencimento}</p>
                            {doc.garantia !== '-' && <p className="text-sm text-gray-600">Garantia: {doc.garantia}</p>}
                          </div>
                          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                            doc.status === 'Aprovado' ? 'bg-green-100 text-green-800' :
                            doc.status === 'Pendente' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {doc.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'enviar' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Enviar Documentos</h2>
                
                <div className="space-y-8">
                  {documentosEspecificos.map((categoria, catIndex) => (
                    <div key={catIndex} className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-2xl">{categoria.icon}</span>
                        {categoria.categoria}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {categoria.documentos.map((doc, docIndex) => (
                          <div key={docIndex} className="border border-gray-100 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-medium text-gray-800">{doc.nome}</h4>
                              {doc.obrigatorio && (
                                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Obrigatório</span>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-4">{doc.descricao}</p>
                            
                            {/* Upload Area */}
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors cursor-pointer">
                              <div className="text-gray-400 mb-2">⬆️</div>
                              <p className="text-sm text-gray-600">Clique para enviar ou arraste o arquivo aqui</p>
                              <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (máx. 5MB)</p>
                            </div>
                            
                            {/* Campos específicos */}
                            {doc.temVencimento && (
                              <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Data de Vencimento *
                                </label>
                                <input 
                                  type="date" 
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                />
                                {doc.vencimentoInfo && (
                                  <p className="text-xs text-gray-500 mt-1">{doc.vencimentoInfo}</p>
                                )}
                              </div>
                            )}
                            
                            {doc.temGarantia && (
                              <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Valor da Garantia *
                                </label>
                                <input 
                                  type="text" 
                                  placeholder="R$ 0,00"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">Valor pago pelo seguro</p>
                              </div>
                            )}
                            
                            <button className="w-full mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                              Enviar Documento
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'historico' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Histórico de Documentos</h2>
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-600">Histórico de envios e aprovações...</p>
                </div>
              </div>
            )}

            {activeTab === 'perfil' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Meu Perfil</h2>
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-600">Informações da empresa e configurações...</p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    )
  }

  return null
}

export default App

