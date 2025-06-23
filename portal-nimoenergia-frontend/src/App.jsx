import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// Componentes
import LoginPage from './components/LoginPage'
import Dashboard from './components/Dashboard'
import DocumentosPage from './components/DocumentosPage'
import TransportadorasPage from './components/TransportadorasPage'
import UsuariosPage from './components/UsuariosPage'
import ConfiguracoesPage from './components/ConfiguracoesPage'
import Sidebar from './components/Sidebar'
import Header from './components/Header'

// Context para autenticação
import { AuthProvider, useAuth } from './contexts/AuthContext'

// Layout principal do sistema
function AppLayout({ children }) {
  const { user } = useAuth()
  
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

// Componente para rotas protegidas
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return <AppLayout>{children}</AppLayout>
}

// Componente principal da aplicação
function AppContent() {
  const { user } = useAuth()
  
  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/documentos" 
          element={
            <ProtectedRoute>
              <DocumentosPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/transportadoras" 
          element={
            <ProtectedRoute>
              <TransportadorasPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/usuarios" 
          element={
            <ProtectedRoute>
              <UsuariosPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/configuracoes" 
          element={
            <ProtectedRoute>
              <ConfiguracoesPage />
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App

