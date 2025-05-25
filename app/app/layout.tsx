import type React from "react"
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { Sidebar } from "./components/sidebar"
import { Header } from "./components/header"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  // Verificar se o usuário tem uma empresa associada
  const { data: user } = await supabase
    .from("users")
    .select("company_id, company:companies(*)")
    .eq("email", session.user.email)
    .single()

  if (!user?.company_id) {
    redirect("/onboarding")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar company={user.company} />
        <div className="flex-1 flex flex-col">
          <Header user={session.user} company={user.company} />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
