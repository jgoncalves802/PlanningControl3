// Script de teste para verificar a API de atualização de funcionários
async function testUpdateEmployee() {
  try {
    // Primeiro, buscar um funcionário existente
    const getResponse = await fetch('http://localhost:3000/api/employees');
    const employees = await getResponse.json();
    
    if (employees.length === 0) {
      console.log('Nenhum funcionário encontrado');
      return;
    }
    
    const employee = employees[0];
    console.log('Funcionário original:', employee);
    
    // Fazer uma atualização simples
    const updateData = {
      name: employee.name + ' (Atualizado)',
      notes: 'Teste de atualização - ' + new Date().toISOString()
    };
    
    console.log('Dados para atualização:', updateData);
    
    const updateResponse = await fetch(`http://localhost:3000/api/employees/${employee.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('Erro na atualização:', errorText);
      return;
    }
    
    const updatedEmployee = await updateResponse.json();
    console.log('Funcionário atualizado:', updatedEmployee);
    
    // Verificar se a atualização foi salva
    const verifyResponse = await fetch(`http://localhost:3000/api/employees/${employee.id}`);
    const verifiedEmployee = await verifyResponse.json();
    console.log('Funcionário verificado:', verifiedEmployee);
    
    if (verifiedEmployee.name === updateData.name) {
      console.log('✅ Atualização funcionou corretamente!');
    } else {
      console.log('❌ Atualização não foi salva');
    }
    
  } catch (error) {
    console.error('Erro no teste:', error);
  }
}

// Executar o teste se estiver sendo chamado diretamente
if (typeof window === 'undefined') {
  testUpdateEmployee();
}

module.exports = { testUpdateEmployee }; 