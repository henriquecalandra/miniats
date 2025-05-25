import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthPage = request.nextUrl.pathname.startsWith("/auth")
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/app") || request.nextUrl.pathname.startsWith("/onboarding")
  const isPublicRoute = request.nextUrl.pathname.startsWith("/careers") || request.nextUrl.pathname === "/"

  // Redirecionar para login se não autenticado e tentando acessar rota protegida
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL("/auth/login", request.url)
    redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirecionar para dashboard se autenticado e tentando acessar páginas de auth
  if (user && isAuthPage) {
    // Verificar se o usuário tem uma empresa
    const { data: userData } = await supabase.from("users").select("company_id").eq("email", user.email).single()

    if (userData?.company_id) {
      return NextResponse.redirect(new URL("/app/dashboard", request.url))
    } else {
      return NextResponse.redirect(new URL("/onboarding", request.url))
    }
  }

  // Verificar se usuário autenticado tem empresa ao acessar /app
  if (user && request.nextUrl.pathname.startsWith("/app")) {
    const { data: userData } = await supabase.from("users").select("company_id").eq("email", user.email).single()

    if (!userData?.company_id) {
      return NextResponse.redirect(new URL("/onboarding", request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
