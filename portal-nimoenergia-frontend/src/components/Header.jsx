import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  Bell, 
  Search, 
  User,
  AlertTriangle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover'

export default function Header() {
  const { user, apiCall } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      // Simular notificações baseadas em alertas do dashboard
      const response = await apiCall('/dashboard/alertas')
      if (response.ok) {
        const data = await response.json()
        const mockNotifications = data.alertas.map((alerta, index) => ({
          id: index + 1,
          titulo: alerta.titulo,
          mensagem: alerta.mensagem,
          tipo: alerta.tipo,
          lida: false,
          created_at: new Date().toISOString()
        }))
        setNotifications(mockNotifications)
        setUnreadCount(mockNotifications.filter(n => !n.lida).length)
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error)
    }
  }

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, lida: true } : n
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const getNotificationIcon = (tipo) => {
    switch (tipo) {
      case 'erro':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'aviso':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'info':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const formatTimeAgo = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Agora'
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`
    return `${Math.floor(diffInMinutes / 1440)}d atrás`
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Título da Página */}
        <div>
          <h1 className="text-2xl font-bold nimo-text-primary">
            {user?.role === 'admin' ? 'Dashboard NIMO ENERGIA' : `Bem-vindo, ${user?.username}`}
          </h1>
          <p className="text-sm text-gray-600">
            {user?.role === 'admin' 
              ? 'Painel administrativo de gestão de documentos' 
              : 'Portal de documentos da transportadora'
            }
          </p>
        </div>

        {/* Ações do Header */}
        <div className="flex items-center space-x-4">
          {/* Busca */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar documentos..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Notificações */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Notificações</h3>
                <p className="text-sm text-gray-600">
                  {unreadCount > 0 ? `${unreadCount} não lidas` : 'Todas lidas'}
                </p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b hover:bg-gray-50 ${!notification.lida ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex items-start space-x-3">
                        {getNotificationIcon(notification.tipo)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.titulo}
                          </p>
                          <p className="text-sm text-gray-600">
                            {notification.mensagem}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatTimeAgo(notification.created_at)}
                          </p>
                        </div>
                        {!notification.lida && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>Nenhuma notificação</p>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Menu do Usuário */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="hidden md:block">{user?.username}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium">{user?.username}</p>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                  <Badge variant="outline" className="mt-1 capitalize">
                    {user?.role}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem>
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

