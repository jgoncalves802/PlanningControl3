// Função para converter string de data para Date (copiada do endpoint)
function parseDate(dateString) {
  if (!dateString) return null;
  
  try {
    const dateStr = dateString.toString().trim();
    
    // Tenta formato DD/MM/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      const [d, m, y] = dateStr.split('/');
      const day = parseInt(d, 10);
      const month = parseInt(m, 10) - 1; // Mês começa em 0
      const year = parseInt(y, 10);
      
      if (day < 1 || day > 31 || month < 0 || month > 11 || year < 1900 || year > 2100) {
        return null;
      }
      
      const date = new Date(year, month, day);
      if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
        return date;
      }
    }
    
    // Tenta formato ISO
    const isoDate = new Date(dateStr);
    if (!isNaN(isoDate.getTime()) && isoDate.getFullYear() > 1900 && isoDate.getFullYear() < 2100) {
      return isoDate;
    }
    
    return null;
  } catch (error) {
    console.warn('Erro ao converter data:', dateString, error);
    return null;
  }
}

// Datas para testar
const testDates = [
  "15/05/1985",
  "20/08/1990",
  "01/03/2024",
  "15/03/2024",
  "32/13/2024", // Data inválida
  "00/00/2024", // Data inválida
  "2024-03-01", // Formato ISO
  "2024-03-15", // Formato ISO
  "invalid-date", // Data inválida
  "", // Vazio
  null, // Null
  undefined // Undefined
];

console.log('🧪 Testando parsing de datas...\n');

testDates.forEach((date, index) => {
  const parsed = parseDate(date);
  
  console.log(`${index + 1}. Data: "${date}"`);
  console.log(`   Tipo: ${typeof date}`);
  console.log(`   Resultado: ${parsed ? parsed.toISOString() : 'null'}`);
  console.log(`   Válida: ${parsed ? '✅ SIM' : '❌ NÃO'}`);
  console.log('');
});

console.log('📋 Datas válidas para usar nos testes:');
console.log('- 15/05/1985');
console.log('- 20/08/1990');
console.log('- 01/03/2024');
console.log('- 15/03/2024'); 