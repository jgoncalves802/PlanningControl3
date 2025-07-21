# Mensagem de Commit

```
refactor(db): remove campos role e category da tabela Employee

BREAKING CHANGE: Campos role e category removidos da tabela Employee

## Mudanças Principais

### Database Schema
- Remove campos `role` e `category` da tabela Employee
- Mantém apenas `currentFunctionId` para relacionamento com ContractFunction
- Aplica migração mesmo com dados existentes (34 registros com category, 4 com role)

### API Endpoints
- app/api/employees/route.ts: Remove referências a role/category
- app/api/employees/[id]/route.ts: Atualiza validação de campos
- app/api/employees/import/route.ts: Remove campos da importação CSV
- Inclui currentFunction, companyFunction e currentContract nas queries

### Frontend Components
- components/employees/EmployeeTable.tsx: Atualiza exibição de cargo
- components/employees/EmployeeAddModal.tsx: Remove campo role
- components/employees/EmployeeEditModal.tsx: Usa currentFunction.name

### TypeScript Types
- lib/mock-data.ts: Remove role e category da interface Employee
- lib/test-import.ts: Remove campos da importação de teste

## Benefícios
- Elimina duplicação de dados entre role/category e currentFunction
- Mantém integridade referencial com tabela ContractFunction
- Simplifica manutenção e evita inconsistências
- Melhora performance das queries

## Impacto
- Funcionários sem currentFunctionId não terão cargo exibido
- Importação CSV não incluirá mais role/category
- Interface mostrará apenas função atual do funcionário

## Migração
- Dados existentes foram preservados durante a migração
- Cliente Prisma regenerado com sucesso
- Servidor funcionando normalmente após mudanças 