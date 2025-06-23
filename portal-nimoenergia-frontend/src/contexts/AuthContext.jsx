import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  const API_BASE_URL = 'https://3dhkilcqezmm.manus.space/api'

  useEffect(() => {
    if (token) {
      // Verificar se o token é válido
      fetchCurrentUser()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        // Token inválido
        logout()
      }
    } catch (error) {
      console.error('Erro ao verificar usuário:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        setToken(data.token)
        setUser(data.user)
        localStorage.setItem('token', data.token)
        return { success: true, user: data.user }
      } else {
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error('Erro no login:', error)
      return { success: false, message: 'Erro de conexão' }
    }
  }

  const loginDemo = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/demo-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (response.ok) {
        setToken(data.token)
        setUser(data.user)
        localStorage.setItem('token', data.token)
        return { success: true, user: data.user }
      } else {
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error('Erro no login demo:', error)
      return { success: false, message: 'Erro de conexão' }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
  }

  const apiCall = async (endpoint, options = {}) => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    }

    try {
      const response = await fetch(url, config)
      
      if (response.status === 401) {
        // Token expirado
        logout()
        throw new Error('Sessão expirada')
      }

      return response
    } catch (error) {
      console.error('Erro na API:', error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    token,
    login,
    loginDemo,
    logout,
    apiCall,
    isAdmin: user?.role === 'admin',
    isTransportadora: user?.role === 'transportadora'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

