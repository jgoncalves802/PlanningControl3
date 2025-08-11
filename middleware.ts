import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Permitir acesso a arquivos estáticos do Next.js
  if (req.nextUrl.pathname.startsWith('/_next/') || 
      req.nextUrl.pathname.startsWith('/favicon.ico') ||
      req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ['/login', '/signup', '/forgot-password', '/']
  const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname.startsWith(route))

  // Verificar se há token de autenticação do Supabase
  // O Supabase pode usar diferentes nomes de cookies dependendo da configuração
  const possibleAuthCookies = [
    'sb-cwilhwqrmjtljwgsgbey-auth-token',
    'sb-access-token',
    'sb-refresh-token',
    'supabase-auth-token'
  ]
  
  let hasAuthToken = false
  let authToken = null
  
  // Verificar todos os possíveis cookies de autenticação
  for (const cookieName of possibleAuthCookies) {
    const cookie = req.cookies.get(cookieName)
    if (cookie?.value) {
      hasAuthToken = true
      authToken = cookie.value
      break
    }
  }
  
  console.log('🔍 Middleware - Rota:', req.nextUrl.pathname)
  console.log('🔍 Middleware - É rota pública:', isPublicRoute)
  console.log('🔍 Middleware - Tem token:', hasAuthToken)
  
  // CORREÇÃO: Evitar loop de redirecionamento
  // Se não há token e não é rota pública, redirecionar para login
  if (!hasAuthToken && !isPublicRoute) {
    console.log('🔍 Middleware - Redirecionando para login (sem token)')
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    return NextResponse.redirect(redirectUrl)
  }

  // CORREÇÃO: Simplificar lógica da rota raiz
  // Se está na rota raiz e não tem token, redirecionar para login
  if (!hasAuthToken && req.nextUrl.pathname === '/') {
    console.log('🔍 Middleware - Redirecionando raiz para login')
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    return NextResponse.redirect(redirectUrl)
  }

  console.log('🔍 Middleware - Permitindo acesso à rota')
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 