import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, ArrowRight, Users, Briefcase, Building2, Globe } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">Mini ATS</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-gray-900">
                Funcionalidades
              </Link>
              <Link href="#pricing" className="text-gray-600 hover:text-gray-900">
                Preços
              </Link>
              <Link href="#testimonials" className="text-gray-600 hover:text-gray-900">
                Depoimentos
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link href="/auth/login">Entrar</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">Começar Grátis</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Recrutamento simplificado</span>
              <span className="block text-blue-600">para pequenas empresas</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Um sistema de recrutamento intuitivo e acessível, projetado especificamente para as necessidades de
              pequenas e médias empresas.
            </p>
            <div className="mt-10 flex justify-center">
              <Button size="lg" asChild>
                <Link href="/auth/signup">Comece seu teste gratuito de 14 dias</Link>
              </Button>
            </div>
            <p className="mt-3 text-sm text-gray-500">Sem necessidade de cartão de crédito</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Tudo que você precisa para recrutar melhor</h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Ferramentas simples e poderosas para todo o seu processo de recrutamento.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Gestão de Vagas</h3>
                <p className="mt-2 text-base text-gray-500">
                  Crie, publique e gerencie todas as suas vagas em um só lugar, com descrições detalhadas e requisitos
                  personalizados.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Quadro Kanban</h3>
                <p className="mt-2 text-base text-gray-500">
                  Acompanhe candidatos em cada etapa do processo com um quadro visual intuitivo de arrastar e soltar.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Página de Carreiras</h3>
                <p className="mt-2 text-base text-gray-500">
                  Sua própria página de carreiras personalizada para atrair os melhores talentos para sua empresa.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Colaboração em Equipe</h3>
                <p className="mt-2 text-base text-gray-500">
                  Convide membros da sua equipe para colaborar no processo de recrutamento com diferentes níveis de
                  acesso.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Formulários Personalizados</h3>
                <p className="mt-2 text-base text-gray-500">
                  Crie formulários de candidatura personalizados para cada vaga, coletando exatamente as informações que
                  você precisa.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Comunicação Integrada</h3>
                <p className="mt-2 text-base text-gray-500">
                  Envie emails para candidatos diretamente da plataforma, usando modelos personalizáveis para cada etapa
                  do processo.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Planos simples e transparentes</h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Escolha o plano ideal para o tamanho da sua empresa.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium text-gray-900">Starter</h3>
                <p className="mt-4">
                  <span className="text-4xl font-extrabold text-gray-900">R$29</span>
                  <span className="text-base font-medium text-gray-500">/mês</span>
                </p>
                <p className="mt-4 text-sm text-gray-500">Perfeito para pequenas empresas começando a crescer.</p>

                <ul className="mt-6 space-y-4">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="ml-3 text-base text-gray-500">5 vagas ativas</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="ml-3 text-base text-gray-500">200 candidaturas/mês</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="ml-3 text-base text-gray-500">1 usuário</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="ml-3 text-base text-gray-500">Página de carreiras básica</span>
                  </li>
                </ul>

                <Button className="mt-8 w-full" variant="outline">
                  Começar teste grátis
                </Button>
              </CardContent>
            </Card>

            <Card className="border-blue-600 shadow-lg">
              <CardContent className="p-6">
                <div className="absolute top-0 right-0 -mt-3 mr-6 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Popular
                </div>
                <h3 className="text-lg font-medium text-gray-900">Professional</h3>
                <p className="mt-4">
                  <span className="text-4xl font-extrabold text-gray-900">R$79</span>
                  <span className="text-base font-medium text-gray-500">/mês</span>
                </p>
                <p className="mt-4 text-sm text-gray-500">Ideal para empresas em crescimento com equipes maiores.</p>

                <ul className="mt-6 space-y-4">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="ml-3 text-base text-gray-500">20 vagas ativas</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="ml-3 text-base text-gray-500">1.000 candidaturas/mês</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="ml-3 text-base text-gray-500">5 usuários</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="ml-3 text-base text-gray-500">Página de carreiras personalizada</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="ml-3 text-base text-gray-500">Modelos de email</span>
                  </li>
                </ul>

                <Button className="mt-8 w-full">Começar teste grátis</Button>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium text-gray-900">Business</h3>
                <p className="mt-4">
                  <span className="text-4xl font-extrabold text-gray-900">R$199</span>
                  <span className="text-base font-medium text-gray-500">/mês</span>
                </p>
                <p className="mt-4 text-sm text-gray-500">Para empresas com necessidades avançadas de recrutamento.</p>

                <ul className="mt-6 space-y-4">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="ml-3 text-base text-gray-500">Vagas ilimitadas</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="ml-3 text-base text-gray-500">Candidaturas ilimitadas</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="ml-3 text-base text-gray-500">Usuários ilimitados</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="ml-3 text-base text-gray-500">Página de carreiras premium</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="ml-3 text-base text-gray-500">API e integrações</span>
                  </li>
                </ul>

                <Button className="mt-8 w-full" variant="outline">
                  Começar teste grátis
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-600 rounded-lg shadow-xl overflow-hidden">
            <div className="px-6 py-12 sm:px-12 lg:py-16 lg:pr-0 xl:py-20 xl:px-20">
              <div className="lg:self-center">
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                  <span className="block">Pronto para simplificar seu recrutamento?</span>
                </h2>
                <p className="mt-4 text-lg leading-6 text-blue-100">
                  Comece seu teste gratuito de 14 dias hoje e veja como o Mini ATS pode transformar seu processo de
                  contratação.
                </p>
                <Button className="mt-8 bg-white text-blue-600 hover:bg-blue-50" size="lg" asChild>
                  <Link href="/auth/signup">
                    Começar agora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">M</span>
                </div>
                <span className="ml-2 text-xl font-bold">Mini ATS</span>
              </div>
              <p className="mt-4 text-gray-300">Recrutamento simplificado para pequenas empresas.</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider">Produto</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#features" className="text-gray-300 hover:text-white">
                    Funcionalidades
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-gray-300 hover:text-white">
                    Preços
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Segurança
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider">Empresa</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Sobre nós
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Contato
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider">Legal</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Privacidade
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Termos
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-700 pt-8">
            <p className="text-gray-400 text-sm text-center">
              &copy; {new Date().getFullYear()} Mini ATS. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
