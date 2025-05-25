import nodemailer from "nodemailer"

// Configuração do transporte de email
// Em produção, você usaria um serviço como SendGrid, Mailgun, etc.
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.example.com",
  port: Number.parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER || "user@example.com",
    pass: process.env.EMAIL_PASSWORD || "password",
  },
})

export interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

export async function sendEmail(options: EmailOptions) {
  const { to, subject, html, from = process.env.EMAIL_FROM || "noreply@miniats.com" } = options

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    })

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error }
  }
}

// Templates de email
export const emailTemplates = {
  teamInvite: (inviterName: string, companyName: string, inviteUrl: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f0f4f8; padding: 20px; text-align: center;">
        <h1 style="color: #3b82f6; margin: 0;">Mini ATS</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
        <h2>Você foi convidado para se juntar a uma equipe</h2>
        <p>${inviterName} convidou você para se juntar à equipe da ${companyName} no Mini ATS.</p>
        <p>O Mini ATS é uma plataforma de recrutamento para pequenas e médias empresas.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Aceitar Convite
          </a>
        </div>
        <p>Se você não esperava este convite, pode ignorar este email.</p>
      </div>
      <div style="background-color: #f0f4f8; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
        <p>© ${new Date().getFullYear()} Mini ATS. Todos os direitos reservados.</p>
      </div>
    </div>
  `,

  applicationReceived: (candidateName: string, jobTitle: string, companyName: string, applicationUrl: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f0f4f8; padding: 20px; text-align: center;">
        <h1 style="color: #3b82f6; margin: 0;">Mini ATS</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
        <h2>Nova Candidatura Recebida</h2>
        <p>Olá,</p>
        <p>Você recebeu uma nova candidatura para a vaga <strong>${jobTitle}</strong>.</p>
        <p><strong>Candidato:</strong> ${candidateName}</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${applicationUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Ver Candidatura
          </a>
        </div>
      </div>
      <div style="background-color: #f0f4f8; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
        <p>© ${new Date().getFullYear()} Mini ATS. Todos os direitos reservados.</p>
      </div>
    </div>
  `,

  candidateStageChanged: (
    candidateName: string,
    jobTitle: string,
    stage: string,
    companyName: string,
    applicationUrl: string,
  ) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f0f4f8; padding: 20px; text-align: center;">
        <h1 style="color: #3b82f6; margin: 0;">Mini ATS</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
        <h2>Atualização de Candidatura</h2>
        <p>Olá,</p>
        <p>A candidatura de <strong>${candidateName}</strong> para a vaga <strong>${jobTitle}</strong> foi movida para a etapa <strong>${stage}</strong>.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${applicationUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Ver Candidatura
          </a>
        </div>
      </div>
      <div style="background-color: #f0f4f8; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
        <p>© ${new Date().getFullYear()} Mini ATS. Todos os direitos reservados.</p>
      </div>
    </div>
  `,
}
