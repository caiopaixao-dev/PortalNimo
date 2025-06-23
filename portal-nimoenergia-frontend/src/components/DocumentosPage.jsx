import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Check, 
  X, 
  Clock,
  AlertTriangle
} from 'lucide-react'

export default function DocumentosPage() {
  const { user, apiCall } = useAuth()
  const [documentos, setDocumentos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDocumentos()
  }, [])

  const fetchDocumentos = async () => {
    try {
      const response = await apiCall('/documentos')
      if (response.ok) {
        const data = await response.json()
        setDocumentos(data.documentos)
      }
    } catch (error) {
      console.error('Erro ao carregar documentos:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'aprovado':
        return <Check className="h-4 w-4 text-green-600" />
      case 'rejeitado':
        return <X className="h-4 w-4 text-red-600" />
      case 'pendente':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'vencido':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'aprovado':
        return 'bg-green-100 text-green-800'
      case 'rejeitado':
        return 'bg-red-100 text-red-800'
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800'
      case 'vencido':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold nimo-text-primary">Documentos</h1>
          <p className="text-gray-600">Gerencie seus documentos e certificações</p>
        </div>
        <Button className="nimo-button-primary">
          <Upload className="mr-2 h-4 w-4" />
          Enviar Documento
        </Button>
      </div>

      {/* Filtros e Busca */}
      <Card className="nimo-card">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Buscar documentos..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todos os status</option>
              <option value="aprovado">Aprovado</option>
              <option value="pendente">Pendente</option>
              <option value="rejeitado">Rejeitado</option>
              <option value="vencido">Vencido</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todos os tipos</option>
              <option value="veiculo">Veículo</option>
              <option value="motorista">Motorista</option>
              <option value="societario">Societário</option>
              <option value="seguro">Seguro</option>
              <option value="certificacao">Certificação</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Documentos */}
      <div className="grid gap-4">
        {documentos.length > 0 ? (
          documentos.map((documento) => (
            <Card key={documento.id} className="nimo-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(documento.status)}
                    <div>
                      <h3 className="font-semibold">{documento.nome_original}</h3>
                      <p className="text-sm text-gray-600">
                        {documento.tipo_documento?.nome}
                      </p>
                      <p className="text-xs text-gray-500">
                        Enviado em {new Date(documento.data_upload).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(documento.status)}>
                      {documento.status}
                    </Badge>
                    {documento.data_vencimento && (
                      <div className="text-sm text-gray-600">
                        Vence: {new Date(documento.data_vencimento).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                {documento.observacoes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Observações:</strong> {documento.observacoes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="nimo-card">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum documento encontrado
                </h3>
                <p className="text-gray-600 mb-4">
                  Comece enviando seus primeiros documentos
                </p>
                <Button className="nimo-button-primary">
                  <Upload className="mr-2 h-4 w-4" />
                  Enviar Primeiro Documento
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

