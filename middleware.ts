import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';

const intlMiddleware = createIntlMiddleware({
  locales: ['pt-BR', 'en-US'],
  defaultLocale: 'pt-BR'
});

export default function middleware(request: NextRequest) {
  // Garantir que todas as respostas tenham charset UTF-8
  const response = intlMiddleware(request);
  
  // Para rotas da API, garantir UTF-8
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const newResponse = NextResponse.next();
    newResponse.headers.set('Content-Type', 'application/json; charset=utf-8');
    return newResponse;
  }
  
  // Para outras rotas, usar o middleware de internacionalização
  if (response) {
    response.headers.set('Content-Type', 'text/html; charset=utf-8');
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)',
    // However, match all pathnames within `/api/`, except for Next.js internals
    '/api/((?!_next).*)'
  ]
}; 