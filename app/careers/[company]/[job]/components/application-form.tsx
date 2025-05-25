"use client"

import Link from "next/link"

import type React from "react"

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
import { Loader2, Upload, Linkedin } from "lucide-react"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const applicationSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  linkedin_url: z.string().url("URL do LinkedIn inválida").optional().or(z.literal("")),
  portfolio_url: z.string().url("URL do portfólio inválida").optional().or(z.literal("")),
  location: z.string().optional(),
  message: z.string().optional(),
})

type ApplicationFormValues = z.infer<typeof applicationSchema>

interface ApplicationFormProps {
  company: any
  job: any
}

export function ApplicationForm({ company, job }: ApplicationFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeError, setResumeError] = useState("")
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      linkedin_url: "",
      portfolio_url: "",
      location: "",
      message: "",
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setResumeError("")

    if (!file) {
      setResumeFile(null)
      return
    }

    // Verificar tamanho do arquivo
    if (file.size > MAX_FILE_SIZE) {
      setResumeError("O arquivo deve ter no máximo 5MB")
      return
    }

    // Verificar tipo do arquivo
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if (!allowedTypes.includes(file.type)) {
      setResumeError("Apenas arquivos PDF ou Word são permitidos")
      return
    }

    setResumeFile(file)
  }

  const onSubmit = async (data: ApplicationFormValues) => {
    setLoading(true)
    setError("")
    setSuccess(false)

    if (!resumeFile) {
      setResumeError("O currículo é obrigatório")
      setLoading(false)
      return
    }

    try {
      // 1. Fazer upload do currículo
      const fileName = `${Date.now()}_${resumeFile.name.replace(/\s+/g, "_")}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(fileName, resumeFile)

      if (uploadError) {
        throw new Error("Erro ao fazer upload do currículo")
      }

      // 2. Obter URL pública do currículo
      const { data: urlData } = supabase.storage.from("resumes").getPublicUrl(fileName)
      const resumeUrl = urlData.publicUrl

      // 3. Criar ou atualizar candidato
      const { data: candidateData, error: candidateError } = await supabase
        .from("candidates")
        .select("id")
        .eq("email", data.email)
        .maybeSingle()

      let candidateId
      if (candidateData) {
        // Atualizar candidato existente
        candidateId = candidateData.id
        await supabase
          .from("candidates")
          .update({
            name: data.name,
            phone: data.phone || null,
            linkedin_url: data.linkedin_url || null,
            portfolio_url: data.portfolio_url || null,
            location: data.location || null,
            resume_url: resumeUrl,
          })
          .eq("id", candidateId)
      } else {
        // Criar novo candidato
        const { data: newCandidate, error: newCandidateError } = await supabase
          .from("candidates")
          .insert({
            name: data.name,
            email: data.email,
            phone: data.phone || null,
            linkedin_url: data.linkedin_url || null,
            portfolio_url: data.portfolio_url || null,
            location: data.location || null,
            resume_url: resumeUrl,
          })
          .select("id")
          .single()

        if (newCandidateError) {
          throw new Error("Erro ao criar candidato")
        }

        candidateId = newCandidate.id
      }

      // 4. Criar candidatura
      const { error: applicationError } = await supabase.from("applications").insert({
        job_id: job.id,
        candidate_id: candidateId,
        company_id: company.id,
        stage: "new",
        notes: data.message
          ? [
              {
                text: data.message,
                created_at: new Date().toISOString(),
                type: "candidate_message",
              },
            ]
          : [],
      })

      if (applicationError) {
        throw new Error("Erro ao criar candidatura")
      }

      // 5. Registrar atividade
      await supabase.from("activity_log").insert({
        company_id: company.id,
        entity_type: "application",
        entity_id: job.id,
        action: "application_received",
        metadata: {
          job_title: job.title?.pt,
          candidate_name: data.name,
        },
      })

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao enviar sua candidatura")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Candidatura enviada com sucesso!</h3>
        <p className="text-gray-600 mb-6">
          Obrigado por se candidatar. Entraremos em contato em breve para dar continuidade ao processo seletivo.
        </p>
        <Button variant="outline" asChild>
          <Link href={`/careers/${company.slug}`}>Ver outras vagas</Link>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nome completo *</Label>
        <Input id="name" {...register("name")} placeholder="Seu nome completo" />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input id="email" type="email" {...register("email")} placeholder="seu@email.com" />
        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefone</Label>
        <Input id="phone" {...register("phone")} placeholder="(00) 00000-0000" />
        {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Localização</Label>
        <Input id="location" {...register("location")} placeholder="Cidade, Estado" />
        {errors.location && <p className="text-sm text-red-500">{errors.location.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="linkedin_url">LinkedIn (opcional)</Label>
        <div className="relative">
          <Input
            id="linkedin_url"
            {...register("linkedin_url")}
            placeholder="https://linkedin.com/in/seu-perfil"
            className="pl-10"
          />
          <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        {errors.linkedin_url && <p className="text-sm text-red-500">{errors.linkedin_url.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="portfolio_url">Portfólio/Website (opcional)</Label>
        <Input id="portfolio_url" {...register("portfolio_url")} placeholder="https://seu-site.com" />
        {errors.portfolio_url && <p className="text-sm text-red-500">{errors.portfolio_url.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="resume">Currículo *</Label>
        <div className="border border-gray-300 rounded-md p-4">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="resume"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Clique para fazer upload</span> ou arraste e solte
                </p>
                <p className="text-xs text-gray-500">PDF ou Word (máx. 5MB)</p>
              </div>
              <input
                id="resume"
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
              />
            </label>
          </div>
          {resumeFile && (
            <div className="mt-2 flex items-center justify-between bg-blue-50 p-2 rounded-md">
              <span className="text-sm text-blue-700 truncate">{resumeFile.name}</span>
              <button
                type="button"
                onClick={() => setResumeFile(null)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remover
              </button>
            </div>
          )}
          {resumeError && <p className="text-sm text-red-500 mt-2">{resumeError}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Mensagem (opcional)</Label>
        <Textarea
          id="message"
          {...register("message")}
          rows={4}
          placeholder="Conte-nos por que você está interessado nesta vaga"
        />
        {errors.message && <p className="text-sm text-red-500">{errors.message.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          "Enviar Candidatura"
        )}
      </Button>
    </form>
  )
}
