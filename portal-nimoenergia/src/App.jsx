import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Fuel, User, Lock, AlertCircle, BarChart3, Users, Settings, LogOut, TrendingUp, Zap, Truck } from 'lucide-react'
import './App.css'

// Credenciais válidas
const VALID_CREDENTIALS = {
  email: 'admin@nimoenergia.com.br',
  password: 'NimoAdmin2024'
}

function LoginPage({ onLogin, error, isLoading }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    onLogin(email, password)
  }

  const handleDemoLogin = () => {
    onLogin('demo', 'demo', true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo e Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Fuel className="h-8 w-8 text-orange-400" />
            <div className="nimo-logo">
              NIMO <span className="nimo-highlight">ENERGIA</span>
            </div>
          </div>
          <div className="text-sm text-gray-400">DISTRIBUIDORA</div>
        </div>

        {/* Card de Login */}
        <Card className="nimo-card border-0 shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-white">
              Bem-vindo de volta!
            </CardTitle>
            <CardDescription className="text-gray-300">
              Faça login para acessar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Email</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@nimoenergia.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="nimo-input placeholder:text-gray-400"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white flex items-center space-x-2">
                  <Lock className="h-4 w-4" />
                  <span>Senha</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="NimoAdmin2024"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="nimo-input placeholder:text-gray-400"
                  required
                />
              </div>

              {error && (
                <Alert className="border-red-500 bg-red-500/10">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-400">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full nimo-button-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-transparent px-2 text-gray-400">ou</span>
              </div>
            </div>

            <Button
              onClick={handleDemoLogin}
              className="w-full nimo-button-secondary"
              disabled={isLoading}
            >
              Acesso de Demonstração (Admin)
            </Button>

            <div className="text-center">
              <span className="text-gray-400">Não tem uma conta? </span>
              <a href="#" className="nimo-highlight hover:underline font-medium">
                Cadastre-se
              </a>
            </div>

            {/* Credenciais de demonstração */}
            <div className="mt-4 p-3 bg-blue-900/30 rounded-lg border border-blue-700/30">
              <p className="text-xs text-blue-300 font-medium mb-2">Credenciais de teste:</p>
              <p className="text-xs text-blue-200">Email: admin@nimoenergia.com.br</p>
              <p className="text-xs text-blue-200">Senha: NimoAdmin2024</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-400">
          <p>© 2024 NIMOENERGIA - Levando energia de qualidade para todo o Brasil</p>
        </div>
      </div>
    </div>
  )
}

function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview')

  const stats = [
    { title: 'Vendas Hoje', value: 'R$ 45.230', icon: TrendingUp, color: 'text-green-400' },
    { title: 'Litros Vendidos', value: '12.450L', icon: Fuel, color: 'text-blue-400' },
    { title: 'Clientes Ativos', value: '1.234', icon: Users, color: 'text-orange-400' },
    { title: 'Entregas', value: '89', icon: Truck, color: 'text-purple-400' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Fuel className="h-8 w-8 text-orange-400" />
              <div className="nimo-logo text-lg">
                NIMO <span className="nimo-highlight">ENERGIA</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">
                Bem-vindo, {user.isDemo ? 'Administrador (Demo)' : 'Administrador'}
              </span>
              <Button
                onClick={onLogout}
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-slate-800/30 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
              { id: 'users', label: 'Usuários', icon: Users },
              { id: 'settings', label: 'Configurações', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-orange-400 text-orange-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
              <p className="text-gray-400">Visão geral das operações da NIMOENERGIA</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="nimo-card border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                        <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
                      </div>
                      <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Activity */}
            <Card className="nimo-card border-0">
              <CardHeader>
                <CardTitle className="text-white">Atividade Recente</CardTitle>
                <CardDescription className="text-gray-400">
                  Últimas transações e eventos do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { time: '10:30', event: 'Nova venda realizada - R$ 2.450,00', type: 'sale' },
                    { time: '09:15', event: 'Entrega concluída - Pedido #1234', type: 'delivery' },
                    { time: '08:45', event: 'Novo cliente cadastrado - João Silva', type: 'user' },
                    { time: '08:20', event: 'Estoque reabastecido - 5.000L Gasolina', type: 'stock' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-slate-700/30">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm">{activity.event}</p>
                        <p className="text-gray-400 text-xs">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Usuários</h1>
              <p className="text-gray-400">Gerenciamento de usuários do sistema</p>
            </div>

            <Card className="nimo-card border-0">
              <CardHeader>
                <CardTitle className="text-white">Lista de Usuários</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'João Silva', email: 'joao@nimoenergia.com.br', role: 'Administrador', status: 'Ativo' },
                    { name: 'Maria Santos', email: 'maria@nimoenergia.com.br', role: 'Operador', status: 'Ativo' },
                    { name: 'Pedro Costa', email: 'pedro@nimoenergia.com.br', role: 'Vendedor', status: 'Inativo' }
                  ].map((user, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-slate-700/30">
                      <div>
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-orange-400 text-sm">{user.role}</p>
                        <p className={`text-xs ${user.status === 'Ativo' ? 'text-green-400' : 'text-red-400'}`}>
                          {user.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Configurações</h1>
              <p className="text-gray-400">Configurações do sistema e preferências</p>
            </div>

            <Card className="nimo-card border-0">
              <CardHeader>
                <CardTitle className="text-white">Configurações Gerais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-white">Nome da Empresa</Label>
                  <Input className="nimo-input mt-2" value="NIMOENERGIA DISTRIBUIDORA" readOnly />
                </div>
                <div>
                  <Label className="text-white">Email de Contato</Label>
                  <Input className="nimo-input mt-2" value="contato@nimoenergia.com.br" readOnly />
                </div>
                <div>
                  <Label className="text-white">Telefone</Label>
                  <Input className="nimo-input mt-2" value="+55 16 4009-8155" readOnly />
                </div>
                <Button className="nimo-button-primary">
                  Salvar Configurações
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (email, password, isDemo = false) => {
    setIsLoading(true)
    setError('')
    
    // Simular delay de autenticação
    setTimeout(() => {
      if (isDemo) {
        setUser({ email: 'demo@nimoenergia.com.br', isDemo: true })
      } else if (email === VALID_CREDENTIALS.email && password === VALID_CREDENTIALS.password) {
        setUser({ email, isDemo: false })
      } else {
        setError('Email ou senha incorretos. Use: admin@nimoenergia.com.br / NimoAdmin2024')
      }
      setIsLoading(false)
    }, 1000)
  }

  const handleLogout = () => {
    setUser(null)
    setError('')
  }

  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />
  }

  return <LoginPage onLogin={handleLogin} error={error} isLoading={isLoading} />
}

export default App

