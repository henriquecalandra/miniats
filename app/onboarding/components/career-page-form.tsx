"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

const careerPageSchema = z.object({
  headline: z.string().min(2, "Título da página é obrigatório"),
  description: z.string().min(10, "Descrição da empresa é obrigatória"),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
})

type CareerPageFormValues = z.infer<typeof careerPageSchema>

interface CareerPageFormProps {
  onSubmit: (data: CareerPageFormValues) => void
  onBack: () => void
}

export function CareerPageForm({ onSubmit, onBack }: CareerPageFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CareerPageFormValues>({
    resolver: zodResolver(careerPageSchema),
    defaultValues: {
      headline: "",
      description: "",
      website: "",
    },
  })

  const handleFormSubmit = async (data: CareerPageFormValues) => {
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

      // Atualizar as configurações da empresa
      const { error: companyError } = await supabase
        .from("companies")
        .update({
          settings: {
            career_page: {
              headline: data.headline,
              description: data.description,
            },
          },
          website: data.website || null,
        })
        .eq("id", userData.company_id)

      if (companyError) {
        throw new Error(companyError.message)
      }

      // Chamar o callback de sucesso
      onSubmit(data)
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao salvar as configurações")
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
        <Label htmlFor="headline">Título da página de carreiras</Label>
        <Input id="headline" {...register("headline")} placeholder="Ex: Junte-se à nossa equipe" />
        {errors.headline && <p className="text-sm text-red-500">{errors.headline.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição da empresa</Label>
        <Textarea
          id="description"
          {...register("description")}
          rows={5}
          placeholder="Descreva sua empresa, cultura e valores para atrair candidatos"
        />
        {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Website da empresa (opcional)</Label>
        <Input id="website" {...register("website")} placeholder="https://www.suaempresa.com" />
        {errors.website && <p className="text-sm text-red-500">{errors.website.message}</p>}
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            "Continuar"
          )}
        </Button>
      </div>
    </form>
  )
}
