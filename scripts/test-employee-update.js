async function testEmployeeUpdate() {
  console.log('🧪 Testando atualização de funcionário...');

  try {
    // Buscar um funcionário existente
    const response = await fetch('http://localhost:3000/api/employees?limit=1');
    const data = await response.json();
    
    if (data.employees && data.employees.length > 0) {
      const employee = data.employees[0];
      console.log('Funcionário encontrado:', employee.name);
      
      // Atualizar o funcionário
      const updateResponse = await fetch(`http://localhost:3000/api/employees/${employee.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: `Teste SSE - ${new Date().toLocaleTimeString()}`
        })
      });
      
      if (updateResponse.ok) {
        console.log('✅ Funcionário atualizado com sucesso');
        console.log('📡 Verifique se a tabela foi atualizada automaticamente');
      } else {
        const error = await updateResponse.json();
        console.log('❌ Erro na atualização:', error);
      }
    } else {
      console.log('❌ Nenhum funcionário encontrado');
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testEmployeeUpdate(); 