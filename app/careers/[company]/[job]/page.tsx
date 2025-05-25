import { notFound } from "next/navigation"
import Link from "next/link"
import { createServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import { ApplicationForm } from "./components/application-form"

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
    company: string
    job: string
  }
}

export default async function JobPage({ params }: JobPageProps) {
  const supabase = createServerClient()

  // Buscar a empresa pelo slug
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("*")
    .eq("slug", params.company)
    .single()

  if (companyError || !company) {
    notFound()
  }

  // Buscar a vaga pelo ID
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", params.job)
    .eq("company_id", company.id)
    .eq("status", "published")
    .single()

  if (jobError || !job) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center mb-4">
            <Link
              href={`/careers/${params.company}`}
              className="text-white hover:text-blue-100 flex items-center transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar para vagas
            </Link>
          </div>
          <h1 className="text-3xl font-bold">{job.title?.pt || "Título não definido"}</h1>
          <div className="mt-4 flex flex-wrap gap-4">
            <Badge className="bg-white text-blue-600">{job.location || "Localização não definida"}</Badge>
            <Badge className="bg-white text-blue-600">
              {remoteTypeLabels[job.remote_type as keyof typeof remoteTypeLabels] ||
                job.remote_type ||
                "Tipo não definido"}
            </Badge>
            <Badge className="bg-white text-blue-600">
              {employmentTypeLabels[job.employment_type as keyof typeof employmentTypeLabels] ||
                job.employment_type ||
                "Contratação não definida"}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Descrição da Vaga</h2>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-line">{job.description?.pt || "Sem descrição"}</p>
                </div>
              </CardContent>
            </Card>

            {job.requirements?.pt && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Requisitos</h2>
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-line">{job.requirements.pt}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {job.benefits?.pt && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Benefícios</h2>
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-line">{job.benefits.pt}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <div className="sticky top-8 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Sobre a Empresa</h2>
                  <div className="mb-4">
                    {company.logo_url ? (
                      <img
                        src={company.logo_url || "/placeholder.svg"}
                        alt={company.name}
                        className="h-12 w-auto mb-4 rounded-lg bg-white p-1 border border-gray-200"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <span className="text-blue-600 font-bold text-xl">{company.name.charAt(0)}</span>
                      </div>
                    )}
                    <h3 className="text-lg font-medium">{company.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{company.industry}</p>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    {company.settings?.career_page?.description ||
                      "Empresa inovadora buscando talentos para fazer parte do nosso time."}
                  </p>
                  {company.website && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={company.website} target="_blank" rel="noopener noreferrer">
                        Visitar Site
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Candidatar-se</h2>
                  <ApplicationForm company={company} job={job} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600">
            © {new Date().getFullYear()} {company.name}. Todos os direitos reservados.
          </p>
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 mt-2 inline-block"
            >
              Visite nosso site
            </a>
          )}
        </div>
      </footer>
    </div>
  )
}
