import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, CreditCard, TrendingUp } from "lucide-react"

// Força a página a ser renderizada dinamicamente
export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  let totalCompanies = 0
  let totalUsers = 0
  let activeSubscriptions = 0
  let recentCompanies: any[] = []
  let recentActivities: any[] = []

  try {
    const supabase = createClient()

    // Buscar estatísticas com tratamento de erro
    const [companiesResult, usersResult, subscriptionsResult] = await Promise.allSettled([
      supabase.from("companies").select("*", { count: "exact", head: true }),
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("companies").select("*", { count: "exact", head: true }).eq("subscription_status", "active"),
    ])

    if (companiesResult.status === "fulfilled") {
      totalCompanies = companiesResult.value.count || 0
    }
    if (usersResult.status === "fulfilled") {
      totalUsers = usersResult.value.count || 0
    }
    if (subscriptionsResult.status === "fulfilled") {
      activeSubscriptions = subscriptionsResult.value.count || 0
    }

    // Buscar empresas recentes com tratamento de erro
    try {
      const { data: companies } = await supabase
        .from("companies")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5)

      recentCompanies = companies || []
    } catch (error) {
      console.error("Erro ao buscar empresas recentes:", error)
    }

    // Buscar atividades recentes com tratamento de erro
    try {
      const { data: activities } = await supabase
        .from("activity_log")
        .select(`
          *,
          company:companies(name)
        `)
        .order("created_at", { ascending: false })
        .limit(10)

      recentActivities = activities || []
    } catch (error) {
      console.error("Erro ao buscar atividades recentes:", error)
    }
  } catch (error) {
    console.error("Erro ao conectar com Supabase:", error)
    // Continua com valores padrão se houver erro
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard de Administração</h1>
        <p className="text-gray-600">Visão geral do sistema Mini ATS</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Empresas</CardTitle>
            <Building2 className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompanies}</div>
            <p className="text-xs text-gray-600 mt-1">Total de empresas registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Usuários</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-gray-600 mt-1">Total de usuários registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Assinaturas Ativas</CardTitle>
            <CreditCard className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptions}</div>
            <p className="text-xs text-gray-600 mt-1">Empresas com assinatura ativa</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalCompanies > 0 ? `${Math.round((activeSubscriptions / totalCompanies) * 100)}%` : "0%"}
            </div>
            <p className="text-xs text-gray-600 mt-1">Teste → Assinatura paga</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Empresas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCompanies.length > 0 ? (
                recentCompanies.map((company) => (
                  <div key={company.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{company.name}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>{company.slug}</span>
                        <span>•</span>
                        <span>{company.plan}</span>
                      </div>
                    </div>
                    <div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          company.subscription_status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {company.subscription_status === "active" ? "Ativo" : "Teste"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhuma empresa registrada ainda.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-xs">
                          {activity.company?.name?.charAt(0)?.toUpperCase() || "A"}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.company?.name || "Empresa"}</span>{" "}
                        {activity.action.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.created_at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhuma atividade registrada ainda.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
