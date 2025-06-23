import { useState, useEffect } from 'react'
import './App.css'
import './styles-funcionalidades.css'
import './styles-melhorias.css'

// Configuração da API
const API_BASE_URL = 'https://5000-ig1o78vk2iehekes7zrt9-f8f5cc27.manusvm.computer/api'

// Funções de API
const api = {
  // Autenticação
  login: async (email, senha) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, senha })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro no login')
    }
    
    return response.json()
  },

  // Dashboard
  getDashboardAdmin: async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard/admin`)
    if (!response.ok) throw new Error('Erro ao carregar dashboard admin')
    return response.json()
  },

  getDashboardTransportadora: async (id) => {
    const response = await fetch(`${API_BASE_URL}/dashboard/transportadora/${id}`)
    if (!response.ok) throw new Error('Erro ao carregar dashboard transportadora')
    return response.json()
  },

  // Documentos
  getTiposDocumento: async () => {
    const response = await fetch(`${API_BASE_URL}/documentos/tipos`)
    if (!response.ok) throw new Error('Erro ao carregar tipos de documento')
    return response.json()
  },

  getDocumentosTransportadora: async (id) => {
    const response = await fetch(`${API_BASE_URL}/documentos/transportadora/${id}`)
    if (!response.ok) throw new Error('Erro ao carregar documentos')
    return response.json()
  },

  // Transportadoras
  getTransportadoras: async () => {
    const response = await fetch(`${API_BASE_URL}/transportadoras/`)
    if (!response.ok) throw new Error('Erro ao carregar transportadoras')
    return response.json()
  }
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [currentView, setCurrentView] = useState('dashboard')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Verificar se já está logado ao carregar
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        setIsLoggedIn(true)
      } catch (error) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  }, [])

  const handleLogin = async (email, senha) => {
    setLoading(true)
    setError('')
    
    try {
      const response = await api.login(email, senha)
      
      // Salva token e dados do usuário
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      setUser(response.user)
      setIsLoggedIn(true)
      setCurrentView('dashboard')
      
    } catch (error) {
      setError(error.message || 'Erro no login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setIsLoggedIn(false)
    setCurrentView('dashboard')
  }

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} loading={loading} error={error} />
  }

  // REDIRECIONAMENTO CORRETO BASEADO NO TIPO DE USUÁRIO
  if (user?.tipo === 'ADMIN') {
    return <AdminDashboard user={user} onLogout={handleLogout} currentView={currentView} setCurrentView={setCurrentView} />
  } else if (user?.tipo === 'TRANSPORTADORA') {
    return <TransportadoraDashboard user={user} onLogout={handleLogout} currentView={currentView} setCurrentView={setCurrentView} />
  } else {
    return <div>Erro: Tipo de usuário não reconhecido</div>
  }
}

function LoginScreen({ onLogin, loading, error }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email && senha) {
      onLogin(email, senha)
    }
  }

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-content">
          <div className="login-header">
            <div className="logo-container">
              <div className="logo-icon">📊</div>
              <div className="logo-icon">📋</div>
            </div>
            <h1 className="company-name">NIMO <span className="highlight">ENERGIA</span></h1>
            <p className="subtitle">Portal de Gestão de Documentos</p>
            <p className="description">Sistema para Cadastro e Controle de Transportadoras</p>
          </div>

          <div className="login-form-container">
            <h2>Acesso ao Portal</h2>
            <p>Entre com suas credenciais para acessar o sistema</p>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Senha</label>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" disabled={loading} className="login-button">
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <div className="credentials-info">
              <p>Credenciais de teste:</p>
              <p><strong>Admin:</strong> admin@nimoenergia.com.br / senha123</p>
              <p><strong>Transportadora:</strong> silva@silvatransportes.com.br / senha123</p>
            </div>
          </div>

          <div className="features-section">
            <h3>Sistema de Gestão de Documentos para Transportadoras</h3>
            <p>Automatização de processos • Controle de vencimentos • Dashboard em tempo real</p>
            <div className="features-list">
              <span>✓ Upload com drag-and-drop</span>
              <span>✓ Notificações automáticas</span>
              <span>✓ Controle de acesso</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AdminDashboard({ user, onLogout, currentView, setCurrentView }) {
  const [dashboardData, setDashboardData] = useState({
    metricas: {
      total_transportadoras: 45,
      docs_aprovados: 234,
      docs_pendentes: 12,
      docs_vencidos: 3
    },
    atividade_recente: [
      { descricao: "Silva Transportes enviou Alvará de Funcionamento", status: "NOVO", tempo: "2 min atrás" },
      { descricao: "Documento CNH aprovado para Santos Logística", status: "APROVADO", tempo: "15 min atrás" },
      { descricao: "Seguro vencido para Rápido Transportes", status: "VENCIDO", tempo: "1h atrás" },
      { descricao: "Nova transportadora cadastrada: Express Cargas", status: "NOVO", tempo: "2h atrás" },
      { descricao: "Documento RNTRC pendente para Veloz Transportes", status: "PENDENTE", tempo: "3h atrás" }
    ]
  })

  // Carregar dados reais do dashboard admin
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const data = await api.getDashboardAdmin()
        setDashboardData(data)
      } catch (error) {
        console.error('Erro ao carregar dashboard admin:', error)
        // Manter dados mock em caso de erro
      }
    }
    loadDashboardData()
  }, [])

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>NIMO <span className="highlight">ENERGIA</span> | Portal Administrativo</h1>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span className="notification-badge">3</span>
            <span>{user.nome}</span>
            <button onClick={onLogout} className="logout-btn">Sair</button>
          </div>
        </div>
      </header>

      <div className="dashboard-layout">
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentView('dashboard')}
            >
              <span className="nav-icon">📊</span> Dashboard
            </button>
            <button 
              className={`nav-item ${currentView === 'documentos' ? 'active' : ''}`}
              onClick={() => setCurrentView('documentos')}
            >
              <span className="nav-icon">📄</span> Documentos
            </button>
            <button 
              className={`nav-item ${currentView === 'transportadoras' ? 'active' : ''}`}
              onClick={() => setCurrentView('transportadoras')}
            >
              <span className="nav-icon">🚛</span> Transportadoras
            </button>
            <button 
              className={`nav-item ${currentView === 'performance' ? 'active' : ''}`}
              onClick={() => setCurrentView('performance')}
            >
              <span className="nav-icon">📈</span> Performance
            </button>
            <button 
              className={`nav-item ${currentView === 'compliance' ? 'active' : ''}`}
              onClick={() => setCurrentView('compliance')}
            >
              <span className="nav-icon">⚠️</span> Compliance
            </button>
            <button 
              className={`nav-item ${currentView === 'usuarios' ? 'active' : ''}`}
              onClick={() => setCurrentView('usuarios')}
            >
              <span className="nav-icon">👥</span> Usuários
            </button>
            <button 
              className={`nav-item ${currentView === 'configuracoes' ? 'active' : ''}`}
              onClick={() => setCurrentView('configuracoes')}
            >
              <span className="nav-icon">⚙️</span> Configurações
            </button>
          </nav>
        </aside>

        <main className="main-content">
          {currentView === 'dashboard' && <AdminDashboardContent data={dashboardData} />}
          {currentView === 'documentos' && <DocumentosView userType="admin" />}
          {currentView === 'transportadoras' && <TransportadorasView />}
          {currentView === 'performance' && <PerformanceView />}
          {currentView === 'compliance' && <ComplianceView />}
          {currentView === 'usuarios' && <UsuariosView />}
          {currentView === 'configuracoes' && <ConfiguracoesView />}
        </main>
      </div>
    </div>
  )
}

function TransportadoraDashboard({ user, onLogout, currentView, setCurrentView }) {
  const [dashboardData, setDashboardData] = useState({
    transportadora: {
      razao_social: "Silva Transportes Ltda",
      cnpj: "12.345.678/0001-90",
      status_cadastro: "APROVADA"
    },
    metricas: {
      docs_enviados: 13,
      docs_aprovados: 8,
      docs_pendentes: 3,
      percentual_compliance: 85.5
    }
  })

  // Carregar dados reais do dashboard transportadora
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const data = await api.getDashboardTransportadora(user.transportadora_id)
        setDashboardData(data)
      } catch (error) {
        console.error('Erro ao carregar dashboard transportadora:', error)
        // Manter dados mock em caso de erro
      }
    }
    if (user.transportadora_id) {
      loadDashboardData()
    }
  }, [user.transportadora_id])

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>NIMO <span className="highlight">ENERGIA</span> | Portal da Transportadora</h1>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span className="notification-badge">2</span>
            <span>{user.nome}</span>
            <button onClick={onLogout} className="logout-btn">Sair</button>
          </div>
        </div>
      </header>

      <div className="dashboard-layout">
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentView('dashboard')}
            >
              <span className="nav-icon">📊</span> Dashboard
            </button>
            <button 
              className={`nav-item ${currentView === 'documentos' ? 'active' : ''}`}
              onClick={() => setCurrentView('documentos')}
            >
              <span className="nav-icon">📄</span> Meus Documentos
            </button>
            <button 
              className={`nav-item ${currentView === 'upload' ? 'active' : ''}`}
              onClick={() => setCurrentView('upload')}
            >
              <span className="nav-icon">📤</span> Enviar Documentos
            </button>
            <button 
              className={`nav-item ${currentView === 'perfil' ? 'active' : ''}`}
              onClick={() => setCurrentView('perfil')}
            >
              <span className="nav-icon">🏢</span> Perfil da Empresa
            </button>
          </nav>
        </aside>

        <main className="main-content">
          {currentView === 'dashboard' && <TransportadoraDashboardContent data={dashboardData} />}
          {currentView === 'documentos' && <MeusDocumentosView data={dashboardData} />}
          {currentView === 'upload' && <EnviarDocumentosView />}
          {currentView === 'perfil' && <PerfilEmpresaView data={dashboardData} />}
        </main>
      </div>
    </div>
  )
}

function AdminDashboardContent({ data }) {
  return (
    <div className="dashboard-content">
      <h2>Dashboard Administrativo</h2>
      
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">🚛</div>
          <div className="metric-content">
            <h3>Total Transportadoras</h3>
            <div className="metric-value">{data.metricas?.total_transportadoras || 0}</div>
          </div>
        </div>
        
        <div className="metric-card success">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <h3>Docs Aprovados</h3>
            <div className="metric-value">{data.metricas?.docs_aprovados || 0}</div>
          </div>
        </div>
        
        <div className="metric-card warning">
          <div className="metric-icon">⏳</div>
          <div className="metric-content">
            <h3>Docs Pendentes</h3>
            <div className="metric-value">{data.metricas?.docs_pendentes || 0}</div>
          </div>
        </div>
        
        <div className="metric-card danger">
          <div className="metric-icon">❌</div>
          <div className="metric-content">
            <h3>Docs Vencidos</h3>
            <div className="metric-value">{data.metricas?.docs_vencidos || 0}</div>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="section">
          <h3>Atividade Recente</h3>
          <div className="activity-list">
            {data.atividade_recente?.map((item, index) => (
              <div key={index} className={`activity-item ${item.status.toLowerCase()}`}>
                <div className="activity-icon">
                  {item.status === 'APROVADO' ? '✅' : 
                   item.status === 'PENDENTE' ? '⏳' : 
                   item.status === 'VENCIDO' ? '❌' :
                   item.status === 'NOVO' ? '🆕' : '📄'}
                </div>
                <div className="activity-content">
                  <p>{item.descricao}</p>
                  <span className="activity-time">{item.tempo}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function TransportadoraDashboardContent({ data }) {
  return (
    <div className="dashboard-content">
      <h2>Dashboard da Transportadora</h2>
      
      <div className="company-info">
        <h3>{data.transportadora?.razao_social}</h3>
        <p>CNPJ: {data.transportadora?.cnpj}</p>
        <p>Status: <span className={`status ${data.transportadora?.status_cadastro?.toLowerCase()}`}>
          {data.transportadora?.status_cadastro}
        </span></p>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">📄</div>
          <div className="metric-content">
            <h3>Docs Enviados</h3>
            <div className="metric-value">{data.metricas?.docs_enviados || 0}</div>
          </div>
        </div>
        
        <div className="metric-card success">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <h3>Docs Aprovados</h3>
            <div className="metric-value">{data.metricas?.docs_aprovados || 0}</div>
          </div>
        </div>
        
        <div className="metric-card warning">
          <div className="metric-icon">⏳</div>
          <div className="metric-content">
            <h3>Docs Pendentes</h3>
            <div className="metric-value">{data.metricas?.docs_pendentes || 0}</div>
          </div>
        </div>
        
        <div className="metric-card info">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <h3>Compliance</h3>
            <div className="metric-value">{data.metricas?.percentual_compliance || 0}%</div>
          </div>
        </div>
      </div>

      {data.docs_faltantes && data.docs_faltantes.length > 0 && (
        <div className="section alert">
          <h3>⚠️ Documentos Faltantes</h3>
          <div className="missing-docs">
            {data.docs_faltantes.map((doc, index) => (
              <div key={index} className="missing-doc-item">
                <span>{doc.nome}</span>
                <span className="category">{doc.categoria}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="section">
        <h3>Histórico Recente</h3>
        <div className="activity-list">
          {data.historico_recente?.map((item, index) => (
            <div key={index} className={`activity-item ${item.status.toLowerCase()}`}>
              <div className="activity-icon">
                {item.status === 'APROVADO' ? '✅' : 
                 item.status === 'PENDENTE' ? '⏳' : 
                 item.status === 'REJEITADO' ? '❌' : '📄'}
              </div>
              <div className="activity-content">
                <p><strong>{item.tipo_documento}</strong> - {item.nome_arquivo}</p>
                <span className="activity-time">{item.tempo}</span>
                {item.observacoes && <p className="observations">{item.observacoes}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Componentes funcionais para Transportadora
function MeusDocumentosView({ data }) {
  const documentos = [
    {
      id: 1,
      tipo: "SEGURO RCF-DC",
      nome_arquivo: "seguro_rcf_dc_silva.pdf",
      status: "APROVADO",
      data_envio: "15/06/2025",
      data_vencimento: "15/12/2025",
      observacoes: "Documento aprovado conforme análise técnica"
    },
    {
      id: 2,
      tipo: "ALVARÁ DE FUNCIONAMENTO",
      nome_arquivo: "alvara_funcionamento.pdf",
      status: "PENDENTE",
      data_envio: "10/06/2025",
      data_vencimento: "10/12/2025",
      observacoes: null
    },
    {
      id: 3,
      tipo: "SEGURO RCTR-C",
      nome_arquivo: "seguro_rctr_c.pdf",
      status: "APROVADO",
      data_envio: "08/06/2025",
      data_vencimento: "08/01/2026",
      observacoes: "Documento aprovado"
    },
    {
      id: 4,
      tipo: "PGR",
      nome_arquivo: "pgr_silva_transportes.pdf",
      status: "REJEITADO",
      data_envio: "05/06/2025",
      data_vencimento: "05/12/2025",
      observacoes: "Documento fora do padrão exigido. Favor reenviar com as correções."
    },
    {
      id: 5,
      tipo: "SEGURO AMBIENTAL",
      nome_arquivo: "seguro_ambiental.pdf",
      status: "VENCIDO",
      data_envio: "01/05/2025",
      data_vencimento: "01/06/2025",
      observacoes: "Documento vencido. Necessário renovação urgente."
    }
  ]

  const getStatusIcon = (status) => {
    switch(status) {
      case 'APROVADO': return '✅'
      case 'PENDENTE': return '⏳'
      case 'REJEITADO': return '❌'
      case 'VENCIDO': return '🔴'
      default: return '📄'
    }
  }

  const getStatusClass = (status) => {
    switch(status) {
      case 'APROVADO': return 'status-aprovado'
      case 'PENDENTE': return 'status-pendente'
      case 'REJEITADO': return 'status-rejeitado'
      case 'VENCIDO': return 'status-vencido'
      default: return ''
    }
  }

  return (
    <div className="documentos-view">
      <div className="view-header">
        <h2>Meus Documentos</h2>
        <p>Gerencie todos os documentos enviados para a NIMOENERGIA</p>
      </div>

      <div className="documentos-stats">
        <div className="stat-card success">
          <span className="stat-icon">✅</span>
          <div className="stat-content">
            <h3>Aprovados</h3>
            <span className="stat-number">2</span>
          </div>
        </div>
        <div className="stat-card warning">
          <span className="stat-icon">⏳</span>
          <div className="stat-content">
            <h3>Pendentes</h3>
            <span className="stat-number">1</span>
          </div>
        </div>
        <div className="stat-card danger">
          <span className="stat-icon">❌</span>
          <div className="stat-content">
            <h3>Rejeitados</h3>
            <span className="stat-number">1</span>
          </div>
        </div>
        <div className="stat-card critical">
          <span className="stat-icon">🔴</span>
          <div className="stat-content">
            <h3>Vencidos</h3>
            <span className="stat-number">1</span>
          </div>
        </div>
      </div>

      <div className="documentos-table">
        <div className="table-header">
          <div className="table-actions">
            <input type="text" placeholder="Buscar documentos..." className="search-input" />
            <select className="filter-select">
              <option value="">Todos os status</option>
              <option value="APROVADO">Aprovados</option>
              <option value="PENDENTE">Pendentes</option>
              <option value="REJEITADO">Rejeitados</option>
              <option value="VENCIDO">Vencidos</option>
            </select>
          </div>
        </div>

        <div className="documents-list">
          {documentos.map((doc) => (
            <div key={doc.id} className={`document-item ${getStatusClass(doc.status)}`}>
              <div className="document-info">
                <div className="document-header">
                  <span className="document-icon">{getStatusIcon(doc.status)}</span>
                  <div className="document-details">
                    <h4>{doc.tipo}</h4>
                    <p className="document-filename">{doc.nome_arquivo}</p>
                  </div>
                  <span className={`status-badge ${getStatusClass(doc.status)}`}>
                    {doc.status}
                  </span>
                </div>
                
                <div className="document-dates">
                  <div className="date-info">
                    <span className="date-label">Enviado em:</span>
                    <span className="date-value">{doc.data_envio}</span>
                  </div>
                  <div className="date-info">
                    <span className="date-label">Vencimento:</span>
                    <span className="date-value">{doc.data_vencimento}</span>
                  </div>
                </div>

                {doc.observacoes && (
                  <div className="document-observations">
                    <strong>Observações:</strong> {doc.observacoes}
                  </div>
                )}

                <div className="document-actions">
                  <button className="btn-secondary">📄 Visualizar</button>
                  <button className="btn-secondary">📥 Download</button>
                  {doc.status === 'REJEITADO' || doc.status === 'VENCIDO' ? (
                    <button className="btn-primary">🔄 Reenviar</button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function EnviarDocumentosView() {
  const [selectedDocType, setSelectedDocType] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])

  const tiposDocumentos = [
    { value: 'doc_societario', label: 'DOC SOCIETÁRIO (Estatuto/ATA/Contrato Social)', categoria: 'EMPRESA' },
    { value: 'comprovante_endereco', label: 'COMPROVANTE DE ENDEREÇO', categoria: 'EMPRESA', vencimento: true },
    { value: 'docs_socios', label: 'DOCS SÓCIOS (RG/CPF ou CNH)', categoria: 'EMPRESA' },
    { value: 'alvara_funcionamento', label: 'ALVARÁ DE FUNCIONAMENTO', categoria: 'EMPRESA', vencimento: true },
    { value: 'antt_pj', label: 'ANTT - PJ', categoria: 'EMPRESA' },
    { value: 'seguro_rcf_dc', label: 'SEGURO RCF-DC', categoria: 'SEGUROS', vencimento: true, garantia: true },
    { value: 'seguro_rctr_c', label: 'SEGURO RCTR-C', categoria: 'SEGUROS', vencimento: true, garantia: true },
    { value: 'seguro_ambiental', label: 'SEGURO AMBIENTAL', categoria: 'SEGUROS', vencimento: true, garantia: true },
    { value: 'pgr', label: 'PGR (Programa de Gerenciamento de Riscos)', categoria: 'AMBIENTAL', vencimento: true },
    { value: 'pae', label: 'PAE (Plano de Emergência)', categoria: 'AMBIENTAL', vencimento: true },
    { value: 'aatipp', label: 'AATIPP (IBAMA)', categoria: 'AMBIENTAL', vencimento: true },
    { value: 'cr_ibama', label: 'Certificado de Regularidade - CR/IBAMA', categoria: 'AMBIENTAL', vencimento: true },
    { value: 'licenca_ambiental', label: 'LICENÇA AMBIENTAL ESTADUAL', categoria: 'AMBIENTAL', vencimento: true }
  ]

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFiles = (files) => {
    const newFiles = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      name: file.name,
      size: file.size,
      type: file.type
    }))
    setUploadedFiles(prev => [...prev, ...newFiles])
  }

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const selectedDoc = tiposDocumentos.find(doc => doc.value === selectedDocType)

  return (
    <div className="enviar-documentos-view">
      <div className="view-header">
        <h2>Enviar Documentos</h2>
        <p>Faça o upload dos documentos necessários para manter sua documentação em dia</p>
      </div>

      <div className="upload-form">
        <div className="form-section">
          <label className="form-label">Tipo de Documento *</label>
          <select 
            value={selectedDocType} 
            onChange={(e) => setSelectedDocType(e.target.value)}
            className="form-select"
          >
            <option value="">Selecione o tipo de documento</option>
            <optgroup label="📋 Documentos da Empresa">
              {tiposDocumentos.filter(doc => doc.categoria === 'EMPRESA').map(doc => (
                <option key={doc.value} value={doc.value}>{doc.label}</option>
              ))}
            </optgroup>
            <optgroup label="🛡️ Seguros Obrigatórios">
              {tiposDocumentos.filter(doc => doc.categoria === 'SEGUROS').map(doc => (
                <option key={doc.value} value={doc.value}>{doc.label}</option>
              ))}
            </optgroup>
            <optgroup label="🌱 Documentos Ambientais">
              {tiposDocumentos.filter(doc => doc.categoria === 'AMBIENTAL').map(doc => (
                <option key={doc.value} value={doc.value}>{doc.label}</option>
              ))}
            </optgroup>
          </select>
        </div>

        {selectedDoc && (
          <>
            {selectedDoc.vencimento && (
              <div className="form-section">
                <label className="form-label">Data de Vencimento *</label>
                <input type="date" className="form-input" required />
              </div>
            )}

            {selectedDoc.garantia && (
              <div className="form-section">
                <label className="form-label">Valor da Garantia (R$) *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Ex: 1.000.000,00"
                  required 
                />
              </div>
            )}

            <div className="form-section">
              <label className="form-label">Upload do Arquivo *</label>
              <div 
                className={`upload-area ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="upload-content">
                  <div className="upload-icon">📁</div>
                  <p>Arraste e solte o arquivo aqui ou</p>
                  <label className="upload-button">
                    Escolher Arquivo
                    <input 
                      type="file" 
                      hidden 
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => handleFiles(e.target.files)}
                    />
                  </label>
                  <p className="upload-info">Formatos aceitos: PDF, DOC, DOCX, JPG, PNG (máx. 10MB)</p>
                </div>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="uploaded-files">
                  <h4>Arquivos Selecionados:</h4>
                  {uploadedFiles.map(file => (
                    <div key={file.id} className="uploaded-file">
                      <div className="file-info">
                        <span className="file-icon">📄</span>
                        <div className="file-details">
                          <span className="file-name">{file.name}</span>
                          <span className="file-size">{formatFileSize(file.size)}</span>
                        </div>
                      </div>
                      <button 
                        className="remove-file"
                        onClick={() => removeFile(file.id)}
                      >
                        ❌
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-section">
              <label className="form-label">Observações (opcional)</label>
              <textarea 
                className="form-textarea" 
                placeholder="Adicione observações sobre o documento..."
                rows="3"
              ></textarea>
            </div>

            <div className="form-actions">
              <button className="btn-secondary">Cancelar</button>
              <button className="btn-primary">📤 Enviar Documento</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function PerfilEmpresaView({ data }) {
  return (
    <div className="perfil-empresa-view">
      <div className="view-header">
        <h2>Perfil da Empresa</h2>
        <p>Informações da sua transportadora e relacionamento com a NIMOENERGIA</p>
      </div>

      <div className="perfil-content">
        <div className="empresa-info-card">
          <div className="card-header">
            <h3>🏢 Dados da Empresa</h3>
            <button className="btn-secondary">✏️ Editar</button>
          </div>
          
          <div className="info-grid">
            <div className="info-item">
              <label>Razão Social</label>
              <span>{data.transportadora?.razao_social}</span>
            </div>
            <div className="info-item">
              <label>CNPJ</label>
              <span>{data.transportadora?.cnpj}</span>
            </div>
            <div className="info-item">
              <label>Status do Cadastro</label>
              <span className={`status ${data.transportadora?.status_cadastro?.toLowerCase()}`}>
                {data.transportadora?.status_cadastro}
              </span>
            </div>
            <div className="info-item">
              <label>Data de Cadastro</label>
              <span>15/03/2024</span>
            </div>
          </div>
        </div>

        <div className="relacionamento-card">
          <div className="card-header">
            <h3>📊 Relacionamento NIMOENERGIA</h3>
          </div>
          
          <div className="relacionamento-content">
            <div className="compliance-score">
              <div className="score-circle">
                <div className="score-value">{data.metricas?.percentual_compliance || 0}%</div>
                <div className="score-label">Compliance</div>
              </div>
              <div className="score-details">
                <p>Seu nível de conformidade com os requisitos da NIMOENERGIA</p>
                <div className="score-breakdown">
                  <div className="breakdown-item">
                    <span className="breakdown-label">Documentos em dia:</span>
                    <span className="breakdown-value">{data.metricas?.docs_aprovados || 0}/{(data.metricas?.docs_aprovados || 0) + (data.metricas?.docs_pendentes || 0) + (data.metricas?.docs_rejeitados || 0) + (data.metricas?.docs_vencidos || 0)}</span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-label">Tempo médio de aprovação:</span>
                    <span className="breakdown-value">3 dias úteis</span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-label">Última atualização:</span>
                    <span className="breakdown-value">2 dias atrás</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relacionamento-stats">
              <div className="stat-item">
                <div className="stat-icon">📄</div>
                <div className="stat-content">
                  <span className="stat-number">{data.metricas?.docs_enviados || 0}</span>
                  <span className="stat-label">Documentos Enviados</span>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">⚡</div>
                <div className="stat-content">
                  <span className="stat-number">98%</span>
                  <span className="stat-label">Pontualidade</span>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">🎯</div>
                <div className="stat-content">
                  <span className="stat-number">A+</span>
                  <span className="stat-label">Classificação</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="contato-card">
          <div className="card-header">
            <h3>📞 Informações de Contato</h3>
            <button className="btn-secondary">✏️ Editar</button>
          </div>
          
          <div className="info-grid">
            <div className="info-item">
              <label>Email Principal</label>
              <span>silva@silvatransportes.com.br</span>
            </div>
            <div className="info-item">
              <label>Telefone</label>
              <span>(11) 3456-7890</span>
            </div>
            <div className="info-item">
              <label>Responsável</label>
              <span>João Silva</span>
            </div>
            <div className="info-item">
              <label>Cargo</label>
              <span>Diretor Operacional</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Funcionalidades completas do Admin
function DocumentosView({ userType }) {
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [busca, setBusca] = useState('')

  const documentos = [
    {
      id: 1,
      nome: 'SEGURO RCF-DC',
      arquivo: 'seguro_rcf_dc_silva.pdf',
      transportadora: 'Silva Transportes Ltda',
      tipo: 'SEGURO',
      status: 'APROVADO',
      dataEnvio: '15/06/2025',
      dataVencimento: '15/12/2025',
      observacoes: 'Documento aprovado conforme análise técnica'
    },
    {
      id: 2,
      nome: 'ALVARÁ DE FUNCIONAMENTO',
      arquivo: 'alvara_funcionamento.pdf',
      transportadora: 'Silva Transportes Ltda',
      tipo: 'EMPRESA',
      status: 'PENDENTE',
      dataEnvio: '10/06/2025',
      dataVencimento: '10/12/2025',
      observacoes: 'Aguardando análise técnica'
    },
    {
      id: 3,
      nome: 'SEGURO AMBIENTAL',
      arquivo: 'seguro_ambiental_frota.pdf',
      transportadora: 'Frota Rápida Transportes',
      tipo: 'SEGURO',
      status: 'VENCIDO',
      dataEnvio: '01/05/2025',
      dataVencimento: '01/06/2025',
      observacoes: 'Documento vencido - necessário renovação'
    },
    {
      id: 4,
      nome: 'AATIPP (IBAMA)',
      arquivo: 'aatipp_logistica.pdf',
      transportadora: 'Logística Santos S.A.',
      tipo: 'AMBIENTAL',
      status: 'REJEITADO',
      dataEnvio: '20/05/2025',
      dataVencimento: '20/11/2025',
      observacoes: 'Documento ilegível - solicitar reenvio'
    }
  ]

  const documentosFiltrados = documentos.filter(doc => {
    const matchStatus = filtroStatus === 'todos' || doc.status.toLowerCase() === filtroStatus.toLowerCase()
    const matchTipo = filtroTipo === 'todos' || doc.tipo.toLowerCase() === filtroTipo.toLowerCase()
    const matchBusca = doc.nome.toLowerCase().includes(busca.toLowerCase()) || 
                      doc.transportadora.toLowerCase().includes(busca.toLowerCase())
    return matchStatus && matchTipo && matchBusca
  })

  const getStatusColor = (status) => {
    switch(status) {
      case 'APROVADO': return '#10b981'
      case 'PENDENTE': return '#f59e0b'
      case 'REJEITADO': return '#ef4444'
      case 'VENCIDO': return '#dc2626'
      default: return '#6b7280'
    }
  }

  const aprovarDocumento = (id) => {
    alert(`Documento ${id} aprovado com sucesso!`)
  }

  const rejeitarDocumento = (id) => {
    const motivo = prompt('Motivo da rejeição:')
    if (motivo) {
      alert(`Documento ${id} rejeitado. Motivo: ${motivo}`)
    }
  }

  return (
    <div className="documentos-admin">
      <div className="documentos-header">
        <h2>Gestão de Documentos - Administrador</h2>
        <p>Gerencie todos os documentos enviados pelas transportadoras</p>
      </div>

      <div className="documentos-stats">
        <div className="stat-card green">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-number">234</span>
            <span className="stat-label">Aprovados</span>
          </div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <span className="stat-number">12</span>
            <span className="stat-label">Pendentes</span>
          </div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon">❌</div>
          <div className="stat-info">
            <span className="stat-number">8</span>
            <span className="stat-label">Rejeitados</span>
          </div>
        </div>
        <div className="stat-card dark-red">
          <div className="stat-icon">🔴</div>
          <div className="stat-info">
            <span className="stat-number">3</span>
            <span className="stat-label">Vencidos</span>
          </div>
        </div>
      </div>

      <div className="documentos-filters">
        <input 
          type="text" 
          placeholder="Buscar documentos ou transportadoras..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="search-input"
        />
        <select 
          value={filtroStatus} 
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="filter-select"
        >
          <option value="todos">Todos os status</option>
          <option value="aprovado">Aprovados</option>
          <option value="pendente">Pendentes</option>
          <option value="rejeitado">Rejeitados</option>
          <option value="vencido">Vencidos</option>
        </select>
        <select 
          value={filtroTipo} 
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="filter-select"
        >
          <option value="todos">Todos os tipos</option>
          <option value="empresa">Empresa</option>
          <option value="seguro">Seguros</option>
          <option value="ambiental">Ambiental</option>
        </select>
      </div>

      <div className="documentos-list">
        {documentosFiltrados.map(doc => (
          <div key={doc.id} className="documento-card">
            <div className="documento-info">
              <div className="documento-header">
                <h4>{doc.nome}</h4>
                <span 
                  className="status-badge" 
                  style={{backgroundColor: getStatusColor(doc.status)}}
                >
                  {doc.status}
                </span>
              </div>
              <p className="documento-arquivo">📄 {doc.arquivo}</p>
              <p className="documento-transportadora">🚛 {doc.transportadora}</p>
              <div className="documento-datas">
                <span>Enviado em: {doc.dataEnvio}</span>
                <span>Vencimento: {doc.dataVencimento}</span>
              </div>
              {doc.observacoes && (
                <p className="documento-obs">💬 {doc.observacoes}</p>
              )}
            </div>
            <div className="documento-actions">
              <button className="btn-visualizar">📄 Visualizar</button>
              <button className="btn-download">📥 Download</button>
              {doc.status === 'PENDENTE' && (
                <>
                  <button 
                    className="btn-aprovar"
                    onClick={() => aprovarDocumento(doc.id)}
                  >
                    ✅ Aprovar
                  </button>
                  <button 
                    className="btn-rejeitar"
                    onClick={() => rejeitarDocumento(doc.id)}
                  >
                    ❌ Rejeitar
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TransportadorasView() {
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [busca, setBusca] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  const transportadoras = [
    {
      id: 1,
      razaoSocial: 'Silva Transportes Ltda',
      cnpj: '12.345.678/0001-90',
      status: 'APROVADO',
      compliance: 85.5,
      docsEnviados: 13,
      docsAprovados: 8,
      docsPendentes: 3,
      docsVencidos: 2,
      dataCadastro: '15/03/2024',
      ultimaAtividade: '2 dias atrás',
      responsavel: 'João Silva',
      email: 'silva@silvatransportes.com.br',
      telefone: '(11) 99999-9999'
    },
    {
      id: 2,
      razaoSocial: 'Logística Santos S.A.',
      cnpj: '98.765.432/0001-10',
      status: 'PENDENTE',
      compliance: 72.3,
      docsEnviados: 8,
      docsAprovados: 5,
      docsPendentes: 2,
      docsVencidos: 1,
      dataCadastro: '10/04/2024',
      ultimaAtividade: '4 horas atrás',
      responsavel: 'Maria Santos',
      email: 'maria@logisticasantos.com.br',
      telefone: '(11) 88888-8888'
    },
    {
      id: 3,
      razaoSocial: 'Frota Rápida Transportes',
      cnpj: '11.222.333/0001-44',
      status: 'SUSPENSO',
      compliance: 45.2,
      docsEnviados: 15,
      docsAprovados: 6,
      docsPendentes: 4,
      docsVencidos: 5,
      dataCadastro: '22/02/2024',
      ultimaAtividade: '1 semana atrás',
      responsavel: 'Carlos Frota',
      email: 'carlos@frotarapida.com.br',
      telefone: '(11) 77777-7777'
    }
  ]

  const transportadorasFiltradas = transportadoras.filter(transp => {
    const matchStatus = filtroStatus === 'todos' || transp.status.toLowerCase() === filtroStatus.toLowerCase()
    const matchBusca = transp.razaoSocial.toLowerCase().includes(busca.toLowerCase()) || 
                      transp.cnpj.includes(busca) ||
                      transp.responsavel.toLowerCase().includes(busca.toLowerCase())
    return matchStatus && matchBusca
  })

  const getStatusColor = (status) => {
    switch(status) {
      case 'APROVADO': return '#10b981'
      case 'PENDENTE': return '#f59e0b'
      case 'SUSPENSO': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getComplianceColor = (compliance) => {
    if (compliance >= 80) return '#10b981'
    if (compliance >= 60) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className="transportadoras-admin">
      <div className="transportadoras-header">
        <h2>Gestão de Transportadoras</h2>
        <p>Gerencie todas as transportadoras cadastradas no sistema</p>
        <button 
          className="btn-novo"
          onClick={() => setMostrarFormulario(true)}
        >
          ➕ Nova Transportadora
        </button>
      </div>

      <div className="transportadoras-stats">
        <div className="stat-card blue">
          <div className="stat-icon">🚛</div>
          <div className="stat-info">
            <span className="stat-number">45</span>
            <span className="stat-label">Total</span>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-number">38</span>
            <span className="stat-label">Aprovadas</span>
          </div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <span className="stat-number">5</span>
            <span className="stat-label">Pendentes</span>
          </div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon">⛔</div>
          <div className="stat-info">
            <span className="stat-number">2</span>
            <span className="stat-label">Suspensas</span>
          </div>
        </div>
      </div>

      <div className="transportadoras-filters">
        <input 
          type="text" 
          placeholder="Buscar por razão social, CNPJ ou responsável..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="search-input"
        />
        <select 
          value={filtroStatus} 
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="filter-select"
        >
          <option value="todos">Todos os status</option>
          <option value="aprovado">Aprovadas</option>
          <option value="pendente">Pendentes</option>
          <option value="suspenso">Suspensas</option>
        </select>
      </div>

      <div className="transportadoras-list">
        {transportadorasFiltradas.map(transp => (
          <div key={transp.id} className="transportadora-card">
            <div className="transportadora-info">
              <div className="transportadora-header">
                <h4>{transp.razaoSocial}</h4>
                <span 
                  className="status-badge" 
                  style={{backgroundColor: getStatusColor(transp.status)}}
                >
                  {transp.status}
                </span>
              </div>
              <p className="transportadora-cnpj">🏢 CNPJ: {transp.cnpj}</p>
              <p className="transportadora-responsavel">👤 {transp.responsavel}</p>
              <p className="transportadora-contato">📧 {transp.email} | 📞 {transp.telefone}</p>
              
              <div className="transportadora-metricas">
                <div className="metrica">
                  <span className="metrica-label">Compliance:</span>
                  <span 
                    className="metrica-valor"
                    style={{color: getComplianceColor(transp.compliance)}}
                  >
                    {transp.compliance}%
                  </span>
                </div>
                <div className="metrica">
                  <span className="metrica-label">Docs Enviados:</span>
                  <span className="metrica-valor">{transp.docsEnviados}</span>
                </div>
                <div className="metrica">
                  <span className="metrica-label">Aprovados:</span>
                  <span className="metrica-valor" style={{color: '#10b981'}}>{transp.docsAprovados}</span>
                </div>
                <div className="metrica">
                  <span className="metrica-label">Pendentes:</span>
                  <span className="metrica-valor" style={{color: '#f59e0b'}}>{transp.docsPendentes}</span>
                </div>
              </div>
              
              <div className="transportadora-datas">
                <span>Cadastro: {transp.dataCadastro}</span>
                <span>Última atividade: {transp.ultimaAtividade}</span>
              </div>
            </div>
            <div className="transportadora-actions">
              <button className="btn-visualizar">👁️ Ver Detalhes</button>
              <button className="btn-documentos">📄 Documentos</button>
              <button className="btn-editar">✏️ Editar</button>
              {transp.status === 'APROVADO' && (
                <button className="btn-suspender">⛔ Suspender</button>
              )}
              {transp.status === 'SUSPENSO' && (
                <button className="btn-reativar">✅ Reativar</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {mostrarFormulario && (
        <div className="modal-overlay" onClick={() => setMostrarFormulario(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Nova Transportadora</h3>
            <form className="form-transportadora">
              <div className="form-group">
                <label>Razão Social *</label>
                <input type="text" placeholder="Nome da empresa" />
              </div>
              <div className="form-group">
                <label>CNPJ *</label>
                <input type="text" placeholder="00.000.000/0001-00" />
              </div>
              <div className="form-group">
                <label>Responsável *</label>
                <input type="text" placeholder="Nome do responsável" />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" placeholder="email@empresa.com.br" />
              </div>
              <div className="form-group">
                <label>Telefone *</label>
                <input type="tel" placeholder="(11) 99999-9999" />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setMostrarFormulario(false)}>Cancelar</button>
                <button type="submit">Cadastrar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function PerformanceView() {
  const [periodoSelecionado, setPeriodoSelecionado] = useState('30dias')
  const [tipoAnalise, setTipoAnalise] = useState('geral')

  const dadosPerformance = {
    metricas: {
      tempoMedioAprovacao: '2.3 dias',
      taxaAprovacao: '89.2%',
      documentosProcessados: 1247,
      transportadorasAtivas: 42
    },
    rankingTransportadoras: [
      { nome: 'Silva Transportes Ltda', compliance: 95.8, docsAprovados: 45, tempoMedio: '1.2 dias' },
      { nome: 'Logística Santos S.A.', compliance: 92.4, docsAprovados: 38, tempoMedio: '1.8 dias' },
      { nome: 'Expresso Norte', compliance: 88.7, docsAprovados: 42, tempoMedio: '2.1 dias' },
      { nome: 'Transportes Sul', compliance: 85.3, docsAprovados: 35, tempoMedio: '2.5 dias' },
      { nome: 'Frota Rápida', compliance: 78.9, docsAprovados: 28, tempoMedio: '3.2 dias' }
    ],
    documentosMaisRejeitados: [
      { tipo: 'SEGURO AMBIENTAL', rejeicoes: 23, motivo: 'Documento vencido' },
      { tipo: 'AATIPP (IBAMA)', rejeicoes: 18, motivo: 'Documento ilegível' },
      { tipo: 'ALVARÁ DE FUNCIONAMENTO', rejeicoes: 15, motivo: 'Informações incompletas' },
      { tipo: 'SEGURO RCF-DC', rejeicoes: 12, motivo: 'Valor de garantia insuficiente' }
    ],
    tendencias: {
      documentosEnviados: [120, 135, 142, 158, 163, 171, 185],
      documentosAprovados: [98, 118, 125, 142, 148, 155, 167],
      tempoMedioAprovacao: [3.2, 2.8, 2.5, 2.3, 2.1, 2.0, 2.3]
    }
  }

  return (
    <div className="performance-admin">
      <div className="performance-header">
        <h2>Análise de Performance</h2>
        <p>Monitore o desempenho do sistema e das transportadoras</p>
        <div className="performance-controls">
          <select 
            value={periodoSelecionado} 
            onChange={(e) => setPeriodoSelecionado(e.target.value)}
            className="filter-select"
          >
            <option value="7dias">Últimos 7 dias</option>
            <option value="30dias">Últimos 30 dias</option>
            <option value="90dias">Últimos 90 dias</option>
            <option value="1ano">Último ano</option>
          </select>
          <select 
            value={tipoAnalise} 
            onChange={(e) => setTipoAnalise(e.target.value)}
            className="filter-select"
          >
            <option value="geral">Análise Geral</option>
            <option value="documentos">Por Documentos</option>
            <option value="transportadoras">Por Transportadoras</option>
          </select>
        </div>
      </div>

      <div className="performance-metricas">
        <div className="metrica-card blue">
          <div className="metrica-icon">⏱️</div>
          <div className="metrica-info">
            <span className="metrica-numero">{dadosPerformance.metricas.tempoMedioAprovacao}</span>
            <span className="metrica-label">Tempo Médio de Aprovação</span>
            <span className="metrica-tendencia positive">↗ -0.3 dias vs mês anterior</span>
          </div>
        </div>
        <div className="metrica-card green">
          <div className="metrica-icon">✅</div>
          <div className="metrica-info">
            <span className="metrica-numero">{dadosPerformance.metricas.taxaAprovacao}</span>
            <span className="metrica-label">Taxa de Aprovação</span>
            <span className="metrica-tendencia positive">↗ +2.1% vs mês anterior</span>
          </div>
        </div>
        <div className="metrica-card purple">
          <div className="metrica-icon">📄</div>
          <div className="metrica-info">
            <span className="metrica-numero">{dadosPerformance.metricas.documentosProcessados}</span>
            <span className="metrica-label">Documentos Processados</span>
            <span className="metrica-tendencia positive">↗ +15% vs mês anterior</span>
          </div>
        </div>
        <div className="metrica-card orange">
          <div className="metrica-icon">🚛</div>
          <div className="metrica-info">
            <span className="metrica-numero">{dadosPerformance.metricas.transportadorasAtivas}</span>
            <span className="metrica-label">Transportadoras Ativas</span>
            <span className="metrica-tendencia positive">↗ +3 novas este mês</span>
          </div>
        </div>
      </div>

      <div className="performance-content">
        <div className="performance-section">
          <h3>🏆 Ranking de Transportadoras</h3>
          <div className="ranking-list">
            {dadosPerformance.rankingTransportadoras.map((transp, index) => (
              <div key={index} className="ranking-item">
                <div className="ranking-posicao">#{index + 1}</div>
                <div className="ranking-info">
                  <h4>{transp.nome}</h4>
                  <div className="ranking-metricas">
                    <span className="metrica">Compliance: <strong style={{color: transp.compliance >= 90 ? '#10b981' : transp.compliance >= 80 ? '#f59e0b' : '#ef4444'}}>{transp.compliance}%</strong></span>
                    <span className="metrica">Docs Aprovados: <strong>{transp.docsAprovados}</strong></span>
                    <span className="metrica">Tempo Médio: <strong>{transp.tempoMedio}</strong></span>
                  </div>
                </div>
                <div className="ranking-badge">
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="performance-section">
          <h3>⚠️ Documentos Mais Rejeitados</h3>
          <div className="rejeicoes-list">
            {dadosPerformance.documentosMaisRejeitados.map((doc, index) => (
              <div key={index} className="rejeicao-item">
                <div className="rejeicao-info">
                  <h4>{doc.tipo}</h4>
                  <p className="rejeicao-motivo">Principal motivo: {doc.motivo}</p>
                </div>
                <div className="rejeicao-numero">
                  <span className="numero">{doc.rejeicoes}</span>
                  <span className="label">rejeições</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="performance-section full-width">
          <h3>📊 Tendências dos Últimos 7 Dias</h3>
          <div className="tendencias-grid">
            <div className="tendencia-chart">
              <h4>Documentos Enviados</h4>
              <div className="chart-bars">
                {dadosPerformance.tendencias.documentosEnviados.map((valor, index) => (
                  <div key={index} className="chart-bar">
                    <div 
                      className="bar-fill blue" 
                      style={{height: `${(valor / Math.max(...dadosPerformance.tendencias.documentosEnviados)) * 100}%`}}
                    ></div>
                    <span className="bar-label">{valor}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="tendencia-chart">
              <h4>Documentos Aprovados</h4>
              <div className="chart-bars">
                {dadosPerformance.tendencias.documentosAprovados.map((valor, index) => (
                  <div key={index} className="chart-bar">
                    <div 
                      className="bar-fill green" 
                      style={{height: `${(valor / Math.max(...dadosPerformance.tendencias.documentosAprovados)) * 100}%`}}
                    ></div>
                    <span className="bar-label">{valor}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="tendencia-chart">
              <h4>Tempo Médio (dias)</h4>
              <div className="chart-bars">
                {dadosPerformance.tendencias.tempoMedioAprovacao.map((valor, index) => (
                  <div key={index} className="chart-bar">
                    <div 
                      className="bar-fill orange" 
                      style={{height: `${(valor / Math.max(...dadosPerformance.tendencias.tempoMedioAprovacao)) * 100}%`}}
                    ></div>
                    <span className="bar-label">{valor}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ComplianceView() {
  const [filtroNivel, setFiltroNivel] = useState('todos')
  const [filtroCategoria, setFiltroCategoria] = useState('todas')

  const dadosCompliance = {
    resumo: {
      complianceGeral: 87.3,
      transportadorasConformes: 38,
      transportadorasAlerta: 5,
      transportadorasCriticas: 2,
      documentosVencendo: 12,
      documentosVencidos: 3
    },
    alertas: [
      {
        id: 1,
        tipo: 'VENCIMENTO_PROXIMO',
        transportadora: 'Silva Transportes Ltda',
        documento: 'SEGURO RCF-DC',
        vencimento: '25/06/2025',
        diasRestantes: 7,
        nivel: 'ALERTA'
      },
      {
        id: 2,
        tipo: 'DOCUMENTO_VENCIDO',
        transportadora: 'Frota Rápida Transportes',
        documento: 'SEGURO AMBIENTAL',
        vencimento: '15/06/2025',
        diasVencido: 3,
        nivel: 'CRITICO'
      },
      {
        id: 3,
        tipo: 'COMPLIANCE_BAIXO',
        transportadora: 'Transportes Norte',
        compliance: 65.2,
        nivel: 'ALERTA'
      },
      {
        id: 4,
        tipo: 'DOCUMENTO_REJEITADO',
        transportadora: 'Logística Santos S.A.',
        documento: 'AATIPP (IBAMA)',
        motivo: 'Documento ilegível',
        nivel: 'ATENCAO'
      }
    ],
    categorias: [
      {
        nome: 'Documentos da Empresa',
        compliance: 92.1,
        total: 180,
        conformes: 166,
        pendentes: 8,
        vencidos: 6
      },
      {
        nome: 'Seguros Obrigatórios',
        compliance: 88.7,
        total: 135,
        conformes: 120,
        pendentes: 12,
        vencidos: 3
      },
      {
        nome: 'Documentos Ambientais',
        compliance: 81.4,
        total: 225,
        conformes: 183,
        pendentes: 32,
        vencidos: 10
      }
    ],
    transportadorasCriticas: [
      {
        nome: 'Frota Rápida Transportes',
        compliance: 45.2,
        problemas: ['3 docs vencidos', '5 docs rejeitados', 'Sem SEGURO AMBIENTAL'],
        ultimaAtualizacao: '1 semana atrás'
      },
      {
        nome: 'Transportes Norte',
        compliance: 65.2,
        problemas: ['2 docs vencidos', 'AATIPP pendente há 30 dias'],
        ultimaAtualizacao: '3 dias atrás'
      }
    ]
  }

  const alertasFiltrados = dadosCompliance.alertas.filter(alerta => {
    const matchNivel = filtroNivel === 'todos' || alerta.nivel.toLowerCase() === filtroNivel.toLowerCase()
    return matchNivel
  })

  const getNivelColor = (nivel) => {
    switch(nivel) {
      case 'CRITICO': return '#dc2626'
      case 'ALERTA': return '#f59e0b'
      case 'ATENCAO': return '#3b82f6'
      default: return '#6b7280'
    }
  }

  const getComplianceColor = (compliance) => {
    if (compliance >= 90) return '#10b981'
    if (compliance >= 80) return '#f59e0b'
    if (compliance >= 70) return '#f97316'
    return '#ef4444'
  }

  return (
    <div className="compliance-admin">
      <div className="compliance-header">
        <h2>Monitoramento de Compliance</h2>
        <p>Monitore a conformidade de todas as transportadoras</p>
      </div>

      <div className="compliance-resumo">
        <div className="resumo-card principal">
          <div className="resumo-icon">📊</div>
          <div className="resumo-info">
            <span className="resumo-numero" style={{color: getComplianceColor(dadosCompliance.resumo.complianceGeral)}}>{dadosCompliance.resumo.complianceGeral}%</span>
            <span className="resumo-label">Compliance Geral</span>
          </div>
        </div>
        <div className="resumo-card green">
          <div className="resumo-icon">✅</div>
          <div className="resumo-info">
            <span className="resumo-numero">{dadosCompliance.resumo.transportadorasConformes}</span>
            <span className="resumo-label">Conformes</span>
          </div>
        </div>
        <div className="resumo-card orange">
          <div className="resumo-icon">⚠️</div>
          <div className="resumo-info">
            <span className="resumo-numero">{dadosCompliance.resumo.transportadorasAlerta}</span>
            <span className="resumo-label">Em Alerta</span>
          </div>
        </div>
        <div className="resumo-card red">
          <div className="resumo-icon">🚨</div>
          <div className="resumo-info">
            <span className="resumo-numero">{dadosCompliance.resumo.transportadorasCriticas}</span>
            <span className="resumo-label">Críticas</span>
          </div>
        </div>
      </div>

      <div className="compliance-content">
        <div className="compliance-section">
          <div className="section-header">
            <h3>🚨 Alertas Ativos</h3>
            <select 
              value={filtroNivel} 
              onChange={(e) => setFiltroNivel(e.target.value)}
              className="filter-select"
            >
              <option value="todos">Todos os níveis</option>
              <option value="critico">Crítico</option>
              <option value="alerta">Alerta</option>
              <option value="atencao">Atenção</option>
            </select>
          </div>
          <div className="alertas-list">
            {alertasFiltrados.map(alerta => (
              <div key={alerta.id} className="alerta-item">
                <div 
                  className="alerta-nivel" 
                  style={{backgroundColor: getNivelColor(alerta.nivel)}}
                >
                  {alerta.nivel}
                </div>
                <div className="alerta-info">
                  <h4>{alerta.transportadora}</h4>
                  {alerta.documento && <p>📄 {alerta.documento}</p>}
                  {alerta.vencimento && (
                    <p>📅 Vencimento: {alerta.vencimento} 
                      {alerta.diasRestantes && ` (${alerta.diasRestantes} dias)`}
                      {alerta.diasVencido && ` (vencido há ${alerta.diasVencido} dias)`}
                    </p>
                  )}
                  {alerta.compliance && <p>📊 Compliance: {alerta.compliance}%</p>}
                  {alerta.motivo && <p>💬 {alerta.motivo}</p>}
                </div>
                <div className="alerta-actions">
                  <button className="btn-acao">🔍 Ver Detalhes</button>
                  <button className="btn-acao">📧 Notificar</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="compliance-section">
          <h3>📋 Compliance por Categoria</h3>
          <div className="categorias-list">
            {dadosCompliance.categorias.map((categoria, index) => (
              <div key={index} className="categoria-item">
                <div className="categoria-header">
                  <h4>{categoria.nome}</h4>
                  <span 
                    className="categoria-compliance"
                    style={{color: getComplianceColor(categoria.compliance)}}
                  >
                    {categoria.compliance}%
                  </span>
                </div>
                <div className="categoria-stats">
                  <div className="stat">
                    <span className="stat-numero">{categoria.total}</span>
                    <span className="stat-label">Total</span>
                  </div>
                  <div className="stat">
                    <span className="stat-numero" style={{color: '#10b981'}}>{categoria.conformes}</span>
                    <span className="stat-label">Conformes</span>
                  </div>
                  <div className="stat">
                    <span className="stat-numero" style={{color: '#f59e0b'}}>{categoria.pendentes}</span>
                    <span className="stat-label">Pendentes</span>
                  </div>
                  <div className="stat">
                    <span className="stat-numero" style={{color: '#ef4444'}}>{categoria.vencidos}</span>
                    <span className="stat-label">Vencidos</span>
                  </div>
                </div>
                <div className="categoria-barra">
                  <div 
                    className="barra-progresso"
                    style={{
                      width: `${categoria.compliance}%`,
                      backgroundColor: getComplianceColor(categoria.compliance)
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="compliance-section">
          <h3>⚠️ Transportadoras Críticas</h3>
          <div className="criticas-list">
            {dadosCompliance.transportadorasCriticas.map((transp, index) => (
              <div key={index} className="critica-item">
                <div className="critica-info">
                  <h4>{transp.nome}</h4>
                  <p className="critica-compliance">
                    Compliance: <span style={{color: getComplianceColor(transp.compliance)}}>{transp.compliance}%</span>
                  </p>
                  <div className="critica-problemas">
                    {transp.problemas.map((problema, idx) => (
                      <span key={idx} className="problema-tag">⚠️ {problema}</span>
                    ))}
                  </div>
                  <p className="critica-atualizacao">Última atualização: {transp.ultimaAtualizacao}</p>
                </div>
                <div className="critica-actions">
                  <button className="btn-urgente">🚨 Ação Urgente</button>
                  <button className="btn-contato">📞 Contatar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function UsuariosView() {
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [busca, setBusca] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  const usuarios = [
    {
      id: 1,
      nome: 'João Silva',
      email: 'silva@silvatransportes.com.br',
      tipo: 'TRANSPORTADORA',
      empresa: 'Silva Transportes Ltda',
      status: 'ATIVO',
      ultimoAcesso: '2 horas atrás',
      dataCadastro: '15/03/2024',
      permissoes: ['upload_documentos', 'visualizar_compliance']
    },
    {
      id: 2,
      nome: 'Maria Santos',
      email: 'maria@logisticasantos.com.br',
      tipo: 'TRANSPORTADORA',
      empresa: 'Logística Santos S.A.',
      status: 'ATIVO',
      ultimoAcesso: '1 dia atrás',
      dataCadastro: '10/04/2024',
      permissoes: ['upload_documentos', 'visualizar_compliance']
    },
    {
      id: 3,
      nome: 'Carlos Admin',
      email: 'carlos@nimoenergia.com.br',
      tipo: 'ADMIN',
      empresa: 'NIMOENERGIA',
      status: 'ATIVO',
      ultimoAcesso: '30 minutos atrás',
      dataCadastro: '01/01/2024',
      permissoes: ['admin_total', 'gerenciar_usuarios', 'aprovar_documentos']
    },
    {
      id: 4,
      nome: 'Ana Analista',
      email: 'ana@nimoenergia.com.br',
      tipo: 'ANALISTA',
      empresa: 'NIMOENERGIA',
      status: 'ATIVO',
      ultimoAcesso: '4 horas atrás',
      dataCadastro: '15/02/2024',
      permissoes: ['aprovar_documentos', 'visualizar_relatorios']
    },
    {
      id: 5,
      nome: 'Pedro Frota',
      email: 'pedro@frotarapida.com.br',
      tipo: 'TRANSPORTADORA',
      empresa: 'Frota Rápida Transportes',
      status: 'SUSPENSO',
      ultimoAcesso: '1 semana atrás',
      dataCadastro: '22/02/2024',
      permissoes: ['upload_documentos']
    }
  ]

  const usuariosFiltrados = usuarios.filter(user => {
    const matchTipo = filtroTipo === 'todos' || user.tipo.toLowerCase() === filtroTipo.toLowerCase()
    const matchStatus = filtroStatus === 'todos' || user.status.toLowerCase() === filtroStatus.toLowerCase()
    const matchBusca = user.nome.toLowerCase().includes(busca.toLowerCase()) || 
                      user.email.toLowerCase().includes(busca.toLowerCase()) ||
                      user.empresa.toLowerCase().includes(busca.toLowerCase())
    return matchTipo && matchStatus && matchBusca
  })

  const getTipoColor = (tipo) => {
    switch(tipo) {
      case 'ADMIN': return '#dc2626'
      case 'ANALISTA': return '#3b82f6'
      case 'TRANSPORTADORA': return '#10b981'
      default: return '#6b7280'
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'ATIVO': return '#10b981'
      case 'SUSPENSO': return '#ef4444'
      case 'INATIVO': return '#6b7280'
      default: return '#6b7280'
    }
  }

  return (
    <div className="usuarios-admin">
      <div className="usuarios-header">
        <h2>Gestão de Usuários</h2>
        <p>Gerencie todos os usuários do sistema</p>
        <button 
          className="btn-novo"
          onClick={() => setMostrarFormulario(true)}
        >
          ➕ Novo Usuário
        </button>
      </div>

      <div className="usuarios-stats">
        <div className="stat-card blue">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <span className="stat-number">127</span>
            <span className="stat-label">Total de Usuários</span>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-number">118</span>
            <span className="stat-label">Ativos</span>
          </div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon">🔒</div>
          <div className="stat-info">
            <span className="stat-number">9</span>
            <span className="stat-label">Suspensos</span>
          </div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon">🚛</div>
          <div className="stat-info">
            <span className="stat-number">98</span>
            <span className="stat-label">Transportadoras</span>
          </div>
        </div>
      </div>

      <div className="usuarios-filters">
        <input 
          type="text" 
          placeholder="Buscar por nome, email ou empresa..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="search-input"
        />
        <select 
          value={filtroTipo} 
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="filter-select"
        >
          <option value="todos">Todos os tipos</option>
          <option value="admin">Administradores</option>
          <option value="analista">Analistas</option>
          <option value="transportadora">Transportadoras</option>
        </select>
        <select 
          value={filtroStatus} 
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="filter-select"
        >
          <option value="todos">Todos os status</option>
          <option value="ativo">Ativos</option>
          <option value="suspenso">Suspensos</option>
          <option value="inativo">Inativos</option>
        </select>
      </div>

      <div className="usuarios-list">
        {usuariosFiltrados.map(user => (
          <div key={user.id} className="usuario-card">
            <div className="usuario-info">
              <div className="usuario-header">
                <h4>{user.nome}</h4>
                <div className="usuario-badges">
                  <span 
                    className="tipo-badge" 
                    style={{backgroundColor: getTipoColor(user.tipo)}}
                  >
                    {user.tipo}
                  </span>
                  <span 
                    className="status-badge" 
                    style={{backgroundColor: getStatusColor(user.status)}}
                  >
                    {user.status}
                  </span>
                </div>
              </div>
              <p className="usuario-email">📧 {user.email}</p>
              <p className="usuario-empresa">🏢 {user.empresa}</p>
              <div className="usuario-detalhes">
                <span>Último acesso: {user.ultimoAcesso}</span>
                <span>Cadastro: {user.dataCadastro}</span>
              </div>
              <div className="usuario-permissoes">
                <span className="permissoes-label">Permissões:</span>
                {user.permissoes.map((perm, index) => (
                  <span key={index} className="permissao-tag">{perm}</span>
                ))}
              </div>
            </div>
            <div className="usuario-actions">
              <button className="btn-visualizar">👁️ Ver Perfil</button>
              <button className="btn-editar">✏️ Editar</button>
              <button className="btn-permissoes">🔑 Permissões</button>
              {user.status === 'ATIVO' && (
                <button className="btn-suspender">🔒 Suspender</button>
              )}
              {user.status === 'SUSPENSO' && (
                <button className="btn-reativar">✅ Reativar</button>
              )}
              <button className="btn-resetar">🔄 Reset Senha</button>
            </div>
          </div>
        ))}
      </div>

      {mostrarFormulario && (
        <div className="modal-overlay" onClick={() => setMostrarFormulario(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Novo Usuário</h3>
            <form className="form-usuario">
              <div className="form-group">
                <label>Nome Completo *</label>
                <input type="text" placeholder="Nome do usuário" />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" placeholder="email@empresa.com.br" />
              </div>
              <div className="form-group">
                <label>Tipo de Usuário *</label>
                <select>
                  <option value="">Selecione o tipo</option>
                  <option value="admin">Administrador</option>
                  <option value="analista">Analista</option>
                  <option value="transportadora">Transportadora</option>
                </select>
              </div>
              <div className="form-group">
                <label>Empresa *</label>
                <input type="text" placeholder="Nome da empresa" />
              </div>
              <div className="form-group">
                <label>Senha Temporária *</label>
                <input type="password" placeholder="Senha inicial" />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setMostrarFormulario(false)}>Cancelar</button>
                <button type="submit">Criar Usuário</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function ConfiguracoesView() {
  const [abaSelecionada, setAbaSelecionada] = useState('geral')

  const configuracoes = {
    geral: {
      nomePortal: 'Portal NIMOENERGIA',
      emailContato: 'contato@nimoenergia.com.br',
      telefoneContato: '(11) 3333-4444',
      enderecoEmpresa: 'São Paulo, SP',
      logoUrl: '/logo-nimoenergia.png',
      corPrimaria: '#1e40af',
      corSecundaria: '#f59e0b'
    },
    documentos: {
      tamanhoMaximoArquivo: '10MB',
      formatosPermitidos: ['PDF', 'DOCX', 'JPG', 'PNG'],
      diasAvisoVencimento: 30,
      diasLimiteRenovacao: 7,
      aprovacaoAutomatica: false,
      notificacaoEmail: true
    },
    compliance: {
      percentualMinimoCompliance: 80,
      diasToleranciaVencimento: 5,
      alertasAutomaticos: true,
      relatoriosMensais: true,
      auditoriaTrimestral: true
    },
    seguranca: {
      senhaMinCaracteres: 8,
      senhaExigeMaiuscula: true,
      senhaExigeNumero: true,
      senhaExigeEspecial: true,
      tentativasMaxLogin: 3,
      tempoSessao: 480,
      autenticacaoDoisFatores: false
    }
  }

  const salvarConfiguracoes = () => {
    alert('Configurações salvas com sucesso!')
  }

  return (
    <div className="configuracoes-admin">
      <div className="configuracoes-header">
        <h2>Configurações do Sistema</h2>
        <p>Configure parâmetros gerais do portal</p>
      </div>

      <div className="config-tabs">
        <button 
          className={`config-tab ${abaSelecionada === 'geral' ? 'active' : ''}`}
          onClick={() => setAbaSelecionada('geral')}
        >
          ⚙️ Geral
        </button>
        <button 
          className={`config-tab ${abaSelecionada === 'documentos' ? 'active' : ''}`}
          onClick={() => setAbaSelecionada('documentos')}
        >
          📄 Documentos
        </button>
        <button 
          className={`config-tab ${abaSelecionada === 'compliance' ? 'active' : ''}`}
          onClick={() => setAbaSelecionada('compliance')}
        >
          ⚠️ Compliance
        </button>
        <button 
          className={`config-tab ${abaSelecionada === 'seguranca' ? 'active' : ''}`}
          onClick={() => setAbaSelecionada('seguranca')}
        >
          🔒 Segurança
        </button>
      </div>

      <div className="config-content">
        {abaSelecionada === 'geral' && (
          <div className="config-section">
            <h3>Configurações Gerais</h3>
            <div className="config-form">
              <div className="form-group">
                <label>Nome do Portal</label>
                <input type="text" defaultValue={configuracoes.geral.nomePortal} />
              </div>
              <div className="form-group">
                <label>Email de Contato</label>
                <input type="email" defaultValue={configuracoes.geral.emailContato} />
              </div>
              <div className="form-group">
                <label>Telefone de Contato</label>
                <input type="tel" defaultValue={configuracoes.geral.telefoneContato} />
              </div>
              <div className="form-group">
                <label>Endereço da Empresa</label>
                <input type="text" defaultValue={configuracoes.geral.enderecoEmpresa} />
              </div>
              <div className="form-group">
                <label>Cor Primária</label>
                <input type="color" defaultValue={configuracoes.geral.corPrimaria} />
              </div>
              <div className="form-group">
                <label>Cor Secundária</label>
                <input type="color" defaultValue={configuracoes.geral.corSecundaria} />
              </div>
            </div>
          </div>
        )}

        {abaSelecionada === 'documentos' && (
          <div className="config-section">
            <h3>Configurações de Documentos</h3>
            <div className="config-form">
              <div className="form-group">
                <label>Tamanho Máximo de Arquivo</label>
                <select defaultValue={configuracoes.documentos.tamanhoMaximoArquivo}>
                  <option value="5MB">5MB</option>
                  <option value="10MB">10MB</option>
                  <option value="20MB">20MB</option>
                  <option value="50MB">50MB</option>
                </select>
              </div>
              <div className="form-group">
                <label>Dias de Aviso de Vencimento</label>
                <input type="number" defaultValue={configuracoes.documentos.diasAvisoVencimento} />
              </div>
              <div className="form-group">
                <label>Dias Limite para Renovação</label>
                <input type="number" defaultValue={configuracoes.documentos.diasLimiteRenovacao} />
              </div>
              <div className="form-group checkbox">
                <label>
                  <input type="checkbox" defaultChecked={configuracoes.documentos.aprovacaoAutomatica} />
                  Aprovação Automática (documentos válidos)
                </label>
              </div>
              <div className="form-group checkbox">
                <label>
                  <input type="checkbox" defaultChecked={configuracoes.documentos.notificacaoEmail} />
                  Notificações por Email
                </label>
              </div>
            </div>
          </div>
        )}

        {abaSelecionada === 'compliance' && (
          <div className="config-section">
            <h3>Configurações de Compliance</h3>
            <div className="config-form">
              <div className="form-group">
                <label>Percentual Mínimo de Compliance (%)</label>
                <input type="number" defaultValue={configuracoes.compliance.percentualMinimoCompliance} min="0" max="100" />
              </div>
              <div className="form-group">
                <label>Dias de Tolerância para Vencimento</label>
                <input type="number" defaultValue={configuracoes.compliance.diasToleranciaVencimento} />
              </div>
              <div className="form-group checkbox">
                <label>
                  <input type="checkbox" defaultChecked={configuracoes.compliance.alertasAutomaticos} />
                  Alertas Automáticos
                </label>
              </div>
              <div className="form-group checkbox">
                <label>
                  <input type="checkbox" defaultChecked={configuracoes.compliance.relatoriosMensais} />
                  Relatórios Mensais Automáticos
                </label>
              </div>
              <div className="form-group checkbox">
                <label>
                  <input type="checkbox" defaultChecked={configuracoes.compliance.auditoriaTrimestral} />
                  Auditoria Trimestral
                </label>
              </div>
            </div>
          </div>
        )}

        {abaSelecionada === 'seguranca' && (
          <div className="config-section">
            <h3>Configurações de Segurança</h3>
            <div className="config-form">
              <div className="form-group">
                <label>Mínimo de Caracteres na Senha</label>
                <input type="number" defaultValue={configuracoes.seguranca.senhaMinCaracteres} min="6" max="20" />
              </div>
              <div className="form-group">
                <label>Tentativas Máximas de Login</label>
                <input type="number" defaultValue={configuracoes.seguranca.tentativasMaxLogin} min="3" max="10" />
              </div>
              <div className="form-group">
                <label>Tempo de Sessão (minutos)</label>
                <input type="number" defaultValue={configuracoes.seguranca.tempoSessao} min="30" max="1440" />
              </div>
              <div className="form-group checkbox">
                <label>
                  <input type="checkbox" defaultChecked={configuracoes.seguranca.senhaExigeMaiuscula} />
                  Exigir Letra Maiúscula na Senha
                </label>
              </div>
              <div className="form-group checkbox">
                <label>
                  <input type="checkbox" defaultChecked={configuracoes.seguranca.senhaExigeNumero} />
                  Exigir Número na Senha
                </label>
              </div>
              <div className="form-group checkbox">
                <label>
                  <input type="checkbox" defaultChecked={configuracoes.seguranca.senhaExigeEspecial} />
                  Exigir Caractere Especial na Senha
                </label>
              </div>
              <div className="form-group checkbox">
                <label>
                  <input type="checkbox" defaultChecked={configuracoes.seguranca.autenticacaoDoisFatores} />
                  Autenticação de Dois Fatores
                </label>
              </div>
            </div>
          </div>
        )}

        <div className="config-actions">
          <button className="btn-salvar" onClick={salvarConfiguracoes}>
            💾 Salvar Configurações
          </button>
          <button className="btn-resetar">
            🔄 Restaurar Padrões
          </button>
          <button className="btn-backup">
            📦 Fazer Backup
          </button>
        </div>
      </div>
    </div>
  )
}

function UploadDocumentosView() {
  return (
    <div className="view-placeholder">
      <h3>Upload de Documentos</h3>
      <p>Funcionalidade em desenvolvimento</p>
    </div>
  )
}

function ComplianceTransportadoraView({ data }) {
  return (
    <div className="view-placeholder">
      <h3>Compliance da Transportadora</h3>
      <p>Percentual atual: {data?.metricas?.percentual_compliance || 0}%</p>
    </div>
  )
}

export default App

