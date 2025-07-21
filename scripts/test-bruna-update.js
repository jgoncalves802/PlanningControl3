async function testBrunaUpdate() {
  console.log('🧪 Testando atualização da Bruna da Cruz...');

  try {
    // Buscar a Bruna
    const response = await fetch('http://localhost:3000/api/employees?search=BRUNA');
    const data = await response.json();
    
    if (data.employees && data.employees.length > 0) {
      const bruna = data.employees.find(emp => emp.name.includes('BRUNA'));
      
      if (bruna) {
        console.log('✅ Bruna encontrada:', bruna.name);
        console.log('📋 Cargo atual:', bruna.companyFunction?.name || 'N/A');
        
        // Atualizar a Bruna com uma nota de teste
        const updateResponse = await fetch(`http://localhost:3000/api/employees/${bruna.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            notes: `Teste SSE Bruna - ${new Date().toLocaleTimeString()}`
          })
        });
        
        if (updateResponse.ok) {
          console.log('✅ Bruna atualizada com sucesso');
          console.log('📡 Evento SSE deve ter sido emitido');
          console.log('🔄 Verifique se a tabela foi atualizada automaticamente');
        } else {
          const error = await updateResponse.json();
          console.log('❌ Erro na atualização:', error);
        }
      } else {
        console.log('❌ Bruna não encontrada');
      }
    } else {
      console.log('❌ Nenhum funcionário encontrado');
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testBrunaUpdate(); 