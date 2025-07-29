fix: corrigir erro 500 na API de orçamentos com filtro status=all

- Corrigir PrismaClientValidationError ao usar "all" como status
- Implementar verificação if (status && status !== 'all') na API
- Corrigir acesso aos dados retornados pelo hook useBudgets
- Ajustar estrutura de dados na página de orçamentos

Arquivos: app/api/budgets/route.ts, app/dashboard/budgets/page.tsx 