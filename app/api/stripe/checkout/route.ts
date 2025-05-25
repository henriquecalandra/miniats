import { NextResponse, type NextRequest } from "next/server"
import { getStripe, PLANS, type PlanId } from "@/lib/stripe"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe()

    if (!stripe) {
      return NextResponse.json({ error: "Stripe não está configurado" }, { status: 500 })
    }

    const { planId, interval = "month", companyId } = await req.json()

    if (!planId || !companyId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const plan = PLANS[planId.toUpperCase() as PlanId]

    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Buscar informações da empresa
    const { data: company, error } = await supabase.from("companies").select("*").eq("id", companyId).single()

    if (error || !company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Criar ou recuperar cliente no Stripe
    let customerId = company.stripe_customer_id

    if (!customerId) {
      // Buscar o usuário admin da empresa
      const { data: adminUser } = await supabase
        .from("users")
        .select("*")
        .eq("company_id", companyId)
        .eq("role", "admin")
        .single()

      const customer = await stripe.customers.create({
        email: adminUser?.email || company.name,
        name: company.name,
        metadata: {
          companyId: company.id,
        },
      })

      customerId = customer.id

      // Atualizar o ID do cliente na empresa
      await supabase.from("companies").update({ stripe_customer_id: customerId }).eq("id", companyId)
    }

    // Criar sessão de checkout
    const priceId = interval === "year" ? plan.stripe_price_id_yearly : plan.stripe_price_id_monthly

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      client_reference_id: companyId,
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        companyId,
        plan: plan.id,
      },
      subscription_data: {
        metadata: {
          companyId,
          plan: plan.id,
        },
      },
      success_url: `${req.headers.get("origin")}/app/settings/billing?success=true`,
      cancel_url: `${req.headers.get("origin")}/app/settings/billing?canceled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
