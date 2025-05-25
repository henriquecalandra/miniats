import Link from "next/link"
import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface RecentApplicationsProps {
  companyId: string
}

const stageLabels = {
  new: "Novo",
  "phone-screen": "Triagem",
  interview: "Entrevista",
  technical: "Técnico",
  offer: "Proposta",
  hired: "Contratado",
  rejected: "Rejeitado",
}

const stageColors = {
  new: "bg-blue-100 text-blue-800",
  "phone-screen": "bg-yellow-100 text-yellow-800",
  interview: "bg-purple-100 text-purple-800",
  technical: "bg-orange-100 text-orange-800",
  offer: "bg-green-100 text-green-800",
  hired: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
}

export async function RecentApplications({ companyId }: RecentApplicationsProps) {
  const supabase = createServerClient()

  const { data: applications } = await supabase
    .from("applications")
    .select(`
      *,
      candidate:candidates(*),
      job:jobs(title)
    `)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Candidaturas Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        {applications && applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((application) => (
              <div key={application.id} className="flex items-center space-x-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{application.candidate?.name?.charAt(0)?.toUpperCase() || "?"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{application.candidate?.name}</p>
                  <p className="text-sm text-gray-500 truncate">
                    {application.job?.title?.pt || "Vaga não encontrada"}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <Badge
                    variant="secondary"
                    className={
                      stageColors[application.stage as keyof typeof stageColors] || "bg-gray-100 text-gray-800"
                    }
                  >
                    {stageLabels[application.stage as keyof typeof stageLabels] || application.stage}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(application.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </div>
              </div>
            ))}
            <div className="pt-2">
              <Link href="/app/candidates" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Ver todos os candidatos →
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">Nenhuma candidatura ainda</p>
            <Link href="/app/jobs/new" className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-2 block">
              Criar sua primeira vaga →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
