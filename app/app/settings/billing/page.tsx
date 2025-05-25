"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { PLANS, formatCurrency } from "@/lib/stripe"
import { CheckCircle, AlertCircle, CreditCard, Clock, ArrowRight, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function BillingPage() {
  const [loading, setLoading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [company, setCompany] = useState<any>(null)
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("month")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const success = searchParams.get("success")
  const canceled = searchParams.get("canceled")

  useEffect(() => {
    async function fetchCompany() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        const { data: userData } = await supabase
          .from("users")
          .select("company_id, company:companies(*)")
          .eq("email", user.email)
          .single()

        if (userData?.company) {
          setCompany(userData.company)
        }
      } catch (err) {
        console.error("Erro ao buscar empresa:", err)
      }
    }

    fetchCompany()
  }, [supabase])

  const handleCheckout = async (planId: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId,
          interval: billingInterval,
          companyId: company.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar sessão de checkout")
      }

      // Redirecionar para o checkout do Stripe
      router.push(data.url)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCustomerPortal = async () => {
    setPortalLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyId: company.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao acessar o portal de clientes")
      }

      // Redirecionar para o portal de clientes do Stripe
      router.push(data.url)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setPortalLoading(false)
    }
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const isSubscribed = company.subscription_status === "active" || company.subscription_status === "trialing"
  const currentPlan = Object.values(PLANS).find((plan) => plan.id === company.plan) || PLANS.STARTER
  const isOnTrial = Boolean(company.trial_ends_at && new Date(company.trial_ends_at) > new Date())

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cobrança</h1>
        <p className="text-gray-600">Gerencie seu plano e informações de pagamento</p>
      </div>

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Assinatura realizada com sucesso!</AlertTitle>
          <AlertDescription className="text-green-700">
            Sua assinatura foi ativada. Você agora tem acesso a todos os recursos do plano selecionado.
          </AlertDescription>
        </Alert>
      )}

      {canceled && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Checkout cancelado</AlertTitle>
          <AlertDescription className="text-yellow-700">
            O processo de checkout foi cancelado. Você pode tentar novamente quando quiser.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Plano Atual</CardTitle>
          <CardDescription>Detalhes do seu plano e assinatura</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">
                Plano {currentPlan.name}{" "}
                {isOnTrial && (
                  <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700">
                    Período de Teste
                  </Badge>
                )}
                {company.subscription_status === "active" && (
                  <Badge variant="outline" className="ml-2 bg-green-50 text-green-700">
                    Ativo
                  </Badge>
                )}
                {company.subscription_status === "canceled" && (
                  <Badge variant="outline" className="ml-2 bg-red-50 text-red-700">
                    Cancelado
                  </Badge>
                )}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {isOnTrial
                  ? `Período de teste termina em ${format(new Date(company.trial_ends_at), "dd 'de' MMMM 'de' yyyy", {
                      locale: ptBR,
                    })}`
                  : company.subscription_status === "active"
                    ? "Sua assinatura está ativa"
                    : "Você não tem uma assinatura ativa"}
              </p>
            </div>
            {(isOnTrial || company.subscription_status === "canceled") && (
              <Button onClick={() => handleCheckout(currentPlan.id)} disabled={loading}>
                {loading ? "Processando..." : "Fazer Upgrade"}
              </Button>
            )}
            {company.subscription_status === "active" && (
              <Button variant="outline" onClick={handleCustomerPortal} disabled={portalLoading}>
                {portalLoading ? "Processando..." : "Gerenciar Assinatura"}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="border rounded-lg p-4">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium">Método de Pagamento</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {company.stripe_customer_id ? "Cartão de crédito" : "Nenhum método de pagamento"}
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium">Ciclo de Cobrança</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {company.stripe_subscription_id ? "Mensal" : "Não aplicável"}
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium">Limites do Plano</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {currentPlan.limits.jobs === -1 ? "Vagas ilimitadas" : `${currentPlan.limits.jobs} vagas ativas`},{" "}
                {currentPlan.limits.users === -1 ? "usuários ilimitados" : `${currentPlan.limits.users} usuários`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Planos Disponíveis</h2>

        <Tabs
          defaultValue="month"
          value={billingInterval}
          onValueChange={(value) => setBillingInterval(value as "month" | "year")}
          className="w-full"
        >
          <div className="flex justify-end mb-4">
            <TabsList>
              <TabsTrigger value="month">Mensal</TabsTrigger>
              <TabsTrigger value="year">Anual (10% de desconto)</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="month" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {Object.values(PLANS).map((plan) => (
                <Card
                  key={plan.id}
                  className={`${plan.is_popular ? "border-blue-600 shadow-lg" : "border-gray-200"} relative`}
                >
                  {plan.is_popular && (
                    <div className="absolute top-0 right-0 -mt-3 mr-6 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Popular
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-3xl font-bold">{formatCurrency(plan.price_monthly)}</span>
                      <span className="text-gray-500 ml-2">/mês</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className={`w-full ${plan.is_popular ? "" : "bg-gray-800 hover:bg-gray-700"}`}
                      onClick={() => handleCheckout(plan.id)}
                      disabled={loading || (isSubscribed && company.plan === plan.id)}
                    >
                      {loading
                        ? "Processando..."
                        : isSubscribed && company.plan === plan.id
                          ? "Plano Atual"
                          : "Selecionar Plano"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="year" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {Object.values(PLANS).map((plan) => (
                <Card
                  key={plan.id}
                  className={`${plan.is_popular ? "border-blue-600 shadow-lg" : "border-gray-200"} relative`}
                >
                  {plan.is_popular && (
                    <div className="absolute top-0 right-0 -mt-3 mr-6 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Popular
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-3xl font-bold">{formatCurrency(plan.price_yearly / 12)}</span>
                      <span className="text-gray-500 ml-2">/mês</span>
                      <p className="text-sm text-gray-500 mt-1">
                        Faturado anualmente como {formatCurrency(plan.price_yearly)}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className={`w-full ${plan.is_popular ? "" : "bg-gray-800 hover:bg-gray-700"}`}
                      onClick={() => handleCheckout(plan.id)}
                      disabled={loading || (isSubscribed && company.plan === plan.id)}
                    >
                      {loading
                        ? "Processando..."
                        : isSubscribed && company.plan === plan.id
                          ? "Plano Atual"
                          : "Selecionar Plano"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Histórico de Faturas</CardTitle>
          <CardDescription>Visualize e baixe suas faturas anteriores</CardDescription>
        </CardHeader>
        <CardContent>
          {company.stripe_customer_id ? (
            <Button variant="outline" onClick={handleCustomerPortal} disabled={portalLoading}>
              {portalLoading ? "Processando..." : "Ver Histórico de Faturas"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <p className="text-gray-600">Você ainda não tem faturas disponíveis.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
