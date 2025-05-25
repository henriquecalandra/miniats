"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { Loader2, MoreVertical, UserPlus, Mail, Clock, Shield } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const inviteSchema = z.object({
  email: z.string().email("Email inválido"),
  role: z.string().min(1, "Função é obrigatória"),
})

type InviteFormValues = z.infer<typeof inviteSchema>

export default function TeamPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [company, setCompany] = useState<any>(null)
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        // Buscar empresa
        const { data: userData } = await supabase
          .from("users")
          .select("company_id, company:companies(*)")
          .eq("email", user.email)
          .single()

        if (userData?.company) {
          setCompany(userData.company)

          // Buscar membros da equipe
          const { data: members } = await supabase
            .from("team_members")
            .select("*, user:users(name, email, avatar_url)")
            .eq("company_id", userData.company.id)
            .order("role", { ascending: false })

          setTeamMembers(members || [])
        }
      } catch (err) {
        console.error("Erro ao buscar dados:", err)
      }
    }

    fetchData()
  }, [supabase])

  const onSubmit = async (data: InviteFormValues) => {
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      // Verificar se o usuário já foi convidado
      const { data: existingMember } = await supabase
        .from("team_members")
        .select("id")
        .eq("company_id", company.id)
        .eq("email", data.email)
        .maybeSingle()

      if (existingMember) {
        throw new Error("Este usuário já foi convidado para a equipe")
      }

      // Verificar limites do plano
      const currentPlan = company.plan || "starter"
      let userLimit = 1 // padrão para starter

      if (currentPlan === "professional") {
        userLimit = 5
      } else if (currentPlan === "business") {
        userLimit = -1 // ilimitado
      }

      if (userLimit !== -1 && teamMembers.length >= userLimit) {
        throw new Error(
          `Seu plano atual permite apenas ${userLimit} ${
            userLimit === 1 ? "usuário" : "usuários"
          }. Faça upgrade para adicionar mais membros.`,
        )
      }

      // Gerar token de convite
      const inviteToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

      // Criar convite
      const { error: inviteError } = await supabase.from("team_members").insert({
        company_id: company.id,
        email: data.email,
        role: data.role,
        status: "pending",
        invited_at: new Date().toISOString(),
        invite_token: inviteToken,
      })

      if (inviteError) {
        throw new Error(inviteError.message)
      }

      // Registrar atividade
      await supabase.from("activity_log").insert({
        company_id: company.id,
        entity_type: "team",
        action: "team_member_invited",
        metadata: {
          email: data.email,
          role: data.role,
        },
      })

      // TODO: Enviar email de convite

      setSuccess(true)
      setIsDialogOpen(false)
      reset()

      // Atualizar lista de membros
      const { data: updatedMembers } = await supabase
        .from("team_members")
        .select("*, user:users(name, email, avatar_url)")
        .eq("company_id", company.id)
        .order("role", { ascending: false })

      setTeamMembers(updatedMembers || [])
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao enviar o convite")
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      await supabase.from("team_members").delete().eq("id", memberId)

      // Atualizar lista de membros
      const { data: updatedMembers } = await supabase
        .from("team_members")
        .select("*, user:users(name, email, avatar_url)")
        .eq("company_id", company.id)
        .order("role", { ascending: false })

      setTeamMembers(updatedMembers || [])
    } catch (err) {
      console.error("Erro ao remover membro:", err)
    }
  }

  const handleResendInvite = async (memberId: string, email: string) => {
    try {
      // Gerar novo token de convite
      const inviteToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

      await supabase
        .from("team_members")
        .update({
          invited_at: new Date().toISOString(),
          invite_token: inviteToken,
        })
        .eq("id", memberId)

      // TODO: Enviar email de convite

      // Mostrar mensagem de sucesso
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error("Erro ao reenviar convite:", err)
    }
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const roleLabels = {
    admin: "Administrador",
    manager: "Gerente",
    member: "Membro",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipe</h1>
          <p className="text-gray-600">Gerencie os membros da sua equipe e permissões</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Convidar Membro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convidar Novo Membro</DialogTitle>
              <DialogDescription>
                Envie um convite por email para adicionar um novo membro à sua equipe.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" {...register("email")} placeholder="email@exemplo.com" />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Função</Label>
                <Select onValueChange={(value) => setValue("role", value)} defaultValue="member">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="manager">Gerente</SelectItem>
                    <SelectItem value="member">Membro</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
              </div>

              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar Convite"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">Convite enviado com sucesso!</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Membros da Equipe</CardTitle>
          <CardDescription>
            Gerencie quem tem acesso ao seu painel de recrutamento e quais permissões eles têm.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers.length > 0 ? (
              teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {member.user?.name ? (
                        <span className="text-gray-700 font-medium">{member.user.name.charAt(0).toUpperCase()}</span>
                      ) : (
                        <span className="text-gray-700 font-medium">{member.email.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {member.user?.name || member.email}
                        {member.status === "pending" && (
                          <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                            Pendente
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          {member.email}
                        </div>
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 mr-1" />
                          {roleLabels[member.role as keyof typeof roleLabels] || member.role}
                        </div>
                        {member.status === "pending" && (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            Convidado{" "}
                            {format(new Date(member.invited_at), "dd/MM/yyyy", {
                              locale: ptBR,
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {member.status === "pending" && (
                        <DropdownMenuItem onClick={() => handleResendInvite(member.id, member.email)}>
                          Reenviar Convite
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-red-600" onClick={() => handleRemoveMember(member.id)}>
                        Remover
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhum membro na equipe ainda.</p>
                <Button variant="outline" className="mt-4" onClick={() => setIsDialogOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Convidar Membro
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permissões</CardTitle>
          <CardDescription>Entenda as diferentes funções e permissões disponíveis.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Administrador</h3>
              <p className="text-gray-600">
                Acesso completo a todas as funcionalidades, incluindo configurações da empresa, cobrança e gerenciamento
                de equipe.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Gerente</h3>
              <p className="text-gray-600">
                Pode criar e gerenciar vagas, candidatos e processos de recrutamento, mas não tem acesso às
                configurações da empresa ou cobrança.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Membro</h3>
              <p className="text-gray-600">
                Pode visualizar vagas e candidatos, mas não pode criar novas vagas ou editar configurações.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
