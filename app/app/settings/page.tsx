"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

const companySchema = z.object({
  name: z.string().min(2, "Nome da empresa é obrigatório"),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  industry: z.string().min(1, "Indústria é obrigatória"),
  size: z.string().min(1, "Tamanho da empresa é obrigatório"),
  description: z.string().optional(),
})

type CompanyFormValues = z.infer<typeof companySchema>

export default function CompanySettingsPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [company, setCompany] = useState<any>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
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
          reset({
            name: userData.company.name || "",
            website: userData.company.website || "",
            industry: userData.company.industry || "",
            size: userData.company.size || "",
            description: userData.company.settings?.career_page?.description || "",
          })
        }
      } catch (err) {
        console.error("Erro ao buscar empresa:", err)
      }
    }

    fetchCompany()
  }, [supabase, reset])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
    }
  }

  const onSubmit = async (data: CompanyFormValues) => {
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      let logoUrl = company?.logo_url

      // Upload do logo se houver
      if (logoFile) {
        const fileName = `${company.id}_${Date.now()}_${logoFile.name.replace(/\s+/g, "_")}`
        const { data: uploadData, error: uploadError } = await supabase.storage.from("logos").upload(fileName, logoFile)

        if (uploadError) {
          throw new Error("Erro ao fazer upload do logo")
        }

        const { data: urlData } = supabase.storage.from("logos").getPublicUrl(fileName)
        logoUrl = urlData.publicUrl
      }

      // Atualizar empresa
      const { error: updateError } = await supabase
        .from("companies")
        .update({
          name: data.name,
          website: data.website || null,
          industry: data.industry,
          size: data.size,
          logo_url: logoUrl,
          settings: {
            ...company.settings,
            career_page: {
              ...company.settings?.career_page,
              description: data.description,
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações da Empresa</h1>
        <p className="text-gray-600">Gerencie as informações da sua empresa</p>
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
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>Informações gerais sobre sua empresa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="logo">Logo da empresa</Label>
              <div className="flex items-center space-x-4">
                {company.logo_url && (
                  <img
                    src={company.logo_url || "/placeholder.svg"}
                    alt="Logo atual"
                    className="h-16 w-16 object-cover rounded-lg border border-gray-200"
                  />
                )}
                <div className="flex-1">
                  <input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG ou SVG (máx. 2MB)</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome da empresa *</Label>
              <Input id="name" {...register("name")} placeholder="Nome da sua empresa" />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" {...register("website")} placeholder="https://www.suaempresa.com" />
              {errors.website && <p className="text-sm text-red-500">{errors.website.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry">Indústria *</Label>
                <Select onValueChange={(value) => setValue("industry", value)} defaultValue={company.industry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a indústria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Tecnologia</SelectItem>
                    <SelectItem value="healthcare">Saúde</SelectItem>
                    <SelectItem value="education">Educação</SelectItem>
                    <SelectItem value="finance">Finanças</SelectItem>
                    <SelectItem value="retail">Varejo</SelectItem>
                    <SelectItem value="manufacturing">Manufatura</SelectItem>
                    <SelectItem value="services">Serviços</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
                {errors.industry && <p className="text-sm text-red-500">{errors.industry.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">Tamanho da empresa *</Label>
                <Select onValueChange={(value) => setValue("size", value)} defaultValue={company.size}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tamanho" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 funcionários</SelectItem>
                    <SelectItem value="11-50">11-50 funcionários</SelectItem>
                    <SelectItem value="51-200">51-200 funcionários</SelectItem>
                    <SelectItem value="201-500">201-500 funcionários</SelectItem>
                    <SelectItem value="501-1000">501-1000 funcionários</SelectItem>
                    <SelectItem value="1000+">1000+ funcionários</SelectItem>
                  </SelectContent>
                </Select>
                {errors.size && <p className="text-sm text-red-500">{errors.size.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição da empresa</Label>
              <Textarea
                id="description"
                {...register("description")}
                rows={4}
                placeholder="Descreva sua empresa, cultura e valores"
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações da Conta</CardTitle>
            <CardDescription>Detalhes da sua conta e plano</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Plano atual</Label>
                <p className="text-sm text-gray-600 capitalize">{company.plan}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Slug da empresa</Label>
                <p className="text-sm text-gray-600">{company.slug}</p>
              </div>
            </div>
            {company.trial_ends_at && (
              <div>
                <Label className="text-sm font-medium text-gray-700">Teste gratuito expira em</Label>
                <p className="text-sm text-gray-600">{new Date(company.trial_ends_at).toLocaleDateString("pt-BR")}</p>
              </div>
            )}
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
