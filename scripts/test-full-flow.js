const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Função para validar CPF (copiada do endpoint)
function validateCPF(cpf) {
  if (!cpf) return false;
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
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

// Função para formatar CPF (copiada do csvEncodingUtils)
function formatCPF(cpf) {
  if (!cpf) return '';
  const cpfString = String(cpf).replace(/\D/g, '');
  if (cpfString.length === 11) {
    return cpfString;
  }
  if (cpfString.length < 11) {
    return cpfString.padStart(11, '0');
  }
  return cpfString.substring(0, 11);
}

// Função para converter nome para maiúsculo
function convertNameToUpperCase(name) {
  if (!name || typeof name !== 'string') return name;
  return name.toUpperCase();
}

// Função para obter empresa padrão
function getDefaultCompany() {
  return 'SARTORI SERVIÇOS';
}

// Função de validação (copiada do endpoint)
async function validateEmployeeFromCSV(data, index) {
  const errors = {};
  
  if (!data.name || data.name.trim() === '') {
    errors.name = 'Nome é obrigatório';
  }
  
  if (!data.registration || data.registration.trim() === '') {
    errors.registration = 'Matrícula é obrigatória';
  }
  
  if (!data.company || data.company.trim() === '') {
    data.company = getDefaultCompany();
  }
  
  if (!data.cpf || data.cpf.trim() === '') {
    errors.cpf = 'CPF é obrigatório';
  } else if (!validateCPF(data.cpf)) {
    errors.cpf = 'CPF inválido';
  } else {
    const existingCpf = await prisma.employee.findUnique({ 
      where: { cpf: data.cpf.replace(/\D/g, '') } 
    });
    if (existingCpf) {
      errors.cpf = 'CPF já cadastrado';
    }
  }
  
  if (data.registration && data.company) {
    const existingRegistration = await prisma.employee.findFirst({
      where: {
        registration: data.registration.toString(),
        company: data.company,
        isActive: true,
      },
    });
    if (existingRegistration) {
      errors.registration = 'Matrícula já cadastrada para esta empresa';
    }
  }
  
  return errors;
}

// Função de correção automática (copiada do csvEncodingUtils)
function autoCorrectEmployeeData(data) {
  const corrections = [];
  const correctedData = { ...data };

  // Converter nome para maiúsculo
  if (correctedData.name && typeof correctedData.name === 'string') {
    const originalName = correctedData.name;
    const upperCaseName = convertNameToUpperCase(correctedData.name);
    
    if (upperCaseName !== originalName) {
      corrections.push(`Nome: "${originalName}" → "${upperCaseName}" (convertido para maiúsculo)`);
      correctedData.name = upperCaseName;
    }
  }

  // Formatar CPF para garantir 11 dígitos
  if (correctedData.cpf) {
    const originalCPF = correctedData.cpf;
    const formattedCPF = formatCPF(correctedData.cpf);
    
    if (formattedCPF !== originalCPF) {
      corrections.push(`CPF: "${originalCPF}" → "${formattedCPF}" (formatado para 11 dígitos)`);
      correctedData.cpf = formattedCPF;
    }
  }

  return { correctedData, corrections };
}

// Função de conversão para formato do banco
function convertCSVToEmployeeData(csvData) {
  const employeeData = {
    name: convertNameToUpperCase(csvData.name),
    registration: csvData.registration?.toString(),
    company: csvData.company,
    cpf: formatCPF(csvData.cpf),
    phone: csvData.phone ? csvData.phone.replace(/\D/g, '') : null,
    status: 'ACTIVE',
    isActive: true,
  };
  
  return employeeData;
}

// Simular o fluxo completo da API
async function simulateFullFlow() {
  try {
    console.log('🧪 Simulando fluxo completo da API de importação...\n');
    
    const testEmployees = [
      {
        name: "CARLOS DALBERTO DE OLIVEIRA",
        registration: "12345",
        company: "", // Empresa vazia
        cpf: "529.982.247-25", // CPF válido
        phone: "31987654321"
      },
      {
        name: "MARIA SANTOS COSTA",
        registration: "12346",
        company: "   ", // Empresa com espaços
        cpf: "111.444.777-35", // CPF válido
        phone: "31987654322"
      }
    ];
    
    const results = [];
    const createdEmployees = [];
    const failedEmployees = [];
    
    for (const [index, csvData] of testEmployees.entries()) {
      try {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`PROCESSANDO FUNCIONÁRIO ${index + 1}: ${csvData.name}`);
        console.log(`${'='.repeat(60)}`);
        
        // 1. Primeiro validar os dados originais do CSV
        console.log('\n🔍 PASSO 1: Validação original');
        console.log('Dados originais:', JSON.stringify(csvData, null, 2));
        
        const originalErrors = await validateEmployeeFromCSV(csvData, index);
        console.log('Erros na validação original:', originalErrors);
        
        if (Object.keys(originalErrors).length > 0) {
          console.log(`❌ Funcionário ${index + 1} falhou na validação original`);
          results.push({ 
            index: index + 1, 
            name: csvData.name || 'Nome não informado',
            registration: csvData.registration || 'Matrícula não informada',
            status: 'error', 
            errors: originalErrors 
          });
          failedEmployees.push({ index: index + 1, name: csvData.name, errors: originalErrors });
          continue;
        }
        
        console.log('✅ Validação original passou!');
        
        // 2. Aplicar correção automática
        console.log('\n🔧 PASSO 2: Correção automática');
        const { correctedData, corrections } = autoCorrectEmployeeData(csvData);
        
        console.log('Dados após correção:', JSON.stringify(correctedData, null, 2));
        console.log('Correções aplicadas:', corrections);
        
        // 3. Validar novamente os dados corrigidos
        console.log('\n🔍 PASSO 3: Validação após correção');
        const correctedErrors = await validateEmployeeFromCSV(correctedData, index);
        console.log('Erros na validação após correção:', correctedErrors);
        
        if (Object.keys(correctedErrors).length > 0) {
          console.log(`❌ Funcionário ${index + 1} falhou na validação após correção`);
          results.push({ 
            index: index + 1, 
            name: correctedData.name || 'Nome não informado',
            registration: correctedData.registration || 'Matrícula não informada',
            status: 'error', 
            errors: correctedErrors,
            note: 'Erro após correção automática'
          });
          failedEmployees.push({ index: index + 1, name: correctedData.name, errors: correctedErrors });
          continue;
        }
        
        console.log('✅ Validação após correção passou!');
        
        // 4. Converter dados para formato do banco
        console.log('\n🔄 PASSO 4: Conversão para formato do banco');
        const employeeData = convertCSVToEmployeeData(correctedData);
        console.log('Dados para inserção:', JSON.stringify(employeeData, null, 2));
        
        // 5. Criar funcionário no banco (simulado)
        console.log('\n💾 PASSO 5: Criação no banco (SIMULADO)');
        console.log('✅ Funcionário seria criado com sucesso!');
        
        const mockEmployee = {
          id: `mock-id-${index + 1}`,
          name: employeeData.name,
          registration: employeeData.registration,
          cpf: employeeData.cpf,
          company: employeeData.company
        };
        
        createdEmployees.push(mockEmployee);
        results.push({ 
          index: index + 1, 
          name: mockEmployee.name,
          registration: mockEmployee.registration,
          status: 'success', 
          id: mockEmployee.id 
        });
        
        console.log('✅ Funcionário processado com sucesso!');
        
      } catch (error) {
        console.error(`❌ Erro ao processar funcionário ${index + 1}:`, error);
        results.push({ 
          index: index + 1, 
          name: csvData.name || 'Nome não informado',
          registration: csvData.registration || 'Matrícula não informada',
          status: 'error', 
          errors: { 
            general: 'Erro ao processar',
            details: error.message 
          } 
        });
        failedEmployees.push({ 
          index: index + 1, 
          name: csvData.name, 
          errors: { general: error.message } 
        });
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('RESULTADO FINAL');
    console.log('='.repeat(60));
    console.log(`Total: ${testEmployees.length}`);
    console.log(`Criados: ${createdEmployees.length}`);
    console.log(`Falharam: ${failedEmployees.length}`);
    
    if (createdEmployees.length > 0) {
      console.log('\n✅ Funcionários criados:');
      createdEmployees.forEach((emp, index) => {
        console.log(`  ${index + 1}. ${emp.name} - Empresa: ${emp.company}`);
      });
    }
    
    if (failedEmployees.length > 0) {
      console.log('\n❌ Funcionários que falharam:');
      failedEmployees.forEach((failed, index) => {
        console.log(`  ${index + 1}. ${failed.name} (Linha ${failed.index})`);
        Object.entries(failed.errors).forEach(([field, error]) => {
          console.log(`     ${field}: ${error}`);
        });
      });
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

simulateFullFlow(); 