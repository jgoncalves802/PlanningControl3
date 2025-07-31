// Simular dados de teste baseados no erro reportado
const testEmployees = [
  {
    name: "CARLOS DALBERTO DE OLIVEIRA",
    registration: "12345",
    company: "SARTORI SERVIÇOS",
    cpf: "12345678901",
    phone: "31987654321",
    birthDate: "15/05/1985",
    gender: "Masculino",
    maritalStatus: "Solteiro",
    role: "Operador",
    category: "CLT",
    admissionDate: "01/03/2024",
    status: "Ativo"
  },
  {
    name: "MARIA SANTOS COSTA",
    registration: "12346",
    company: "SARTORI SERVIÇOS",
    cpf: "98765432100",
    phone: "31987654322",
    birthDate: "20/08/1990",
    gender: "Feminino",
    maritalStatus: "Casada",
    role: "Auxiliar",
    category: "CLT",
    admissionDate: "15/03/2024",
    status: "Ativo"
  }
];

async function testFullImport() {
  try {
    console.log('🧪 Testando importação completa...\n');
    
    console.log('📋 Dados de teste:');
    console.log(JSON.stringify(testEmployees, null, 2));
    console.log('');
    
    // Simular chamada para a API
    console.log('🌐 Simulando chamada para API...');
    
    const response = await fetch('/api/employees/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testEmployees)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Erro na API:', response.status, errorText);
      return;
    }
    
    const result = await response.json();
    
    console.log('📊 Resultado da importação:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n✅ Importação bem-sucedida!');
      console.log(`Total: ${result.summary.total}`);
      console.log(`Criados: ${result.summary.created}`);
      console.log(`Falharam: ${result.summary.failed}`);
      
      if (result.failedEmployees.length > 0) {
        console.log('\n❌ Funcionários que falharam:');
        result.failedEmployees.forEach((failed, index) => {
          console.log(`  ${index + 1}. ${failed.name} (Linha ${failed.index})`);
          Object.entries(failed.errors).forEach(([field, error]) => {
            console.log(`     ${field}: ${error}`);
          });
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Função para testar localmente sem API
function testLocalValidation() {
  console.log('🧪 Testando validação local...\n');
  
  testEmployees.forEach((employee, index) => {
    console.log(`📋 Funcionário ${index + 1}: ${employee.name}`);
    
    // Validar campos obrigatórios
    const errors = {};
    
    if (!employee.name || employee.name.trim() === '') {
      errors.name = 'Nome é obrigatório';
    }
    
    if (!employee.registration || employee.registration.trim() === '') {
      errors.registration = 'Matrícula é obrigatória';
    }
    
    if (!employee.company || employee.company.trim() === '') {
      errors.company = 'Empresa é obrigatória';
    }
    
    if (!employee.cpf || employee.cpf.trim() === '') {
      errors.cpf = 'CPF é obrigatório';
    }
    
    if (Object.keys(errors).length > 0) {
      console.log('❌ Erros encontrados:');
      Object.entries(errors).forEach(([field, error]) => {
        console.log(`  ${field}: ${error}`);
      });
    } else {
      console.log('✅ Validação passou');
    }
    
    console.log('');
  });
}

// Executar testes
testLocalValidation();

// Para testar com API real, descomente a linha abaixo:
// testFullImport(); 