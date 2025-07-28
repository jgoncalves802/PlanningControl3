const fs = require('fs');
const path = require('path');

async function testFunctionImport() {
  try {
    console.log('🧪 Testando importação de funções...\n');

    // Ler o arquivo CSV de teste
    const csvPath = path.join(__dirname, '..', 'teste-importacao-funcoes.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    
    console.log('📄 Conteúdo do arquivo CSV:');
    console.log(csvContent);
    console.log('\n' + '='.repeat(50) + '\n');

    // Fazer o parsing manual do CSV
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const functions = [];

    console.log('🔍 Headers detectados:', headers);

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      console.log(`\n📝 Processando linha ${i + 1}: "${line}"`);

      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      console.log('Valores extraídos:', values);

      const row = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      console.log('Row original:', row);

      // Normalizar nomes de campos
      const normalizedRow = {};
      Object.keys(row).forEach(key => {
        // Remover acentos e caracteres especiais para normalização
        const normalizedKey = key.toLowerCase()
          .replace(/[àáâãäå]/g, 'a')
          .replace(/[èéêë]/g, 'e')
          .replace(/[ìíîï]/g, 'i')
          .replace(/[òóôõö]/g, 'o')
          .replace(/[ùúûü]/g, 'u')
          .replace(/[ç]/g, 'c')
          .replace(/[ñ]/g, 'n')
          .replace(/\s+/g, '');
        
        console.log(`Normalizando campo: "${key}" -> "${normalizedKey}"`);
        
        if (normalizedKey === 'nomedafuncao') {
          normalizedRow.name = row[key];
          console.log(`Campo nome mapeado: "${row[key]}"`);
        } else if (normalizedKey === 'tipodemaodeobra') {
          normalizedRow.laborType = row[key];
          console.log(`Campo tipo mapeado: "${row[key]}"`);
        }
      });

      console.log('Row normalizado:', normalizedRow);

      if (normalizedRow.name) {
        functions.push(normalizedRow);
        console.log(`✅ Função adicionada: ${normalizedRow.name}`);
      } else {
        console.log(`❌ Função ignorada - sem nome`);
      }
    }

    console.log('\n🔍 Funções extraídas do CSV:');
    console.log(JSON.stringify(functions, null, 2));
    console.log('\n' + '='.repeat(50) + '\n');

    if (functions.length === 0) {
      console.log('❌ Nenhuma função foi extraída do CSV. Parando o teste.');
      return;
    }

    // Testar a API de importação
    const response = await fetch('http://localhost:3000/api/functions/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ functions }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    console.log('✅ Resultado da importação:');
    console.log(JSON.stringify(result, null, 2));
    
    console.log('\n📊 Resumo:');
    console.log(`- Sucessos: ${result.results.success}`);
    console.log(`- Erros: ${result.results.errors.length}`);
    console.log(`- Duplicados: ${result.results.duplicates.length}`);
    console.log(`- Criados: ${result.results.created.length}`);

    if (result.results.created.length > 0) {
      console.log('\n🎉 Funções criadas:');
      result.results.created.forEach(func => console.log(`  - ${func}`));
    }

    if (result.results.duplicates.length > 0) {
      console.log('\n⚠️ Funções duplicadas:');
      result.results.duplicates.forEach(dup => console.log(`  - ${dup}`));
    }

    if (result.results.errors.length > 0) {
      console.log('\n❌ Erros:');
      result.results.errors.forEach(error => console.log(`  - ${error}`));
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar o teste
testFunctionImport(); 