"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Briefcase, Users, Settings, Building2, CreditCard, UserPlus, Globe } from "lucide-react"

interface SidebarProps {
  company: any
}

const navigation = [
  { name: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
  { name: "Vagas", href: "/app/jobs", icon: Briefcase },
  { name: "Candidatos", href: "/app/candidates", icon: Users },
  { name: "Configurações", href: "/app/settings", icon: Settings },
]

const settingsNavigation = [
  { name: "Empresa", href: "/app/settings", icon: Building2 },
  { name: "Cobrança", href: "/app/settings/billing", icon: CreditCard },
  { name: "Equipe", href: "/app/settings/team", icon: UserPlus },
  { name: "Página de Carreiras", href: "/app/settings/career-page", icon: Globe },
]

export function Sidebar({ company }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">{company?.name?.charAt(0)?.toUpperCase() || "M"}</span>
          </div>
          <div className="ml-3">
            <h2 className="text-sm font-semibold text-gray-900">{company?.name || "Mini ATS"}</h2>
            <p className="text-xs text-gray-500">{company?.plan || "trial"}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/app/dashboard" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}

        <div className="pt-4 mt-4 border-t border-gray-200">
          <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Configurações</p>
          <div className="mt-2 space-y-1">
            {settingsNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs font-medium text-blue-900">Período de teste</p>
          <p className="text-xs text-blue-700 mt-1">
            {company?.trial_ends_at
              ? `Expira em ${new Date(company.trial_ends_at).toLocaleDateString()}`
              : "14 dias restantes"}
          </p>
          <Link
            href="/app/settings/billing"
            className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-2 block"
          >
            Fazer upgrade →
          </Link>
        </div>
      </div>
    </div>
  )
}
