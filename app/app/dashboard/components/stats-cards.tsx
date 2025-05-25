import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Users, UserCheck, TrendingUp } from "lucide-react"

interface StatsCardsProps {
  companyId: string
}

export async function StatsCards({ companyId }: StatsCardsProps) {
  const supabase = createServerClient()

  // Buscar estatísticas em paralelo
  const [{ count: totalJobs }, { count: totalApplications }, { count: hiredCandidates }, { count: activeJobs }] =
    await Promise.all([
      supabase.from("jobs").select("*", { count: "exact", head: true }).eq("company_id", companyId),
      supabase.from("applications").select("*", { count: "exact", head: true }).eq("company_id", companyId),
      supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("company_id", companyId)
        .eq("stage", "hired"),
      supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .eq("company_id", companyId)
        .eq("status", "published"),
    ])

  const stats = [
    {
      title: "Vagas Ativas",
      value: activeJobs || 0,
      icon: Briefcase,
      description: `${totalJobs || 0} vagas no total`,
      trend: "+12% este mês",
    },
    {
      title: "Candidaturas",
      value: totalApplications || 0,
      icon: Users,
      description: "Total de candidaturas",
      trend: "+8% esta semana",
    },
    {
      title: "Contratações",
      value: hiredCandidates || 0,
      icon: UserCheck,
      description: "Candidatos contratados",
      trend: "+2 este mês",
    },
    {
      title: "Taxa de Conversão",
      value: totalApplications ? `${Math.round(((hiredCandidates || 0) / totalApplications) * 100)}%` : "0%",
      icon: TrendingUp,
      description: "Candidaturas → Contratações",
      trend: "+5% este mês",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-gray-600 mt-1">{stat.description}</p>
            <p className="text-xs text-green-600 mt-1">{stat.trend}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
