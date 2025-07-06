# 📋 Exemplos Rápidos de APIs

Exemplos práticos e prontos para uso de endpoints de API.

## ⚠️ APIs Reais vs. Exemplos

### ✅ APIs que Existem no Projeto:
- `/api/protected/user-profile` - Dados do usuário autenticado
- `/api/protected/supabase-posts` - CRUD de posts no Supabase
- `/api/protected/dashboard-data` - Dados do dashboard
- `/api/webhooks/clerk` - Webhooks do Clerk
- `/api/whatsapp-contact` - Widget WhatsApp

### 📝 APIs de Exemplo (não implementadas):
- `/api/health` - Health check
- `/api/protected/upload` - Upload de arquivos
- `/api/webhooks/payment` - Webhooks de pagamento

## 🔒 API Protegida - Perfil do Usuário

```typescript
// src/app/api/protected/user-profile/route.ts (EXISTENTE)
import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json(
      { error: 'Não autorizado' },
      { status: 401 }
    );
  }

  const user = await currentUser();
  
  return NextResponse.json({
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress,
    name: `${user.firstName} ${user.lastName}`.trim()
  });
}
```

**Teste no Frontend:**
```typescript
const response = await fetch('/api/protected/user-profile');
const userData = await response.json();
```

## 📝 API com Validação - Criar Post

```typescript
// src/app/api/protected/supabase-posts/route.ts (EXISTENTE)
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const CreatePostSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  content: z.string().min(10, 'Conteúdo deve ter pelo menos 10 caracteres'),
  tags: z.array(z.string()).optional()
});

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const body = await request.json();
  const result = CreatePostSchema.safeParse(body);
  
  if (!result.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: result.error.errors },
      { status: 400 }
    );
  }

  const post = {
    id: Date.now(),
    ...result.data,
    userId,
    createdAt: new Date().toISOString()
  };

  return NextResponse.json(post, { status: 201 });
}
```

**Teste no Frontend:**
```typescript
const response = await fetch('/api/protected/supabase-posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Meu Post',
    content: 'Conteúdo do post aqui...',
    tags: ['exemplo', 'api']
  })
});
```

## 🔍 API com Paginação - Lista de Posts

```typescript
// src/app/api/protected/supabase-posts/route.ts (EXISTENTE) (adicionar ao arquivo acima)
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
  const search = searchParams.get('search') || '';

  // Simular busca no banco
  const allPosts = []; // Seus posts do banco de dados
  const filteredPosts = allPosts.filter(post => 
    post.userId === userId &&
    (search ? post.title.toLowerCase().includes(search.toLowerCase()) : true)
  );

  const startIndex = (page - 1) * limit;
  const posts = filteredPosts.slice(startIndex, startIndex + limit);

  return NextResponse.json({
    posts,
    pagination: {
      page,
      limit,
      total: filteredPosts.length,
      totalPages: Math.ceil(filteredPosts.length / limit)
    }
  });
}
```

## 📤 API de Upload de Arquivo

```typescript
// src/app/api/protected/upload/route.ts (EXEMPLO - não existe)
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  if (!file) {
    return NextResponse.json(
      { error: 'Arquivo não encontrado' },
      { status: 400 }
    );
  }

  // Validações
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: 'Arquivo muito grande (máx 5MB)' },
      { status: 400 }
    );
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: 'Tipo de arquivo não permitido' },
      { status: 400 }
    );
  }

  // Aqui você salvaria o arquivo (AWS S3, Cloudinary, etc.)
  const fileName = `${userId}-${Date.now()}-${file.name}`;
  
  return NextResponse.json({
    message: 'Upload realizado com sucesso',
    file: {
      name: fileName,
      size: file.size,
      type: file.type,
      url: `/uploads/${fileName}` // URL do arquivo salvo
    }
  });
}
```

**Uso no Frontend:**
```typescript
const handleUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/protected/upload', {  // EXEMPLO - API não existe
    method: 'POST',
    body: formData
  });

  const result = await response.json();
  console.log('Upload:', result);
};
```

## 🪝 Webhook Exemplo

```typescript
// src/app/api/webhooks/payment/route.ts (EXEMPLO - não existe)
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('stripe-signature');
    
    if (!signature) {
      return NextResponse.json(
        { error: 'Assinatura ausente' },
        { status: 400 }
      );
    }

    const body = await request.text();
    
    // Verificar assinatura do Stripe (exemplo)
    // const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    const event = JSON.parse(body);

    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('Pagamento aprovado:', event.data.object.id);
        // Atualizar status do pedido
        break;
        
      case 'payment_intent.payment_failed':
        console.log('Pagamento falhou:', event.data.object.id);
        // Notificar falha
        break;
        
      default:
        console.log('Evento não tratado:', event.type);
    }

    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('Erro no webhook:', error);
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 400 }
    );
  }
}
```

## 🧪 Testando APIs

### 1. Com curl

```bash
# API pública
# curl http://localhost:3000/api/health  # API não existe - exemplo apenas

# API protegida (precisa do token)
curl -H "Authorization: Bearer SEU_TOKEN" \
     http://localhost:3000/api/protected/user-profile
```

### 2. Com JavaScript (Frontend)

```typescript
// Hook personalizado para APIs
const useApi = () => {
  const callApi = async (endpoint: string, options?: RequestInit) => {
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro na API');
    }

    return response.json();
  };

  return { callApi };
};

// Uso
const { callApi } = useApi();

const userData = await callApi('/api/protected/user-profile');
const newPost = await callApi('/api/protected/supabase-posts', {
  method: 'POST',
  body: JSON.stringify({ title: 'Novo Post', content: 'Conteúdo...' })
});
```

### 3. Página de Demonstração

Use a página `/api-demo` para testar interativamente todas as APIs!

## Importação em Massa de Funcionários

### Endpoint
```
POST /api/employees/import
```

### Formato de Dados
A API aceita um array de objetos JSON com os dados dos funcionários. Os campos correspondem ao arquivo CSV de modelo.

#### Campos Obrigatórios
- `name`: Nome completo do funcionário
- `registration`: Matrícula única por empresa
- `company`: Nome da empresa
- `cpf`: CPF válido (será validado pelo algoritmo oficial)

#### Campos Opcionais
- `phone`: Telefone (10 ou 11 dígitos)
- `birthDate`: Data de nascimento (formato DD/MM/YYYY)
- `admissionDate`: Data de admissão (formato DD/MM/YYYY)
- `gender`: Sexo
- `maritalStatus`: Estado civil
- `role`: Função/cargo
- `category`: Categoria
- `pis`: PIS
- `ctps`: CTPS
- `ctpsSeries`: Série da CTPS
- `ctpsUf`: UF da CTPS
- `motherName`: Nome da mãe
- `status`: Status do funcionário
- `centroCusto`: Centro de custo
- `obra`: Obra/projeto
- `mo`: Tipo de mão de obra
- `localAlojado`: Local/alojamento
- `pontoReferencia`: Ponto de referência
- `statusBancodoc`: Status bancário/documental
- `efetivoRDO`: Efetivo em RDO (true/false)

### Exemplo de Requisição
```json
POST /api/employees/import
Content-Type: application/json

[
  {
    "name": "João Silva Santos",
    "registration": "12345",
    "company": "SARTORI SERVIÇOS",
    "cpf": "12345678901",
    "phone": "31987654321",
    "birthDate": "15/05/1985",
    "admissionDate": "01/03/2024",
    "gender": "Masculino",
    "maritalStatus": "Solteiro",
    "role": "Operador",
    "category": "CLT",
    "motherName": "Maria Silva",
    "status": "Ativo"
  },
  {
    "name": "Maria Santos Costa",
    "registration": "12346",
    "company": "SARTORI SERVIÇOS",
    "cpf": "98765432100",
    "phone": "31987654322",
    "birthDate": "20/08/1990",
    "admissionDate": "15/03/2024",
    "gender": "Feminino",
    "maritalStatus": "Casada",
    "role": "Auxiliar",
    "category": "CLT",
    "motherName": "Ana Santos",
    "status": "Ativo"
  }
]
```

### Exemplo de Resposta de Sucesso
```json
{
  "success": true,
  "summary": {
    "total": 2,
    "created": 2,
    "failed": 0
  },
  "results": [
    {
      "index": 1,
      "name": "João Silva Santos",
      "registration": "12345",
      "status": "success",
      "id": "cm123abc456"
    },
    {
      "index": 2,
      "name": "Maria Santos Costa",
      "registration": "12346",
      "status": "success",
      "id": "cm123def789"
    }
  ],
  "createdEmployees": [
    {
      "id": "cm123abc456",
      "name": "João Silva Santos",
      "registration": "12345",
      "cpf": "12345678901"
    },
    {
      "id": "cm123def789",
      "name": "Maria Santos Costa",
      "registration": "12346",
      "cpf": "98765432100"
    }
  ],
  "failedEmployees": []
}
```

### Exemplo de Resposta com Erros
```json
{
  "success": true,
  "summary": {
    "total": 2,
    "created": 1,
    "failed": 1
  },
  "results": [
    {
      "index": 1,
      "name": "João Silva Santos",
      "registration": "12345",
      "status": "success",
      "id": "cm123abc456"
    },
    {
      "index": 2,
      "name": "Maria Santos Costa",
      "registration": "",
      "status": "error",
      "errors": {
        "registration": "Matrícula é obrigatória",
        "cpf": "CPF inválido"
      }
    }
  ],
  "createdEmployees": [
    {
      "id": "cm123abc456",
      "name": "João Silva Santos",
      "registration": "12345",
      "cpf": "12345678901"
    }
  ],
  "failedEmployees": [
    {
      "index": 2,
      "name": "Maria Santos Costa",
      "errors": {
        "registration": "Matrícula é obrigatória",
        "cpf": "CPF inválido"
      }
    }
  ]
}
```

### Validações Implementadas

#### CPF
- Verifica se o CPF tem 11 dígitos
- Valida usando o algoritmo oficial do CPF
- Verifica se não são todos os dígitos iguais
- Verifica unicidade no banco de dados

#### Telefone
- Deve ter entre 10 e 11 dígitos (após remoção de formatação)
- Aceita formatação como (31) 99999-9999

#### Datas
- Aceita formato DD/MM/YYYY
- Valida se a data é válida
- Converte automaticamente para formato ISO

#### Matrícula
- Deve ser única por empresa
- Considera apenas funcionários ativos

#### Caracteres Especiais
- Todos os campos de texto são normalizados usando UTF-8
- Suporte completo para acentos e caracteres especiais

### Códigos de Status HTTP
- `200`: Sucesso (mesmo com alguns erros individuais)
- `400`: Formato de dados inválido
- `500`: Erro interno do servidor

### Tratamento de Erros
A API processa todos os registros e retorna:
- Lista detalhada de sucessos e falhas
- Resumo com contadores
- Funcionários criados com sucesso
- Lista de funcionários que falharam com motivos específicos

### Exemplo de Uso com JavaScript/TypeScript
```typescript
const employeesData = [
  // ... dados dos funcionários
];

const response = await fetch('/api/employees/import', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(employeesData)
});

const result = await response.json();

if (result.success) {
  console.log(`${result.summary.created} funcionários criados com sucesso`);
  console.log(`${result.summary.failed} funcionários falharam`);
  
  if (result.failedEmployees.length > 0) {
    console.log('Funcionários com erro:', result.failedEmployees);
  }
} else {
  console.error('Erro na importação:', result.error);
}
```

### Conversão de CSV para JSON
Para converter o arquivo CSV para o formato JSON aceito pela API:

```javascript
// Exemplo de conversão de dados CSV
function convertCSVRowToJSON(csvRow) {
  return {
    name: csvRow.name,
    registration: csvRow.registration,
    company: csvRow.company,
    cpf: csvRow.cpf,
    phone: csvRow.phone,
    birthDate: csvRow.birthDate,
    gender: csvRow.gender,
    maritalStatus: csvRow.maritalStatus,
    pis: csvRow.pis,
    ctps: csvRow.ctps,
    ctpsSeries: csvRow.ctpsSeries,
    ctpsUf: csvRow.ctpsUf,
    motherName: csvRow.motherName,
    role: csvRow.role,
    category: csvRow.category,
    currentContractId: csvRow.currentContractId,
    admissionDate: csvRow.admissionDate,
    status: csvRow.status
  };
}
```

---

💡 **Dica**: Copie estes exemplos e adapte para suas necessidades específicas!