// Simular a validação que está falhando
function validateEmployeeFromCSV(data, index) {
  const errors = {};
  
  console.log(`\n🔍 Validando funcionário ${index + 1}: ${data.name}`);
  console.log('Dados recebidos:', JSON.stringify(data, null, 2));
  
  // Validações obrigatórias
  if (!data.name || data.name.trim() === '') {
    errors.name = 'Nome é obrigatório';
    console.log('❌ Nome vazio');
  } else {
    console.log('✅ Nome OK:', data.name);
  }
  
  if (!data.registration || data.registration.trim() === '') {
    errors.registration = 'Matrícula é obrigatória';
    console.log('❌ Matrícula vazia');
  } else {
    console.log('✅ Matrícula OK:', data.registration);
  }
  
  if (!data.company || data.company.trim() === '') {
    errors.company = 'Empresa é obrigatória';
    console.log('❌ Empresa vazia');
  } else {
    console.log('✅ Empresa OK:', data.company);
  }
  
  if (!data.cpf || data.cpf.trim() === '') {
    errors.cpf = 'CPF é obrigatório';
    console.log('❌ CPF vazio');
  } else {
    console.log('✅ CPF OK:', data.cpf);
  }
  
  console.log('Resultado da validação:', Object.keys(errors).length === 0 ? 'PASS' : 'FAIL');
  if (Object.keys(errors).length > 0) {
    console.log('Erros:', errors);
  }
  
  return errors;
}

// Dados de teste baseados no erro reportado
const testData = {
  name: "CARLOS DALBERTO DE OLIVEIRA",
  registration: "12345",
  company: "SARTORI SERVIÇOS",
  cpf: "12345678901",
  phone: "31987654321",
  birthDate: "15/05/1985",
  gender: "Masculino",
  maritalStatus: "Solteiro",
  role: "Operador",
  category: "CLT",
  admissionDate: "01/03/2024",
  status: "Ativo"
};

console.log('🧪 Debugando erro de importação...\n');

// Teste 1: Validação direta
console.log('📋 Teste 1: Validação direta dos dados');
const errors1 = validateEmployeeFromCSV(testData, 0);

// Teste 2: Simular dados que podem estar vazios
console.log('\n📋 Teste 2: Dados com campos vazios');
const testDataEmpty = {
  name: "",
  registration: "",
  company: "",
  cpf: "",
  phone: "31987654321",
  birthDate: "15/05/1985",
  gender: "Masculino",
  maritalStatus: "Solteiro",
  role: "Operador",
  category: "CLT",
  admissionDate: "01/03/2024",
  status: "Ativo"
};

const errors2 = validateEmployeeFromCSV(testDataEmpty, 1);

// Teste 3: Simular dados com espaços em branco
console.log('\n📋 Teste 3: Dados com espaços em branco');
const testDataSpaces = {
  name: "   ",
  registration: "   ",
  company: "   ",
  cpf: "   ",
  phone: "31987654321",
  birthDate: "15/05/1985",
  gender: "Masculino",
  maritalStatus: "Solteiro",
  role: "Operador",
  category: "CLT",
  admissionDate: "01/03/2024",
  status: "Ativo"
};

const errors3 = validateEmployeeFromCSV(testDataSpaces, 2);

// Teste 4: Simular dados undefined/null
console.log('\n📋 Teste 4: Dados undefined/null');
const testDataNull = {
  name: undefined,
  registration: null,
  company: undefined,
  cpf: null,
  phone: "31987654321",
  birthDate: "15/05/1985",
  gender: "Masculino",
  maritalStatus: "Solteiro",
  role: "Operador",
  category: "CLT",
  admissionDate: "01/03/2024",
  status: "Ativo"
};

const errors4 = validateEmployeeFromCSV(testDataNull, 3);

console.log('\n📊 Resumo dos testes:');
console.log('Teste 1 (dados corretos):', Object.keys(errors1).length === 0 ? 'PASS' : 'FAIL');
console.log('Teste 2 (campos vazios):', Object.keys(errors2).length === 0 ? 'PASS' : 'FAIL');
console.log('Teste 3 (espaços em branco):', Object.keys(errors3).length === 0 ? 'PASS' : 'FAIL');
console.log('Teste 4 (undefined/null):', Object.keys(errors4).length === 0 ? 'PASS' : 'FAIL'); 