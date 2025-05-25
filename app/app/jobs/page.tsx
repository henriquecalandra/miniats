import Link from "next/link"
import { createServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Search, Filter, MapPin, Clock, Users } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

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

export default async function JobsPage() {
  const supabase = createServerClient()

  // Obter dados da empresa do usuário
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const { data: user } = await supabase.from("users").select("company_id").eq("email", session?.user?.email).single()

  // Buscar todas as vagas da empresa
  const { data: jobs } = await supabase
    .from("jobs")
    .select(`
      *,
      applications(count)
    `)
    .eq("company_id", user?.company_id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vagas</h1>
          <p className="text-gray-600">Gerencie suas vagas de emprego</p>
        </div>
        <Button asChild>
          <Link href="/app/jobs/new">
            <Plus className="h-4 w-4 mr-2" />
            Nova Vaga
          </Link>
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="search"
            placeholder="Buscar vagas..."
            className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {jobs && jobs.length > 0 ? (
          jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        <Link href={`/app/jobs/${job.id}`} className="hover:text-blue-600">
                          {job.title?.pt || "Título não definido"}
                        </Link>
                      </h3>
                      <Badge
                        variant="secondary"
                        className={statusColors[job.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}
                      >
                        {statusLabels[job.status as keyof typeof statusLabels] || job.status}
                      </Badge>
                    </div>
                    <div className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {job.description?.pt || "Sem descrição"}
                    </div>
                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
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
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {job.applications?.[0]?.count || 0} candidatos
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/app/jobs/${job.id}/edit`}>Editar</Link>
                    </Button>
                    <Button variant="default" size="sm" asChild>
                      <Link href={`/app/jobs/${job.id}`}>Ver Candidatos</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma vaga encontrada</h3>
            <p className="text-gray-600 mb-6">Comece criando sua primeira vaga de emprego</p>
            <Button asChild>
              <Link href="/app/jobs/new">
                <Plus className="h-4 w-4 mr-2" />
                Criar Vaga
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
