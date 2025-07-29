fix(api): proteção de integridade para deleção de funcionários

Implementa verificação de dependências TransferRequest antes da deleção.
Retorna erro 400 informativo em vez de erro 500 de constraint SQL.
Melhora UX com mensagem clara sobre como resolver o problema.

✅ Testado: DELETE /api/employees/[id] → 400 Bad Request 