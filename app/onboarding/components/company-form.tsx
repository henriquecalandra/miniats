"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

const companySchema = z.object({
  name: z.string().min(2, "Nome da empresa é obrigatório"),
  slug: z
    .string()
    .min(2, "Slug é obrigatório")
    .regex(/^[a-z0-9-]+$/, "Apenas letras minúsculas, números e hífens"),
  industry: z.string().min(1, "Indústria é obrigatória"),
  size: z.string().min(1, "Tamanho da empresa é obrigatório"),
})

type CompanyFormValues = z.infer<typeof companySchema>

interface CompanyFormProps {
  onSubmit: (data: CompanyFormValues) => void
}

export function CompanyForm({ onSubmit }: CompanyFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      slug: "",
      industry: "",
      size: "",
    },
  })

  const companyName = watch("name")

  // Gera o slug a partir do nome da empresa
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setValue("name", name)
    setValue("slug", generateSlug(name))
  }

  const handleFormSubmit = async (data: CompanyFormValues) => {
    setLoading(true)
    setError("")

    try {
      // Verifica se o slug já existe
      const { data: existingCompany, error: slugCheckError } = await supabase
        .from("companies")
        .select("id")
        .eq("slug", data.slug)
        .single()

      if (slugCheckError && slugCheckError.code !== "PGRST116") {
        throw new Error("Erro ao verificar disponibilidade do slug")
      }

      if (existingCompany) {
        setError("Este slug já está em uso. Por favor, escolha outro.")
        setLoading(false)
        return
      }

      // Obter o usuário atual
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Usuário não autenticado")
      }

      // Criar a empresa
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .insert({
          name: data.name,
          slug: data.slug,
          industry: data.industry,
          size: data.size,
          plan: "trial",
          trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 dias
        })
        .select()
        .single()

      if (companyError) {
        throw new Error(companyError.message)
      }

      // Associar o usuário à empresa
      const { error: userError } = await supabase.from("users").insert({
        company_id: company.id,
        email: user.email,
        name: user.user_metadata.name || user.email,
        role: "admin", // Primeiro usuário é admin
      })

      if (userError) {
        throw new Error(userError.message)
      }

      // Chamar o callback de sucesso
      onSubmit(data)
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao criar sua empresa")
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
        <Label htmlFor="name">Nome da empresa</Label>
        <Input id="name" {...register("name")} onChange={handleNameChange} placeholder="Minha Empresa" />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug (URL da sua página de carreiras)</Label>
        <div className="flex items-center">
          <span className="bg-gray-100 px-3 py-2 rounded-l-md text-gray-500">https://</span>
          <Input id="slug" {...register("slug")} className="rounded-l-none" placeholder="minha-empresa" />
          <span className="bg-gray-100 px-3 py-2 rounded-r-md text-gray-500">.miniats.com</span>
        </div>
        {errors.slug && <p className="text-sm text-red-500">{errors.slug.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="industry">Indústria</Label>
        <Select onValueChange={(value) => setValue("industry", value)} defaultValue="">
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
        <Label htmlFor="size">Tamanho da empresa</Label>
        <Select onValueChange={(value) => setValue("size", value)} defaultValue="">
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

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Criando empresa...
          </>
        ) : (
          "Continuar"
        )}
      </Button>
    </form>
  )
}
