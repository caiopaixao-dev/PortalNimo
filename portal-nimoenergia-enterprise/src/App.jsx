import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { 
  BarChart3, 
  FileText, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Building2,
  Shield,
  FileCheck,
  Calendar,
  Download,
  Search,
  Filter,
  Settings,
  LogOut,
  Bell,
  Menu,
  X
} from 'lucide-react'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('login')
  const [userType, setUserType] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  // Dados enterprise realistas
  const enterpriseData = {
    kpis: {
      totalTransportadoras: 247,
      documentosProcessados: 12847,
      conformidadeMedia: 94.2,
      economiaAnual: 2850000,
      tempoMedioAprovacao: 2.3,
      documentosVencendo: 23
    },
    documentosStatus: [
      { name: 'Aprovados', value: 8945, color: '#22c55e' },
      { name: 'Pendentes', value: 234, color: '#f59e0b' },
      { name: 'Rejeitados', value: 156, color: '#ef4444' },
      { name: 'Vencidos', value: 89, color: '#6b7280' }
    ],
    performanceMensal: [
      { mes: 'Jan', documentos: 980, aprovacao: 92 },
      { mes: 'Fev', documentos: 1120, aprovacao: 94 },
      { mes: 'Mar', documentos: 1050, aprovacao: 91 },
      { mes: 'Abr', documentos: 1180, aprovacao: 95 },
      { mes: 'Mai', documentos: 1340, aprovacao: 96 },
      { mes: 'Jun', documentos: 1290, aprovacao: 94 }
    ],
    transportadorasTop: [
      { nome: 'Transportes Silva Ltda', documentos: 45, conformidade: 98, status: 'Excelente' },
      { nome: 'Logística Santos S.A.', documentos: 38, conformidade: 96, status: 'Muito Bom' },
      { nome: 'Frota Rápida Transportes', documentos: 42, conformidade: 94, status: 'Bom' },
      { nome: 'Cargo Express Brasil', documentos: 35, conformidade: 92, status: 'Bom' },
      { nome: 'Transporte Seguro Ltda', documentos: 40, conformidade: 89, status: 'Regular' }
    ],
    alertasCriticos: [
      { tipo: 'Vencimento', descricao: '23 documentos vencem em 7 dias', prioridade: 'Alta' },
      { tipo: 'Conformidade', descricao: '5 transportadoras abaixo de 85%', prioridade: 'Média' },
      { tipo: 'Pendência', descricao: '12 documentos aguardam há mais de 5 dias', prioridade: 'Alta' }
    ]
  }

  const handleLogin = (type) => {
    setUserType(type)
    setCurrentView('dashboard')
  }

  const handleLogout = () => {
    setCurrentView('login')
    setUserType('')
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  if (currentView === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Building2 className="h-12 w-12 text-blue-600" />
              <BarChart3 className="h-12 w-12 text-orange-500" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              NIMO <span className="nimo-text-gradient">ENERGIA</span>
            </h1>
            <p className="text-blue-600 dark:text-blue-400 text-lg font-medium">Portal Enterprise</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Sistema de Gestão de Documentos Corporativo</p>
          </div>

          <Card className="enterprise-shadow">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Acesso Executivo</CardTitle>
              <CardDescription>Entre com suas credenciais corporativas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Corporativo</Label>
                <Input 
                  id="email"
                  type="email" 
                  placeholder="usuario@nimoenergia.com.br"
                  defaultValue="admin@nimoenergia.com.br"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input 
                  id="password"
                  type="password" 
                  placeholder="••••••••"
                  defaultValue="NimoAdmin2024"
                />
              </div>
              
              <Button 
                onClick={() => handleLogin('admin')}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                <Shield className="mr-2 h-4 w-4" />
                Acesso Executivo
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">ou</span>
                </div>
              </div>

              <Button 
                onClick={() => handleLogin('demo')}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Demonstração Executiva
              </Button>
            </CardContent>
          </Card>

          <div className="text-center mt-6 space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Sistema Enterprise:</strong> Gestão completa de documentos e conformidade
            </p>
            <div className="flex justify-center gap-4 text-xs text-gray-500">
              <span>✓ Dashboard Executivo</span>
              <span>✓ Relatórios Avançados</span>
              <span>✓ Compliance Automático</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-background ${darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            <Building2 className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold">NIMO <span className="text-orange-500">ENERGIA</span></h1>
              <p className="text-xs text-muted-foreground">Portal Enterprise</p>
            </div>
          </div>
          
          <div className="ml-auto flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">3</Badge>
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleDarkMode}>
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden border-r bg-card/30`}>
          <nav className="p-4 space-y-2">
            <Button variant="ghost" className="w-full justify-start" onClick={() => setCurrentView('dashboard')}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Dashboard Executivo
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => setCurrentView('documentos')}>
              <FileText className="mr-2 h-4 w-4" />
              Gestão de Documentos
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => setCurrentView('transportadoras')}>
              <Users className="mr-2 h-4 w-4" />
              Transportadoras
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => setCurrentView('relatorios')}>
              <FileCheck className="mr-2 h-4 w-4" />
              Relatórios Executivos
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => setCurrentView('compliance')}>
              <Shield className="mr-2 h-4 w-4" />
              Compliance
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {currentView === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold">Dashboard Executivo</h2>
                  <p className="text-muted-foreground">Visão geral das operações e performance</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    Período
                  </Button>
                </div>
              </div>

              {/* KPIs Essenciais */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Transportadoras Ativas</p>
                        <p className="text-3xl font-bold">{enterpriseData.kpis.totalTransportadoras}</p>
                        <p className="text-xs text-green-600">+12 este mês</p>
                      </div>
                      <Users className="h-10 w-10 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Documentos Processados</p>
                        <p className="text-3xl font-bold">{enterpriseData.kpis.documentosProcessados.toLocaleString()}</p>
                        <p className="text-xs text-green-600">+1.290 este mês</p>
                      </div>
                      <FileText className="h-10 w-10 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Taxa de Conformidade</p>
                        <p className="text-3xl font-bold">{enterpriseData.kpis.conformidadeMedia}%</p>
                        <p className="text-xs text-green-600">+2.1% este mês</p>
                      </div>
                      <CheckCircle className="h-10 w-10 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-orange-200 bg-orange-50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-orange-700">Documentos Vencendo</p>
                        <p className="text-3xl font-bold text-orange-600">{enterpriseData.kpis.documentosVencendo}</p>
                        <p className="text-xs text-orange-600">Próximos 30 dias</p>
                      </div>
                      <AlertTriangle className="h-10 w-10 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Informações Operacionais Essenciais */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      Alertas Operacionais
                    </CardTitle>
                    <CardDescription>Ações necessárias imediatas</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {enterpriseData.alertasCriticos.map((alerta, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div>
                          <p className="font-medium">{alerta.tipo}</p>
                          <p className="text-sm text-muted-foreground">{alerta.descricao}</p>
                        </div>
                        <Badge variant={alerta.prioridade === 'Alta' ? 'destructive' : 'secondary'}>
                          {alerta.prioridade}
                        </Badge>
                      </div>
                    ))}
                    <Button className="w-full mt-4" variant="outline">
                      <FileCheck className="mr-2 h-4 w-4" />
                      Ver Todos os Alertas
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Transportadoras - Performance</CardTitle>
                    <CardDescription>Ranking por conformidade e documentação</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {enterpriseData.transportadorasTop.map((transportadora, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{transportadora.nome}</p>
                            <p className="text-sm text-muted-foreground">{transportadora.documentos} documentos</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{transportadora.conformidade}%</p>
                          <Badge variant={transportadora.conformidade >= 95 ? 'default' : transportadora.conformidade >= 90 ? 'secondary' : 'destructive'}>
                            {transportadora.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    <Button className="w-full mt-4" variant="outline">
                      <Users className="mr-2 h-4 w-4" />
                      Ver Todas as Transportadoras
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Status Resumido */}
              <Card>
                <CardHeader>
                  <CardTitle>Status Geral dos Documentos</CardTitle>
                  <CardDescription>Distribuição atual por status de aprovação</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {enterpriseData.documentosStatus.map((status, index) => (
                      <div key={index} className="text-center p-4 border rounded-lg">
                        <div className="w-4 h-4 rounded-full mx-auto mb-2" style={{ backgroundColor: status.color }}></div>
                        <p className="text-2xl font-bold">{status.value.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{status.name}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentView === 'documentos' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold">Gestão de Documentos</h2>
                  <p className="text-muted-foreground">Controle completo de documentos e aprovações</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Search className="mr-2 h-4 w-4" />
                    Buscar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filtros
                  </Button>
                </div>
              </div>

              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Gestão Avançada de Documentos</h3>
                    <p className="text-muted-foreground mb-4">
                      Sistema completo de workflow, aprovações e controle de vencimentos
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                      <div className="p-4 border rounded-lg">
                        <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <h4 className="font-medium">Aprovação Automática</h4>
                        <p className="text-sm text-muted-foreground">Workflow inteligente</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                        <h4 className="font-medium">Controle de Vencimento</h4>
                        <p className="text-sm text-muted-foreground">Alertas automáticos</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <Shield className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                        <h4 className="font-medium">Auditoria Completa</h4>
                        <p className="text-sm text-muted-foreground">Rastreabilidade total</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Outras views podem ser implementadas conforme necessário */}
        </main>
      </div>
    </div>
  )
}

export default App

