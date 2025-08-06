// Teste da função formatCPF
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

// Testes
console.log('=== Teste da função formatCPF ===');
console.log('CPF original: 2610511983');
console.log('CPF formatado:', formatCPF('2610511983'));
console.log('CPF com zeros à esquerda:', formatCPF('2610511983').padStart(11, '0'));

console.log('\n=== Outros testes ===');
console.log('CPF: 12345678901 →', formatCPF('12345678901')); // 11 dígitos
console.log('CPF: 123456789 →', formatCPF('123456789')); // 9 dígitos
console.log('CPF: 123456789012 →', formatCPF('123456789012')); // 12 dígitos
console.log('CPF: 123.456.789-01 →', formatCPF('123.456.789-01')); // com formatação
console.log('CPF: 00012345678 →', formatCPF('00012345678')); // com zeros à esquerda 