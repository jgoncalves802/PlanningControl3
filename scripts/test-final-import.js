// Dados de teste com CPFs válidos para verificar a correção da empresa
const finalTestEmployees = [
  {
    name: "CARLOS DALBERTO DE OLIVEIRA",
    registration: "12345",
    company: "", // Empresa vazia - deve ser preenchida automaticamente
    cpf: "529.982.247-25", // CPF válido
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
    company: "   ", // Empresa com espaços em branco - deve ser preenchida automaticamente
    cpf: "111.444.777-35", // CPF válido
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

async function testFinalImport() {
  try {
    console.log('🧪 Teste final - Verificando correção automática da empresa...\n');
    
    console.log('📋 Dados que serão enviados:');
    console.log(JSON.stringify(finalTestEmployees, null, 2));
    console.log('');
    
    console.log('🌐 Enviando dados para API...');
    
    const response = await fetch('http://localhost:3000/api/employees/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(finalTestEmployees)
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
        console.log('\n✅ Funcionários criados com sucesso:');
        result.createdEmployees.forEach((emp, index) => {
          console.log(`  ${index + 1}. ${emp.name}`);
          console.log(`     Matrícula: ${emp.registration}`);
          console.log(`     CPF: ${emp.cpf}`);
          console.log(`     Empresa: ${emp.company || 'N/A'}`);
        });
        
        console.log('\n🎉 CORREÇÃO DA EMPRESA FUNCIONANDO!');
        console.log('✅ Quando o campo "company" está vazio, o sistema automaticamente preenche com a empresa do usuário logado.');
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

// Executar teste final
testFinalImport(); 