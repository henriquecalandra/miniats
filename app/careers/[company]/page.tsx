import { notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Briefcase, Building } from "lucide-react"
import Link from "next/link"

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

interface CareerPageProps {
  params: {
    company: string
  }
}

export default async function CareerPage({ params }: CareerPageProps) {
  const supabase = createServerClient()

  // Buscar a empresa pelo slug
  const { data: company, error } = await supabase.from("companies").select("*").eq("slug", params.company).single()

  if (error || !company) {
    notFound()
  }

  // Buscar vagas publicadas da empresa
  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("company_id", company.id)
    .eq("status", "published")
    .order("created_at", { ascending: false })

  // Agrupar vagas por departamento
  const jobsByDepartment: Record<string, any[]> = {}
  jobs?.forEach((job) => {
    const department = job.department || "other"
    if (!jobsByDepartment[department]) {
      jobsByDepartment[department] = []
    }
    jobsByDepartment[department].push(job)
  })

  const departmentLabels: Record<string, string> = {
    engineering: "Engenharia",
    product: "Produto",
    design: "Design",
    marketing: "Marketing",
    sales: "Vendas",
    "customer-support": "Suporte ao Cliente",
    hr: "Recursos Humanos",
    finance: "Finanças",
    operations: "Operações",
    other: "Outros Departamentos",
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 text-center">
          <div className="mb-4">
            {company.logo_url ? (
              <img
                src={company.logo_url || "/placeholder.svg"}
                alt={company.name}
                className="h-16 w-auto mx-auto mb-4 rounded-lg bg-white p-2"
              />
            ) : (
              <div className="h-16 w-16 bg-white rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-2xl">{company.name.charAt(0)}</span>
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold">
            {company.settings?.career_page?.headline || `Carreiras na ${company.name}`}
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl">
            {company.settings?.career_page?.description ||
              "Junte-se à nossa equipe e faça parte de algo especial. Confira nossas vagas abertas."}
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar vagas..."
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select className="rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Todos os departamentos</option>
            {Object.keys(jobsByDepartment).map((dept) => (
              <option key={dept} value={dept}>
                {departmentLabels[dept] || dept}
              </option>
            ))}
          </select>
          <select className="rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Todas as localizações</option>
            {jobs
              ?.map((job) => job.location)
              .filter((location, index, self) => location && self.indexOf(location) === index)
              .map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
          </select>
          <select className="rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Todos os tipos</option>
            <option value="remote">Remoto</option>
            <option value="hybrid">Híbrido</option>
            <option value="on-site">Presencial</option>
          </select>
        </div>

        {/* Job listings by department */}
        <div className="space-y-12">
          {Object.keys(jobsByDepartment).length > 0 ? (
            Object.keys(jobsByDepartment).map((department) => (
              <div key={department}>
                <h2 className="text-2xl font-bold mb-6">{departmentLabels[department] || department}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {jobsByDepartment[department].map((job) => (
                    <Card key={job.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          <Link
                            href={`/careers/${params.company}/${job.id}`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {job.title?.pt || "Título não definido"}
                          </Link>
                        </h3>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="h-4 w-4 mr-1" />
                            {job.location || "Localização não definida"}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Briefcase className="h-4 w-4 mr-1" />
                            {remoteTypeLabels[job.remote_type as keyof typeof remoteTypeLabels] ||
                              job.remote_type ||
                              "Tipo não definido"}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Building className="h-4 w-4 mr-1" />
                            {employmentTypeLabels[job.employment_type as keyof typeof employmentTypeLabels] ||
                              job.employment_type ||
                              "Contratação não definida"}
                          </div>
                          {(job.salary_min || job.salary_max) && (
                            <div className="flex items-center text-sm text-gray-500">
                              <span className="font-medium">Salário:</span>
                              <span className="ml-1">
                                {job.salary_min && job.salary_max
                                  ? `${job.salary_min.toLocaleString("pt-BR")} - ${job.salary_max.toLocaleString(
                                      "pt-BR",
                                    )} ${job.salary_currency}`
                                  : job.salary_min
                                    ? `A partir de ${job.salary_min.toLocaleString("pt-BR")} ${job.salary_currency}`
                                    : job.salary_max
                                      ? `Até ${job.salary_max.toLocaleString("pt-BR")} ${job.salary_currency}`
                                      : "Não definido"}
                              </span>
                            </div>
                          )}
                        </div>
                        <Button asChild className="w-full">
                          <Link href={`/careers/${params.company}/${job.id}`}>Ver Vaga</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma vaga disponível no momento</h3>
              <p className="text-gray-600">
                Não há vagas abertas atualmente. Por favor, volte mais tarde ou entre em contato conosco.
              </p>
            </div>
          )}
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
