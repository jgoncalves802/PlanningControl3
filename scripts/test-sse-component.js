async function testSSEComponent() {
  console.log('🧪 Testando componente SSE...');

  try {
    // Testar se o endpoint de eventos está funcionando
    console.log('1. Testando endpoint de eventos...');
    const eventsResponse = await fetch('http://localhost:3000/api/employees/events');
    console.log('Status do endpoint SSE:', eventsResponse.status);
    
    if (eventsResponse.status === 200) {
      console.log('✅ Endpoint SSE funcionando');
    } else {
      console.log('❌ Endpoint SSE com problema');
    }

    // Testar se a página de funcionários está carregando
    console.log('\n2. Testando página de funcionários...');
    const pageResponse = await fetch('http://localhost:3000/dashboard/employees');
    console.log('Status da página:', pageResponse.status);
    
    if (pageResponse.status === 200) {
      console.log('✅ Página de funcionários carregando');
    } else {
      console.log('❌ Página de funcionários com problema');
    }

    // Testar atualização de funcionário para verificar SSE
    console.log('\n3. Testando atualização com SSE...');
    const employeesResponse = await fetch('http://localhost:3000/api/employees?limit=1');
    const employeesData = await employeesResponse.json();
    
    if (employeesData.employees && employeesData.employees.length > 0) {
      const employee = employeesData.employees[0];
      console.log('Funcionário para teste:', employee.name);
      
      const updateResponse = await fetch(`http://localhost:3000/api/employees/${employee.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: `Teste componente SSE - ${new Date().toLocaleTimeString()}`
        })
      });
      
      if (updateResponse.ok) {
        console.log('✅ Atualização realizada com sucesso');
        console.log('📡 Evento SSE deve ter sido emitido');
        console.log('🔄 Verifique se o componente SSE mostrou a atualização');
      } else {
        console.log('❌ Erro na atualização');
      }
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testSSEComponent(); 