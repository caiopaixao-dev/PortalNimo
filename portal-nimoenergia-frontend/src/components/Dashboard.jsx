import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { 
  FileText, 
  Building2, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Download,
  Upload,
  Eye
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#1a365d', '#f6ad55', '#38a169', '#2d5a87', '#0f2a44']

export default function Dashboard() {
  const { user, apiCall, isAdmin } = useAuth()
  const [stats, setStats] = useState(null)
  const [atividades, setAtividades] = useState([])
  const [alertas, setAlertas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Buscar estatísticas
      const statsResponse = await apiCall('/dashboard/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.stats)
      }

      // Buscar atividades recentes
      const atividadesResponse = await apiCall('/dashboard/atividade-recente?limit=5')
      if (atividadesResponse.ok) {
        const atividadesData = await atividadesResponse.json()
        setAtividades(atividadesData.atividades)
      }

      // Buscar alertas
      const alertasResponse = await apiCall('/dashboard/alertas')
      if (alertasResponse.ok) {
        const alertasData = await alertasResponse.json()
        setAlertas(alertasData.alertas)
      }

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'aprovado':
        return 'bg-green-100 text-green-800'
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejeitado':
        return 'bg-red-100 text-red-800'
      case 'vencido':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getAlertIcon = (tipo) => {
    switch (tipo) {
      case 'erro':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'aviso':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'info':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Dados para gráficos
  const documentosData = stats?.documentos ? [
    { name: 'Aprovados', value: stats.documentos.aprovados, color: '#38a169' },
    { name: 'Pendentes', value: stats.documentos.pendentes, color: '#f6ad55' },
    { name: 'Rejeitados', value: stats.documentos.rejeitados, color: '#dc2626' },
    { name: 'Vencidos', value: stats.documentos.vencidos, color: '#7c2d12' }
  ] : []

  return (
    <div className="space-y-6 fade-in">
      {/* Cards de Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total de Documentos */}
        <Card className="nimo-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold nimo-text-primary">
              {stats?.documentos?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {isAdmin ? 'Todos os documentos' : 'Seus documentos'}
            </p>
          </CardContent>
        </Card>

        {/* Documentos Aprovados */}
        <Card className="nimo-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.documentos?.aprovados || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Documentos em conformidade
            </p>
          </CardContent>
        </Card>

        {/* Documentos Pendentes */}
        <Card className="nimo-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.documentos?.pendentes || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Aguardando aprovação
            </p>
          </CardContent>
        </Card>

        {/* Documentos Vencidos */}
        <Card className="nimo-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.documentos?.vencidos || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Necessitam renovação
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cards Administrativos (apenas para admin) */}
      {isAdmin && stats?.transportadoras && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="nimo-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transportadoras</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold nimo-text-primary">
                {stats.transportadoras.total}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.transportadoras.ativas} ativas
              </p>
            </CardContent>
          </Card>

          <Card className="nimo-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold nimo-text-primary">
                {stats.usuarios?.total || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.usuarios?.ativos || 0} ativos
              </p>
            </CardContent>
          </Card>

          <Card className="nimo-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximos Vencimentos</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.vencimentos?.proximos_30_dias || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Próximos 30 dias
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Documentos */}
        <Card className="nimo-card">
          <CardHeader>
            <CardTitle>Status dos Documentos</CardTitle>
            <CardDescription>
              Distribuição por status de aprovação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={documentosData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {documentosData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Atividade Recente */}
        <Card className="nimo-card">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>
              Últimas ações no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {atividades.length > 0 ? (
                atividades.map((atividade, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {atividade.titulo}
                      </p>
                      <p className="text-sm text-gray-500">
                        {atividade.descricao}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(atividade.data).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <Badge className={getStatusColor(atividade.status)}>
                      {atividade.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhuma atividade recente
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <Card className="nimo-card">
          <CardHeader>
            <CardTitle>Alertas Importantes</CardTitle>
            <CardDescription>
              Itens que requerem atenção
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alertas.map((alerta, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border">
                  {getAlertIcon(alerta.tipo)}
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{alerta.titulo}</h4>
                    <p className="text-sm text-gray-600">{alerta.mensagem}</p>
                    {alerta.acao && (
                      <p className="text-xs text-blue-600 mt-1">
                        Ação: {alerta.acao}
                      </p>
                    )}
                  </div>
                  <Badge variant={alerta.prioridade === 'alta' ? 'destructive' : 'secondary'}>
                    {alerta.prioridade}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações Rápidas */}
      <Card className="nimo-card">
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesso rápido às principais funcionalidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="nimo-button-primary h-auto p-4 flex flex-col items-center space-y-2">
              <Upload className="h-6 w-6" />
              <span>Enviar Documento</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Eye className="h-6 w-6" />
              <span>Ver Documentos</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Download className="h-6 w-6" />
              <span>Relatórios</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

