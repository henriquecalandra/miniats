"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

const jobSchema = z.object({
  title: z.string().min(2, "Título da vaga é obrigatório"),
  description: z.string().min(10, "Descrição da vaga é obrigatória"),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
  location: z.string().min(2, "Localização é obrigatória"),
  remote_type: z.string().min(1, "Tipo de trabalho remoto é obrigatório"),
  employment_type: z.string().min(1, "Tipo de contratação é obrigatório"),
  department: z.string().min(1, "Departamento é obrigatório"),
  salary_min: z.string().optional(),
  salary_max: z.string().optional(),
  salary_currency: z.string().default("BRL"),
  status: z.string().default("draft"),
})

type JobFormValues = z.infer<typeof jobSchema>

export default function NewJobPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      description: "",
      requirements: "",
      benefits: "",
      location: "",
      remote_type: "",
      employment_type: "",
      department: "",
      salary_min: "",
      salary_max: "",
      salary_currency: "BRL",
      status: "draft",
    },
  })

  const onSubmit = async (data: JobFormValues, status: "draft" | "published") => {
    setLoading(true)
    setError("")

    try {
      // Obter o usuário atual
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Usuário não autenticado")
      }

      // Obter a empresa do usuário
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("company_id")
        .eq("email", user.email)
        .single()

      if (userError) {
        throw new Error("Erro ao obter informações do usuário")
      }

      // Preparar dados da vaga
      const jobData = {
        company_id: userData.company_id,
        title: { pt: data.title },
        description: { pt: data.description },
        requirements: data.requirements ? { pt: data.requirements } : null,
        benefits: data.benefits ? { pt: data.benefits } : null,
        location: data.location,
        remote_type: data.remote_type,
        employment_type: data.employment_type,
        department: data.department,
        salary_min: data.salary_min ? Number.parseInt(data.salary_min) : null,
        salary_max: data.salary_max ? Number.parseInt(data.salary_max) : null,
        salary_currency: data.salary_currency,
        status: status,
        published_at: status === "published" ? new Date().toISOString() : null,
      }

      // Criar a vaga
      const { data: job, error: jobError } = await supabase.from("jobs").insert(jobData).select().single()

      if (jobError) {
        throw new Error(jobError.message)
      }

      // Registrar atividade
      await supabase.from("activity_log").insert({
        company_id: userData.company_id,
        user_id: user.id,
        entity_type: "job",
        entity_id: job.id,
        action: status === "published" ? "job_published" : "job_created",
        metadata: {
          job_title: data.title,
        },
      })

      // Redirecionar para a página da vaga
      router.push(`/app/jobs/${job.id}`)
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao criar a vaga")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nova Vaga</h1>
        <p className="text-gray-600">Crie uma nova vaga de emprego</p>
      </div>

      <form onSubmit={handleSubmit((data) => onSubmit(data, "draft"))}>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="salary">Salário</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>Defina as informações principais da vaga</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Título da vaga *</Label>
                  <Input id="title" {...register("title")} placeholder="Ex: Desenvolvedor Full Stack" />
                  {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição da vaga *</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    rows={5}
                    placeholder="Descreva as responsabilidades e o dia a dia da vaga"
                  />
                  {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Localização *</Label>
                  <Input id="location" {...register("location")} placeholder="Ex: São Paulo, SP" />
                  {errors.location && <p className="text-sm text-red-500">{errors.location.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Departamento *</Label>
                  <Select onValueChange={(value) => setValue("department", value)} defaultValue="">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engineering">Engenharia</SelectItem>
                      <SelectItem value="product">Produto</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="sales">Vendas</SelectItem>
                      <SelectItem value="customer-support">Suporte ao Cliente</SelectItem>
                      <SelectItem value="hr">Recursos Humanos</SelectItem>
                      <SelectItem value="finance">Finanças</SelectItem>
                      <SelectItem value="operations">Operações</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.department && <p className="text-sm text-red-500">{errors.department.message}</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detalhes da Vaga</CardTitle>
                <CardDescription>Adicione mais informações sobre a vaga</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="remote_type">Tipo de trabalho remoto *</Label>
                  <Select onValueChange={(value) => setValue("remote_type", value)} defaultValue="">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de trabalho remoto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="on-site">Presencial</SelectItem>
                      <SelectItem value="hybrid">Híbrido</SelectItem>
                      <SelectItem value="remote">Totalmente remoto</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.remote_type && <p className="text-sm text-red-500">{errors.remote_type.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employment_type">Tipo de contratação *</Label>
                  <Select onValueChange={(value) => setValue("employment_type", value)} defaultValue="">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de contratação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Tempo integral</SelectItem>
                      <SelectItem value="part-time">Meio período</SelectItem>
                      <SelectItem value="contract">Contrato</SelectItem>
                      <SelectItem value="temporary">Temporário</SelectItem>
                      <SelectItem value="internship">Estágio</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.employment_type && <p className="text-sm text-red-500">{errors.employment_type.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Requisitos</Label>
                  <Textarea
                    id="requirements"
                    {...register("requirements")}
                    rows={5}
                    placeholder="Liste os requisitos e qualificações necessárias"
                  />
                  {errors.requirements && <p className="text-sm text-red-500">{errors.requirements.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="benefits">Benefícios</Label>
                  <Textarea
                    id="benefits"
                    {...register("benefits")}
                    rows={5}
                    placeholder="Liste os benefícios oferecidos"
                  />
                  {errors.benefits && <p className="text-sm text-red-500">{errors.benefits.message}</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="salary" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações de Salário</CardTitle>
                <CardDescription>Defina a faixa salarial para esta vaga</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salary_min">Salário Mínimo</Label>
                    <Input id="salary_min" {...register("salary_min")} type="number" placeholder="Ex: 3000" min="0" />
                    {errors.salary_min && <p className="text-sm text-red-500">{errors.salary_min.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salary_max">Salário Máximo</Label>
                    <Input id="salary_max" {...register("salary_max")} type="number" placeholder="Ex: 5000" min="0" />
                    {errors.salary_max && <p className="text-sm text-red-500">{errors.salary_max.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary_currency">Moeda</Label>
                  <Select
                    onValueChange={(value) => setValue("salary_currency", value)}
                    defaultValue={z.string().default("BRL").parse(undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a moeda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRL">Real (BRL)</SelectItem>
                      <SelectItem value="USD">Dólar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.salary_currency && <p className="text-sm text-red-500">{errors.salary_currency.message}</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-4 mt-6">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit((data) => onSubmit(data, "published"))}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Publicar Vaga"
            )}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar como Rascunho"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
