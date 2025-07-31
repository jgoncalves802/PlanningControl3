const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Função para validar CPF (copiada do endpoint)
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

// Função para formatar CPF (copiada do csvEncodingUtils)
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
  
  // Validação de CPF
  console.log('\n🔍 Validando CPF:', data.cpf);
  if (!data.cpf || data.cpf.trim() === '') {
    errors.cpf = 'CPF é obrigatório';
    console.log('❌ CPF vazio');
  } else {
    console.log('CPF original:', data.cpf);
    const cleanCPF = data.cpf.replace(/\D/g, '');
    console.log('CPF limpo:', cleanCPF);
    console.log('CPF tem 11 dígitos:', cleanCPF.length === 11);
    console.log('CPF não é todos iguais:', !/^(\d)\1{10}$/.test(cleanCPF));
    
    if (!validateCPF(data.cpf)) {
      errors.cpf = 'CPF inválido';
      console.log('❌ CPF inválido');
    } else {
      console.log('✅ CPF válido');
      
      // Verifica se CPF já existe
      const existingCpf = await prisma.employee.findUnique({ 
        where: { cpf: data.cpf.replace(/\D/g, '') } 
      });
      if (existingCpf) {
        errors.cpf = 'CPF já cadastrado';
        console.log('❌ CPF já cadastrado');
      } else {
        console.log('✅ CPF não existe no banco');
      }
    }
  }
  
  // Validação de matrícula única por empresa
  if (data.registration && data.company) {
    console.log('\n🔍 Verificando matrícula única...');
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

async function runDebugTest() {
  try {
    console.log('🧪 Debugando validação de importação...\n');
    
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
    
    for (const [index, employee] of testEmployees.entries()) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`FUNCIONÁRIO ${index + 1}: ${employee.name}`);
      console.log(`${'='.repeat(60)}`);
      
      const errors = await validateEmployeeFromCSV(employee, index);
      
      if (Object.keys(errors).length === 0) {
        console.log(`\n✅ Funcionário ${index + 1} passou na validação!`);
      } else {
        console.log(`\n❌ Funcionário ${index + 1} falhou na validação:`);
        Object.entries(errors).forEach(([field, error]) => {
          console.log(`   ${field}: ${error}`);
        });
      }
    }
    
    console.log('\n🎯 CONCLUSÃO:');
    console.log('Se todos os funcionários passaram na validação, o problema pode estar na correção automática.');
    console.log('Se algum funcionário falhou, o problema está na validação.');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runDebugTest(); 