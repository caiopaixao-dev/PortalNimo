import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Alert, AlertDescription } from './ui/alert'
import { Loader2, Building2, Fuel, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, loginDemo } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await login(email, password)
    
    if (!result.success) {
      setError(result.message)
    }
    
    setLoading(false)
  }

  const handleDemoLogin = async () => {
    setLoading(true)
    setError('')

    const result = await loginDemo()
    
    if (!result.success) {
      setError(result.message)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen nimo-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo e Título */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="flex items-center space-x-1">
              <Building2 className="h-8 w-8 text-white" />
              <Fuel className="h-6 w-6 text-[var(--nimo-orange)]" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              NIMO <span className="nimo-text-secondary">ENERGIA</span>
            </h1>
            <p className="text-blue-100 mt-2">Portal de Gestão de Documentos</p>
            <p className="text-blue-200 text-sm">Sistema para Cadastro e Controle de Transportadoras</p>
          </div>
        </div>

        {/* Card de Login */}
        <Card className="nimo-card shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center nimo-text-primary">
              Acesso ao Portal
            </CardTitle>
            <CardDescription className="text-center">
              Entre com suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full nimo-button-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Ou
                </span>
              </div>
            </div>

            <Button 
              type="button"
              variant="outline"
              className="w-full nimo-button-success"
              onClick={handleDemoLogin}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Carregando...
                </>
              ) : (
                'Acesso de Demonstração'
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <p>Credenciais de teste:</p>
              <p className="font-mono text-xs mt-1">
                admin@nimoenergia.com.br<br />
                NimoAdmin2024
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Informações do Sistema */}
        <div className="text-center text-blue-100 text-sm space-y-2">
          <p>Sistema de Gestão de Documentos para Transportadoras</p>
          <p>Automatização de processos • Controle de vencimentos • Dashboard em tempo real</p>
          <div className="flex justify-center space-x-4 text-xs">
            <span>✓ Upload com drag-and-drop</span>
            <span>✓ Notificações automáticas</span>
            <span>✓ Controle de acesso</span>
          </div>
        </div>
      </div>
    </div>
  )
}

