---
id: plan-002
title: Implementar Aba de Funções/Cargos na Página de Funcionários
createdAt: 2025-07-06
author: Junior Silva
status: draft
---

## 🧩 Scope

Implementar uma nova aba "Funções" dentro da página de funcionários que permita gerenciar as funções/cargos da empresa e classificar o tipo de mão de obra (Direto/Indireto). A funcionalidade deve incluir CRUD completo para funções, integração com o sistema de funcionários existente, e interface responsiva seguindo o padrão visual da aplicação.

## ✅ Functional Requirements

- Criar aba "Funções" na página de funcionários com navegação entre "Funcionários" e "Funções"
- Implementar CRUD completo para funções/cargos:
  - Listar todas as funções da empresa
  - Criar nova função com nome e tipo de mão de obra
  - Editar função existente
  - Excluir função (com validação se há funcionários associados)
- Classificar funções por tipo de mão de obra: "Direto" ou "Indireto"
- Integrar com sistema de funcionários (relacionamento função-funcionário)
- Filtros e busca por nome da função e tipo de mão de obra
- Exportação de dados (CSV, XLSX, PDF)
- Validação de dados e tratamento de erros
- Interface responsiva e acessível
- Suporte a internacionalização (pt-BR/en-US)

## ⚙️ Non-Functional Requirements

- Performance: Queries otimizadas, paginação se necessário
- Security: Validação de permissões, apenas usuários autorizados podem gerenciar funções
- Scalability: Suporte a multi-tenant, isolamento por empresa
- Usability: Interface intuitiva seguindo padrões da aplicação
- Accessibility: Suporte a leitores de tela, navegação por teclado
- Responsiveness: Funcional em desktop, tablet e mobile

## 📚 Guidelines & Packages

- Seguir padrões estabelecidos na aplicação (MCP guidelines, docs internas)
- Usar componentes UI existentes (Button, Card, Modal, etc.)
- Implementar com TypeScript e tipagem forte
- Usar Tailwind CSS para estilização
- Integrar com Prisma Client para operações de banco
- Usar React Query para cache e sincronização
- Seguir padrões de internacionalização (next-intl)
- Manter consistência visual com página de funcionários
- Usar ícones do Lucide React
- Implementar com Framer Motion para animações

## 🔐 Threat Model

- Acesso não autorizado a funções de outras empresas (isolamento tenant)
- Exclusão acidental de funções com funcionários associados
- Injeção de dados maliciosos nos campos de texto
- Exposição de informações sensíveis da empresa
- Manipulação de permissões para acesso não autorizado

## 🔢 Execution Plan

### 1. Preparação do Backend (API e Banco de Dados)
- [ ] Criar modelo `CompanyFunction` no schema Prisma
- [ ] Gerar e aplicar migração do banco de dados
- [ ] Criar endpoints da API:
  - [ ] `GET /api/functions` - Listar funções
  - [ ] `POST /api/functions` - Criar função
  - [ ] `PUT /api/functions/[id]` - Atualizar função
  - [ ] `DELETE /api/functions/[id]` - Excluir função
- [ ] Implementar validações de segurança e isolamento tenant
- [ ] Atualizar modelo Employee para referenciar CompanyFunction

### 2. Hooks e Services (Frontend)
- [ ] Criar `useFunctionsQuery` hook para listar funções
- [ ] Criar `useCreateFunction` hook para criar função
- [ ] Criar `useUpdateFunction` hook para atualizar função
- [ ] Criar `useDeleteFunction` hook para excluir função
- [ ] Implementar cache e sincronização com React Query
- [ ] Adicionar tratamento de erros e loading states

### 3. Interface de Usuário
- [ ] Implementar sistema de abas na página de funcionários
- [ ] Criar componente `FunctionsTab` com:
  - [ ] Lista de funções em tabela responsiva
  - [ ] Botões de ação (criar, editar, excluir)
  - [ ] Filtros por nome e tipo de mão de obra
  - [ ] Campo de busca
  - [ ] Indicadores de status e estatísticas
- [ ] Criar modal de criação/edição de função
- [ ] Implementar validação de formulários
- [ ] Adicionar confirmação para exclusão

### 4. Integração e Funcionalidades Avançadas
- [ ] Integrar funções com cadastro de funcionários
- [ ] Implementar dropdown de funções no formulário de funcionário
- [ ] Adicionar validação de exclusão (verificar funcionários associados)
- [ ] Implementar exportação de dados (CSV, XLSX, PDF)
- [ ] Adicionar estatísticas (total de funções, distribuição por tipo)

### 5. Internacionalização e Acessibilidade
- [ ] Adicionar traduções em `messages/pt-BR.json` e `messages/en-US.json`
- [ ] Implementar suporte a leitores de tela
- [ ] Garantir navegação por teclado
- [ ] Testar responsividade em diferentes dispositivos

### 6. Testes e Validação
- [ ] Criar testes unitários para hooks e componentes
- [ ] Testar integração com banco de dados
- [ ] Validar permissões e segurança
- [ ] Testar fluxos completos de CRUD
- [ ] Verificar performance com grande volume de dados

### 7. Documentação e Deploy
- [ ] Atualizar documentação da API
- [ ] Documentar novos componentes e hooks
- [ ] Atualizar guias de uso para usuários
- [ ] Deploy e testes em ambiente de produção

## 📊 Estrutura de Dados

### Modelo CompanyFunction (Prisma)
```prisma
model CompanyFunction {
  id          String   @id @default(cuid())
  name        String   // Nome da função (ex: "PEDREIRO", "SOLDADOR")
  laborType   LaborType // Tipo de mão de obra
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relacionamentos
  employees   Employee[] @relation("EmployeeFunction")
  
  @@unique([name]) // Nome único por empresa
}

enum LaborType {
  DIRETO    // Mão de obra direta
  INDIRETO  // Mão de obra indireta
}
```

### Interface TypeScript
```typescript
interface CompanyFunction {
  id: string
  name: string
  laborType: 'DIRETO' | 'INDIRETO'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  _count?: {
    employees: number
  }
}
```

## 🎨 Design System

### Componentes Principais
- **FunctionsTab**: Container principal da aba
- **FunctionsList**: Tabela de funções
- **FunctionModal**: Modal para criar/editar
- **FunctionFilters**: Filtros e busca
- **FunctionStats**: Estatísticas e indicadores

### Cores e Ícones
- Ícone da aba: `Briefcase` (Lucide React)
- Cor primária: Seguir padrão da aplicação
- Tipo "Direto": Badge verde
- Tipo "Indireto": Badge azul

### Estados Visuais
- Loading: Skeleton components
- Erro: Mensagens de erro contextuais
- Vazio: Ilustração com call-to-action
- Sucesso: Toasts de confirmação

## 🔄 Fluxos de Usuário

### Fluxo Principal - Gerenciar Funções
1. Usuário acessa página de funcionários
2. Clica na aba "Funções"
3. Visualiza lista de funções existentes
4. Pode filtrar por tipo ou buscar por nome
5. Clica em "Adicionar Função"
6. Preenche formulário (nome + tipo)
7. Salva e recebe confirmação
8. Nova função aparece na lista

### Fluxo Secundário - Editar/Excluir
1. Na lista de funções, clica em ação
2. Para editar: abre modal com dados preenchidos
3. Para excluir: mostra confirmação
4. Se função tem funcionários: impede exclusão
5. Mostra feedback de sucesso/erro

## 📈 Métricas de Sucesso

- Tempo de carregamento da aba < 200ms
- Taxa de erro em operações CRUD < 1%
- Satisfação do usuário > 90%
- Cobertura de testes > 80%
- Acessibilidade score > 95%
