/**
 * Testes para validação de encoding CSV com caracteres especiais
 * Garante que dados em português brasileiro sejam processados corretamente
 */

import { 
  robustNormalizeText, 
  validateSpecialCharacters, 
  detectEncodingIssues,
  parseCSVWithEncoding,
  validateEmployeeDataInRealTime,
  normalizeEmployeeData,
  createTestCSVTemplate,
  generateEncodingReport
} from './csvEncodingUtils';

// Dados de teste com caracteres especiais
export const testDataWithSpecialChars = [
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

// Dados de teste com problemas de encoding
export const testDataWithEncodingIssues = [
  {
    name: "Joao Silva Santos", // Sem acento
    registration: "12345",
    company: "SARTORI SERVICOS", // Sem acento
    cpf: "12345678901",
    motherName: "Maria da Silva Santos"
  },
  {
    name: "Ana Paula Costa",
    registration: "12346", 
    company: "SARTORI SERVIÇOS",
    cpf: "98765432100",
    motherName: "Antonia Costa" // Sem acento
  }
];

/**
 * Teste de normalização de texto
 */
export function testTextNormalization() {
  console.log('🧪 Testando normalização de texto...');
  
  const testCases = [
    { input: 'João', expected: 'João', description: 'Texto com acento' },
    { input: 'Joao', expected: 'Joao', description: 'Texto sem acento' },
    { input: '  João  ', expected: 'João', description: 'Texto com espaços' },
    { input: '\uFEFFJoão', expected: 'João', description: 'Texto com BOM' },
    { input: '', expected: '', description: 'Texto vazio' },
    { input: null, expected: null, description: 'Valor null' }
  ];

  testCases.forEach(({ input, expected, description }) => {
    const result = robustNormalizeText(input);
    const passed = result === expected;
    
    console.log(`${passed ? '✅' : '❌'} ${description}: "${input}" → "${result}"`);
    
    if (!passed) {
      console.error(`  Esperado: "${expected}"`);
    }
  });
}

/**
 * Teste de validação de caracteres especiais
 */
export function testSpecialCharactersValidation() {
  console.log('\n🧪 Testando validação de caracteres especiais...');
  
  const testCases = [
    { input: 'João', expected: true, description: 'Nome com acento' },
    { input: 'Joao', expected: false, description: 'Nome sem acento' },
    { input: 'Antônia', expected: true, description: 'Nome com til' },
    { input: 'Antonia', expected: false, description: 'Nome sem til' },
    { input: 'São Paulo', expected: true, description: 'Cidade com acento' },
    { input: 'Sao Paulo', expected: false, description: 'Cidade sem acento' },
    { input: '', expected: true, description: 'Texto vazio' },
    { input: 'ABC123', expected: false, description: 'Texto sem caracteres especiais' }
  ];

  testCases.forEach(({ input, expected, description }) => {
    const result = validateSpecialCharacters(input);
    const passed = result === expected;
    
    console.log(`${passed ? '✅' : '❌'} ${description}: "${input}" → ${result}`);
    
    if (!passed) {
      console.error(`  Esperado: ${expected}`);
    }
  });
}

/**
 * Teste de detecção de problemas de encoding
 */
export function testEncodingIssueDetection() {
  console.log('\n🧪 Testando detecção de problemas de encoding...');
  
  const testCases = [
    { 
      input: 'Joao Silva Santos', 
      expectedIssues: 1, 
      description: 'Nome sem acento que deveria ter' 
    },
    { 
      input: 'João Silva Santos', 
      expectedIssues: 0, 
      description: 'Nome com acento correto' 
    },
    { 
      input: 'Antonia Costa', 
      expectedIssues: 1, 
      description: 'Nome sem til que deveria ter' 
    },
    { 
      input: 'Sao Paulo', 
      expectedIssues: 1, 
      description: 'Cidade sem acento' 
    },
    { 
      input: 'ABC123', 
      expectedIssues: 0, 
      description: 'Texto sem caracteres especiais' 
    }
  ];

  testCases.forEach(({ input, expectedIssues, description }) => {
    const issues = detectEncodingIssues(input);
    const passed = issues.length === expectedIssues;
    
    console.log(`${passed ? '✅' : '❌'} ${description}: "${input}" → ${issues.length} problemas`);
    
    if (issues.length > 0) {
      console.log(`  Problemas detectados: ${issues.join(', ')}`);
    }
    
    if (!passed) {
      console.error(`  Esperado: ${expectedIssues} problemas`);
    }
  });
}

/**
 * Teste de parser CSV
 */
export function testCSVParser() {
  console.log('\n🧪 Testando parser CSV...');
  
  const csvContent = `name;registration;company;cpf;motherName
João Silva Santos;12345;SARTORI SERVIÇOS;12345678901;Maria da Silva Santos
Ana Paula Costa;12346;SARTORI SERVIÇOS;98765432100;Antônia Costa`;

  const result = parseCSVWithEncoding(csvContent);
  
  console.log(`✅ CSV parseado: ${result.length} registros`);
  
  result.forEach((row, index) => {
    console.log(`  Registro ${index + 1}: ${row.name} (${row.registration})`);
    
    // Verificar se caracteres especiais foram preservados
    if (row.name.includes('João') || row.name.includes('Ana')) {
      console.log(`    ✅ Caracteres especiais preservados: ${row.name}`);
    } else {
      console.log(`    ❌ Problema com caracteres especiais: ${row.name}`);
    }
  });
}

/**
 * Teste de validação em tempo real
 */
export function testRealTimeValidation() {
  console.log('\n🧪 Testando validação em tempo real...');
  
  const validation = validateEmployeeDataInRealTime(testDataWithSpecialChars);
  
  console.log(`✅ Validação concluída: ${validation.isValid ? 'VÁLIDO' : 'INVÁLIDO'}`);
  
  if (validation.warnings.length > 0) {
    console.log(`⚠️  Avisos: ${validation.warnings.length}`);
    validation.warnings.forEach(warning => console.log(`  - ${warning}`));
  }
  
  if (validation.errors.length > 0) {
    console.log(`❌ Erros: ${validation.errors.length}`);
    validation.errors.forEach(error => console.log(`  - ${error}`));
  }
  
  // Testar com dados com problemas
  const validationWithIssues = validateEmployeeDataInRealTime(testDataWithEncodingIssues);
  
  console.log(`\n📊 Validação com problemas: ${validationWithIssues.isValid ? 'VÁLIDO' : 'INVÁLIDO'}`);
  
  if (validationWithIssues.errors.length > 0) {
    console.log(`❌ Problemas detectados: ${validationWithIssues.errors.length}`);
    validationWithIssues.errors.forEach(error => console.log(`  - ${error}`));
  }
}

/**
 * Teste de normalização de dados de funcionário
 */
export function testEmployeeDataNormalization() {
  console.log('\n🧪 Testando normalização de dados de funcionário...');
  
  const testData = {
    name: '  João Silva Santos  ',
    registration: '12345',
    company: 'SARTORI SERVIÇOS',
    cpf: '123.456.789-01',
    motherName: 'Maria da Silva Santos',
    phone: '(31) 98765-4321',
    birthDate: '15/05/1985',
    admissionDate: '01/03/2024',
    status: 'Ativo'
  };
  
  const normalized = normalizeEmployeeData(testData);
  
  console.log('✅ Dados normalizados:');
  console.log(`  Nome: "${testData.name}" → "${normalized.name}"`);
  console.log(`  CPF: "${testData.cpf}" → "${normalized.cpf}"`);
  console.log(`  Telefone: "${testData.phone}" → "${normalized.phone}"`);
  console.log(`  Data de nascimento: "${testData.birthDate}" → ${normalized.birthDate}`);
  console.log(`  Data de admissão: "${testData.admissionDate}" → ${normalized.admissionDate}`);
  
  // Verificar se caracteres especiais foram preservados
  if (normalized.name.includes('João') && normalized.motherName?.includes('Maria')) {
    console.log('  ✅ Caracteres especiais preservados corretamente');
  } else {
    console.log('  ❌ Problema com caracteres especiais');
  }
}

/**
 * Teste de geração de template CSV
 */
export function testCSVTemplateGeneration() {
  console.log('\n🧪 Testando geração de template CSV...');
  
  const template = createTestCSVTemplate();
  
  console.log('✅ Template CSV gerado:');
  console.log(template);
  
  // Verificar se template contém caracteres especiais
  if (template.includes('João') && template.includes('Antônio')) {
    console.log('  ✅ Template contém caracteres especiais de teste');
  } else {
    console.log('  ❌ Template não contém caracteres especiais');
  }
}

/**
 * Teste de geração de relatório
 */
export function testReportGeneration() {
  console.log('\n🧪 Testando geração de relatório...');
  
  const report = generateEncodingReport(testDataWithSpecialChars);
  
  console.log('✅ Relatório gerado:');
  console.log(report);
}

/**
 * Executar todos os testes
 */
export function runAllTests() {
  console.log('🚀 INICIANDO TESTES DE ENCODING CSV');
  console.log('=====================================\n');
  
  testTextNormalization();
  testSpecialCharactersValidation();
  testEncodingIssueDetection();
  testCSVParser();
  testRealTimeValidation();
  testEmployeeDataNormalization();
  testCSVTemplateGeneration();
  testReportGeneration();
  
  console.log('\n✅ TODOS OS TESTES CONCLUÍDOS');
  console.log('=====================================');
}

/**
 * Teste específico para dados problemáticos
 */
export function testProblematicData() {
  console.log('\n🧪 Testando dados problemáticos...');
  
  const problematicCSV = `name;registration;company;cpf;motherName
Joao Silva Santos;12345;SARTORI SERVICOS;12345678901;Maria da Silva Santos
Ana Paula Costa;12346;SARTORI SERVIÇOS;98765432100;Antonia Costa
José Antônio Oliveira;12347;SARTORI SERVIÇOS;11122233344;Francisca Oliveira`;

  const parsed = parseCSVWithEncoding(problematicCSV);
  const validation = validateEmployeeDataInRealTime(parsed);
  
  console.log(`📊 Análise de dados problemáticos:`);
  console.log(`  Total de registros: ${parsed.length}`);
  console.log(`  Válido: ${validation.isValid ? 'SIM' : 'NÃO'}`);
  console.log(`  Avisos: ${validation.warnings.length}`);
  console.log(`  Erros: ${validation.errors.length}`);
  
  if (validation.errors.length > 0) {
    console.log('\n❌ Problemas detectados:');
    validation.errors.forEach(error => console.log(`  - ${error}`));
  }
  
  if (validation.warnings.length > 0) {
    console.log('\n⚠️  Avisos:');
    validation.warnings.forEach(warning => console.log(`  - ${warning}`));
  }
}

// Executar testes se este arquivo for executado diretamente
if (typeof window !== 'undefined') {
  // No navegador, adicionar ao console global
  (window as any).testCSVEncoding = {
    runAllTests,
    testProblematicData,
    testDataWithSpecialChars,
    testDataWithEncodingIssues
  };
  
  console.log('🧪 Testes de encoding CSV carregados!');
  console.log('Use testCSVEncoding.runAllTests() para executar todos os testes');
  console.log('Use testCSVEncoding.testProblematicData() para testar dados problemáticos');
} 