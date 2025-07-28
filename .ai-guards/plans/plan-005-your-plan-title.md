---
id: plan-005
title: Sistema de Elaboração e Controle de Orçamentos
createdAt: 2025-07-24
author: Junior Silva
status: draft
---

## 🧩 Scope

Implementação de um sistema completo de elaboração e controle de orçamentos que permita a criação de orçamentos estruturados conforme os modelos fornecidos, incluindo QQP, composições de custo, propostas técnicas e comerciais, e geração de ordens de serviço.

## ✅ Functional Requirements

### 1. QQP - Planilha de Quantidades e Preços
- Editor de planilha interativo com linhas e colunas editáveis
- Cálculo automático de quantidades × preços unitários
- Agrupamento por categorias de serviços
- Importação/exportação de dados em Excel/CSV
- Validação de dados e fórmulas

### 2. Custo de Mão de Obra (Direta e Indireta)
- Cadastro de composições de mão de obra
- Cálculo de custos diretos por função/cargo
- Distribuição de custos indiretos
- Integração com sistema de funcionários existente (dentro da página de planejamento)
- Atualização automática de custos

### 3. CPU - Composição de Preço Unitário
- Editor de composições com insumos, quantidades e preços
- Cálculo automático de custos unitários
- Biblioteca de composições reutilizáveis
- Validação de fórmulas e referências
- Versionamento de composições

### 4. BDI - Benefícios e Despesas Indiretas
- Configuração de percentuais de BDI
- Cálculo automático aplicado aos custos diretos
- Diferentes configurações por tipo de projeto
- Histórico de alterações de BDI

### 5. Encargos - Agrupamento de Encargos
- Cadastro de tipos de encargos (INSS, FGTS, etc.)
- Configuração de percentuais por categoria
- Cálculo automático de encargos sobre mão de obra
- Relatórios de encargos por projeto

### 6. Fórmulas Paramétricas
- Editor de fórmulas com validação matemática
- Variáveis parametrizáveis (área, volume, etc.)
- Cálculo automático baseado em parâmetros
- Biblioteca de fórmulas reutilizáveis
- Validação de sintaxe e referências

### 7. Proposta Técnica
- Template com tópicos obrigatórios configuráveis
- Editor rico para conteúdo técnico
- Sistema de anexos e referências
- Upload de fotos e documentos
- Geração automática de sumário
- Exportação em PDF com formatação profissional

### 8. Proposta Comercial
- Template com seções obrigatórias e opcionais
- Cálculo automático de valores totais
- Condições comerciais configuráveis
- Anexos e documentação de suporte
- Validação de dados antes da aprovação
- Exportação em PDF padronizado

### 9. Ordem de Serviço
- Compilação automática de dados do orçamento
- Geração de documento executivo
- Assinaturas digitais
- Controle de versões
- Exportação em múltiplos formatos

### 10. Controles Gerais
- Sistema de aprovação por níveis
- Versionamento de orçamentos
- Auditoria de mudanças
- Backup e recuperação
- Integração com contratos existentes

## ⚙️ Non-Functional Requirements

### Performance
- Carregamento de planilhas grandes em < 3 segundos
- Cálculos em tempo real sem travamentos
- Suporte a orçamentos com 1000+ itens
- Cache inteligente de composições e fórmulas

### Security
- Controle de acesso por perfil (criador, aprovador, visualizador)
- Validação e sanitização de uploads de arquivos
- Auditoria completa de mudanças
- Backup automático de dados críticos

### Scalability
- Suporte a múltiplos usuários simultâneos
- Arquitetura modular para futuras expansões
- Separação clara entre frontend e backend
- API RESTful bem documentada

### Usability
- Interface intuitiva similar ao sistema existente
- Responsividade para tablets e desktops
- Feedback visual para cálculos e validações
- Help contextual e documentação integrada

## 📚 Guidelines & Packages

### Frontend
- **Next.js 14** - Framework principal
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes de interface
- **Zustand** - Gerenciamento de estado
- **SWR** - Cache e sincronização de dados
- **react-spreadsheet-grid** - Editor de planilhas
- **react-dropzone** - Upload de arquivos
- **react-pdf** - Geração de PDFs
- **mathjs** - Cálculos matemáticos complexos
- **zod** - Validação de schemas

### Backend
- **Supabase** - Banco de dados e autenticação
- **Prisma** - ORM
- **Node.js** - Runtime
- **puppeteer** - Geração de PDFs complexos
- **multer** - Upload de arquivos
- **xlsx** - Manipulação de planilhas Excel

### Arquitetura
- Seguir padrões modulares existentes
- Manter separação entre lógica de negócio e apresentação
- Implementar testes unitários e de integração
- Documentar APIs e componentes

## 🔐 Threat Model

### Ameaças de Segurança
- **Injeção de código malicioso** via fórmulas matemáticas
- **Upload de arquivos maliciosos** em anexos
- **Acesso não autorizado** a orçamentos confidenciais
- **Manipulação de dados** por usuários não autorizados

### Mitigações
- Validação rigorosa de fórmulas matemáticas
- Scan de vírus em uploads de arquivos
- Controle de acesso granular por projeto/orçamento
- Auditoria completa de todas as operações

## 🔢 Execution Plan

### Fase 1: Fundação (Semanas 1-2)
1. **Modelo de Dados**
   - Criar schemas Prisma para orçamentos
   - Implementar migrações de banco
   - Configurar relacionamentos entre entidades

2. **API Base**
   - Endpoints CRUD para orçamentos
   - Autenticação e autorização
   - Validação de dados com Zod

3. **Interface Principal**
   - Lista de orçamentos
   - Formulário de criação básico
   - Navegação entre seções

### Fase 2: QQP e Composições (Semanas 3-4)
1. **Editor de Planilha**
   - Implementar grid interativo
   - Cálculos automáticos
   - Importação/exportação Excel

2. **Sistema de Composições**
   - CRUD de composições
   - Cálculo de preços unitários
   - Biblioteca reutilizável

3. **Mão de Obra**
   - Integração com funcionários (dentro da página de planejamento)
   - Cálculo de custos diretos/indiretos
   - Configuração de encargos

### Fase 3: Cálculos e Fórmulas (Semanas 5-6)
1. **Editor de Fórmulas**
   - Interface para criação de fórmulas
   - Validação matemática
   - Biblioteca de fórmulas

2. **Sistema de BDI**
   - Configuração de percentuais
   - Cálculo automático
   - Histórico de alterações

3. **Validações e Regras**
   - Validação de dados
   - Regras de negócio
   - Feedback de erros

### Fase 4: Documentos Dinâmicos (Semanas 7-8)
1. **Proposta Técnica**
   - Template configurável
   - Editor rico de conteúdo
   - Sistema de anexos

2. **Proposta Comercial**
   - Estrutura similar à técnica
   - Cálculos automáticos
   - Condições comerciais

3. **Upload e Referências**
   - Sistema de upload seguro
   - Gerenciamento de anexos
   - Referências cruzadas

### Fase 5: Ordem de Serviço e Exportação (Semanas 9-10)
1. **Geração de OS**
   - Compilação de dados
   - Template de documento
   - Assinaturas digitais

2. **Sistema de Exportação**
   - Geração de PDFs
   - Múltiplos formatos
   - Formatação profissional

3. **Relatórios**
   - Dashboards de orçamentos
   - Relatórios analíticos
   - Exportação de dados

### Fase 6: Controles e Aprovações (Semanas 11-12)
1. **Fluxo de Aprovação**
   - Workflow configurável
   - Notificações automáticas
   - Controle de status

2. **Versionamento**
   - Controle de versões
   - Histórico de mudanças
   - Comparação entre versões

3. **Auditoria**
   - Logs de todas as operações
   - Relatórios de auditoria
   - Backup automático

### Fase 7: Testes e Refinamentos (Semanas 13-14)
1. **Testes**
   - Testes unitários
   - Testes de integração
   - Testes de usuário

2. **Otimizações**
   - Performance
   - Usabilidade
   - Segurança

3. **Documentação**
   - Manual do usuário
   - Documentação técnica
   - Vídeos tutoriais

## 📊 Success Metrics

- **Tempo de criação**: Orçamento completo em < 2 horas
- **Precisão**: Zero erros de cálculo em testes
- **Usabilidade**: 90% de satisfação em testes de usuário
- **Performance**: Carregamento de planilhas em < 3 segundos
- **Segurança**: Zero vulnerabilidades críticas
- **Adoção**: 80% dos usuários ativos em 30 dias
