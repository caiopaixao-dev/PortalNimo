import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

export default function TransportadorasPage() {
  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-bold nimo-text-primary">Transportadoras</h1>
        <p className="text-gray-600">Gerencie as transportadoras cadastradas</p>
      </div>
      
      <Card className="nimo-card">
        <CardHeader>
          <CardTitle>Em Desenvolvimento</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Funcionalidade em desenvolvimento...</p>
        </CardContent>
      </Card>
    </div>
  )
}

