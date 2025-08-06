// Teste detalhado da validação do CPF
function validateCPF(cpf) {
  if (!cpf) return false;
  
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  console.log(`CPF limpo: ${cleanCPF}`);
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) {
    console.log(`❌ CPF não tem 11 dígitos (tem ${cleanCPF.length})`);
    return false;
  }
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    console.log('❌ CPF com todos os dígitos iguais');
    return false;
  }
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  
  console.log(`Soma para primeiro dígito: ${sum}`);
  console.log(`Resto: ${remainder}`);
  console.log(`Primeiro dígito verificador esperado: ${remainder}`);
  console.log(`Primeiro dígito verificador real: ${parseInt(cleanCPF.charAt(9))}`);
  
  if (remainder !== parseInt(cleanCPF.charAt(9))) {
    console.log('❌ Primeiro dígito verificador inválido');
    return false;
  }
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  
  console.log(`Soma para segundo dígito: ${sum}`);
  console.log(`Resto: ${remainder}`);
  console.log(`Segundo dígito verificador esperado: ${remainder}`);
  console.log(`Segundo dígito verificador real: ${parseInt(cleanCPF.charAt(10))}`);
  
  if (remainder !== parseInt(cleanCPF.charAt(10))) {
    console.log('❌ Segundo dígito verificador inválido');
    return false;
  }
  
  console.log('✅ CPF válido!');
  return true;
}

// Testar CPFs conhecidos
const testCPFs = [
  '02610511983', // CPF do problema
  '12345678901', // CPF de teste
  '11144477735', // CPF válido conhecido
  '00000000000', // CPF inválido (todos iguais)
  '12345678909'  // CPF inválido
];

testCPFs.forEach((cpf, index) => {
  console.log(`\n=== Teste ${index + 1}: ${cpf} ===`);
  const isValid = validateCPF(cpf);
  console.log(`Resultado: ${isValid ? 'VÁLIDO' : 'INVÁLIDO'}`);
}); 