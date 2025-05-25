import { Suspense } from "react"
import Link from "next/link"
import { createServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, Plus, Star, MapPin, Calendar } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

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

export default async function CandidatesPage() {
  const supabase = createServerClient()

  // Obter dados da empresa do usuário
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const { data: user } = await supabase.from("users").select("company_id").eq("email", session?.user?.email).single()

  // Buscar todas as candidaturas da empresa
  const { data: applications } = await supabase
    .from("applications")
    .select(`
      *,
      candidate:candidates(*),
      job:jobs(title)
    `)
    .eq("company_id", user?.company_id)
    .order("updated_at", { ascending: false })

  // Buscar candidatos no talent pool
  const { data: talentPool } = await supabase
    .from("talent_pool")
    .select(`
      *,
      candidate:candidates(*)
    `)
    .eq("company_id", user?.company_id)
    .order("added_at", { ascending: false })

  // Agrupar candidatos por estágio
  const candidatesByStage: Record<string, any[]> = {}
  Object.keys(stageLabels).forEach((stage) => {
    candidatesByStage[stage] = []
  })

  applications?.forEach((application) => {
    if (candidatesByStage[application.stage]) {
      candidatesByStage[application.stage].push(application)
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidatos</h1>
          <p className="text-gray-600">Gerencie todos os seus candidatos e banco de talentos</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Candidato
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="search"
            placeholder="Buscar candidatos..."
            className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Todos ({applications?.length || 0})</TabsTrigger>
          <TabsTrigger value="active">
            Ativos (
            {candidatesByStage.new?.length +
              candidatesByStage["phone-screen"]?.length +
              candidatesByStage.interview?.length +
              candidatesByStage.technical?.length +
              candidatesByStage.offer?.length || 0}
            )
          </TabsTrigger>
          <TabsTrigger value="hired">Contratados ({candidatesByStage.hired?.length || 0})</TabsTrigger>
          <TabsTrigger value="talent-pool">Banco de Talentos ({talentPool?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Suspense fallback={<div>Carregando...</div>}>
            <CandidatesList candidates={applications || []} />
          </Suspense>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <Suspense fallback={<div>Carregando...</div>}>
            <CandidatesList
              candidates={
                applications?.filter((app) =>
                  ["new", "phone-screen", "interview", "technical", "offer"].includes(app.stage),
                ) || []
              }
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="hired" className="space-y-4">
          <Suspense fallback={<div>Carregando...</div>}>
            <CandidatesList candidates={candidatesByStage.hired || []} />
          </Suspense>
        </TabsContent>

        <TabsContent value="talent-pool" className="space-y-4">
          <Suspense fallback={<div>Carregando...</div>}>
            <TalentPoolList candidates={talentPool || []} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function CandidatesList({ candidates }: { candidates: any[] }) {
  if (candidates.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum candidato encontrado</h3>
        <p className="text-gray-600">Quando você receber candidaturas, elas aparecerão aqui.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {candidates.map((application) => (
        <Card key={application.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback>{application.candidate?.name?.charAt(0)?.toUpperCase() || "?"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">
                  <Link href={`/app/candidates/${application.candidate?.id}`} className="hover:text-blue-600">
                    {application.candidate?.name || "Candidato"}
                  </Link>
                </h3>
                <p className="text-sm text-gray-500 truncate">{application.candidate?.email}</p>
                <div className="flex items-center mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= (application.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <Badge
                  variant="secondary"
                  className={stageColors[application.stage as keyof typeof stageColors] || "bg-gray-100 text-gray-800"}
                >
                  {stageLabels[application.stage as keyof typeof stageLabels] || application.stage}
                </Badge>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(application.updated_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </div>

              <p className="text-sm text-gray-600 truncate">{application.job?.title?.pt || "Vaga não encontrada"}</p>

              {application.candidate?.location && (
                <div className="flex items-center text-xs text-gray-500">
                  <MapPin className="h-3 w-3 mr-1" />
                  {application.candidate.location}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function TalentPoolList({ candidates }: { candidates: any[] }) {
  if (candidates.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Banco de talentos vazio</h3>
        <p className="text-gray-600">
          Adicione candidatos interessantes ao seu banco de talentos para futuras oportunidades.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {candidates.map((talent) => (
        <Card key={talent.candidate.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback>{talent.candidate?.name?.charAt(0)?.toUpperCase() || "?"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">
                  <Link href={`/app/candidates/${talent.candidate?.id}`} className="hover:text-blue-600">
                    {talent.candidate?.name || "Candidato"}
                  </Link>
                </h3>
                <p className="text-sm text-gray-500 truncate">{talent.candidate?.email}</p>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              {talent.tags && talent.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {talent.tags.slice(0, 3).map((tag: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {talent.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{talent.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {talent.candidate?.location && (
                <div className="flex items-center text-xs text-gray-500">
                  <MapPin className="h-3 w-3 mr-1" />
                  {talent.candidate.location}
                </div>
              )}

              <div className="flex items-center text-xs text-gray-500">
                <Calendar className="h-3 w-3 mr-1" />
                Adicionado{" "}
                {formatDistanceToNow(new Date(talent.added_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
