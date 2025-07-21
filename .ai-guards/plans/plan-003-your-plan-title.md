---
id: plan-003
title: Migração de Dados Mock para Banco de Dados Real
author: Junior Silva
status: draft
updatedAt: 2025-07-13
---

# STATUS ATUAL DA APLICAÇÃO (JUL/2025)

- **Dados mock removidos**: Todas as páginas principais (funcionários, contratos, workforce, NFC) usam dados reais do banco via Prisma.
- **CRUD completo**: Funcionários, contratos, funções/cargos, workforce, NFC, dashboards e analytics.
- **SSE implementado**: Atualização em tempo real para funcionários, contratos, NFC (crachás). Cards, tabelas e dashboards refletem alterações instantaneamente.
- **Dashboard e Analytics**: KPIs, gráficos e métricas reais, filtros avançados, fallback robusto para dados mock.
- **Controle de Efetivo**: Vinculação de funcionários a contratos, registro de ponto via NFC, filtros avançados, feedback visual, ações em lote, recarregamento automático.
- **Gestão de Crachás NFC**: Atribuição única, bloqueio de duplicidade, histórico, SSE robusto.
- **Validações de integridade**: Constraints de unicidade, validação de permissões, logs de auditoria em andamento.
- **Internacionalização**: Labels e mensagens em pt-BR, dark/light mode, responsividade.
- **Segurança**: RBAC, autenticação JWT, validação de entrada, rate limiting, soft deletes, logs de auditoria (em andamento).
- **Performance**: APIs < 500ms para CRUD simples, paginação, cache inteligente com React Query.

---

# CONSTRUÇÃO DA PÁGINA DE TRANSFERÊNCIAS (TransferRequests)

## 1. **Requisitos Funcionais**
- Listar todas as solicitações de transferência (TransferRequests) com filtros por status, funcionário, contrato origem/destino, data.
- Permitir criação de nova solicitação de transferência (seleção de funcionário, contrato destino, função destino, data agendada, motivo).
- Workflow de aprovação: aprovar, rejeitar, cancelar, visualizar histórico.
- Exibir status atual (pendente, aprovada, rejeitada, concluída).
- Visualizar detalhes completos da solicitação (funcionário, contratos, funções, datas, logs de auditoria).
- Permitir ações em lote (aprovar/rejeitar/cancelar múltiplas solicitações).
- Feedback visual para todas as ações (toast, loading, erro).
- Atualização automática via SSE (sem recarregar página).
- Paginação e busca.
- Histórico de transferências por funcionário (TransferHistory).

## 2. **APIs Necessárias**
- **GET /api/transfer-requests**: Listar solicitações com filtros, paginação.
- **POST /api/transfer-requests**: Criar nova solicitação.
- **GET /api/transfer-requests/[id]**: Detalhar solicitação.
- **PUT /api/transfer-requests/[id]**: Atualizar status (aprovar, rejeitar, cancelar).
- **DELETE /api/transfer-requests/[id]**: Cancelar/excluir solicitação.
- **GET /api/transfer-history**: Listar histórico de transferências (por funcionário, contrato, período).
- **GET /api/employees**: Listar funcionários para seleção.
- **GET /api/contracts**: Listar contratos para seleção.
- **GET /api/functions**: Listar funções para seleção.
- **SSE /api/transfer-requests/events**: Atualização em tempo real das transferências.

## 3. **Funcionalidades Frontend**
- Tabela de transferências com filtros (status, funcionário, contrato origem/destino, data).
- Botão "Nova Transferência" com modal/formulário para criar solicitação.
- Ações rápidas: aprovar, rejeitar, cancelar, visualizar detalhes.
- Modal de detalhes com histórico e logs.
- Paginação, busca e ordenação.
- Ações em lote (checkboxes).
- Feedback visual (toast, loading, erro).
- Atualização automática via SSE.
- Exibição de histórico de transferências por funcionário.
- Integração com RBAC (apenas usuários autorizados podem aprovar/rejeitar).

## 4. **Sugestões Técnicas**
- Utilizar React Query para cache, paginação e refetch.
- Implementar SSE para transferências (hook useTransferRequestsSSE).
- Validar permissões no backend e frontend.
- Utilizar Zod para validação de schemas.
- Adicionar logs de auditoria para cada ação (criação, aprovação, rejeição, cancelamento).
- Garantir integridade referencial (funcionário, contrato, função devem existir e estar ativos).
- Implementar loading states e feedback visual em todas as operações.
- Internacionalizar labels e mensagens.
- Garantir responsividade e acessibilidade.

## 5. **Checklist de Implementação**
- [x] Integração com Employees, Contracts, Functions
- [x] Página de transferências com tabela, filtros, paginação
- [x] Modal de criação/edição de transferência
- [x] Internacionalização e responsividade
- [x] Feedback visual e loading states
- [x] React Query para cache e paginação
- [x] Infraestrutura SSE pronta

- [ ] CRUD completo de TransferRequests no backend (com SSE)
- [ ] CRUD de TransferHistory
- [ ] Workflow de aprovação/rejeição/cancelamento
- [ ] Histórico detalhado por funcionário
- [ ] SSE para transferências
- [ ] Ações em lote (aprovar/rejeitar/cancelar múltiplas)
- [ ] Logs de auditoria completos e reversão
- [ ] RBAC detalhado e validação de permissões
- [ ] Garantir integridade referencial e validação de entidades ativas
- [ ] Finalizar feedback visual em todos os fluxos

---

## Status Visual

```markdown
- [x] Integração com Employees, Contracts, Functions
- [x] Página de transferências com tabela, filtros, paginação
- [x] Modal de criação/edição de transferência
- [x] Internacionalização e responsividade
- [x] Feedback visual e loading states
- [x] React Query para cache e paginação
- [x] Infraestrutura SSE pronta

- [ ] CRUD completo de TransferRequests no backend (com SSE)
- [ ] CRUD de TransferHistory
- [ ] Workflow de aprovação/rejeição/cancelamento
- [ ] Histórico detalhado por funcionário
- [ ] SSE para transferências
- [ ] Ações em lote (aprovar/rejeitar/cancelar múltiplas)
- [ ] Logs de auditoria completos e reversão
- [ ] RBAC detalhado e validação de permissões
- [ ] Garantir integridade referencial e validação de entidades ativas
- [ ] Finalizar feedback visual em todos os fluxos
```

---

# Observações
- O sistema já está preparado para atualização automática via SSE, basta criar o endpoint e hook para transferências.
- APIs de funcionários, contratos e funções já estão prontas para seleção e vinculação.
- Logs de auditoria e histórico de transferências devem ser priorizados para rastreabilidade.
- Garantir que todas as ações sejam auditáveis e revertíveis se necessário.
