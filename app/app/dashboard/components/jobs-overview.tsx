import Link from "next/link"
import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, MapPin, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface JobsOverviewProps {
  companyId: string
}

const statusLabels = {
  draft: "Rascunho",
  published: "Publicada",
  paused: "Pausada",
  closed: "Fechada",
}

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  published: "bg-green-100 text-green-800",
  paused: "bg-yellow-100 text-yellow-800",
  closed: "bg-red-100 text-red-800",
}

export async function JobsOverview({ companyId }: JobsOverviewProps) {
  const supabase = createServerClient()

  const { data: jobs } = await supabase
    .from("jobs")
    .select(`
      *,
      applications(count)
    `)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Vagas Recentes</CardTitle>
        <Button asChild size="sm">
          <Link href="/app/jobs/new">
            <Plus className="h-4 w-4 mr-2" />
            Nova Vaga
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {jobs && jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      <Link href={`/app/jobs/${job.id}`} className="hover:text-blue-600">
                        {job.title?.pt || "Título não definido"}
                      </Link>
                    </h3>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location || "Localização não definida"}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDistanceToNow(new Date(job.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge
                      variant="secondary"
                      className={statusColors[job.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}
                    >
                      {statusLabels[job.status as keyof typeof statusLabels] || job.status}
                    </Badge>
                    <span className="text-xs text-gray-500">{job.applications?.[0]?.count || 0} candidaturas</span>
                  </div>
                </div>
              </div>
            ))}
            <div className="pt-2">
              <Link href="/app/jobs" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Ver todas as vagas →
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">Nenhuma vaga criada ainda</p>
            <Button asChild>
              <Link href="/app/jobs/new">
                <Plus className="h-4 w-4 mr-2" />
                Criar primeira vaga
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
