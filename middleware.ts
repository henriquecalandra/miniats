import { type NextRequest, NextResponse } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(request: NextRequest) {
  // Cria o cliente do Supabase para verificar autenticação
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const url = request.nextUrl
  const hostname = request.headers.get("host") || ""
  const path = url.pathname

  // Verifica se estamos em ambiente de desenvolvimento
  const isDev = process.env.NODE_ENV === "development"
  const baseHost = isDev ? "localhost:3000" : "miniats.com"

  // Extrai o subdomínio
  let subdomain = hostname.replace(`.${baseHost}`, "")

  // Em desenvolvimento, usamos um formato diferente: localhost:3000/app, localhost:3000/admin, etc.
  if (isDev) {
    subdomain = hostname.split(":")[0] === "localhost" ? path.split("/")[1] : subdomain
  }

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ["/", "/auth/login", "/auth/signup", "/auth/callback", "/api/webhooks"]
  const isPublicRoute = publicRoutes.some((route) => path.startsWith(route))

  // Se for a rota raiz (/), não fazer nada e permitir o acesso à página inicial
  if (path === "/") {
    return res
  }

  // Roteamento baseado no subdomínio
  if (subdomain === "app") {
    // Painel da empresa - requer autenticação
    if (!session && !isPublicRoute) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    // Se estiver autenticado e tentar acessar páginas de auth, redireciona para o dashboard
    if (session && (path.startsWith("/auth/login") || path.startsWith("/auth/signup"))) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // Redireciona para o onboarding se o usuário não tiver uma empresa associada
    // Isso seria implementado verificando se o usuário tem company_id

    // Reescreve a URL para o app
    if (!path.startsWith("/app")) {
      url.pathname = `/app${path}`
      return NextResponse.rewrite(url)
    }
  } else if (subdomain === "admin") {
    // Painel de administração - requer autenticação e verificação de admin
    if (!session) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    // Reescreve a URL para o admin
    if (!path.startsWith("/admin")) {
      url.pathname = `/admin${path}`
      return NextResponse.rewrite(url)
    }
  } else if (subdomain && subdomain !== "www") {
    // Página de carreiras da empresa
    // Reescreve a URL para a página de carreiras da empresa específica
    url.pathname = `/careers/${subdomain}${path}`
    return NextResponse.rewrite(url)
  }

  return res
}

// Configuração para que o middleware seja executado em todas as rotas
export const config = {
  matcher: [
    /*
     * Corresponde a todas as rotas exceto:
     * 1. Arquivos estáticos (_next/static, favicon.ico, etc.)
     * 2. Rotas de API que não precisam de middleware
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
