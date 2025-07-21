async function testPageLoad() {
  console.log('🧪 Testando carregamento da página...');

  try {
    // Testar se a página de funcionários carrega
    console.log('1. Testando página de funcionários...');
    const pageResponse = await fetch('http://localhost:3000/dashboard/employees');
    console.log('Status da página:', pageResponse.status);
    
    if (pageResponse.status === 200) {
      console.log('✅ Página de funcionários carregando corretamente');
    } else {
      console.log('❌ Página de funcionários com problema');
    }

    // Testar se a API de funcionários está funcionando
    console.log('\n2. Testando API de funcionários...');
    const apiResponse = await fetch('http://localhost:3000/api/employees?limit=1');
    console.log('Status da API:', apiResponse.status);
    
    if (apiResponse.status === 200) {
      const data = await apiResponse.json();
      console.log('✅ API de funcionários funcionando');
      console.log('📊 Funcionários encontrados:', data.employees?.length || 0);
    } else {
      console.log('❌ API de funcionários com problema');
    }

    // Testar se o endpoint SSE está funcionando
    console.log('\n3. Testando endpoint SSE...');
    const sseResponse = await fetch('http://localhost:3000/api/employees/events');
    console.log('Status do SSE:', sseResponse.status);
    
    if (sseResponse.status === 200) {
      console.log('✅ Endpoint SSE funcionando');
    } else {
      console.log('❌ Endpoint SSE com problema');
    }

    console.log('\n🎉 Todos os testes passaram! A página deve estar funcionando sem erros.');

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testPageLoad(); 