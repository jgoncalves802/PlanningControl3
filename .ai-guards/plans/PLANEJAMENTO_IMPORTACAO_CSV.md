# 📋 PLANEJAMENTO: GARANTIA DE IMPORTAÇÃO CSV COM CARACTERES ESPECIAIS

## 🎯 OBJETIVO
Garantir que a importação e inserção de dados CSV funcione corretamente, especialmente para caracteres especiais em português brasileiro (Ç, Ã, Õ, etc.), e estabelecer sincronismo adequado entre funções importadas e a tabela de funções do sistema.

## 🔍 ANÁLISE DO PROBLEMA

### Problemas Identificados:
1. **Encoding inconsistente** entre diferentes fontes de dados
2. **Caracteres especiais corrompidos** (Ç → C, Ã → A, etc.)
3. **BOM (Byte Order Mark)** não tratado adequadamente
4. **Normalização Unicode** inconsistente
5. **Validação de dados** insuficiente para caracteres especiais
6. **Sincronismo de funções** entre dados importados e tabela companyfunctions
7. **Referenciamento inadequado** de funções não cadastradas no sistema

### Impacto:
- Nomes de funcionários com caracteres especiais ficam corrompidos
- Busca e filtros não funcionam corretamente
- Relatórios com dados incorretos
- Experiência do usuário prejudicada
- Funcionários importados sem função associada corretamente
- Inconsistência entre funções do CSV e funções cadastradas no sistema
- Dificuldade para relatórios e análises por função

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

### 4. **Sincronismo de Funções**
```typescript
// Validar e sincronizar funções com a tabela companyfunctions
async function validateAndSyncFunctions(functionNames: string[]): Promise<{
  existingFunctions: any[];
  newFunctions: string[];
  mapping: Record<string, number>;
}> {
  const existingFunctions = await prisma.companyFunction.findMany({
    where: { name: { in: functionNames } }
  });
  
  const existingNames = existingFunctions.map(f => f.name);
  const newFunctions = functionNames.filter(name => !existingNames.includes(name));
  
  const mapping: Record<string, number> = {};
  existingFunctions.forEach(func => {
    mapping[func.name] = func.id;
  });
  
  return { existingFunctions, newFunctions, mapping };
}
```

### 5. **Cadastro Automático de Funções**
```typescript
// Cadastrar funções não existentes automaticamente
async function createMissingFunctions(functionNames: string[]): Promise<Record<string, number>> {
  const createdFunctions = await prisma.companyFunction.createMany({
    data: functionNames.map(name => ({ name })),
    skipDuplicates: true
  });
  
  const newFunctions = await prisma.companyFunction.findMany({
    where: { name: { in: functionNames } }
  });
  
  const mapping: Record<string, number> = {};
  newFunctions.forEach(func => {
    mapping[func.name] = func.id;
  });
  
  return mapping;
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

#### 2.4 Implementar Sincronismo de Funções
```typescript
// Sistema de sincronismo entre funções CSV e tabela companyfunctions
async function processFunctionSynchronization(csvData: any[]): Promise<{
  processedData: any[];
  functionMapping: Record<string, number>;
  newFunctions: string[];
  warnings: string[];
}> {
  // Extrair todas as funções únicas do CSV
  const functionNames = [...new Set(
    csvData
      .map(row => row.function || row.cargo || row.role)
      .filter(Boolean)
  )];

  // Validar funções existentes
  const { existingFunctions, newFunctions, mapping } = await validateAndSyncFunctions(functionNames);
  
  const warnings = [];
  const processedData = csvData.map(row => {
    const functionName = row.function || row.cargo || row.role;
    if (functionName && !mapping[functionName]) {
      warnings.push(`Função "${functionName}" não encontrada no sistema`);
    }
    return {
      ...row,
      functionId: mapping[functionName] || null,
      functionName: functionName
    };
  });

  return {
    processedData,
    functionMapping: mapping,
    newFunctions,
    warnings
  };
}
```

#### 2.5 Interface de Confirmação de Funções
```typescript
// Componente para confirmar cadastro de novas funções
interface FunctionConfirmationProps {
  newFunctions: string[];
  onConfirm: (functions: string[]) => void;
  onCancel: () => void;
}

function FunctionConfirmationDialog({ newFunctions, onConfirm, onCancel }: FunctionConfirmationProps) {
  const [selectedFunctions, setSelectedFunctions] = useState<string[]>(newFunctions);

  return (
    <Dialog>
      <DialogTitle>Novas Funções Detectadas</DialogTitle>
      <DialogContent>
        <p>As seguintes funções não estão cadastradas no sistema:</p>
        <div className="space-y-2">
          {newFunctions.map(func => (
            <label key={func} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedFunctions.includes(func)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedFunctions([...selectedFunctions, func]);
                  } else {
                    setSelectedFunctions(selectedFunctions.filter(f => f !== func));
                  }
                }}
              />
              <span>{func}</span>
            </label>
          ))}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancelar</Button>
        <Button onClick={() => onConfirm(selectedFunctions)}>
          Cadastrar {selectedFunctions.length} Funções
        </Button>
      </DialogActions>
    </Dialog>
  );
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

#### 3.3 Testes de Sincronismo de Funções
```typescript
// Teste de sincronismo entre funções CSV e tabela companyfunctions
describe('CSV Import - Function Synchronization', () => {
  test('should map existing functions correctly', async () => {
    const csvContent = `name;registration;function
João Silva;12345;Operador de Máquina
Maria Santos;12346;Auxiliar Administrativo`;

    // Simular funções existentes no banco
    const existingFunctions = [
      { id: 1, name: 'Operador de Máquina' },
      { id: 2, name: 'Auxiliar Administrativo' }
    ];

    const result = await processFunctionSynchronization(csvContent);
    
    expect(result.functionMapping['Operador de Máquina']).toBe(1);
    expect(result.functionMapping['Auxiliar Administrativo']).toBe(2);
    expect(result.newFunctions).toHaveLength(0);
  });

  test('should detect new functions and offer to create them', async () => {
    const csvContent = `name;registration;function
João Silva;12345;Operador de Máquina
Maria Santos;12346;Técnico de Segurança`;

    // Simular apenas uma função existente
    const existingFunctions = [
      { id: 1, name: 'Operador de Máquina' }
    ];

    const result = await processFunctionSynchronization(csvContent);
    
    expect(result.newFunctions).toContain('Técnico de Segurança');
    expect(result.warnings).toContain('Função "Técnico de Segurança" não encontrada no sistema');
  });

  test('should create new functions when confirmed', async () => {
    const newFunctions = ['Técnico de Segurança', 'Encarregado de Obra'];
    
    const result = await createMissingFunctions(newFunctions);
    
    expect(result['Técnico de Segurança']).toBeDefined();
    expect(result['Encarregado de Obra']).toBeDefined();
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

### 4. **Sistema de Sincronismo de Funções**
```typescript
// API para sincronizar funções durante importação
// app/api/employees/import/route.ts
export async function POST(req: NextRequest) {
  try {
    const { employees, autoCreateFunctions = false } = await req.json();
    
    // Processar sincronismo de funções
    const functionSync = await processFunctionSynchronization(employees);
    
    if (functionSync.newFunctions.length > 0) {
      if (autoCreateFunctions) {
        // Criar funções automaticamente
        const newFunctionMapping = await createMissingFunctions(functionSync.newFunctions);
        Object.assign(functionSync.functionMapping, newFunctionMapping);
      } else {
        // Retornar funções para confirmação do usuário
        return NextResponse.json({
          status: 'pending_confirmation',
          newFunctions: functionSync.newFunctions,
          warnings: functionSync.warnings,
          message: 'Novas funções detectadas. Confirme para continuar.'
        });
      }
    }

    // Processar funcionários com funções mapeadas
    const processedEmployees = functionSync.processedData.map(emp => ({
      ...emp,
      currentFunctionId: functionSync.functionMapping[emp.functionName] || null
    }));

    // Continuar com a importação...
    const results = [];
    for (const employee of processedEmployees) {
      const result = await createEmployee(employee);
      results.push(result);
    }

    return NextResponse.json({
      success: true,
      imported: results.length,
      newFunctionsCreated: functionSync.newFunctions.length,
      warnings: functionSync.warnings
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### 5. **Interface de Confirmação de Funções**
```typescript
// Componente para confirmar criação de novas funções
// components/employees/FunctionConfirmationDialog.tsx
export function FunctionConfirmationDialog({ 
  newFunctions, 
  onConfirm, 
  onCancel 
}: FunctionConfirmationDialogProps) {
  const [selectedFunctions, setSelectedFunctions] = useState<string[]>(newFunctions);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/employees/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employees: csvData,
          autoCreateFunctions: true,
          selectedFunctions
        })
      });
      
      const result = await response.json();
      if (result.success) {
        onConfirm(result);
      }
    } catch (error) {
      console.error('Erro ao criar funções:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novas Funções Detectadas</DialogTitle>
          <DialogDescription>
            As seguintes funções não estão cadastradas no sistema. 
            Selecione quais deseja cadastrar automaticamente:
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {newFunctions.map(func => (
            <label key={func} className="flex items-center space-x-3 p-2 rounded border">
              <input
                type="checkbox"
                checked={selectedFunctions.includes(func)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedFunctions([...selectedFunctions, func]);
                  } else {
                    setSelectedFunctions(selectedFunctions.filter(f => f !== func));
                  }
                }}
                className="rounded"
              />
              <span className="text-sm">{func}</span>
            </label>
          ))}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={isLoading || selectedFunctions.length === 0}
          >
            {isLoading ? 'Processando...' : `Cadastrar ${selectedFunctions.length} Funções`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

## 📊 MÉTRICAS DE SUCESSO

### Indicadores de Qualidade:
- [ ] **Taxa de sucesso de importação**: > 95%
- [ ] **Caracteres especiais corretos**: 100%
- [ ] **Tempo de processamento**: < 30s para 1000 registros
- [ ] **Detecção de problemas**: 100% dos casos de encoding
- [ ] **Sincronismo de funções**: 100% das funções mapeadas corretamente
- [ ] **Criação automática de funções**: > 90% de sucesso
- [ ] **Referenciamento correto**: 100% dos funcionários com função válida

### Testes de Validação:
- [ ] Importar arquivo com nomes portugueses complexos
- [ ] Testar com diferentes encodings (UTF-8, ANSI, ISO)
- [ ] Validar busca e filtros com caracteres especiais
- [ ] Verificar relatórios e exportações
- [ ] Testar sincronismo com funções existentes
- [ ] Validar criação automática de novas funções
- [ ] Verificar referenciamento correto na tabela de funcionários
- [ ] Testar interface de confirmação de funções

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
7. ✅ **Sincronizar automaticamente** funções com a tabela companyfunctions
8. ✅ **Oferecer opção** de cadastrar funções não existentes
9. ✅ **Referenciar corretamente** funcionários às suas funções
10. ✅ **Manter consistência** entre dados importados e estrutura do sistema

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

## 🔄 FLUXO DE SINCRONISMO DE FUNÇÕES

### **Processo Completo:**

1. **📥 Upload do CSV**
   - Usuário faz upload do arquivo CSV
   - Sistema processa e normaliza caracteres especiais
   - Extrai todas as funções únicas do arquivo

2. **🔍 Validação de Funções**
   - Sistema consulta tabela `companyfunctions`
   - Identifica funções existentes vs. novas funções
   - Cria mapeamento de nomes para IDs

3. **❓ Confirmação do Usuário**
   - Se há novas funções, exibe diálogo de confirmação
   - Usuário seleciona quais funções cadastrar
   - Opção de cancelar ou prosseguir

4. **➕ Criação de Funções**
   - Sistema cria funções selecionadas na tabela
   - Atualiza mapeamento com novos IDs
   - Valida integridade dos dados

5. **👥 Importação de Funcionários**
   - Associa funcionários às funções corretas
   - Define `currentFunctionId` apropriado
   - Importa dados com referenciamento válido

### **Benefícios do Sincronismo:**

- ✅ **Consistência de dados**: Todas as funções referenciadas existem no sistema
- ✅ **Relatórios precisos**: Filtros e análises funcionam corretamente
- ✅ **Experiência fluida**: Usuário não precisa cadastrar funções manualmente
- ✅ **Integridade referencial**: Sem funcionários órfãos sem função
- ✅ **Flexibilidade**: Opção de escolher quais funções criar

---

**Este planejamento garante que a importação de dados CSV funcione corretamente com caracteres especiais em português brasileiro, mantendo a integridade e qualidade dos dados, e estabelecendo sincronismo adequado entre funções importadas e a estrutura do sistema.** 