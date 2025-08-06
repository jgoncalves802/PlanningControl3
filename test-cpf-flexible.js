// Teste da nova validação flexível do CPF
function formatCPF(cpf) {
  if (!cpf) return '';
  
  // Converter para string e remover caracteres não numéricos
  const cpfString = String(cpf).replace(/\D/g, '');
  
  // Se já tem 11 dígitos, retornar como está
  if (cpfString.length === 11) {
    return cpfString;
  }
  
  // Se tem menos de 11 dígitos, adicionar zeros à esquerda
  if (cpfString.length < 11) {
    return cpfString.padStart(11, '0');
  }
  
  // Se tem mais de 11 dígitos, pegar apenas os primeiros 11
  return cpfString.substring(0, 11);
}

function validateCPFFlexible(cpf) {
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
  
  console.log('✅ CPF aceito (validação flexível)');
  return true;
}

// Testar CPFs
const testCPFs = [
  '2610511983', // CPF original do problema
  '02610511983', // CPF formatado
  '12345678901', // CPF de teste
  '11144477735', // CPF válido conhecido
  '00000000000', // CPF inválido (todos iguais)
  '123456789'    // CPF com 9 dígitos
];

testCPFs.forEach((cpf, index) => {
  console.log(`\n=== Teste ${index + 1}: ${cpf} ===`);
  
  // Simular o processo de importação
  console.log('1. Formatando CPF...');
  const formattedCPF = formatCPF(cpf);
  console.log(`CPF formatado: ${formattedCPF}`);
  
  console.log('2. Validando CPF (validação flexível)...');
  const isValid = validateCPFFlexible(formattedCPF);
  console.log(`Resultado: ${isValid ? 'ACEITO' : 'REJEITADO'}`);
  
  if (isValid) {
    console.log('3. CPF pronto para importação:', formattedCPF);
  }
}); 