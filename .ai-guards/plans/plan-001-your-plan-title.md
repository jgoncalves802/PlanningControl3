---
id: plan-001
title: Transição de Mock para Banco de Dados Real
createdAt: 2025-07-06
author: Junior Silva
status: in-progress
---

## 🧩 Scope

Atualizar toda a aplicação para consumir dados reais do banco de dados (PostgreSQL/Supabase via Prisma Client) ao invés de dados mockados em arquivos locais. O objetivo é garantir que todas as telas, hooks, services e fluxos passem a refletir o estado real do banco, suportando leitura, escrita, atualização e deleção de dados reais, com segurança, performance e rastreabilidade.

## ✅ Functional Requirements

- Substituir todos os imports e usos de dados mock (ex: mockEmployees, mockContracts, mockTransferRequests) por queries/mutations reais no banco.
- Refatorar services/hooks para usar Prisma Client/Supabase Client.
- Garantir que todas as operações CRUD (listar, criar, editar, deletar) funcionem com dados reais.
- Atualizar componentes de UI para lidar com loading, erro e estados vazios reais.
- Garantir que filtros, buscas, paginação e ordenação funcionem com queries reais.
- Manter tipagem forte e contratos de dados (TypeScript).
- Garantir que testes automatizados usem banco de dados de teste ou mocks de Prisma.

## ⚙️ Non-Functional Requirements

- Performance: Queries otimizadas, uso de índices, paginação server-side.
- Security: Uso de policies (RLS) no Supabase, validação de entrada, tratamento de erros.
- Scalability: Pronto para multi-tenant, queries isoladas por tenant, suporte a grandes volumes de dados.

## 📚 Guidelines & Packages

- Seguir guidelines de arquitetura MCP, docs internas e padrões de hooks/services.
- Usar Prisma Client para queries/mutations (ou Supabase Client se preferir direto).
- Refatorar arquivos como `lib/employeeService.ts`, `hooks/queries`, `hooks/mutations` para consumir o banco.
- Atualizar componentes como `EmployeesPage`, `CustomGridTable`, etc, para usar os novos hooks/services.
- Garantir internacionalização, acessibilidade e responsividade.
- Testes: Jest + React Testing Library + mocks de Prisma.
- Pacotes: @prisma/client, prisma, @supabase/supabase-js (se necessário), zod, react-query, etc.

## 🔐 Threat Model (Stub)

- Exposição de dados sensíveis por queries sem filtro de tenant.
- Falhas de validação permitindo SQL injection ou dados inválidos.
- Falta de tratamento de erros pode expor stack traces ou dados internos.
- Queries sem paginação podem causar lentidão ou DoS.

## 🔢 Execution Plan

1. Mapear todos os pontos da aplicação que usam dados mock (ex: `mock-data.ts`, `mockEmployees`, etc). ✅
2. Refatorar os services/hooks para consumir dados do banco via Prisma Client/Supabase Client.
   - [x] ✅ Refatorar `lib/employeeService.ts` para usar Prisma Client (listar funcionários)
   - [x] ✅ Refatorar `lib/employeeService.ts` para criar funcionário
   - [x] ✅ Refatorar `lib/employeeService.ts` para editar funcionário
   - [x] ✅ Refatorar `lib/employeeService.ts` para deletar funcionário
   - [x] ✅ Hooks customizados (`useEmployeesQuery`, `useCreateEmployee`) usando React Query já implementados
   - [x] ✅ Garantir tipagem forte e contratos (TypeScript configurado)
   - [x] ✅ Testar integração service <-> banco (funcionando com Prisma + PostgreSQL)
3. Atualizar componentes de UI para usar os novos hooks/services e lidar com loading/erro/empty state. ✅
4. Garantir que todas as operações CRUD estejam funcionando com dados reais (testar fluxo completo). ✅
5. Remover imports e dependências de dados mockados. ✅
6. [ ] Atualizar testes automatizados para usar banco de teste ou mocks de Prisma.
7. [x] ✅ Validar segurança (RLS, validação de entrada, tratamento de erros) - Implementado
8. [ ] Atualizar documentação interna e exemplos de uso.

## 🐛 Bugs Corrigidos

- [x] ✅ Corrigir tratamento de campos de data (conversão de strings vazias para null)
- [x] ✅ Aplicar migração para tornar campos opcionais no banco de dados
- [x] ✅ Corrigir endpoint PUT de funcionários para filtrar campos válidos
- [x] ✅ Implementar upload de avatar para funcionários
- [x] ✅ Corrigir tooltips na tabela (substituir DaisyUI por CSS customizado)
- [x] ✅ Adicionar traduções faltantes para histórico de funcionários
- [x] ✅ Configurar .gitignore para ignorar arquivos de build do Next.js

## 📊 Status Atual

**Status**: 🟡 Em Progresso (85% concluído)

**Módulo Funcionários**: ✅ **COMPLETO**
- ✅ CRUD completo funcionando com banco real
- ✅ Upload de avatar implementado
- ✅ Tooltips funcionais
- ✅ Traduções completas
- ✅ Validação de dados
- ✅ Tratamento de erros
- ✅ Interface responsiva

**Próximos passos**:
1. Implementar testes automatizados
2. Expandir para outros módulos (Contratos, Transferências, etc.)
3. Atualizar documentação
