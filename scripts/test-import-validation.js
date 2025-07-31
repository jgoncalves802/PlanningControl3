const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Dados de teste baseados no erro reportado
const testEmployee = {
  name: "CARLOS DALBERTO DE OLIVEIRA",
  registration: "12345", // Assumindo que existe
  company: "SARTORI SERVIÇOS", // Assumindo que existe
  cpf: "12345678901", // CPF válido
  phone: "31987654321",
  birthDate: "15/05/1985",
  gender: "Masculino",
  maritalStatus: "Solteiro",
  role: "Operador",
  category: "CLT",
  admissionDate: "01/03/2024",
  status: "Ativo"
};

async function testImportValidation() {
  try {
    console.log('🧪 Testando validação de importação...\n');
    
    // 1. Testar dados originais
    console.log('📋 Dados originais:');
    console.log(JSON.stringify(testEmployee, null, 2));
    console.log('');
    
    // 2. Simular o processo de validação
    console.log('🔍 Simulando validação...');
    
    const errors = {};
    
    // Validações obrigatórias
    if (!testEmployee.name || testEmployee.name.trim() === '') {
      errors.name = 'Nome é obrigatório';
    }
    
    if (!testEmployee.registration || testEmployee.registration.trim() === '') {
      errors.registration = 'Matrícula é obrigatória';
    }
    
    if (!testEmployee.company || testEmployee.company.trim() === '') {
      errors.company = 'Empresa é obrigatória';
    }
    
    if (!testEmployee.cpf || testEmployee.cpf.trim() === '') {
      errors.cpf = 'CPF é obrigatório';
    }
    
    console.log('✅ Validações básicas:', Object.keys(errors).length === 0 ? 'PASS' : 'FAIL');
    if (Object.keys(errors).length > 0) {
      console.log('❌ Erros encontrados:', errors);
    }
    
    // 3. Testar validação de CPF
    console.log('\n🔍 Testando validação de CPF...');
    const cpf = testEmployee.cpf.replace(/\D/g, '');
    console.log('CPF limpo:', cpf);
    console.log('CPF tem 11 dígitos:', cpf.length === 11);
    console.log('CPF não é todos iguais:', !/^(\d)\1{10}$/.test(cpf));
    
    // 4. Verificar se CPF já existe
    console.log('\n🔍 Verificando se CPF já existe...');
    const existingCpf = await prisma.employee.findUnique({ 
      where: { cpf: cpf } 
    });
    console.log('CPF já existe:', !!existingCpf);
    
    // 5. Verificar se matrícula já existe para a empresa
    console.log('\n🔍 Verificando se matrícula já existe...');
    const existingRegistration = await prisma.employee.findFirst({
      where: {
        registration: testEmployee.registration.toString(),
        company: testEmployee.company,
        isActive: true,
      },
    });
    console.log('Matrícula já existe:', !!existingRegistration);
    
    // 6. Testar conversão de dados
    console.log('\n🔍 Testando conversão de dados...');
    
    const convertedData = {
      name: testEmployee.name.toUpperCase(),
      registration: testEmployee.registration?.toString(),
      company: testEmployee.company,
      cpf: cpf,
      phone: testEmployee.phone ? testEmployee.phone.replace(/\D/g, '') : null,
      status: 'ACTIVE',
      isActive: true,
      nationality: 'Brasileira',
      naturalness: null,
      educationLevel: null,
      rg: null,
      workplace: null,
      shift: null,
      gender: testEmployee.gender || null,
      maritalStatus: testEmployee.maritalStatus || null,
      pis: null,
      ctps: null,
      ctpsSeries: null,
      ctpsUf: null,
      voterTitle: "",
      voterZone: "",
      voterSection: "",
      motherName: null,
      fatherName: null,
      notes: null,
      centroCusto: null,
      obra: null,
      mo: null,
      localAlojado: null,
      pontoReferencia: null,
      statusBancodoc: null,
      efetivoRDO: null,
      horasNormaisTrabalhadas: null,
      horasExtrasTrabalhadas: null,
      horasNoturnasTrabalhadas: null,
      birthDate: null,
      admissionDate: null,
      primeiraExperiencia: null,
      segundaExperiencia: null,
      previsaoObra: null
    };
    
    console.log('✅ Dados convertidos com sucesso');
    
    // 7. Testar criação no banco
    console.log('\n🔍 Testando criação no banco...');
    
    try {
      const createdEmployee = await prisma.employee.create({
        data: convertedData
      });
      
      console.log('✅ Funcionário criado com sucesso!');
      console.log('ID:', createdEmployee.id);
      console.log('Nome:', createdEmployee.name);
      
      // 8. Limpar - deletar o funcionário de teste
      console.log('\n🧹 Limpando dados de teste...');
      await prisma.employee.delete({
        where: { id: createdEmployee.id }
      });
      console.log('✅ Funcionário de teste removido');
      
    } catch (createError) {
      console.log('❌ Erro ao criar funcionário:', createError.message);
      console.log('Código do erro:', createError.code);
      console.log('Meta do erro:', createError.meta);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testImportValidation(); 