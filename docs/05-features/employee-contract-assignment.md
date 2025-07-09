# Atribuição de Funcionários a Contratos

## Visão Geral

A funcionalidade de atribuição de funcionários a contratos permite vincular múltiplos funcionários a um contrato específico de forma eficiente e organizada.

## Localização

**Rota:** `/dashboard/employee-assignment`

## Funcionalidades Principais

### 1. Seleção de Contrato
- Lista apenas contratos ativos
- Interface de dropdown com nome e código do contrato
- Validação de seleção obrigatória

### 2. Visualização de Funcionários
- **Funcionários já vinculados**: Exibidos em seção separada com informações de data de vinculação
- **Funcionários disponíveis**: Lista filtrada excluindo os já vinculados ao contrato selecionado
- Contadores informativos para cada seção

### 3. Seleção Múltipla
- Checkboxes individuais para cada funcionário disponível
- Botão "Selecionar todos" para funcionários disponíveis
- Contador de funcionários selecionados
- Bloqueio automático de funcionários já vinculados

### 4. Filtros e Busca
- Reutilização do componente `EmployeeFilters`
- Busca por nome, CPF, matrícula
- Filtros por status, contrato, função, etc.
- Botão para limpar todos os filtros

### 5. Vinculação em Lote
- Processamento paralelo de múltiplas vinculações
- Feedback individual para cada funcionário
- Tratamento de erros por funcionário
- Resumo final com contadores de sucesso/erro

### 6. Solicitação de Transferência
- Botão para funcionários já vinculados
- Preparado para futura implementação do sistema de transferências

## Componentes Utilizados

### Reutilizados
- `EmployeeTable`: Exibição da lista de funcionários
- `EmployeeFilters`: Sistema de filtros e busca
- `Button`: Botões da interface
- `useContractsQuery`: Hook para buscar contratos
- `useEmployeesQuery`: Hook para buscar funcionários
- `useUpdateEmployee`: Hook para atualizar funcionários

### Específicos
- Interface customizada para funcionários já vinculados
- Sistema de feedback individualizado
- Lógica de filtragem por contrato

## Fluxo de Uso

1. **Seleção do Contrato**
   - Usuário escolhe um contrato ativo da lista
   - Sistema filtra funcionários automaticamente

2. **Visualização dos Funcionários**
   - Funcionários já vinculados aparecem na seção superior
   - Funcionários disponíveis aparecem na tabela principal

3. **Seleção de Funcionários**
   - Usuário marca os funcionários desejados
   - Sistema atualiza contador de selecionados

4. **Vinculação**
   - Usuário clica em "Vincular X funcionário(s)"
   - Sistema processa cada vinculação individualmente
   - Feedback em tempo real para cada operação

5. **Resultado**
   - Toasts individuais para cada funcionário
   - Resumo final da operação
   - Limpeza automática da seleção

## Campos Atualizados

Ao vincular um funcionário a um contrato, os seguintes campos são atualizados:

- `contractId`: ID do contrato selecionado
- `contractAssignmentDate`: Data/hora atual da vinculação

## Tratamento de Erros

### Validações
- Contrato deve ser selecionado
- Pelo menos um funcionário deve ser marcado
- Funcionários já vinculados não podem ser selecionados

### Feedback de Erros
- Toasts individuais para falhas específicas
- Resumo de sucessos e falhas
- Continuidade da operação mesmo com falhas parciais

## Melhorias Futuras

1. **Sistema de Transferências**
   - Implementar fluxo completo de solicitação de transferência
   - Aprovação/rejeição de transferências
   - Histórico de transferências

2. **Validações Avançadas**
   - Verificar capacidade máxima do contrato
   - Validar qualificações necessárias
   - Checkar conflitos de horários

3. **Relatórios**
   - Exportação de vinculações realizadas
   - Relatórios de funcionários por contrato
   - Histórico de movimentações

4. **Notificações**
   - Notificar gestores sobre novas vinculações
   - Alertas de transferências pendentes
   - Lembretes de revisão de contratos

## Tecnologias Utilizadas

- **React**: Interface de usuário
- **TypeScript**: Tipagem estática
- **TanStack Query**: Gerenciamento de estado servidor
- **React Hot Toast**: Notificações
- **Tailwind CSS**: Estilização
- **Framer Motion**: Animações (via componentes reutilizados)

## Considerações de Performance

- Filtros aplicados no lado cliente para responsividade
- Processamento paralelo de vinculações
- Debounce na busca de funcionários
- Carregamento lazy de dados quando necessário

## Acessibilidade

- Labels apropriados para todos os campos
- Navegação por teclado
- Feedback visual para estados de loading
- Contraste adequado nas cores
- Textos descritivos para ações 