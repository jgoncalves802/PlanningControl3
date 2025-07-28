const fs = require('fs');

// Função para normalizar cabeçalhos
function normalizeHeader(header) {
  return header
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[ñ]/g, 'n')
    .replace(/\s+/g, '')
    .replace(/[^a-z]/g, '');
}

// Função para normalizar texto
function robustNormalizeText(text) {
  if (!text || typeof text !== 'string') return text;
  let normalized = text.replace(/^\uFEFF/, '');
  normalized = normalized.normalize('NFC');
  normalized = normalized.trim();
  return normalized;
}

// Função para parsear linha CSV
function parseCSVLine(line, separator) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === separator && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current.trim());
  return values;
}

// Função principal de parse
function parseCSVWithEncoding(csvText) {
  console.log('🔍 parseCSVWithEncoding iniciado');
  
  // Remover BOM
  const cleanText = csvText.replace(/^\uFEFF/, '');
  console.log('🧹 Texto limpo (primeiras 300 chars):', cleanText.substring(0, 300));
  
  const lines = cleanText.split('\n');
  console.log('📄 Número de linhas:', lines.length);
  if (lines.length < 2) {
    console.log('❌ Poucas linhas, retornando array vazio');
    return [];
  }

  // Detectar separador automaticamente
  const firstLine = lines[0];
  console.log('📋 Primeira linha:', firstLine);
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  
  // Usar o separador mais frequente, ou vírgula como padrão
  const separator = semicolonCount >= commaCount ? ';' : ',';
  console.log(`🔧 Separador detectado: "${separator}" (;: ${semicolonCount}, ,: ${commaCount})`);
  
  // Normalizar cabeçalhos
  const rawHeaders = lines[0].split(separator);
  console.log('📋 Cabeçalhos brutos:', rawHeaders);
  const headers = rawHeaders.map(h => normalizeHeader(robustNormalizeText(h)));
  console.log('📋 Cabeçalhos normalizados:', headers);
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      console.log(`⏭️ Linha ${i + 1} vazia, pulando`);
      continue;
    }

    console.log(`📄 Processando linha ${i + 1}:`, line);
    
    // Tratar campos entre aspas
    const values = parseCSVLine(line, separator);
    console.log(`📊 Valores da linha ${i + 1}:`, values);
    const row = {};

    headers.forEach((header, index) => {
      row[header] = robustNormalizeText(values[index] || '');
    });
    
    console.log(`📋 Linha ${i + 1} processada:`, row);

    // Mapear campos normalizados para os nomes esperados
    const normalizedRow = {};
    Object.keys(row).forEach(key => {
      console.log(`🔍 Verificando campo: "${key}"`);
      if (key === 'nomedafuncao' || key === 'name') {
        normalizedRow.name = row[key];
        console.log(`✅ Campo "name" mapeado: "${row[key]}"`);
      } else if (key === 'tipodemaodeobra' || key === 'labortype') {
        normalizedRow.laborType = row[key];
        console.log(`✅ Campo "laborType" mapeado: "${row[key]}"`);
      } else {
        console.log(`❌ Campo não reconhecido: "${key}"`);
      }
    });
    
    if (normalizedRow.name) {
      console.log(`✅ Adicionando função:`, normalizedRow);
      data.push(normalizedRow);
    } else {
      console.log(`❌ Função sem nome válido, ignorando:`, normalizedRow);
    }
  }

  console.log('🎯 Resultado final do parseCSVWithEncoding:', data);
  console.log('🎯 Número de funções encontradas:', data.length);
  return data;
}

// Testar com o arquivo CSV
try {
  console.log('📄 Tentando ler arquivo com UTF-8...');
  let csvContent = fs.readFileSync('teste-importacao-funcoes.csv', 'utf8');
  console.log('📄 Conteúdo do arquivo CSV (UTF-8):');
  console.log('Tamanho:', csvContent.length);
  console.log('Primeiros 100 chars:', csvContent.substring(0, 100));
  console.log('Todos os chars:', csvContent);
  
  if (!csvContent || csvContent.length === 0) {
    console.log('📄 Tentando ler arquivo com latin1...');
    csvContent = fs.readFileSync('teste-importacao-funcoes.csv', 'latin1');
    console.log('📄 Conteúdo do arquivo CSV (latin1):');
    console.log('Tamanho:', csvContent.length);
    console.log('Primeiros 100 chars:', csvContent.substring(0, 100));
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  const result = parseCSVWithEncoding(csvContent);
  
  console.log('\n' + '='.repeat(50));
  console.log('🎯 RESULTADO FINAL:');
  console.log(JSON.stringify(result, null, 2));
  
} catch (error) {
  console.error('❌ Erro ao ler arquivo:', error.message);
} 