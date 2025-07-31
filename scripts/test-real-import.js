const fs = require('fs');
const path = require('path');

// Dados de teste baseados no erro reportado
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

async function testRealImport() {
  try {
    console.log('🧪 Testando importação real...\n');
    
    console.log('📋 Dados que serão enviados:');
    console.log(JSON.stringify(testEmployees, null, 2));
    console.log('');
    
    // Verificar se o servidor está rodando
    console.log('🌐 Verificando se o servidor está rodando...');
    
    const response = await fetch('http://localhost:3000/api/employees/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testEmployees)
    });
    
    console.log('Status da resposta:', response.status);
    console.log('Headers da resposta:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Erro na API:', errorText);
      return;
    }
    
    const result = await response.json();
    
    console.log('\n📊 Resultado da importação:');
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
    console.error('❌ Erro no teste:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Dica: Certifique-se de que o servidor está rodando em http://localhost:3000');
      console.log('Execute: npm run dev');
    }
  }
}

// Função para testar com dados problemáticos
async function testProblematicData() {
  try {
    console.log('\n🧪 Testando com dados problemáticos...\n');
    
    // Dados que podem estar causando o problema
    const problematicEmployees = [
      {
        name: "", // Nome vazio
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
        name: "CARLOS DALBERTO DE OLIVEIRA",
        registration: "", // Matrícula vazia
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
        company: "", // Empresa vazia
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
    
    console.log('📋 Dados problemáticos que serão enviados:');
    console.log(JSON.stringify(problematicEmployees, null, 2));
    console.log('');
    
    const response = await fetch('http://localhost:3000/api/employees/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(problematicEmployees)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Erro na API:', errorText);
      return;
    }
    
    const result = await response.json();
    
    console.log('\n📊 Resultado da importação problemática:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Erro no teste problemático:', error.message);
  }
}

// Executar testes
testRealImport();

// Para testar dados problemáticos, descomente a linha abaixo:
// testProblematicData(); 