import Stripe from "stripe"
import type { SubscriptionPlan } from "./types" // Assuming SubscriptionPlan is declared in another file

// Versão corrigida que não quebra durante o build
let stripeInstance: Stripe | null = null

export function getStripe() {
  if (!stripeInstance && process.env.STRIPE_SECRET_KEY) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    })
  }

  return stripeInstance
}

export const PLANS = {
  STARTER: {
    id: "starter",
    name: "Starter",
    description: "Perfeito para pequenas empresas começando a crescer.",
    price_monthly: 29,
    price_yearly: 290,
    currency: "BRL",
    features: ["5 vagas ativas", "200 candidaturas/mês", "1 usuário", "Página de carreiras básica"],
    limits: {
      jobs: 5,
      users: 1,
      applications_per_month: 200,
    },
    stripe_price_id_monthly: "price_1234567890",
    stripe_price_id_yearly: "price_0987654321",
  },
  PROFESSIONAL: {
    id: "professional",
    name: "Professional",
    description: "Ideal para empresas em crescimento com equipes maiores.",
    price_monthly: 79,
    price_yearly: 790,
    currency: "BRL",
    features: [
      "20 vagas ativas",
      "1.000 candidaturas/mês",
      "5 usuários",
      "Página de carreiras personalizada",
      "Modelos de email",
    ],
    limits: {
      jobs: 20,
      users: 5,
      applications_per_month: 1000,
    },
    is_popular: true,
    stripe_price_id_monthly: "price_2345678901",
    stripe_price_id_yearly: "price_1098765432",
  },
  BUSINESS: {
    id: "business",
    name: "Business",
    description: "Para empresas com necessidades avançadas de recrutamento.",
    price_monthly: 199,
    price_yearly: 1990,
    currency: "BRL",
    features: [
      "Vagas ilimitadas",
      "Candidaturas ilimitadas",
      "Usuários ilimitados",
      "Página de carreiras premium",
      "API e integrações",
    ],
    limits: {
      jobs: -1, // ilimitado
      users: -1, // ilimitado
      applications_per_month: -1, // ilimitado
    },
    stripe_price_id_monthly: "price_3456789012",
    stripe_price_id_yearly: "price_2109876543",
  },
}

export type PlanId = keyof typeof PLANS

export function getPlanById(planId: string): SubscriptionPlan | null {
  const plan = Object.values(PLANS).find((p) => p.id === planId)
  return plan || null
}

export function formatCurrency(amount: number, currency = "BRL"): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(amount)
}
