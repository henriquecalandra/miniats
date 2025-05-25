"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react"

interface RouteStatus {
  path: string
  name: string
  status: "success" | "error" | "loading"
  responseTime?: number
  error?: string
}

export const dynamic = "force-dynamic"

export default function SystemStatusPage() {
  const [routes, setRoutes] = useState<RouteStatus[]>([])
  const [isChecking, setIsChecking] = useState(false)

  const routesToCheck = [
    { path: "/", name: "Página Inicial" },
    { path: "/auth/login", name: "Login" },
    { path: "/auth/signup", name: "Cadastro" },
    { path: "/app/dashboard", name: "Dashboard" },
    { path: "/app/jobs", name: "Vagas" },
    { path: "/app/candidates", name: "Candidatos" },
    { path: "/app/talent-pool", name: "Banco de Talentos" },
    { path: "/app/settings", name: "Configurações" },
    { path: "/onboarding", name: "Onboarding" },
    { path: "/api/health", name: "API Health Check" },
  ]

  const checkRoutes = async () => {
    setIsChecking(true)
    const results: RouteStatus[] = []

    for (const route of routesToCheck) {
      const startTime = Date.now()
      try {
        const response = await fetch(route.path, {
          method: "HEAD",
          cache: "no-cache",
        })

        const responseTime = Date.now() - startTime

        results.push({
          ...route,
          status: response.ok ? "success" : "error",
          responseTime,
          error: response.ok ? undefined : `HTTP ${response.status}`,
        })
      } catch (error) {
        results.push({
          ...route,
          status: "error",
          responseTime: Date.now() - startTime,
          error: error instanceof Error ? error.message : "Network error",
        })
      }
    }

    setRoutes(results)
    setIsChecking(false)
  }

  useEffect(() => {
    checkRoutes()
  }, [])

  const successCount = routes.filter((r) => r.status === "success").length
  const errorCount = routes.filter((r) => r.status === "error").length
  const averageResponseTime =
    routes.length > 0 ? Math.round(routes.reduce((acc, r) => acc + (r.responseTime || 0), 0) / routes.length) : 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Status do Sistema</h1>
          <p className="text-gray-600">Monitoramento de saúde das rotas da aplicação</p>
        </div>
        <Button onClick={checkRoutes} disabled={isChecking}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? "animate-spin" : ""}`} />
          {isChecking ? "Verificando..." : "Verificar Novamente"}
        </Button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rotas Funcionando</p>
                <p className="text-2xl font-bold text-gray-900">{successCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rotas com Erro</p>
                <p className="text-2xl font-bold text-gray-900">{errorCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
                <p className="text-2xl font-bold text-gray-900">{averageResponseTime}ms</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Rotas */}
      <Card>
        <CardHeader>
          <CardTitle>Status das Rotas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {routes.map((route, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {route.status === "success" && <CheckCircle className="h-5 w-5 text-green-600" />}
                  {route.status === "error" && <XCircle className="h-5 w-5 text-red-600" />}
                  {route.status === "loading" && <Clock className="h-5 w-5 text-yellow-600" />}

                  <div>
                    <p className="font-medium">{route.name}</p>
                    <p className="text-sm text-gray-600">{route.path}</p>
                    {route.error && <p className="text-sm text-red-600">{route.error}</p>}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {route.responseTime && <span className="text-sm text-gray-600">{route.responseTime}ms</span>}
                  <Badge
                    variant={
                      route.status === "success" ? "default" : route.status === "error" ? "destructive" : "secondary"
                    }
                  >
                    {route.status === "success" ? "OK" : route.status === "error" ? "ERRO" : "VERIFICANDO"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
