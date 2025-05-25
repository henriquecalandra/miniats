import { NextResponse, type NextRequest } from "next/server"
import { getStripe } from "@/lib/stripe"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe()

    if (!stripe) {
      return NextResponse.json({ error: "Stripe não está configurado" }, { status: 500 })
    }

    const { companyId } = await req.json()

    if (!companyId) {
      return NextResponse.json({ error: "Missing company ID" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Buscar informações da empresa
    const { data: company, error } = await supabase.from("companies").select("*").eq("id", companyId).single()

    if (error || !company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    if (!company.stripe_customer_id) {
      return NextResponse.json({ error: "No Stripe customer found" }, { status: 404 })
    }

    // Criar sessão do portal de clientes
    const session = await stripe.billingPortal.sessions.create({
      customer: company.stripe_customer_id,
      return_url: `${req.headers.get("origin")}/app/settings/billing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error("Error creating portal session:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
