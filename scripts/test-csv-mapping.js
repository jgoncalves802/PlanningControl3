// Script para testar o mapeamento de campos CSV
// Testa se CPF e matrícula estão sendo reconhecidos corretamente

const testCSV = `NOME;CPF;MATRÍCULA;EMPRESA;TELEFONE;DATA NASC;GÊNERO;ESTADO CIVIL;PIS;CTPS;CTPS SÉRIE;CTPS UF;NOME DA MÃE;CARGO;CATEGORIA;DATA ADMISSÃO;STATUS
João Silva Santos;12345678901;12345;SARTORI SERVIÇOS;31987654321;15/05/1985;Masculino;Solteiro;;;;;;;Operador;CLT;01/03/2024;Ativo
Maria Santos Costa;98765432100;12346;SARTORI SERVIÇOS;31987654322;20/08/1990;Feminino;Casada;;;;;;;Auxiliar;CLT;15/03/2024;Ativo
José Antônio Oliveira;11122233344;12347;SARTORI SERVIÇOS;31987654323;10/12/1975;Masculino;Solteiro;;;;;;;Técnico;CLT;19/01/2023;Ativo`;

console.log('🔍 Testando mapeamento de campos CSV...');
console.log('CSV de teste:');
console.log(testCSV);
console.log('\n---');

// Simular o processamento que acontece no sistema
function processCSVTest(csvText) {
  // Remover BOM
  const cleanText = csvText.replace(/^\uFEFF/, '');
  
  const lines = cleanText.split('\n');
  if (lines.length < 2) {
    return [];
  }

  // Detectar separador automaticamente
  const firstLine = lines[0];
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  
  // Usar o separador mais frequente
  const separator = semicolonCount >= commaCount ? ';' : ',';
  
  // Normalizar cabeçalhos (como no sistema real)
  const rawHeaders = lines[0].split(separator);
  const headers = rawHeaders.map(h => {
    return h
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
  });

  console.log('Cabeçalhos normalizados:', headers);
  
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse simples da linha CSV
    const values = line.split(separator).map(v => v.replace(/^"|"$/g, '').trim());
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    console.log(`\nLinha ${i} - Dados brutos:`, row);

    // Mapear campos normalizados para os nomes esperados (CORREÇÃO APLICADA)
    const normalizedRow = {};
    Object.keys(row).forEach(key => {
      // Mapeamento completo de todos os campos necessários
      if (key === 'nomedafuncao' || key === 'name' || key === 'nome') {
        normalizedRow.name = row[key];
      } else if (key === 'tipodemaodeobra' || key === 'labortype' || key === 'laborType') {
        normalizedRow.laborType = row[key];
      } else if (key === 'cpf') {
        normalizedRow.cpf = row[key];
      } else if (key === 'matricula' || key === 'registration') {
        normalizedRow.registration = row[key];
      } else if (key === 'empresa' || key === 'company') {
        normalizedRow.company = row[key];
      } else if (key === 'telefone' || key === 'phone') {
        normalizedRow.phone = row[key];
      } else if (key === 'datanasc' || key === 'birthdate' || key === 'birthDate') {
        normalizedRow.birthDate = row[key];
      } else if (key === 'genero' || key === 'gender') {
        normalizedRow.gender = row[key];
      } else if (key === 'estadocivil' || key === 'maritalstatus' || key === 'maritalStatus') {
        normalizedRow.maritalStatus = row[key];
      } else if (key === 'pis') {
        normalizedRow.pis = row[key];
      } else if (key === 'ctps') {
        normalizedRow.ctps = row[key];
      } else if (key === 'ctpsseries' || key === 'ctpsSeries') {
        normalizedRow.ctpsSeries = row[key];
      } else if (key === 'ctpsuf' || key === 'ctpsUf') {
        normalizedRow.ctpsUf = row[key];
      } else if (key === 'nomedamae' || key === 'mothername' || key === 'motherName') {
        normalizedRow.motherName = row[key];
      } else if (key === 'dataadmissao' || key === 'admissiondate' || key === 'admissionDate') {
        normalizedRow.admissionDate = row[key];
      } else if (key === 'status') {
        normalizedRow.status = row[key];
      } else if (key === 'rg') {
        normalizedRow.rg = row[key];
      } else if (key === 'endereco' || key === 'address') {
        normalizedRow.address = row[key];
      } else if (key === 'cidade' || key === 'city') {
        normalizedRow.city = row[key];
      } else if (key === 'estado' || key === 'state') {
        normalizedRow.state = row[key];
      } else if (key === 'cep') {
        normalizedRow.cep = row[key];
      } else if (key === 'email') {
        normalizedRow.email = row[key];
      } else if (key === 'cargo' || key === 'role') {
        normalizedRow.role = row[key];
      } else if (key === 'categoria' || key === 'category') {
        normalizedRow.category = row[key];
      } else if (key === 'centrocusto' || key === 'centroCusto') {
        normalizedRow.centroCusto = row[key];
      } else if (key === 'obra') {
        normalizedRow.obra = row[key];
      } else if (key === 'mo') {
        normalizedRow.mo = row[key];
      } else if (key === 'localalojado' || key === 'localAlojado') {
        normalizedRow.localAlojado = row[key];
      } else if (key === 'pontoreferencia' || key === 'pontoReferencia') {
        normalizedRow.pontoReferencia = row[key];
      } else if (key === 'statusbancodoc' || key === 'statusBancodoc') {
        normalizedRow.statusBancodoc = row[key];
      } else if (key === 'efetivordo' || key === 'efetivoRDO') {
        normalizedRow.efetivoRDO = row[key];
      } else if (key === 'horasnormaistrabalhadas' || key === 'horasNormaisTrabalhadas') {
        normalizedRow.horasNormaisTrabalhadas = row[key];
      } else if (key === 'horasextrastrabalhadas' || key === 'horasExtrasTrabalhadas') {
        normalizedRow.horasExtrasTrabalhadas = row[key];
      } else if (key === 'horasnoturnastrabalhadas' || key === 'horasNoturnasTrabalhadas') {
        normalizedRow.horasNoturnasTrabalhadas = row[key];
      } else if (key === 'primeiraexperiencia' || key === 'primeiraExperiencia') {
        normalizedRow.primeiraExperiencia = row[key];
      } else if (key === 'segundaexperiencia' || key === 'segundaExperiencia') {
        normalizedRow.segundaExperiencia = row[key];
      } else if (key === 'previsaoobra' || key === 'previsaoObra') {
        normalizedRow.previsaoObra = row[key];
      }
    });

    console.log(`Linha ${i} - Dados mapeados:`, normalizedRow);
    
    // Verificar se CPF e matrícula foram reconhecidos
    if (normalizedRow.cpf) {
      console.log(`✅ CPF reconhecido: ${normalizedRow.cpf}`);
    } else {
      console.log(`❌ CPF NÃO reconhecido`);
    }
    
    if (normalizedRow.registration) {
      console.log(`✅ Matrícula reconhecida: ${normalizedRow.registration}`);
    } else {
      console.log(`❌ Matrícula NÃO reconhecida`);
    }
    
    if (normalizedRow.name || normalizedRow.cpf) {
      data.push(normalizedRow);
    }
  }

  return data;
}

// Executar teste
const result = processCSVTest(testCSV);

console.log('\n=== RESULTADO FINAL ===');
console.log('Registros processados:', result.length);
console.log('Dados finais:', JSON.stringify(result, null, 2));

// Verificar se todos os campos obrigatórios estão presentes
result.forEach((record, index) => {
  console.log(`\nRegistro ${index + 1}:`);
  console.log(`- Nome: ${record.name || 'NÃO ENCONTRADO'}`);
  console.log(`- CPF: ${record.cpf || 'NÃO ENCONTRADO'}`);
  console.log(`- Matrícula: ${record.registration || 'NÃO ENCONTRADO'}`);
  console.log(`- Empresa: ${record.company || 'NÃO ENCONTRADO'}`);
}); 