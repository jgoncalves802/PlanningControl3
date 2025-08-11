// Configuração para ngrok
module.exports = {
  // Configuração do ngrok
  ngrok: {
    // Permitir todos os hosts
    allow_hosts: true,
    // Configuração de CORS
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }
  },
  
  // Configuração do Next.js para ngrok
  next: {
    // Desabilitar otimizações que podem causar problemas com ngrok
    experimental: {
      optimizeCss: false,
      optimizePackageImports: false
    },
    // Configuração de assets
    assetPrefix: '',
    basePath: '',
    trailingSlash: false
  }
} 