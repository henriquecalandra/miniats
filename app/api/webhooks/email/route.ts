import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { sendEmail, emailTemplates } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const { type, data } = await req.json()
    const supabase = createServerClient()

    switch (type) {
      case "team_invite": {
        const { inviteId, inviterEmail, inviteeEmail, companyId } = data

        // Buscar informações da empresa e do convidador
        const [{ data: company }, { data: inviter }] = await Promise.all([
          supabase.from("companies").select("name").eq("id", companyId).single(),
          supabase.from("users").select("name").eq("email", inviterEmail).single(),
        ])

        if (!company || !inviter) {
          return NextResponse.json({ error: "Company or inviter not found" }, { status: 404 })
        }

        // Gerar URL do convite
        const inviteUrl = `${req.headers.get("origin")}/auth/invite?token=${inviteId}`

        // Enviar email
        await sendEmail({
          to: inviteeEmail,
          subject: `Convite para se juntar à equipe da ${company.name} no Mini ATS`,
          html: emailTemplates.teamInvite(inviter.name || inviterEmail, company.name, inviteUrl),
        })

        break
      }

      case "application_received": {
        const { applicationId, jobId, candidateId, companyId } = data

        // Buscar informações da empresa, vaga e candidato
        const [{ data: company }, { data: job }, { data: candidate }] = await Promise.all([
          supabase.from("companies").select("name").eq("id", companyId).single(),
          supabase.from("jobs").select("title").eq("id", jobId).single(),
          supabase.from("candidates").select("name").eq("id", candidateId).single(),
        ])

        if (!company || !job || !candidate) {
          return NextResponse.json({ error: "Company, job or candidate not found" }, { status: 404 })
        }

        // Buscar emails dos administradores da empresa
        const { data: admins } = await supabase
          .from("users")
          .select("email")
          .eq("company_id", companyId)
          .eq("role", "admin")

        if (!admins || admins.length === 0) {
          return NextResponse.json({ error: "No admin users found" }, { status: 404 })
        }

        // URL da aplicação
        const applicationUrl = `${req.headers.get("origin")}/app/candidates/${candidateId}`

        // Enviar email para cada administrador
        for (const admin of admins) {
          await sendEmail({
            to: admin.email,
            subject: `Nova candidatura para ${job.title.pt} - ${candidate.name}`,
            html: emailTemplates.applicationReceived(candidate.name, job.title.pt, company.name, applicationUrl),
          })
        }

        break
      }

      case "candidate_stage_changed": {
        const { applicationId, jobId, candidateId, companyId, stage } = data

        // Buscar informações da empresa, vaga e candidato
        const [{ data: company }, { data: job }, { data: candidate }] = await Promise.all([
          supabase.from("companies").select("name").eq("id", companyId).single(),
          supabase.from("jobs").select("title").eq("id", jobId).single(),
          supabase.from("candidates").select("name").eq("id", candidateId).single(),
        ])

        if (!company || !job || !candidate) {
          return NextResponse.json({ error: "Company, job or candidate not found" }, { status: 404 })
        }

        // Buscar emails dos administradores e gerentes da empresa
        const { data: teamMembers } = await supabase
          .from("users")
          .select("email")
          .eq("company_id", companyId)
          .in("role", ["admin", "manager"])

        if (!teamMembers || teamMembers.length === 0) {
          return NextResponse.json({ error: "No team members found" }, { status: 404 })
        }

        // Mapear estágios para nomes amigáveis
        const stageNames: Record<string, string> = {
          new: "Novos",
          "phone-screen": "Triagem Telefônica",
          interview: "Entrevista",
          technical: "Teste Técnico",
          offer: "Proposta",
          hired: "Contratado",
          rejected: "Rejeitado",
        }

        // URL da aplicação
        const applicationUrl = `${req.headers.get("origin")}/app/candidates/${candidateId}`

        // Enviar email para cada membro da equipe
        for (const member of teamMembers) {
          await sendEmail({
            to: member.email,
            subject: `Atualização de candidatura: ${candidate.name} - ${stageNames[stage] || stage}`,
            html: emailTemplates.candidateStageChanged(
              candidate.name,
              job.title.pt,
              stageNames[stage] || stage,
              company.name,
              applicationUrl,
            ),
          })
        }

        break
      }

      default:
        return NextResponse.json({ error: "Invalid notification type" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error processing email notification:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
