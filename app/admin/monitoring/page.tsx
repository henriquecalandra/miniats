"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { usePerformance } from "@/hooks/use-performance"
import { Activity, Database, Server, Users } from "lucide-react"

export default function MonitoringPage() {
  const [systemHealth, setSystemHealth] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const performance = usePerformance()

  useEffect(() => {
    const checkSystemHealth = async () => {
      try {
        const response = await fetch("/api/health")
        const data = await response.json()
        setSystemHealth(data)
      } catch (error) {
        console.error("Erro ao verificar saúde do sistema:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSystemHealth()

    // Verificar a cada 30 segundos
    const interval = setInterval(checkSystemHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return <div>Carregando métricas...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Monitoramento</h1>
        <p className="text-gray-600">Métricas em tempo real do sistema</p>
      </div>

      {/* Status Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Server className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sistema</p>
                <Badge variant={systemHealth?.status === "healthy" ? "default" : "destructive"}>
                  {systemHealth?.status === "healthy" ? "Online" : "Offline"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Banco de Dados</p>
                <Badge variant={systemHealth?.services?.database === "connected" ? "default" : "destructive"}>
                  {systemHealth?.services?.database === "connected" ? "Conectado" : "Desconectado"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Performance</p>
                <p className="text-lg font-bold text-gray-900">{performance?.loadTime || 0}ms</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Memória</p>
                <p className="text-lg font-bold text-gray-900">{performance?.memoryUsage || 0}MB</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detalhes do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Última Verificação</p>
                <p className="text-sm text-gray-900">
                  {systemHealth?.timestamp ? new Date(systemHealth.timestamp).toLocaleString("pt-BR") : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Tempo de Renderização</p>
                <p className="text-sm text-gray-900">{performance?.renderTime || 0}ms</p>
              </div>
            </div>

            {systemHealth?.error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-800">Erro Detectado:</p>
                <p className="text-sm text-red-600">{systemHealth.error}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
