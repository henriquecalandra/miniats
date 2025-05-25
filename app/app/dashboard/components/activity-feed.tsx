import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Briefcase, Users, UserCheck, FileText } from "lucide-react"

interface ActivityFeedProps {
  companyId: string
}

const actionIcons = {
  job_created: Briefcase,
  application_received: Users,
  candidate_hired: UserCheck,
  job_published: FileText,
}

const actionLabels = {
  job_created: "criou uma nova vaga",
  application_received: "recebeu uma candidatura",
  candidate_hired: "contratou um candidato",
  job_published: "publicou uma vaga",
}

export async function ActivityFeed({ companyId }: ActivityFeedProps) {
  const supabase = createServerClient()

  const { data: activities } = await supabase
    .from("activity_log")
    .select(`
      *,
      user:users(name, email)
    `)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(10)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent>
        {activities && activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = actionIcons[activity.action as keyof typeof actionIcons] || FileText
              const actionLabel = actionLabels[activity.action as keyof typeof actionLabels] || activity.action

              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Icon className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.user?.name || activity.user?.email || "Usuário"}</span>{" "}
                      {actionLabel}
                      {activity.metadata?.job_title && (
                        <span className="font-medium"> "{activity.metadata.job_title}"</span>
                      )}
                      {activity.metadata?.candidate_name && (
                        <span className="font-medium"> {activity.metadata.candidate_name}</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(activity.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">Nenhuma atividade recente</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
