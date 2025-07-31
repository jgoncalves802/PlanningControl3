// Função para validar CPF (copiada do endpoint)
function validateCPF(cpf) {
  if (!cpf) return false;
  
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validação do algoritmo do CPF
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
}

// CPFs para testar
const testCPFs = [
  "12345678901", // CPF que estava sendo usado
  "98765432100", // CPF que estava sendo usado
  "11111111111", // CPF inválido (todos iguais)
  "1234567890",  // CPF inválido (poucos dígitos)
  "123456789012", // CPF inválido (muitos dígitos)
  "529.982.247-25", // CPF válido com formatação
  "52998224725",   // CPF válido sem formatação
  "111.444.777-35", // CPF válido com formatação
  "11144477735",   // CPF válido sem formatação
];

console.log('🧪 Testando validação de CPF...\n');

testCPFs.forEach((cpf, index) => {
  const isValid = validateCPF(cpf);
  const cleanCPF = cpf.replace(/\D/g, '');
  
  console.log(`${index + 1}. CPF: "${cpf}"`);
  console.log(`   Limpo: "${cleanCPF}"`);
  console.log(`   Válido: ${isValid ? '✅ SIM' : '❌ NÃO'}`);
  console.log('');
});

// Gerar alguns CPFs válidos para teste
console.log('📋 CPFs válidos para usar nos testes:');
console.log('- 529.982.247-25');
console.log('- 111.444.777-35');
console.log('- 123.456.789-09');
console.log('- 987.654.321-00'); 