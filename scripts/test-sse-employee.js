

async function testEmployeeSSE() {
  console.log('🧪 Testando SSE de funcionários...');

  try {
    // 1. Testar se o endpoint de eventos está funcionando
    console.log('1. Testando endpoint de eventos...');
    const eventsResponse = await fetch('http://localhost:3000/api/employees/events');
    console.log('Status:', eventsResponse.status);
    console.log('Headers:', eventsResponse.headers.get('content-type'));

    // 2. Testar atualização de um funcionário
    console.log('\n2. Testando atualização de funcionário...');
    
    // Primeiro, buscar um funcionário existente
    const employeesResponse = await fetch('http://localhost:3000/api/employees?limit=1');
    const employeesData = await employeesResponse.json();
    
    if (employeesData.employees && employeesData.employees.length > 0) {
      const employee = employeesData.employees[0];
      console.log('Funcionário encontrado:', employee.name);
      
      // Atualizar o funcionário
      const updateResponse = await fetch(`http://localhost:3000/api/employees/${employee.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: `Teste SSE - ${new Date().toISOString()}`
        })
      });
      
      console.log('Status da atualização:', updateResponse.status);
      
      if (updateResponse.ok) {
        console.log('✅ Funcionário atualizado com sucesso');
        console.log('📡 Evento SSE deve ter sido emitido');
      } else {
        const error = await updateResponse.json();
        console.log('❌ Erro na atualização:', error);
      }
    } else {
      console.log('❌ Nenhum funcionário encontrado para teste');
    }

    // 3. Testar criação de um funcionário
    console.log('\n3. Testando criação de funcionário...');
    const createResponse = await fetch('http://localhost:3000/api/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `Teste SSE ${Date.now()}`,
        cpf: `123456789${Date.now()}`,
        phone: '11999999999',
        notes: 'Funcionário criado para teste SSE'
      })
    });
    
    console.log('Status da criação:', createResponse.status);
    
    if (createResponse.ok) {
      const newEmployee = await createResponse.json();
      console.log('✅ Funcionário criado com sucesso:', newEmployee.name);
      console.log('📡 Evento SSE deve ter sido emitido');
      
      // Deletar o funcionário de teste
      console.log('\n4. Limpando funcionário de teste...');
      const deleteResponse = await fetch(`http://localhost:3000/api/employees/${newEmployee.id}`, {
        method: 'DELETE'
      });
      
      if (deleteResponse.ok) {
        console.log('✅ Funcionário de teste removido');
      }
    } else {
      const error = await createResponse.json();
      console.log('❌ Erro na criação:', error);
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testEmployeeSSE(); 