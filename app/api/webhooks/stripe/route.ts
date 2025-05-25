import { NextResponse, type NextRequest } from "next/server"
import { getStripe } from "@/lib/stripe"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe()

    if (!stripe) {
      return NextResponse.json({ error: "Stripe não está configurado" }, { status: 500 })
    }

    const body = await req.text()
    const signature = req.headers.get("stripe-signature") as string

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Webhook secret não configurado" }, { status: 500 })
    }

    // Verificar a assinatura do webhook
    const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)

    // Processar o evento
    const supabase = createServerClient()

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any
        const companyId = session.metadata.companyId
        const planId = session.metadata.plan
        const subscriptionId = session.subscription

        // Atualizar a assinatura da empresa
        await supabase
          .from("companies")
          .update({
            subscription_id: subscriptionId,
            plan_id: planId,
            subscription_status: "active",
          })
          .eq("id", companyId)

        break
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as any
        const companyId = subscription.metadata.companyId
        const status = subscription.status

        // Atualizar o status da assinatura
        await supabase
          .from("companies")
          .update({
            subscription_status: status,
          })
          .eq("subscription_id", subscription.id)

        break
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as any

        // Marcar a assinatura como cancelada
        await supabase
          .from("companies")
          .update({
            subscription_status: "canceled",
            plan_id: "free", // Voltar para o plano gratuito
          })
          .eq("subscription_id", subscription.id)

        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
