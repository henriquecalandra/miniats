"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { Loader2, ExternalLink } from "lucide-react"
import Link from "next/link"

const careerPageSchema = z.object({
  headline: z.string().min(2, "Título é obrigatório"),
  description: z.string().min(10, "Descrição é obrigatória"),
  custom_css: z.string().optional(),
  show_salary: z.boolean().default(true),
  show_company_info: z.boolean().default(true),
})

type CareerPageFormValues = z.infer<typeof careerPageSchema>

export default function CareerPageSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [company, setCompany] = useState<any>(null)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<CareerPageFormValues>({
    resolver: zodResolver(careerPageSchema),
  })

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
          const careerPageSettings = userData.company.settings?.career_page || {}
          reset({
            headline: careerPageSettings.headline || `Carreiras na ${userData.company.name}`,
            description: careerPageSettings.description || "",
            custom_css: careerPageSettings.custom_css || "",
            show_salary: careerPageSettings.show_salary !== false,
            show_company_info: careerPageSettings.show_company_info !== false,
          })
        }
      } catch (err) {
        console.error("Erro ao buscar empresa:", err)
      }
    }

    fetchCompany()
  }, [supabase, reset])

  const onSubmit = async (data: CareerPageFormValues) => {
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const { error: updateError } = await supabase
        .from("companies")
        .update({
          settings: {
            ...company.settings,
            career_page: {
              ...company.settings?.career_page,
              headline: data.headline,
              description: data.description,
              custom_css: data.custom_css,
              show_salary: data.show_salary,
              show_company_info: data.show_company_info,
            },
          },
        })
        .eq("id", company.id)

      if (updateError) {
        throw new Error(updateError.message)
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao salvar as configurações")
    } finally {
      setLoading(false)
    }
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Página de Carreiras</h1>
          <p className="text-gray-600">Personalize sua página pública de carreiras</p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/careers/${company.slug}`} target="_blank">
            <ExternalLink className="h-4 w-4 mr-2" />
            Visualizar Página
          </Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">Configurações salvas com sucesso!</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Conteúdo da Página</CardTitle>
            <CardDescription>Configure o conteúdo principal da sua página de carreiras</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="headline">Título principal *</Label>
              <Input id="headline" {...register("headline")} placeholder="Ex: Junte-se à nossa equipe" />
              {errors.headline && <p className="text-sm text-red-500">{errors.headline.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição da empresa *</Label>
              <Textarea
                id="description"
                {...register("description")}
                rows={5}
                placeholder="Descreva sua empresa, cultura e valores para atrair candidatos"
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configurações de Exibição</CardTitle>
            <CardDescription>Configure o que será mostrado nas vagas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="show_salary"
                {...register("show_salary")}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="show_salary">Mostrar faixa salarial nas vagas</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="show_company_info"
                {...register("show_company_info")}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="show_company_info">Mostrar informações da empresa</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personalização Avançada</CardTitle>
            <CardDescription>CSS customizado para personalizar ainda mais sua página</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="custom_css">CSS Customizado</Label>
              <Textarea
                id="custom_css"
                {...register("custom_css")}
                rows={8}
                placeholder="/* Adicione seu CSS customizado aqui */
.career-page {
  /* Seus estilos */
}"
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                Use CSS para personalizar cores, fontes e layout da sua página de carreiras.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>URL da Página</CardTitle>
            <CardDescription>Sua página de carreiras está disponível no seguinte endereço</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-3 rounded-md">
              <code className="text-sm text-gray-700">https://{company.slug}.miniats.com/careers</code>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Configurações"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
