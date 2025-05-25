import { notFound } from "next/navigation"
import Link from "next/link"
import { createServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Mail, Phone, MapPin, Linkedin, Globe, FileText, Star, Calendar } from "lucide-react"
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

interface CandidatePageProps {
  params: {
    id: string
  }
}

export default async function CandidatePage({ params }: CandidatePageProps) {
  const supabase = createServerClient()

  // Obter dados da empresa do usuário
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const { data: user } = await supabase.from("users").select("company_id").eq("email", session?.user?.email).single()

  // Buscar candidato
  const { data: candidate, error } = await supabase.from("candidates").select("*").eq("id", params.id).single()

  if (error || !candidate) {
    notFound()
  }

  // Buscar candidaturas do candidato para esta empresa
  const { data: applications } = await supabase
    .from("applications")
    .select(`
      *,
      job:jobs(title, status)
    `)
    .eq("candidate_id", params.id)
    .eq("company_id", user?.company_id)
    .order("created_at", { ascending: false })

  // Verificar se está no talent pool
  const { data: talentPoolEntry } = await supabase
    .from("talent_pool")
    .select("*")
    .eq("candidate_id", params.id)
    .eq("company_id", user?.company_id)
    .maybeSingle()

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/app/candidates">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-xl">{candidate.name?.charAt(0)?.toUpperCase() || "?"}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl">{candidate.name}</CardTitle>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      {candidate.email}
                    </div>
                    {candidate.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        {candidate.phone}
                      </div>
                    )}
                    {candidate.location && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {candidate.location}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 mt-3">
                    {candidate.linkedin_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={candidate.linkedin_url} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="h-4 w-4 mr-2" />
                          LinkedIn
                        </a>
                      </Button>
                    )}
                    {candidate.portfolio_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={candidate.portfolio_url} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-4 w-4 mr-2" />
                          Portfólio
                        </a>
                      </Button>
                    )}
                    {candidate.resume_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={candidate.resume_url} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-4 w-4 mr-2" />
                          Currículo
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Tabs defaultValue="applications" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="applications">Candidaturas ({applications?.length || 0})</TabsTrigger>
              <TabsTrigger value="notes">Notas e Atividades</TabsTrigger>
            </TabsList>

            <TabsContent value="applications" className="space-y-4">
              {applications && applications.length > 0 ? (
                applications.map((application) => (
                  <Card key={application.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            <Link href={`/app/jobs/${application.job_id}`} className="hover:text-blue-600">
                              {application.job?.title?.pt || "Vaga não encontrada"}
                            </Link>
                          </h3>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                            <span>Candidatura em {new Date(application.created_at).toLocaleDateString("pt-BR")}</span>
                            <span>
                              Última atualização{" "}
                              {formatDistanceToNow(new Date(application.updated_at), {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= (application.rating || 0)
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <Badge
                            variant="secondary"
                            className={
                              stageColors[application.stage as keyof typeof stageColors] || "bg-gray-100 text-gray-800"
                            }
                          >
                            {stageLabels[application.stage as keyof typeof stageLabels] || application.stage}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhuma candidatura encontrada para este candidato.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center py-8 text-gray-500">
                    <p>Funcionalidade de notas em desenvolvimento.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Enviar Email
              </Button>
              <Button className="w-full" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Agendar Entrevista
              </Button>
              {talentPoolEntry ? (
                <Button className="w-full" variant="outline" disabled>
                  ✓ No Banco de Talentos
                </Button>
              ) : (
                <Button className="w-full" variant="outline">
                  Adicionar ao Banco de Talentos
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações Adicionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Primeiro contato</p>
                <p className="text-sm text-gray-600">
                  {applications && applications.length > 0
                    ? new Date(applications[applications.length - 1].created_at).toLocaleDateString("pt-BR")
                    : "Não disponível"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Total de candidaturas</p>
                <p className="text-sm text-gray-600">{applications?.length || 0}</p>
              </div>
              {talentPoolEntry && (
                <div>
                  <p className="text-sm font-medium text-gray-700">No banco de talentos desde</p>
                  <p className="text-sm text-gray-600">
                    {new Date(talentPoolEntry.added_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
