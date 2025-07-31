const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Função para obter empresa padrão
function getDefaultCompany() {
  return 'SARTORI SERVIÇOS';
}

// Função de validação (copiada do endpoint)
async function validateEmployeeFromCSV(data, index) {
  const errors = {};
  
  console.log(`\n🔍 Validando funcionário ${index + 1}:`);
  console.log('Dados recebidos:', JSON.stringify(data, null, 2));
  
  // Validações obrigatórias
  if (!data.name || data.name.trim() === '') {
    errors.name = 'Nome é obrigatório';
    console.log('❌ Nome vazio');
  } else {
    console.log('✅ Nome OK:', data.name);
  }
  
  console.log('\n🔍 Verificando matrícula...');
  console.log('Matrícula original:', data.registration);
  console.log('Tipo da matrícula:', typeof data.registration);
  console.log('Matrícula após trim:', data.registration ? data.registration.trim() : 'undefined');
  
  if (!data.registration || data.registration.trim() === '') {
    errors.registration = 'Matrícula é obrigatória';
    console.log('❌ Matrícula vazia');
  } else {
    console.log('✅ Matrícula OK:', data.registration);
  }
  
  // Se company estiver vazio, usar empresa padrão
  if (!data.company || data.company.trim() === '') {
    data.company = getDefaultCompany();
    console.log(`✅ Empresa definida automaticamente como "${data.company}"`);
  } else {
    console.log('✅ Empresa OK:', data.company);
  }
  
  // Validação de matrícula única por empresa
  if (data.registration && data.company) {
    console.log('\n🔍 Verificando matrícula única...');
    console.log('Matrícula para verificar:', data.registration.toString());
    console.log('Empresa para verificar:', data.company);
    
    const existingRegistration = await prisma.employee.findFirst({
      where: {
        registration: data.registration.toString(),
        company: data.company,
        isActive: true,
      },
    });
    
    if (existingRegistration) {
      errors.registration = 'Matrícula já cadastrada para esta empresa';
      console.log('❌ Matrícula já existe para esta empresa');
      console.log('Funcionário existente:', existingRegistration.name);
    } else {
      console.log('✅ Matrícula única OK');
    }
  }
  
  console.log('\n📊 Resultado da validação:', Object.keys(errors).length === 0 ? 'PASS' : 'FAIL');
  if (Object.keys(errors).length > 0) {
    console.log('Erros encontrados:', errors);
  }
  
  return errors;
}

// Função de conversão para formato do banco
function convertCSVToEmployeeData(csvData) {
  console.log('\n🔄 Convertendo dados para formato do banco...');
  console.log('Dados originais:', JSON.stringify(csvData, null, 2));
  
  const employeeData = {
    name: csvData.name ? csvData.name.toUpperCase() : '',
    registration: csvData.registration ? csvData.registration.toString() : '',
    company: csvData.company,
    cpf: csvData.cpf ? csvData.cpf.replace(/\D/g, '') : '',
    phone: csvData.phone ? csvData.phone.replace(/\D/g, '') : null,
    status: 'ACTIVE',
    isActive: true,
  };
  
  console.log('Dados convertidos:', JSON.stringify(employeeData, null, 2));
  
  return employeeData;
}

async function testRegistrationProcessing() {
  try {
    console.log('🧪 Testando processamento de matrículas...\n');
    
    const testEmployees = [
      {
        name: "CARLOS DALBERTO DE OLIVEIRA",
        registration: "12345",
        company: "",
        cpf: "529.982.247-25",
        phone: "31987654321"
      },
      {
        name: "MARIA SANTOS COSTA",
        registration: "12346",
        company: "   ",
        cpf: "111.444.777-35",
        phone: "31987654322"
      },
      {
        name: "JOÃO SILVA SANTOS",
        registration: 12347, // Número em vez de string
        company: "SARTORI SERVIÇOS",
        cpf: "123.456.789-09",
        phone: "31987654323"
      },
      {
        name: "ANA PAULA COSTA",
        registration: "  12348  ", // Com espaços
        company: "SARTORI SERVIÇOS",
        cpf: "987.654.321-00",
        phone: "31987654324"
      }
    ];
    
    for (const [index, employee] of testEmployees.entries()) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`FUNCIONÁRIO ${index + 1}: ${employee.name}`);
      console.log(`${'='.repeat(60)}`);
      
      // 1. Validar dados
      const errors = await validateEmployeeFromCSV(employee, index);
      
      if (Object.keys(errors).length === 0) {
        console.log(`\n✅ Funcionário ${index + 1} passou na validação!`);
        
        // 2. Converter dados
        const employeeData = convertCSVToEmployeeData(employee);
        
        // 3. Simular criação no banco
        console.log('\n💾 Simulando criação no banco...');
        console.log('Dados que seriam inseridos:', JSON.stringify(employeeData, null, 2));
        console.log('✅ Funcionário seria criado com sucesso!');
        
      } else {
        console.log(`\n❌ Funcionário ${index + 1} falhou na validação:`);
        Object.entries(errors).forEach(([field, error]) => {
          console.log(`   ${field}: ${error}`);
        });
      }
    }
    
    console.log('\n🎯 CONCLUSÃO:');
    console.log('Se todas as matrículas passaram na validação, o problema pode estar na conversão ou inserção.');
    console.log('Se alguma matrícula falhou, o problema está na validação.');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRegistrationProcessing(); 