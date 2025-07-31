// Simular a função autoCorrectEmployeeData
function convertNameToUpperCase(name) {
  if (!name || typeof name !== 'string') return name;
  return name.toUpperCase();
}

function formatCPF(cpf) {
  if (!cpf) return cpf;
  const cleanCPF = cpf.toString().replace(/\D/g, '');
  return cleanCPF;
}

function autoCorrectEmployeeData(data) {
  const corrections = [];
  const correctedData = { ...data };

  // Converter nome para maiúsculo
  if (correctedData.name && typeof correctedData.name === 'string') {
    const originalName = correctedData.name;
    const upperCaseName = convertNameToUpperCase(correctedData.name);
    
    if (upperCaseName !== originalName) {
      corrections.push(`Nome: "${originalName}" → "${upperCaseName}" (convertido para maiúsculo)`);
      correctedData.name = upperCaseName;
    }
  }

  // Formatar CPF para garantir 11 dígitos
  if (correctedData.cpf) {
    const originalCPF = correctedData.cpf;
    const formattedCPF = formatCPF(correctedData.cpf);
    
    if (formattedCPF !== originalCPF) {
      corrections.push(`CPF: "${originalCPF}" → "${formattedCPF}" (formatado para 11 dígitos)`);
      correctedData.cpf = formattedCPF;
    }
  }

  // Validar e corrigir telefone
  if (correctedData.phone && correctedData.phone.trim() !== '') {
    const originalPhone = correctedData.phone;
    const cleanPhone = correctedData.phone.replace(/\D/g, '');
    
    if (cleanPhone.length >= 10 && cleanPhone.length <= 11) {
      if (cleanPhone !== originalPhone) {
        corrections.push(`Telefone: "${originalPhone}" → "${cleanPhone}" (formatado)`);
        correctedData.phone = cleanPhone;
      }
    } else {
      corrections.push(`Telefone: "${originalPhone}" → removido (inválido - deve ter 10 ou 11 dígitos)`);
      correctedData.phone = null;
    }
  } else {
    correctedData.phone = null;
  }

  return { correctedData, corrections };
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

console.log('🧪 Testando autoCorrectEmployeeData...\n');

console.log('📋 Dados originais:');
console.log(JSON.stringify(testData, null, 2));
console.log('');

// Aplicar correção automática
const { correctedData, corrections } = autoCorrectEmployeeData(testData);

console.log('🔧 Correções aplicadas:');
if (corrections.length > 0) {
  corrections.forEach(correction => {
    console.log(`  - ${correction}`);
  });
} else {
  console.log('  - Nenhuma correção aplicada');
}
console.log('');

console.log('📋 Dados corrigidos:');
console.log(JSON.stringify(correctedData, null, 2));
console.log('');

// Verificar campos obrigatórios
console.log('🔍 Verificando campos obrigatórios:');
const requiredFields = ['name', 'registration', 'company', 'cpf'];

requiredFields.forEach(field => {
  const value = correctedData[field];
  const isEmpty = !value || (typeof value === 'string' && value.trim() === '');
  console.log(`  ${field}: ${isEmpty ? '❌ VAZIO' : '✅ OK'} (${value})`);
});

console.log('');

// Verificar se algum campo obrigatório ficou vazio
const emptyRequiredFields = requiredFields.filter(field => {
  const value = correctedData[field];
  return !value || (typeof value === 'string' && value.trim() === '');
});

if (emptyRequiredFields.length > 0) {
  console.log('❌ PROBLEMA ENCONTRADO!');
  console.log('Campos obrigatórios que ficaram vazios:', emptyRequiredFields);
} else {
  console.log('✅ Todos os campos obrigatórios estão preenchidos');
} 