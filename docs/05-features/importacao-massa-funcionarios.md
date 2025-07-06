# Importação em Massa de Funcionários

## Visão Geral

A funcionalidade de importação em massa permite importar múltiplos funcionários de uma só vez através de um arquivo CSV, com validação completa de dados e tratamento de erros.

## Localização

A funcionalidade está disponível na página de **Funcionários** (`/dashboard/employees`) através do botão **"Importar em Massa"**.

## Como Usar

### 1. Preparar o Arquivo CSV

#### Formato Obrigatório
- **Separador**: Ponto e vírgula (`;`)
- **Codificação**: UTF-8 
- **Primeira linha**: Cabeçalhos dos campos

#### Campos Obrigatórios
- `name`: Nome completo do funcionário
- `registration`: Matrícula única por empresa  
- `company`: Nome da empresa
- `cpf`: CPF válido (11 dígitos)

#### Campos Opcionais
- `phone`: Telefone (10 ou 11 dígitos)
- `birthDate`: Data de nascimento (DD/MM/YYYY)
- `admissionDate`: Data de admissão (DD/MM/YYYY)
- `gender`: Sexo/Gênero
- `maritalStatus`: Estado civil
- `role`: Função/cargo
- `category`: Categoria
- `pis`: PIS
- `ctps`: CTPS
- `ctpsSeries`: Série da CTPS
- `ctpsUf`: UF da CTPS (2 caracteres)
- `motherName`: Nome da mãe
- `status`: Status do funcionário (padrão: "Ativo")
- `centroCusto`: Centro de custo (pode ficar vazio)
- `obra`: Obra/projeto (pode ficar vazio)
- `mo`: Tipo de mão de obra (pode ficar vazio)
- `localAlojado`: Local/alojamento (pode ficar vazio)
- `pontoReferencia`: Ponto de referência (pode ficar vazio)
- `statusBancodoc`: Status bancário/documental (pode ficar vazio)
- `efetivoRDO`: Efetivo em RDO (true/false)

> **Nota**: Campos opcionais podem ser deixados vazios no CSV. O sistema automaticamente define como `null` no banco de dados.

### 2. Baixar Modelo

1. Clique em **"Importar em Massa"**
2. Clique em **"Baixar Modelo"** 
3. Use o arquivo CSV de exemplo como base

### 3. Realizar a Importação

1. **Selecionar Arquivo**: Clique em "Selecionar Arquivo CSV" e escolha seu arquivo
2. **Verificar Dados**: O sistema mostrará quantos registros foram carregados
3. **Executar Importação**: Clique em "Importar X Funcionários"
4. **Verificar Resultado**: Veja o resumo com sucessos e falhas

## Validações Implementadas

### CPF
- ✅ Formato correto (11 dígitos)
- ✅ Algoritmo oficial de validação
- ✅ Não permite dígitos todos iguais
- ✅ Unicidade no banco de dados

### Telefone
- ✅ 10 ou 11 dígitos (após remoção de formatação)
- ✅ Aceita formatação: `(31) 99999-9999`

### Datas
- ✅ Formato DD/MM/YYYY
- ✅ Validação de data válida
- ✅ Conversão automática para ISO

### Matrícula
- ✅ Única por empresa
- ✅ Considera apenas funcionários ativos

### Caracteres Especiais
- ✅ Normalização UTF-8 automática
- ✅ Suporte completo para acentos

## Exemplo de Arquivo CSV

```csv
name;registration;company;cpf;phone;birthDate;gender;maritalStatus;role;category;admissionDate;status
João Silva Santos;12345;SARTORI SERVIÇOS;12345678901;31987654321;15/05/1985;Masculino;Solteiro;Operador;CLT;01/03/2024;Ativo
Maria Santos Costa;12346;SARTORI SERVIÇOS;98765432100;31987654322;20/08/1990;Feminino;Casada;Auxiliar;CLT;15/03/2024;Ativo
```

## Tratamento de Erros

### Tipos de Erro
- **Campos obrigatórios**: Nome, matrícula, empresa, CPF
- **CPF inválido**: Formato ou algoritmo incorreto
- **CPF duplicado**: Já existe no sistema
- **Matrícula duplicada**: Já existe para a empresa
- **Telefone inválido**: Formato incorreto
- **Data inválida**: Formato DD/MM/YYYY incorreto

### Resultado da Importação
O sistema retorna:
- **Resumo**: Total, criados, falharam
- **Lista de sucessos**: Funcionários criados
- **Lista de erros**: Detalhes específicos por linha

## Exemplo de Resposta

```json
{
  "success": true,
  "summary": {
    "total": 2,
    "created": 1,
    "failed": 1
  },
  "createdEmployees": [
    {
      "id": "cm123abc456",
      "name": "João Silva Santos",
      "registration": "12345",
      "cpf": "12345678901"
    }
  ],
  "failedEmployees": [
    {
      "index": 2,
      "name": "Maria Santos Costa",
      "errors": {
        "cpf": "CPF inválido",
        "phone": "Telefone deve ter 10 ou 11 dígitos"
      }
    }
  ]
}
```

## Boas Práticas

### Preparação dos Dados
1. **Validar CPFs** antes da importação
2. **Padronizar telefones** no formato correto
3. **Verificar datas** no formato DD/MM/YYYY
4. **Conferir matrículas** para evitar duplicatas

### Durante a Importação
1. **Testar com poucos registros** primeiro
2. **Revisar erros** e corrigir o arquivo
3. **Importar em lotes** se necessário
4. **Backup** antes de grandes importações

### Após a Importação
1. **Verificar funcionários criados**
2. **Conferir dados** na listagem
3. **Corrigir erros** manualmente se necessário
4. **Documentar** o processo

## Limitações

- **Tamanho do arquivo**: Recomendado até 1000 registros por vez
- **Timeout**: Importações muito grandes podem dar timeout
- **Memória**: Arquivos muito grandes podem consumir muita memória

## Solução de Problemas

### Erro: "Formato inválido"
- Verificar se o arquivo é CSV
- Conferir se o separador é ponto e vírgula (`;`)
- Verificar codificação UTF-8

### Erro: "CPF já cadastrado"
- Verificar se o funcionário já existe
- Conferir se não há duplicatas no próprio arquivo

### Erro: "Matrícula já cadastrada"
- Verificar matrículas na empresa
- Considerar funcionários inativos

### Erro: "Data inválida"
- Usar formato DD/MM/YYYY
- Verificar se a data existe (ex: 31/02/2024 é inválido)

### Erro: "Telefone inválido"
- Usar 10 ou 11 dígitos
- Formato: (11) 99999-9999 ou 11999999999

## API Endpoint

Para integrações diretas, use:

```
POST /api/employees/import
Content-Type: application/json

[
  {
    "name": "João Silva",
    "registration": "12345",
    "company": "SARTORI SERVIÇOS",
    "cpf": "12345678901",
    // ... outros campos
  }
]
```

## Arquivos Relacionados

- **API**: `/app/api/employees/import/route.ts`
- **Componente**: `/components/employees/ImportEmployeesDialog.tsx`
- **Documentação**: `/docs/03-development/api-examples.md`
- **Testes**: `/lib/test-import.ts`

## Histórico de Versões

- **v1.0**: Implementação inicial com validações básicas
- **v1.1**: Adicionado suporte a caracteres especiais UTF-8
- **v1.2**: Melhorias na interface e tratamento de erros
- **v1.3**: Validação rigorosa de CPF com algoritmo oficial
- **v1.4**: Correção para campos opcionais vazios (centroCusto, obra, etc.) 