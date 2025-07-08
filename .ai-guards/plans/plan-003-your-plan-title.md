---
id: plan-003
title: Migração de Dados Mock para Banco de Dados Real
createdAt: 2025-07-07
author: Junior Silva
status: draft
---

## 🧩 Scope

Migrar completamente a aplicação do uso de dados mock (lib/mock-data.ts) para utilização de dados reais do banco de dados PostgreSQL via Prisma ORM. Implementar todos os CRUDs faltantes para as entidades que ainda não possuem APIs completas, garantindo que todas as funcionalidades da aplicação funcionem com dados persistentes.

## ✅ Functional Requirements

### 1. Migração de Dados Mock
- Remover dependências de `lib/mock-data.ts` em todos os componentes e páginas
- Substituir dados mock por chamadas de API reais
- Migrar todas as interfaces TypeScript para tipos baseados no schema Prisma

### 2. APIs CRUD Faltantes
- **Contratos (Contracts)**: Implementar CRUD completo
- **Usuários (Users)**: Implementar CRUD completo com autenticação
- **ASOs**: Implementar CRUD completo para exames médicos
- **Treinamentos (Trainings)**: Implementar CRUD completo
- **Treinamentos de Funcionários (EmployeeTrainings)**: Implementar CRUD completo
- **Solicitações de Transferência (TransferRequests)**: Implementar CRUD completo
- **Histórico de Transferências (TransferHistory)**: Implementar CRUD completo
- **Registros de Ponto (TimeRecords)**: Implementar CRUD completo
- **Coleções NFC (NFCCollections)**: Implementar CRUD completo
- **Planejamento de Horas (HourPlanning)**: Implementar CRUD completo
- **Logs de Auditoria (AuditLogs)**: Implementar CRUD completo

### 3. Funcionalidades de Dashboard
- Implementar estatísticas reais baseadas em dados do banco
- Criar endpoints para métricas e KPIs
- Implementar sistema de notificações em tempo real

### 4. Funcionalidades de Segurança
- Gerenciamento completo de ASOs com alertas de vencimento
- Sistema de treinamentos obrigatórios por contrato
- Validações de segurança para transferências

### 5. Sistema de Transferências
- Workflow completo de aprovação de transferências
- Validações de segurança e treinamentos
- Histórico completo de transferências

### 6. Controle de Ponto
- Sistema NFC para registro de ponto
- Importação de dados de folha de pagamento
- Relatórios de presença e horas trabalhadas

### 7. Planejamento de Projetos
- Gerenciamento de fases de projeto
- Alocação de recursos humanos
- Controle de custos e orçamento

## ⚙️ Non-Functional Requirements

### Performance
- APIs devem responder em menos de 500ms para operações CRUD simples
- Queries complexas (relatórios) devem responder em menos de 2s
- Implementar paginação para listas com mais de 100 itens
- Cache inteligente com React Query (staleTime: 5min, gcTime: 10min)

### Security
- Autenticação JWT com refresh tokens
- Autorização baseada em roles (RBAC)
- Validação de entrada em todos os endpoints
- Sanitização de dados para prevenir XSS/SQL Injection
- Rate limiting (100 requests/min por usuário)

### Scalability
- Suporte a multi-tenancy (separação por empresa)
- Índices otimizados no banco de dados
- Queries eficientes com includes seletivos
- Soft deletes para preservar histórico

### Data Integrity
- Validações rigorosas no Prisma schema
- Constraints de unicidade adequadas
- Transações para operações complexas
- Backup automático de dados críticos

## 📚 Guidelines & Packages

### Arquitetura e Padrões
- Seguir padrões definidos em `/docs` e `AGENT.md`
- Manter estrutura de pastas consistente: `/app/api/[entity]/route.ts`
- Usar TypeScript estrito com interfaces bem definidas
- Implementar error boundaries e tratamento de erros

### Packages e Tecnologias
- **Prisma ORM** (já configurado) - Acesso ao banco de dados
- **React Query/TanStack Query** (já configurado) - Cache e sincronização
- **Zod** (adicionar) - Validação de schemas
- **jose** (adicionar) - JWT handling
- **bcrypt** (adicionar) - Hash de senhas
- **date-fns** (já configurado) - Manipulação de datas
- **react-hot-toast** (já configurado) - Notificações

### Internacionalização e UX
- Manter suporte a pt-BR em todas as mensagens
- Implementar loading states para todas as operações
- Feedback visual para sucesso/erro em todas as ações
- Manter responsividade e suporte a dark/light mode

## 🔐 Threat Model

### Ameaças de Segurança
- **SQL Injection**: Mitigado pelo Prisma ORM e validações Zod
- **XSS**: Sanitização de inputs e outputs, CSP headers
- **CSRF**: Tokens CSRF em formulários críticos
- **Broken Authentication**: Implementar refresh tokens e logout seguro
- **Insecure Direct Object References**: Validar ownership em todos os endpoints
- **Mass Assignment**: Whitelist de campos permitidos em cada endpoint

### Ameaças de Dados
- **Data Breach**: Criptografia em repouso, logs de auditoria
- **Data Loss**: Backups automáticos, soft deletes
- **Data Corruption**: Validações rigorosas, transações ACID
- **Unauthorized Access**: RBAC granular, logs de acesso

### Ameaças Operacionais
- **DoS/DDoS**: Rate limiting, monitoring de recursos
- **Privilege Escalation**: Validação de roles em cada operação
- **Session Hijacking**: Secure cookies, HTTPS obrigatório

## 🔢 Execution Plan

### Fase 1: Preparação e Infraestrutura (2-3 dias)
1. **Configurar validações e segurança**
   - Instalar e configurar Zod para validação de schemas
   - Implementar middleware de autenticação JWT
   - Configurar rate limiting e CORS
   - Criar tipos TypeScript baseados no Prisma schema

2. **Otimizar schema do banco**
   - Revisar e otimizar índices existentes
   - Adicionar constraints faltantes
   - Implementar soft deletes onde necessário
   - Criar views para queries complexas

### Fase 2: APIs CRUD Básicas (5-7 dias)
3. **Implementar CRUD de Contratos**
   - GET /api/contracts (listar com filtros e paginação)
   - POST /api/contracts (criar contrato)
   - GET /api/contracts/[id] (buscar por ID)
   - PUT /api/contracts/[id] (atualizar contrato)
   - DELETE /api/contracts/[id] (soft delete)
   - Endpoints relacionados: funções, responsáveis, treinamentos obrigatórios

4. **Implementar CRUD de Usuários**
   - GET /api/users (listar com filtros e paginação)
   - POST /api/users (criar usuário com hash de senha)
   - GET /api/users/[id] (buscar por ID)
   - PUT /api/users/[id] (atualizar usuário)
   - DELETE /api/users/[id] (soft delete)
   - POST /api/auth/login (autenticação)
   - POST /api/auth/refresh (refresh token)
   - POST /api/auth/logout (logout seguro)

5. **Implementar CRUD de Treinamentos**
   - GET /api/trainings (listar treinamentos disponíveis)
   - POST /api/trainings (criar novo treinamento)
   - GET /api/trainings/[id] (buscar por ID)
   - PUT /api/trainings/[id] (atualizar treinamento)
   - DELETE /api/trainings/[id] (soft delete)

6. **Implementar CRUD de Treinamentos de Funcionários**
   - GET /api/employee-trainings (listar com filtros)
   - POST /api/employee-trainings (registrar conclusão)
   - GET /api/employee-trainings/[id] (buscar por ID)
   - PUT /api/employee-trainings/[id] (atualizar registro)
   - DELETE /api/employee-trainings/[id] (remover registro)
   - GET /api/employees/[id]/trainings (treinamentos do funcionário)

### Fase 3: Módulos de Segurança e Saúde (3-4 dias)
7. **Implementar CRUD de ASOs**
   - GET /api/asos (listar com filtros de vencimento)
   - POST /api/asos (registrar novo ASO)
   - GET /api/asos/[id] (buscar por ID)
   - PUT /api/asos/[id] (atualizar ASO)
   - DELETE /api/asos/[id] (remover ASO)
   - GET /api/asos/expiring (ASOs vencendo)
   - GET /api/employees/[id]/asos (ASOs do funcionário)

8. **Sistema de Alertas de Segurança**
   - Endpoint para verificar treinamentos obrigatórios
   - Alertas automáticos de ASOs vencendo
   - Validações de segurança para transferências

### Fase 4: Sistema de Transferências (4-5 dias)
9. **Implementar CRUD de Solicitações de Transferência**
   - GET /api/transfer-requests (listar com filtros de status)
   - POST /api/transfer-requests (criar solicitação)
   - GET /api/transfer-requests/[id] (buscar por ID)
   - PUT /api/transfer-requests/[id] (atualizar status/aprovação)
   - DELETE /api/transfer-requests/[id] (cancelar solicitação)

10. **Workflow de Aprovação**
    - Endpoints para cada etapa de aprovação
    - Validações automáticas de segurança
    - Notificações para aprovadores
    - Histórico completo de aprovações

11. **Implementar Histórico de Transferências**
    - GET /api/transfer-history (histórico com filtros)
    - Registro automático de transferências concluídas
    - Relatórios de mobilidade de funcionários

### Fase 5: Controle de Ponto e NFC (3-4 dias)
12. **Implementar CRUD de Registros de Ponto**
    - GET /api/time-records (registros com filtros)
    - POST /api/time-records (registrar ponto)
    - PUT /api/time-records/[id] (editar registro)
    - GET /api/employees/[id]/time-records (ponto do funcionário)

13. **Sistema NFC**
    - GET /api/nfc-collections (coleções de dados NFC)
    - POST /api/nfc-collections (criar coleção)
    - POST /api/nfc-records (registrar leitura NFC)
    - Processamento automático de registros NFC

### Fase 6: Planejamento e Dashboards (3-4 dias)
14. **Implementar Planejamento de Horas**
    - GET /api/hour-planning (planejamento por contrato/data)
    - POST /api/hour-planning (criar planejamento)
    - PUT /api/hour-planning/[id] (atualizar planejamento)

15. **APIs de Dashboard e Estatísticas**
    - GET /api/dashboard/stats (estatísticas gerais)
    - GET /api/dashboard/charts (dados para gráficos)
    - GET /api/reports/employees (relatório de funcionários)
    - GET /api/reports/contracts (relatório de contratos)
    - GET /api/reports/safety (relatório de segurança)

### Fase 7: Migração de Componentes Frontend (4-5 dias)
16. **Migrar páginas principais**
    - Dashboard: substituir getDashboardStats() por API real
    - Funcionários: já migrado, validar funcionamento
    - Contratos: migrar de mockContracts para API
    - Segurança: migrar ASOs e treinamentos para APIs

17. **Migrar páginas secundárias**
    - Transferências: migrar mockTransferRequests para API
    - Controle de Força de Trabalho: migrar dados mock
    - Planejamento: migrar mockPlanningContracts para API
    - Funções/Cargos: já migrado, validar funcionamento

18. **Atualizar hooks e serviços**
    - Criar hooks React Query para todas as entidades
    - Implementar cache strategies adequadas
    - Adicionar error handling e retry logic
    - Implementar optimistic updates onde apropriado

### Fase 8: Logs de Auditoria e Finalização (2-3 dias)
19. **Implementar Sistema de Auditoria**
    - GET /api/audit-logs (logs com filtros)
    - Middleware automático para log de operações
    - Rastreamento de mudanças em dados críticos

20. **Testes e Validação Final**
    - Testes de integração para todos os CRUDs
    - Validação de performance das APIs
    - Teste de segurança e autorização
    - Migração de dados mock existentes para banco

21. **Limpeza e Otimização**
    - Remover lib/mock-data.ts e dependências
    - Otimizar queries baseado em uso real
    - Documentar APIs criadas
    - Setup de monitoramento e logs

### Fase 9: Deploy e Monitoramento (1-2 dias)
22. **Preparação para Produção**
    - Configurar variáveis de ambiente
    - Setup de backup automático
    - Configurar monitoring e alertas
    - Documentação de deployment

23. **Validação Pós-Deploy**
    - Testes em ambiente de produção
    - Monitoramento de performance
    - Correção de bugs encontrados
    - Treinamento de usuários se necessário

## 📋 Deliverables

### APIs Implementadas
- 23 endpoints CRUD completos
- Sistema de autenticação JWT
- Middleware de autorização RBAC
- Validação com Zod em todos os endpoints

### Frontend Migrado
- Todas as páginas usando dados reais
- Hooks React Query para todas as entidades
- Loading states e error handling
- Cache otimizado e sincronização

### Documentação
- Documentação de APIs (OpenAPI/Swagger)
- Guia de migração de dados
- Manual de deployment
- Documentação de segurança

### Infraestrutura
- Schema de banco otimizado
- Sistema de backup automático
- Monitoramento e alertas
- Logs de auditoria completos

## 🎯 Success Criteria

- ✅ Zero dependências de lib/mock-data.ts
- ✅ Todas as funcionalidades funcionando com dados reais
- ✅ Performance de APIs < 500ms para operações simples
- ✅ Cobertura de testes > 80% para APIs críticas
- ✅ Sistema de segurança validado e testado
- ✅ Backup e recovery testados
- ✅ Documentação completa e atualizada
- ✅ Deploy em produção sem downtime
