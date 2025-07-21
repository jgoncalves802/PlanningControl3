async function debugBruna() {
  console.log('🔍 Debugando dados da Bruna da Cruz...');

  try {
    // Buscar funcionários com busca por nome
    const response = await fetch('http://localhost:3000/api/employees?search=BRUNA');
    const data = await response.json();
    
    if (data.employees && data.employees.length > 0) {
      const bruna = data.employees.find(emp => emp.name.includes('BRUNA'));
      
      if (bruna) {
        console.log('✅ Bruna encontrada:', {
          id: bruna.id,
          name: bruna.name,
          currentFunction: bruna.currentFunction,
          companyFunction: bruna.companyFunction,
          currentFunctionId: bruna.currentFunctionId,
          companyFunctionId: bruna.companyFunctionId
        });
        
        // Buscar dados completos da Bruna
        const detailResponse = await fetch(`http://localhost:3000/api/employees/${bruna.id}`);
        const detailData = await detailResponse.json();
        
        console.log('📋 Dados completos da Bruna:', detailData);
      } else {
        console.log('❌ Bruna não encontrada na busca');
      }
    } else {
      console.log('❌ Nenhum funcionário encontrado');
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

debugBruna(); 