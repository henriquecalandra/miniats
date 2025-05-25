"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

const jobSchema = z.object({
  title: z.string().min(2, "Título da vaga é obrigatório"),
  description: z.string().min(10, "Descrição da vaga é obrigatória"),
  location: z.string().min(2, "Localização é obrigatória"),
  remote_type: z.string().min(1, "Tipo de trabalho remoto é obrigatório"),
  employment_type: z.string().min(1, "Tipo de contratação é obrigatório"),
  department: z.string().min(1, "Departamento é obrigatório"),
})

type JobFormValues = z.infer<typeof jobSchema>

interface JobFormProps {
  onSubmit: (data: JobFormValues) => void
  onBack: () => void
}

export function JobForm({ onSubmit, onBack }: JobFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
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
      location: "",
      remote_type: "",
      employment_type: "",
      department: "",
    },
  })

  const handleFormSubmit = async (data: JobFormValues) => {
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

      // Criar a vaga
      const { error: jobError } = await supabase.from("jobs").insert({
        company_id: userData.company_id,
        title: { pt: data.title },
        description: { pt: data.description },
        location: data.location,
        remote_type: data.remote_type,
        employment_type: data.employment_type,
        department: data.department,
        status: "draft",
      })

      if (jobError) {
        throw new Error(jobError.message)
      }

      // Chamar o callback de sucesso
      onSubmit(data)
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao criar a vaga")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Título da vaga</Label>
        <Input id="title" {...register("title")} placeholder="Ex: Desenvolvedor Full Stack" />
        {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição da vaga</Label>
        <Textarea
          id="description"
          {...register("description")}
          rows={5}
          placeholder="Descreva as responsabilidades, requisitos e benefícios da vaga"
        />
        {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Localização</Label>
        <Input id="location" {...register("location")} placeholder="Ex: São Paulo, SP" />
        {errors.location && <p className="text-sm text-red-500">{errors.location.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="remote_type">Tipo de trabalho remoto</Label>
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
        <Label htmlFor="employment_type">Tipo de contratação</Label>
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
        <Label htmlFor="department">Departamento</Label>
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

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando vaga...
            </>
          ) : (
            "Continuar"
          )}
        </Button>
      </div>
    </form>
  )
}
