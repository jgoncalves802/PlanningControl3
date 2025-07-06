import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';

const intlMiddleware = createIntlMiddleware({
  locales: ['pt-BR', 'en-US'],
  defaultLocale: 'pt-BR',
  localePrefix: 'never' // Não usar prefixo de locale nas URLs
});

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Para rotas da API, apenas garantir UTF-8
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    response.headers.set('Content-Type', 'application/json; charset=utf-8');
    return response;
  }
  
  // Para rotas estáticas e assets, pular middleware
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/_vercel') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }
  
  // Para outras rotas (incluindo /login, /dashboard, etc), usar internacionalização
  const response = intlMiddleware(request);
  
  if (response) {
    response.headers.set('Content-Type', 'text/html; charset=utf-8');
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!_next|_vercel|.*\\..*).*)'
  ]
}; 