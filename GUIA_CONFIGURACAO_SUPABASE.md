# 🚀 Guia Completo: Configuração do Supabase Real

## 📋 Pré-requisitos
- Conta no Supabase (gratuita)
- Node.js instalado
- Projeto Next.js funcionando

## 🔧 Passo a Passo

### 1. Criar Projeto no Supabase

1. **Acesse** [supabase.com](https://supabase.com)
2. **Faça login** ou crie uma conta
3. **Clique** em "New Project"
4. **Preencha** os dados:
   - **Organization**: Sua organização
   - **Name**: `planning-control-platform`
   - **Database Password**: Escolha uma senha forte
   - **Region**: São Paulo (mais próxima)
5. **Clique** em "Create new project"
6. **Aguarde** a criação (2-3 minutos)

### 2. Obter Credenciais

1. **No dashboard** do projeto, vá em **Settings** → **API**
2. **Copie** as seguintes informações:
   - **Project URL** (ex: `https://abcdefghijklmnop.supabase.co`)
   - **anon public** (chave pública)
   - **service_role** (chave privada - mantenha segura!)

### 3. Configurar Variáveis de Ambiente

1. **Abra** o arquivo `.env.local` na raiz do projeto
2. **Substitua** os valores pelos reais:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui

# Database (usar a URL do Supabase)
DATABASE_URL=postgresql://postgres:[SUA-SENHA]@db.[SEU-PROJECT-REF].supabase.co:5432/postgres

# Next.js
NEXTAUTH_SECRET=seu_secret_aqui
NEXTAUTH_URL=http://localhost:3001
```

### 4. Configurar Banco de Dados

```bash
# Executar migrações do Prisma
npx prisma db push

# Configurar banco do Supabase
npm run supabase:db
```

### 5. Configurar Autenticação

```bash
# Configurar usuário admin
npm run supabase:setup
```

### 6. Testar Configuração

```bash
# Iniciar servidor
npm run dev

# Acessar
http://localhost:3001/login
```

## 🔐 Credenciais Padrão

Após a configuração:
- **Email**: `admin@demo-company.com`
- **Senha**: `123456`

## 🛠️ Comandos Úteis

```bash
# Verificar configuração
npm run supabase:config

# Configurar banco
npm run supabase:db

# Configurar auth
npm run supabase:setup

# Ver logs do Supabase
npm run supabase:logs
```

## 🔍 Verificação

### 1. Testar Conexão
- Acesse: http://localhost:3001/login
- Faça login com as credenciais padrão
- Deve redirecionar para o dashboard

### 2. Verificar Dashboard
- Acesse: http://localhost:3001/dashboard
- Deve mostrar a interface normal
- Usuário deve estar logado

### 3. Verificar Supabase Dashboard
- Acesse: https://supabase.com/dashboard/project/[SEU-PROJETO]
- Vá em **Authentication** → **Users**
- Deve mostrar o usuário criado

## 🚨 Troubleshooting

### Erro: "Variáveis não configuradas"
```bash
# Verificar se .env.local existe
ls -la .env.local

# Verificar variáveis
cat .env.local
```

### Erro: "Conexão recusada"
```bash
# Verificar URL do Supabase
echo $NEXT_PUBLIC_SUPABASE_URL

# Testar conexão
npm run supabase:db
```

### Erro: "Tabela não encontrada"
```bash
# Executar migrações
npx prisma db push

# Verificar estrutura
npx prisma studio
```

### Erro: "Usuário não autenticado"
```bash
# Verificar configuração de auth
npm run supabase:setup

# Verificar logs
npm run supabase:logs
```

## 📊 Estrutura do Banco

Após a configuração, você terá:

### Tabelas Principais
- `users` - Usuários do sistema
- `contracts` - Contratos
- `employees` - Funcionários
- `company_functions` - Funções da empresa
- `transfer_requests` - Solicitações de transferência
- `nfc_badges` - Crachás NFC
- `audit_logs` - Logs de auditoria

### Políticas de Segurança
- RLS (Row Level Security) habilitado
- Usuários veem apenas seus dados
- Admin vê todos os dados

## 🎯 Próximos Passos

1. **Personalizar** interface de login
2. **Configurar** provedores OAuth (Google, GitHub)
3. **Implementar** recuperação de senha
4. **Adicionar** verificação de email
5. **Configurar** webhooks para sincronização

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do console
2. Consulte a documentação do Supabase
3. Verifique as variáveis de ambiente
4. Teste a conexão com `npm run supabase:db`

---

**🎉 Configuração concluída!** Seu sistema agora usa Supabase Auth real! 