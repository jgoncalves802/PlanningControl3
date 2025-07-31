// Função para formatar CPF (copiada do csvEncodingUtils)
function formatCPF(cpf) {
  if (!cpf) return '';
  
  // Converter para string e remover caracteres não numéricos
  const cpfString = String(cpf).replace(/\D/g, '');
  
  console.log(`CPF original: "${cpf}"`);
  console.log(`CPF como string: "${String(cpf)}"`);
  console.log(`CPF limpo: "${cpfString}"`);
  console.log(`Tamanho do CPF limpo: ${cpfString.length}`);
  
  // Se já tem 11 dígitos, retornar como está
  if (cpfString.length === 11) {
    console.log(`✅ CPF já tem 11 dígitos: "${cpfString}"`);
    return cpfString;
  }
  
  // Se tem menos de 11 dígitos, adicionar zeros à esquerda
  if (cpfString.length < 11) {
    const paddedCPF = cpfString.padStart(11, '0');
    console.log(`🔧 CPF com zeros adicionados: "${paddedCPF}"`);
    return paddedCPF;
  }
  
  // Se tem mais de 11 dígitos, pegar apenas os primeiros 11
  const truncatedCPF = cpfString.substring(0, 11);
  console.log(`✂️ CPF truncado: "${truncatedCPF}"`);
  return truncatedCPF;
}

// Função para validar CPF
function validateCPF(cpf) {
  if (!cpf) return false;
  
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  console.log(`\n🔍 Validando CPF: "${cpf}"`);
  console.log(`CPF limpo: "${cleanCPF}"`);
  console.log(`Tamanho: ${cleanCPF.length}`);
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) {
    console.log(`❌ CPF não tem 11 dígitos (tem ${cleanCPF.length})`);
    return false;
  }
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    console.log(`❌ CPF tem todos os dígitos iguais`);
    return false;
  }
  
  // Validação do algoritmo do CPF
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) {
    console.log(`❌ Primeiro dígito verificador inválido`);
    return false;
  }
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) {
    console.log(`❌ Segundo dígito verificador inválido`);
    return false;
  }
  
  console.log(`✅ CPF válido`);
  return true;
}

// CPFs para testar
const testCPFs = [
  "12345678901", // CPF com 11 dígitos
  "1234567890",  // CPF com 10 dígitos (deve adicionar 0)
  "123456789",   // CPF com 9 dígitos (deve adicionar 00)
  "12345678",    // CPF com 8 dígitos (deve adicionar 000)
  "529.982.247-25", // CPF válido com formatação
  "111.444.777-35", // CPF válido com formatação
  "123456789012", // CPF com 12 dígitos (deve truncar)
];

console.log('🧪 Testando formatação de CPF...\n');

testCPFs.forEach((cpf, index) => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`TESTE ${index + 1}: CPF "${cpf}"`);
  console.log(`${'='.repeat(50)}`);
  
  const formattedCPF = formatCPF(cpf);
  console.log(`\nCPF formatado: "${formattedCPF}"`);
  
  const isValid = validateCPF(formattedCPF);
  console.log(`CPF é válido: ${isValid ? '✅ SIM' : '❌ NÃO'}`);
});

console.log('\n📋 CPFs válidos para usar nos testes:');
console.log('- 529.982.247-25');
console.log('- 111.444.777-35');
console.log('- 123.456.789-09');
console.log('- 987.654.321-00'); 