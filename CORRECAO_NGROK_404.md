# 🔧 Correção do Erro 404 no Ngrok

## 🚨 **Problema Identificado:**

O erro 404 estava ocorrendo porque:
1. **Arquivos estáticos não encontrados:** `/_next/static/css/app/layout.css`, `/_next/static/chunks/app/dashboard/transfers/page.js`, etc.
2. **Configuração incorreta do Next.js para ngrok**
3. **Middleware bloqueando arquivos estáticos**

## ✅ **Soluções Implementadas:**

### 1. **Atualização do `next.config.js`**
```javascript
// Configuração para funcionar com ngrok
assetPrefix: process.env.NODE_ENV === 'production' ? undefined : '',
basePath: '',
trailingSlash: false,

// Headers para CORS e cache
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Cache-Control', value: 'no-store, must-revalidate' },
        { key: 'Access-Control-Allow-Origin', value: '*' },
        { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
        { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
      ],
    },
    {
      source: '/_next/static/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
  ];
},

// Rewrites para ngrok
async rewrites() {
  return [
    {
      source: '/_next/static/:path*',
      destination: '/_next/static/:path*',
    },
  ];
},
```

### 2. **Atualização do `middleware.ts`**
```typescript
export async function middleware(req: NextRequest) {
  // Permitir acesso a arquivos estáticos do Next.js
  if (req.nextUrl.pathname.startsWith('/_next/') || 
      req.nextUrl.pathname.startsWith('/favicon.ico') ||
      req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }
  
  // ... resto do middleware
}
```

### 3. **Novos Scripts no `package.json`**
```json
{
  "scripts": {
    "dev:ngrok": "next dev --hostname 0.0.0.0 --port 3000",
    "start:ngrok": "next start --hostname 0.0.0.0 --port 3000",
    "ngrok:start": "npm run dev:ngrok & npx ngrok http 3000",
    "ngrok:build": "npm run build && npm run start:ngrok & npx ngrok http 3000"
  }
}
```

### 4. **Script de Reinicialização**
- `scripts/restart-ngrok.js`: Script para reiniciar o servidor com configurações corretas

## 🚀 **Como Usar:**

### **Opção 1: Usar os novos scripts**
```bash
# Para desenvolvimento
npm run ngrok:start

# Para produção
npm run ngrok:build
```

### **Opção 2: Manual**
```bash
# 1. Parar servidor atual (Ctrl+C)
# 2. Iniciar com configuração ngrok
npm run dev:ngrok

# 3. Em outro terminal, iniciar ngrok
npx ngrok http 3000
```

### **Opção 3: Script automático**
```bash
node scripts/restart-ngrok.js
```

## 🔍 **Verificações Importantes:**

### 1. **Verificar se o servidor está rodando corretamente**
```bash
curl http://localhost:3000/_next/static/css/app/layout.css
```

### 2. **Verificar configuração do ngrok**
- Certifique-se de que o ngrok está apontando para a porta correta (3000)
- Verifique se não há conflitos de porta

### 3. **Verificar variáveis de ambiente**
```bash
# .env.local deve ter:
NEXT_PUBLIC_SUPABASE_URL=sua_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave
```

## 🛠️ **Troubleshooting:**

### **Se ainda houver erro 404:**
1. **Limpar cache do Next.js:**
   ```bash
   rm -rf .next
   npm run dev:ngrok
   ```

2. **Verificar se o ngrok está funcionando:**
   ```bash
   curl https://feb4ebcb88ff.ngrok.app/api/health
   ```

3. **Verificar logs do servidor:**
   - Procure por erros de compilação
   - Verifique se todos os arquivos estáticos estão sendo gerados

### **Se houver problemas de CORS:**
1. Verificar se os headers estão sendo aplicados corretamente
2. Verificar se o ngrok está configurado para permitir CORS

## 📋 **Arquivos Modificados:**

- `next.config.js` - Configuração para ngrok
- `middleware.ts` - Permitir arquivos estáticos
- `package.json` - Novos scripts
- `scripts/restart-ngrok.js` - Script de reinicialização
- `ngrok.config.js` - Configuração específica do ngrok

## ✅ **Resultado Esperado:**

Após aplicar essas correções:
- ✅ Arquivos estáticos carregam corretamente
- ✅ API funciona através do ngrok
- ✅ Sem erros 404
- ✅ CORS configurado corretamente
- ✅ Cache otimizado para arquivos estáticos

---

**Nota:** Sempre reinicie o servidor após fazer essas alterações para que as novas configurações sejam aplicadas. 