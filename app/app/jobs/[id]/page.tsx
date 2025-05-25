import { Suspense } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Edit, MapPin, Clock, Users, Building, Briefcase, DollarSign } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { KanbanBoard } from "./components/kanban-board"
import { JobDetails } from "./components/job-details"

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

const remoteTypeLabels = {
  "on-site": "Presencial",
  hybrid: "Híbrido",
  remote: "Remoto",
}

const employmentTypeLabels = {
  "full-time": "Tempo integral",
  "part-time": "Meio período",
  contract: "Contrato",
  temporary: "Temporário",
  internship: "Estágio",
}

interface JobPageProps {
  params: {
    id: string
  }
}

export default async function JobPage({ params }: JobPageProps) {
  const supabase = createServerClient()

  // Obter dados da vaga
  const { data: job, error } = await supabase
    .from("jobs")
    .select(`
      *,
      company:companies(name, industry, size),
      applications(count)
    `)
    .eq("id", params.id)
    .single()

  if (error || !job) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-gray-900">{job.title?.pt || "Título não definido"}</h1>
            <Badge
              variant="secondary"
              className={statusColors[job.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}
            >
              {statusLabels[job.status as keyof typeof statusLabels] || job.status}
            </Badge>
          </div>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
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
        <Button asChild>
          <Link href={`/app/jobs/${params.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Editar Vaga
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="candidates" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="candidates">Candidatos</TabsTrigger>
              <TabsTrigger value="details">Detalhes da Vaga</TabsTrigger>
            </TabsList>

            <TabsContent value="candidates" className="space-y-6">
              <Suspense fallback={<div className="h-96 bg-gray-100 rounded-lg animate-pulse" />}>
                <KanbanBoard jobId={params.id} />
              </Suspense>
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                <JobDetails job={job} />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Vaga</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Building className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Empresa</p>
                  <p className="text-sm text-gray-600">{job.company?.name || "Não definido"}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Briefcase className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Tipo de Trabalho</p>
                  <p className="text-sm text-gray-600">
                    {remoteTypeLabels[job.remote_type as keyof typeof remoteTypeLabels] ||
                      job.remote_type ||
                      "Não definido"}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Tipo de Contratação</p>
                  <p className="text-sm text-gray-600">
                    {employmentTypeLabels[job.employment_type as keyof typeof employmentTypeLabels] ||
                      job.employment_type ||
                      "Não definido"}
                  </p>
                </div>
              </div>

              {(job.salary_min || job.salary_max) && (
                <div className="flex items-start space-x-3">
                  <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Faixa Salarial</p>
                    <p className="text-sm text-gray-600">
                      {job.salary_min && job.salary_max
                        ? `${job.salary_min.toLocaleString("pt-BR")} - ${job.salary_max.toLocaleString("pt-BR")} ${
                            job.salary_currency
                          }`
                        : job.salary_min
                          ? `A partir de ${job.salary_min.toLocaleString("pt-BR")} ${job.salary_currency}`
                          : job.salary_max
                            ? `Até ${job.salary_max.toLocaleString("pt-BR")} ${job.salary_currency}`
                            : "Não definido"}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" variant={job.status === "published" ? "outline" : "default"}>
                {job.status === "published" ? "Pausar Vaga" : "Publicar Vaga"}
              </Button>
              <Button className="w-full" variant="outline">
                Compartilhar Vaga
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <Link href={`/careers/${job.company_id}/${params.id}`} target="_blank">
                  Visualizar Página Pública
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
