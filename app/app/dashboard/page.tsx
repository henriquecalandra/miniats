import { Suspense } from "react"
import { createServerClient } from "@/lib/supabase/server"
import { StatsCards } from "./components/stats-cards"
import { RecentApplications } from "./components/recent-applications"
import { JobsOverview } from "./components/jobs-overview"
import { ActivityFeed } from "./components/activity-feed"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default async function DashboardPage() {
  const supabase = createServerClient()

  // Obter dados da empresa do usuário
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const { data: user } = await supabase.from("users").select("company_id").eq("email", session?.user?.email).single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral do seu processo de recrutamento</p>
      </div>

      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards companyId={user?.company_id} />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<CardSkeleton />}>
          <RecentApplications companyId={user?.company_id} />
        </Suspense>

        <Suspense fallback={<CardSkeleton />}>
          <JobsOverview companyId={user?.company_id} />
        </Suspense>
      </div>

      <Suspense fallback={<CardSkeleton />}>
        <ActivityFeed companyId={user?.company_id} />
      </Suspense>
    </div>
  )
}

function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function CardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
