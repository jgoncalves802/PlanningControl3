// Teste da importação com CPF que precisa de zeros à esquerda
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

// Simular dados de importação
const testData = {
  name: 'João Silva',
  cpf: '2610511983', // CPF com 10 dígitos
  registration: '12345',
  company: 'SARTORI SERVIÇOS'
};

console.log('=== Teste de Importação com CPF ===');
console.log('Dados originais:', testData);

// Simular o processo de validação corrigido
console.log('\n1. Formatando CPF...');
const formattedCPF = formatCPF(testData.cpf);
console.log('CPF formatado:', formattedCPF);

console.log('\n2. Validando CPF formatado...');
const isValid = validateCPF(formattedCPF);
console.log('CPF válido:', isValid);

console.log('\n3. Dados finais para importação:');
const finalData = {
  ...testData,
  cpf: formattedCPF
};
console.log(finalData);

// Teste com outros CPFs
console.log('\n=== Testes com outros CPFs ===');
const testCPFs = [
  '2610511983', // 10 dígitos
  '12345678901', // 11 dígitos válido
  '123456789', // 9 dígitos
  '00000000000', // 11 dígitos iguais (inválido)
  '123.456.789-01' // com formatação
];

testCPFs.forEach(cpf => {
  const formatted = formatCPF(cpf);
  const valid = validateCPF(formatted);
  console.log(`CPF: ${cpf} → Formatado: ${formatted} → Válido: ${valid}`);
}); 