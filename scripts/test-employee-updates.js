const fetch = require('node-fetch');

async function testEmployeeUpdates() {
  console.log('🧪 Testando atualizações em tempo real de funcionários...');
  
  try {
    // Testar criação de funcionário
    console.log('\n1. Testando criação de funcionário...');
    const createResponse = await fetch('http://localhost:3000/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'TESTE TEMPO REAL',
        cpf: '12345678901',
        phone: '11999999999',
        role: 'Teste',
        category: 'Teste',
        company: 'Teste',
        rg: '123456789',
        status: 'Ativo',
        workplace: 'Teste',
        shift: 'Teste',
        address: { cep: '12345-678' },
        nationality: 'Brasileira',
        naturalness: 'São Paulo',
        gender: 'M',
        maritalStatus: 'Solteiro',
        educationLevel: 'Ensino Médio',
        pis: '12345678901',
        ctps: '12345678901',
        ctpsSeries: '123',
        ctpsUf: 'SP',
        voterTitle: '123456789012',
        voterZone: '123',
        voterSection: '123',
        reservist: '123456789',
        reservistCategory: 'Teste',
        cnh: '12345678901',
        cnhCategory: 'B',
        motherName: 'Mãe Teste',
        fatherName: 'Pai Teste',
        dependents: [],
        isActive: true
      })
    });
    
    if (createResponse.ok) {
      const createdEmployee = await createResponse.json();
      console.log('✅ Funcionário criado:', createdEmployee.id);
      
      // Aguardar um pouco
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Testar atualização de funcionário
      console.log('\n2. Testando atualização de funcionário...');
      const updateResponse = await fetch(`http://localhost:3000/api/employees/${createdEmployee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'TESTE TEMPO REAL ATUALIZADO',
          role: 'Teste Atualizado'
        })
      });
      
      if (updateResponse.ok) {
        console.log('✅ Funcionário atualizado');
        
        // Aguardar um pouco
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Testar exclusão de funcionário
        console.log('\n3. Testando exclusão de funcionário...');
        const deleteResponse = await fetch(`http://localhost:3000/api/employees/${createdEmployee.id}`, {
          method: 'DELETE'
        });
        
        if (deleteResponse.ok) {
          console.log('✅ Funcionário excluído');
        } else {
          console.log('❌ Erro ao excluir funcionário:', await deleteResponse.text());
        }
      } else {
        console.log('❌ Erro ao atualizar funcionário:', await updateResponse.text());
      }
    } else {
      console.log('❌ Erro ao criar funcionário:', await createResponse.text());
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testEmployeeUpdates(); 