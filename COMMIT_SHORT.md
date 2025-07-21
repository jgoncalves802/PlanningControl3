# Commit Conciso

```
refactor(db): remove campos role e category da tabela Employee

- Remove duplicação de dados entre role/category e currentFunction
- Atualiza API endpoints, componentes frontend e tipos TypeScript
- Mantém apenas currentFunctionId para relacionamento com ContractFunction
- Aplica migração com dados existentes preservados

BREAKING CHANGE: Campos role e category removidos da tabela Employee
``` 