# 📋 PLANEJAMENTO: GARANTIA DE IMPORTAÇÃO CSV COM CARACTERES ESPECIAIS

## 🎯 OBJETIVO
Garantir que a importação e inserção de dados CSV funcione corretamente, especialmente para caracteres especiais em português brasileiro (Ç, Ã, Õ, etc.).

## 🔍 ANÁLISE DO PROBLEMA

### Problemas Identificados:
1. **Encoding inconsistente** entre diferentes fontes de dados
2. **Caracteres especiais corrompidos** (Ç → C, Ã → A, etc.)
3. **BOM (Byte Order Mark)** não tratado adequadamente
4. **Normalização Unicode** inconsistente
5. **Validação de dados** insuficiente para caracteres especiais

### Impacto:
- Nomes de funcionários com caracteres especiais ficam corrompidos
- Busca e filtros não funcionam corretamente
- Relatórios com dados incorretos
- Experiência do usuário prejudicada

## 🛠️ SOLUÇÕES IMPLEMENTADAS

### 1. **Tratamento de Encoding UTF-8**
```typescript
// Função para normalizar texto (caracteres especiais)
function normalizeText(text: string): string {
  if (!text || typeof text !== 'string') return text;
  return text.normalize('NFC').trim();
}
```

### 2. **Remoção de BOM (Byte Order Mark)**
```typescript
// Detectar se há BOM e removê-lo
const firstLine = lines[0].replace(/^\uFEFF/, '')
lines[0] = firstLine
```

### 3. **Validação de Caracteres Especiais**
```typescript
// Validar se texto contém caracteres especiais válidos
function validateSpecialCharacters(text: string): boolean {
  const specialCharsRegex = /[À-ÿ]/;
  return specialCharsRegex.test(text);
}
```

## 📋 PLANO DE AÇÃO

### FASE 1: PREPARAÇÃO E ANÁLISE (1-2 dias)

#### 1.1 Auditoria do Sistema Atual
- [ ] Analisar todos os pontos de entrada de dados CSV
- [ ] Identificar fontes de dados com problemas de encoding
- [ ] Mapear fluxo completo de importação
- [ ] Documentar casos de teste com caracteres especiais

#### 1.2 Definição de Padrões
- [ ] Estabelecer encoding padrão: UTF-8
- [ ] Definir separador padrão: ponto e vírgula (;)
- [ ] Criar template CSV com caracteres especiais de teste
- [ ] Documentar boas práticas para criação de arquivos CSV

### FASE 2: IMPLEMENTAÇÃO DE MELHORIAS (3-4 dias)

#### 2.1 Melhorar Função de Normalização
```typescript
// Implementar normalização robusta
function robustNormalizeText(text: string): string {
  if (!text || typeof text !== 'string') return text;
  
  // Remover BOM se presente
  let normalized = text.replace(/^\uFEFF/, '');
  
  // Normalizar Unicode (NFC - Canonical Composition)
  normalized = normalized.normalize('NFC');
  
  // Remover espaços extras
  normalized = normalized.trim();
  
  // Validar caracteres especiais
  if (normalized && !validateSpecialCharacters(normalized)) {
    console.warn('Possível problema de encoding detectado:', text);
  }
  
  return normalized;
}
```

#### 2.2 Implementar Validação de Encoding
```typescript
// Validar encoding do arquivo
function validateFileEncoding(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const hasSpecialChars = /[À-ÿ]/.test(content);
      const hasBOM = content.startsWith('\uFEFF');
      
      if (!hasSpecialChars && content.includes('ç') || content.includes('ã')) {
        console.warn('Possível problema de encoding detectado');
        resolve(false);
      }
      
      resolve(true);
    };
    reader.readAsText(file, 'UTF-8');
  });
}
```

#### 2.3 Melhorar Parser CSV
```typescript
// Parser CSV robusto com suporte a caracteres especiais
function parseCSVWithEncoding(csvText: string): any[] {
  // Remover BOM
  const cleanText = csvText.replace(/^\uFEFF/, '');
  
  const lines = cleanText.split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(';').map(h => robustNormalizeText(h));
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(';');
    const row: any = {};

    headers.forEach((header, index) => {
      row[header] = robustNormalizeText(values[index] || '');
    });

    // Só adiciona se tiver pelo menos nome
    if (row.name) {
      data.push(row);
    }
  }

  return data;
}
```

### FASE 3: TESTES E VALIDAÇÃO (2-3 dias)

#### 3.1 Criar Dados de Teste
```typescript
// Dados de teste com caracteres especiais
const testData = [
  {
    name: "João Silva Santos",
    registration: "12345",
    company: "SARTORI SERVIÇOS",
    cpf: "12345678901",
    motherName: "Maria da Silva Santos"
  },
  {
    name: "Ana Paula Costa",
    registration: "12346", 
    company: "SARTORI SERVIÇOS",
    cpf: "98765432100",
    motherName: "Antônia Costa"
  },
  {
    name: "José Antônio Oliveira",
    registration: "12347",
    company: "SARTORI SERVIÇOS", 
    cpf: "11122233344",
    motherName: "Francisca Oliveira"
  }
];
```

#### 3.2 Implementar Testes Automatizados
```typescript
// Teste de validação de caracteres especiais
describe('CSV Import - Special Characters', () => {
  test('should handle Portuguese special characters correctly', async () => {
    const csvContent = `name;registration;company;cpf;motherName
João Silva Santos;12345;SARTORI SERVIÇOS;12345678901;Maria da Silva Santos
Ana Paula Costa;12346;SARTORI SERVIÇOS;98765432100;Antônia Costa`;

    const result = await importCSV(csvContent);
    
    expect(result.success).toBe(true);
    expect(result.employees[0].name).toBe('João Silva Santos');
    expect(result.employees[1].motherName).toBe('Antônia Costa');
  });

  test('should detect encoding issues', async () => {
    const corruptedContent = `name;registration
Joao Silva Santos;12345`; // Sem acentos

    const result = await importCSV(corruptedContent);
    
    expect(result.warnings).toContain('Possível problema de encoding detectado');
  });
});
```

### FASE 4: DOCUMENTAÇÃO E TREINAMENTO (1-2 dias)

#### 4.1 Atualizar Documentação
- [ ] Atualizar guia de importação em massa
- [ ] Criar seção sobre caracteres especiais
- [ ] Documentar processo de validação
- [ ] Criar FAQ sobre problemas de encoding

#### 4.2 Criar Guia de Boas Práticas
```markdown
## Guia para Criação de Arquivos CSV

### 1. Encoding
- ✅ Sempre usar UTF-8
- ❌ Evitar ANSI, ISO-8859-1, etc.

### 2. Caracteres Especiais
- ✅ João, Maria, Antônia, São Paulo
- ❌ Joao, Maria, Antonia, Sao Paulo

### 3. Validação
- ✅ Testar com poucos registros primeiro
- ✅ Verificar se caracteres especiais estão corretos
- ✅ Usar template oficial do sistema
```

## 🔧 IMPLEMENTAÇÕES TÉCNICAS

### 1. **Melhorar API de Importação**
```typescript
// app/api/employees/import/route.ts
export async function POST(req: NextRequest) {
  try {
    const employees = await req.json();
    
    // Validar encoding dos dados
    const encodingValidation = validateDataEncoding(employees);
    if (!encodingValidation.isValid) {
      return NextResponse.json({
        error: 'Problema de encoding detectado',
        warnings: encodingValidation.warnings
      }, { status: 400 });
    }

    // Processar com normalização robusta
    const results = [];
    for (const [index, csvData] of employees.entries()) {
      const normalizedData = robustNormalizeEmployeeData(csvData);
      // ... resto do processamento
    }

    return NextResponse.json(response, {
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  } catch (error) {
    // ... tratamento de erro
  }
}
```

### 2. **Melhorar Componente de Upload**
```typescript
// components/employees/ImportEmployeesDialog.tsx
const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  // Validar encoding antes do processamento
  const isValidEncoding = await validateFileEncoding(file);
  if (!isValidEncoding) {
    toast.error('Problema de encoding detectado. Use UTF-8.');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const csvText = e.target?.result as string;
    try {
      const data = parseCSVWithEncoding(csvText);
      setCsvData(data);
      toast.success(`${data.length} registros carregados do CSV`);
    } catch (error) {
      toast.error('Erro ao processar arquivo CSV');
    }
  };
  reader.readAsText(file, 'UTF-8');
};
```

### 3. **Implementar Validação em Tempo Real**
```typescript
// Validação de caracteres especiais em tempo real
function validateSpecialCharactersInRealTime(data: any[]): ValidationResult {
  const warnings = [];
  const errors = [];

  data.forEach((row, index) => {
    const fields = ['name', 'motherName', 'company'];
    
    fields.forEach(field => {
      if (row[field]) {
        const original = row[field];
        const normalized = robustNormalizeText(original);
        
        if (original !== normalized) {
          warnings.push(`Linha ${index + 1}: Campo "${field}" foi normalizado`);
        }
        
        if (!validateSpecialCharacters(normalized) && 
            (normalized.includes('ç') || normalized.includes('ã'))) {
          errors.push(`Linha ${index + 1}: Possível problema de encoding em "${field}"`);
        }
      }
    });
  });

  return { warnings, errors, isValid: errors.length === 0 };
}
```

## 📊 MÉTRICAS DE SUCESSO

### Indicadores de Qualidade:
- [ ] **Taxa de sucesso de importação**: > 95%
- [ ] **Caracteres especiais corretos**: 100%
- [ ] **Tempo de processamento**: < 30s para 1000 registros
- [ ] **Detecção de problemas**: 100% dos casos de encoding

### Testes de Validação:
- [ ] Importar arquivo com nomes portugueses complexos
- [ ] Testar com diferentes encodings (UTF-8, ANSI, ISO)
- [ ] Validar busca e filtros com caracteres especiais
- [ ] Verificar relatórios e exportações

## 🚀 CRONOGRAMA

| Fase | Duração | Entregáveis |
|------|---------|-------------|
| Fase 1 | 1-2 dias | Análise completa e documentação |
| Fase 2 | 3-4 dias | Implementação das melhorias |
| Fase 3 | 2-3 dias | Testes e validação |
| Fase 4 | 1-2 dias | Documentação e treinamento |

**Total: 7-11 dias**

## 🎯 RESULTADO ESPERADO

Ao final da implementação, o sistema deve:

1. ✅ **Detectar automaticamente** problemas de encoding
2. ✅ **Normalizar corretamente** caracteres especiais
3. ✅ **Validar dados** antes da importação
4. ✅ **Fornecer feedback claro** sobre problemas
5. ✅ **Garantir integridade** dos dados importados
6. ✅ **Manter compatibilidade** com dados existentes

## 📞 SUPORTE E MANUTENÇÃO

### Monitoramento Contínuo:
- Logs de validação de encoding
- Métricas de taxa de sucesso
- Feedback dos usuários
- Análise de erros de importação

### Atualizações Futuras:
- Suporte a outros encodings se necessário
- Melhorias na detecção de problemas
- Otimizações de performance
- Novos tipos de validação

---

**Este planejamento garante que a importação de dados CSV funcione corretamente com caracteres especiais em português brasileiro, mantendo a integridade e qualidade dos dados.** 