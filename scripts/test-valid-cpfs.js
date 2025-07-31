// Teste com CPFs válidos para verificar se a importação está funcionando
const validTestEmployees = [
  {
    name: "CARLOS DALBERTO DE OLIVEIRA",
    registration: "12345",
    company: "", // Empresa vazia
    cpf: "529.982.247-25", // CPF válido
    phone: "31987654321"
  },
  {
    name: "MARIA SANTOS COSTA",
    registration: 12346, // Matrícula como número
    company: "   ", // Empresa com espaços
    cpf: "111.444.777-35", // CPF válido
    phone: 31987654322 // Telefone como número
  },
  {
    name: "JOÃO SILVA SANTOS",
    registration: "  12347  ", // Matrícula com espaços
    company: "SARTORI SERVIÇOS",
    cpf: "123.456.789-09", // CPF válido
    phone: "31987654323"
  }
];

async function testValidCPFs() {
  try {
    console.log('🧪 Teste com CPFs válidos...\n');
    
    console.log('📋 Dados que serão enviados:');
    console.log(JSON.stringify(validTestEmployees, null, 2));
    console.log('');
    
    console.log('🌐 Enviando dados para API...');
    
    const response = await fetch('http://localhost:3000/api/employees/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validTestEmployees)
    });
    
    console.log('Status da resposta:', response.status);
    
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
      
      if (result.createdEmployees.length > 0) {
        console.log('\n🎉 FUNCIONÁRIOS CRIADOS COM SUCESSO!');
        console.log('✅ CPFs válidos e matrículas estão funcionando!');
        result.createdEmployees.forEach((emp, index) => {
          console.log(`  ${index + 1}. ${emp.name}`);
          console.log(`     Matrícula: ${emp.registration}`);
          console.log(`     CPF: ${emp.cpf}`);
          console.log(`     Empresa: ${emp.company || 'N/A'}`);
        });
      }
      
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

testValidCPFs(); 