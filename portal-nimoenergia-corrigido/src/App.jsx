import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('login')
  const [userType, setUserType] = useState('')
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({})
  const [activeTab, setActiveTab] = useState('dashboard')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // API Base URL
  const API_BASE = 'http://localhost:5000/api'

  // Função de login real
  const handleRealLogin = async (email, password) => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('token', data.token)
        setUser(data.user)
        setUserType(data.user.tipo.toLowerCase())
        setCurrentView('dashboard')
      } else {
        setError(data.message || 'Erro no login')
      }
    } catch (err) {
      setError('Erro de conexão com o servidor')
    } finally {
      setLoading(false)
    }
  }

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
    ],
    performance: [
      { posicao: 1, nome: 'Transportes Silva Ltda', conformidade: '98%', status: 'Excelente', ultimaAtualizacao: '2 dias atrás' },
      { posicao: 2, nome: 'Logística Santos S.A.', conformidade: '85%', status: 'Bom', ultimaAtualizacao: '1 semana atrás' },
      { posicao: 3, nome: 'Frota Rápida Transportes', conformidade: '76%', status: 'Regular', ultimaAtualizacao: '3 dias atrás' }
    ],
    compliance: [
      { tipo: 'Alta', descricao: 'Documentos vencendo em 30 dias', quantidade: 23, cor: 'text-red-600' },
      { tipo: 'Média', descricao: 'Conformidade abaixo de 80%', quantidade: 8, cor: 'text-yellow-600' },
      { tipo: 'Baixa', descricao: 'Pendências há mais de 5 dias', quantidade: 12, cor: 'text-blue-600' }
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
    localStorage.removeItem('token')
    setUser(null)
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
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={(e) => {
              e.preventDefault()
              const email = e.target.email.value
              const password = e.target.password.value
              handleRealLogin(email, password)
            }}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input 
                    name="email"
                    type="email" 
                    placeholder="seu@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    defaultValue="admin@nimoenergia.com.br"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                  <input 
                    name="password"
                    type="password" 
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    defaultValue="senha123"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-slate-700 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors mb-4 disabled:opacity-50"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
              <p className="font-medium mb-2">Credenciais de teste:</p>
              <p><strong>Admin:</strong> admin@nimoenergia.com.br / senha123</p>
              <p><strong>Transportadora:</strong> silva@silvatransportes.com.br / senha123</p>
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

  if (currentView === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6 border-b">
            <h1 className="text-xl font-bold text-gray-800">
              NIMO <span className="text-orange-500">ENERGIA</span>
            </h1>
            <p className="text-sm text-gray-600">Portal Administrativo</p>
          </div>
          
          <nav className="mt-6">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full text-left px-6 py-3 border-l-4 ${activeTab === 'dashboard' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}
            >
              📊 Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('documentos')}
              className={`w-full text-left px-6 py-3 border-l-4 ${activeTab === 'documentos' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}
            >
              📄 Documentos
            </button>
            <button 
              onClick={() => setActiveTab('transportadoras')}
              className={`w-full text-left px-6 py-3 border-l-4 ${activeTab === 'transportadoras' ? 'border-green-500 bg-green-50 text-green-700' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}
            >
              🚛 Transportadoras
            </button>
            <button 
              onClick={() => setActiveTab('performance')}
              className={`w-full text-left px-6 py-3 border-l-4 ${activeTab === 'performance' ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}
            >
              🏆 Performance
            </button>
            <button 
              onClick={() => setActiveTab('compliance')}
              className={`w-full text-left px-6 py-3 border-l-4 ${activeTab === 'compliance' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}
            >
              ⚠️ Compliance
            </button>
            <button 
              onClick={() => setActiveTab('usuarios')}
              className={`w-full text-left px-6 py-3 border-l-4 ${activeTab === 'usuarios' ? 'border-red-500 bg-red-50 text-red-700' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}
            >
              👥 Usuários
            </button>
            <button 
              onClick={() => setActiveTab('configuracoes')}
              className={`w-full text-left px-6 py-3 border-l-4 ${activeTab === 'configuracoes' ? 'border-green-500 bg-green-50 text-green-700' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}
            >
              ⚙️ Configurações
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">
              {activeTab === 'dashboard' && 'Dashboard Administrativo'}
              {activeTab === 'documentos' && 'Gestão de Documentos'}
              {activeTab === 'transportadoras' && 'Transportadoras Cadastradas'}
              {activeTab === 'performance' && 'Performance de Transportadoras'}
              {activeTab === 'compliance' && 'Sistema de Compliance'}
              {activeTab === 'usuarios' && 'Gestão de Usuários'}
              {activeTab === 'configuracoes' && 'Configurações do Sistema'}
            </h2>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-800">
                🔔
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {user ? `${user.tipo} ${user.nome}` : 'Admin NIMOENERGIA'}
                </span>
                <button 
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Transportadoras</p>
                        <p className="text-3xl font-bold text-gray-800">{mockData.stats.totalTransportadoras}</p>
                      </div>
                      <div className="text-4xl">🚛</div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Docs Aprovados</p>
                        <p className="text-3xl font-bold text-green-600">{mockData.stats.documentosAprovados}</p>
                      </div>
                      <div className="text-4xl">✅</div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Docs Pendentes</p>
                        <p className="text-3xl font-bold text-orange-600">{mockData.stats.documentosPendentes}</p>
                      </div>
                      <div className="text-4xl">⏳</div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Docs Vencidos</p>
                        <p className="text-3xl font-bold text-red-600">{mockData.stats.documentosVencidos}</p>
                      </div>
                      <div className="text-4xl">❌</div>
                    </div>
                  </div>
                </div>

                {/* Atividade Recente */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">Atividade Recente</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-800">Documento SEGURO RCF-DC aprovado para Transportes Silva Ltda</p>
                          <p className="text-xs text-gray-500">2 horas atrás</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-800">Nova transportadora cadastrada: Logística Santos S.A.</p>
                          <p className="text-xs text-gray-500">4 horas atrás</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-800">Documento SEGURO AMBIENTAL vencido - Frota Rápida Transportes</p>
                          <p className="text-xs text-gray-500">1 dia atrás</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">Ranking de Performance</h3>
                    <p className="text-sm text-gray-600">Classificação baseada na conformidade de documentos</p>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {mockData.performance.map((item) => (
                        <div key={item.posicao} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                              {item.posicao}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{item.nome}</p>
                              <p className="text-sm text-gray-600">Última atualização: {item.ultimaAtualizacao}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">{item.conformidade}</p>
                            <p className={`text-sm ${item.status === 'Excelente' ? 'text-green-600' : item.status === 'Bom' ? 'text-yellow-600' : 'text-red-600'}`}>
                              {item.status}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'compliance' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">Alertas de Compliance</h3>
                    <p className="text-sm text-gray-600">Monitoramento de conformidade e vencimentos</p>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {mockData.compliance.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className={`w-3 h-3 rounded-full ${item.tipo === 'Alta' ? 'bg-red-500' : item.tipo === 'Média' ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
                            <div>
                              <p className="font-semibold text-gray-800">Prioridade {item.tipo}</p>
                              <p className="text-sm text-gray-600">{item.descricao}</p>
                            </div>
                          </div>
                          <div className={`text-2xl font-bold ${item.cor}`}>
                            {item.quantidade}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Status por Transportadora */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">Status por Transportadora</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {mockData.transportadoras.map((transportadora) => (
                        <div key={transportadora.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-semibold text-gray-800">{transportadora.nome}</p>
                            <p className="text-sm text-gray-600">{transportadora.documentos} documentos • {transportadora.vencimentos} vencendo</p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm ${transportadora.status === 'Ativa' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {transportadora.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Outras abas mantêm o conteúdo original */}
            {activeTab === 'documentos' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Documentos Recentes</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Transportadora</th>
                        <th className="text-left py-2">Tipo</th>
                        <th className="text-left py-2">Status</th>
                        <th className="text-left py-2">Vencimento</th>
                        <th className="text-left py-2">Garantia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockData.documentos.map((doc) => (
                        <tr key={doc.id} className="border-b">
                          <td className="py-2">{doc.transportadora}</td>
                          <td className="py-2">{doc.tipo}</td>
                          <td className="py-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              doc.status === 'Aprovado' ? 'bg-green-100 text-green-800' :
                              doc.status === 'Pendente' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {doc.status}
                            </span>
                          </td>
                          <td className="py-2">{doc.vencimento}</td>
                          <td className="py-2">{doc.garantia}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'transportadoras' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Transportadoras Cadastradas</h3>
                <div className="space-y-4">
                  {mockData.transportadoras.map((transportadora) => (
                    <div key={transportadora.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-800">{transportadora.nome}</h4>
                          <p className="text-sm text-gray-600">{transportadora.documentos} documentos enviados</p>
                          <p className="text-sm text-gray-600">{transportadora.vencimentos} documentos vencendo</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          transportadora.status === 'Ativa' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {transportadora.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'usuarios' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Gestão de Usuários</h3>
                <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
              </div>
            )}

            {activeTab === 'configuracoes' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Configurações do Sistema</h3>
                <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Resto do código para cadastro permanece igual...
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

                  <div className="flex justify-between pt-6">
                    <button 
                      onClick={() => setCurrentView('login')}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Voltar ao Login
                    </button>
                    <button 
                      onClick={() => handleCadastroStep(2)}
                      className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                    >
                      Próxima Etapa
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload de Documentos</h2>
                  <p className="text-gray-600">Envie todos os documentos obrigatórios para análise</p>
                </div>

                <div className="space-y-8">
                  {documentosEspecificos.map((categoria, catIndex) => (
                    <div key={catIndex} className="border rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">{categoria.icon}</span>
                        <h3 className="text-lg font-semibold text-gray-800">{categoria.categoria}</h3>
                      </div>
                      
                      <div className="space-y-4">
                        {categoria.documentos.map((doc, docIndex) => (
                          <div key={docIndex} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-800 flex items-center gap-2">
                                  {doc.nome}
                                  {doc.obrigatorio && <span className="text-red-500 text-sm">*</span>}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">{doc.descricao}</p>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              {/* Upload Area */}
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-400 transition-colors cursor-pointer">
                                <div className="text-gray-500">
                                  <div className="text-2xl mb-2">📎</div>
                                  <p className="text-sm">Clique para selecionar ou arraste o arquivo aqui</p>
                                  <p className="text-xs text-gray-400 mt-1">PDF, DOC, JPG, PNG (máx. 10MB)</p>
                                </div>
                              </div>
                              
                              {/* Campos adicionais */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {doc.temVencimento && (
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Data de Vencimento *
                                    </label>
                                    <input 
                                      type="date" 
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
                                    />
                                    {doc.vencimentoInfo && (
                                      <p className="text-xs text-gray-500 mt-1">{doc.vencimentoInfo}</p>
                                    )}
                                  </div>
                                )}
                                
                                {doc.temGarantia && (
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Valor da Garantia *
                                    </label>
                                    <input 
                                      type="text" 
                                      placeholder="R$ 0,00"
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-orange-500 text-xl">⚠️</span>
                      <div>
                        <h4 className="font-medium text-orange-800">Importante</h4>
                        <p className="text-sm text-orange-700 mt-1">
                          Todos os documentos marcados com (*) são obrigatórios. Certifique-se de que os arquivos estão legíveis e dentro da validade.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-6">
                    <button 
                      onClick={() => handleCadastroStep(1)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Etapa Anterior
                    </button>
                    <button 
                      onClick={() => handleCadastroStep(3)}
                      className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                    >
                      Próxima Etapa
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Revisão e Confirmação</h2>
                  <p className="text-gray-600">Revise todas as informações antes de enviar</p>
                </div>

                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-green-500 text-2xl">✅</span>
                      <h3 className="text-lg font-semibold text-green-800">Cadastro Quase Concluído!</h3>
                    </div>
                    <p className="text-green-700">
                      Seus dados e documentos foram preenchidos com sucesso. Após o envio, nossa equipe analisará as informações em até 2 dias úteis.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="font-semibold text-blue-800 mb-3">Próximos Passos:</h4>
                    <ul className="space-y-2 text-blue-700 text-sm">
                      <li className="flex items-center gap-2">
                        <span>1.</span>
                        <span>Análise da documentação pela equipe NIMOENERGIA</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span>2.</span>
                        <span>Verificação de conformidade e autenticidade</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span>3.</span>
                        <span>Envio de email com resultado da análise</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span>4.</span>
                        <span>Liberação de acesso ao portal (se aprovado)</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Informações de Contato:</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Email:</strong> cadastro@nimoenergia.com.br</p>
                      <p><strong>Telefone:</strong> (11) 3000-0000</p>
                      <p><strong>Horário:</strong> Segunda a Sexta, 8h às 18h</p>
                    </div>
                  </div>

                  <div className="flex justify-between pt-6">
                    <button 
                      onClick={() => handleCadastroStep(2)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Etapa Anterior
                    </button>
                    <button 
                      onClick={handleCadastroSubmit}
                      className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                    >
                      Enviar Cadastro
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default App

