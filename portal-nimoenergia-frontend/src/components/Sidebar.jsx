import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/button'
import { 
  LayoutDashboard, 
  FileText, 
  Building2, 
  Users, 
  Settings, 
  LogOut,
  Fuel,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { cn } from '../lib/utils'

const menuItems = [
  {
    title: 'Visão Geral',
    icon: LayoutDashboard,
    path: '/dashboard',
    roles: ['admin', 'transportadora']
  },
  {
    title: 'Documentos',
    icon: FileText,
    path: '/documentos',
    roles: ['admin', 'transportadora']
  },
  {
    title: 'Transportadoras',
    icon: Building2,
    path: '/transportadoras',
    roles: ['admin']
  },
  {
    title: 'Usuários',
    icon: Users,
    path: '/usuarios',
    roles: ['admin']
  },
  {
    title: 'Configurações',
    icon: Settings,
    path: '/configuracoes',
    roles: ['admin', 'transportadora']
  }
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  )

  return (
    <div className={cn(
      "nimo-bg-primary text-white transition-all duration-300 flex flex-col",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header da Sidebar */}
      <div className="p-4 border-b border-blue-600">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Building2 className="h-6 w-6 text-white" />
                <Fuel className="h-4 w-4 nimo-text-secondary" />
              </div>
              <div>
                <h2 className="font-bold text-lg">
                  NIMO <span className="nimo-text-secondary">ENERGIA</span>
                </h2>
                <p className="text-xs text-blue-200">Portal de Documentos</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="text-white hover:bg-blue-600"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              className={cn(
                "w-full justify-start text-white hover:bg-blue-600",
                isActive && "bg-blue-600 nimo-text-secondary",
                collapsed && "px-2"
              )}
              onClick={() => navigate(item.path)}
            >
              <Icon className={cn("h-5 w-5", !collapsed && "mr-3")} />
              {!collapsed && <span>{item.title}</span>}
            </Button>
          )
        })}
      </nav>

      {/* User Info e Logout */}
      <div className="p-4 border-t border-blue-600">
        {!collapsed && (
          <div className="mb-3">
            <p className="text-sm font-medium text-white">{user?.username}</p>
            <p className="text-xs text-blue-200">{user?.email}</p>
            <p className="text-xs nimo-text-secondary capitalize">{user?.role}</p>
          </div>
        )}
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-white hover:bg-red-600",
            collapsed && "px-2"
          )}
          onClick={handleLogout}
        >
          <LogOut className={cn("h-5 w-5", !collapsed && "mr-3")} />
          {!collapsed && <span>Sair</span>}
        </Button>
      </div>
    </div>
  )
}

