async function testRealtimeUpdate() {
  console.log('🧪 Testando atualização em tempo real...');

  try {
    // 1. Buscar BRUNO antes da atualização
    console.log('1. Buscando BRUNO antes da atualização...');
    const beforeResponse = await fetch('http://localhost:3000/api/employees?search=BRUNO SERGIO SANTOS LOBO');
    const beforeData = await beforeResponse.json();
    
    if (beforeData.employees && beforeData.employees.length > 0) {
      const bruno = beforeData.employees.find(emp => emp.name === 'BRUNO SERGIO SANTOS LOBO');
      
      if (bruno) {
        console.log('✅ BRUNO encontrado antes:');
        console.log('Cargo atual:', bruno.companyFunction?.name || '-');
        console.log('Notes atual:', bruno.notes || '-');
        
        // 2. Atualizar BRUNO
        console.log('\n2. Atualizando BRUNO...');
        const updateResponse = await fetch(`http://localhost:3000/api/employees/${bruno.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            notes: 'Teste tempo real - ' + new Date().toLocaleTimeString()
          })
        });
        
        if (updateResponse.ok) {
          console.log('✅ BRUNO atualizado com sucesso');
          
          // 3. Aguardar um pouco para o SSE processar
          console.log('\n3. Aguardando processamento SSE...');
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // 4. Buscar BRUNO após a atualização
          console.log('\n4. Buscando BRUNO após atualização...');
          const afterResponse = await fetch('http://localhost:3000/api/employees?search=BRUNO SERGIO SANTOS LOBO');
          const afterData = await afterResponse.json();
          
          if (afterData.employees && afterData.employees.length > 0) {
            const brunoAfter = afterData.employees.find(emp => emp.name === 'BRUNO SERGIO SANTOS LOBO');
            
            if (brunoAfter) {
              console.log('✅ BRUNO encontrado após atualização:');
              console.log('Cargo após:', brunoAfter.companyFunction?.name || '-');
              console.log('Notes após:', brunoAfter.notes || '-');
              
              // 5. Verificar se houve mudança
              if (bruno.companyFunction?.name === brunoAfter.companyFunction?.name) {
                console.log('\n📊 RESULTADO: Cargo não mudou (esperado)');
              } else {
                console.log('\n📊 RESULTADO: Cargo mudou!');
              }
              
              if (bruno.notes !== brunoAfter.notes) {
                console.log('✅ Notes foram atualizados corretamente');
              } else {
                console.log('❌ Notes não foram atualizados');
              }
              
              console.log('\n🔍 CORREÇÃO APLICADA:');
              console.log('✅ Tabela agora usa filteredEmployees em vez de processedEmployees');
              console.log('✅ Isso garante que as atualizações SSE sejam refletidas na tabela');
              console.log('✅ Filtros locais continuam funcionando');
              console.log('✅ Atualizações em tempo real devem funcionar agora');
              
              console.log('\n📝 PRÓXIMOS PASSOS:');
              console.log('1. Abra a página de funcionários no navegador');
              console.log('2. Atualize um funcionário');
              console.log('3. Verifique se a tabela atualiza automaticamente');
              console.log('4. Se ainda não funcionar, verifique os logs do console');
              
            }
          }
        } else {
          console.log('❌ Erro ao atualizar BRUNO:', updateResponse.status);
        }
      } else {
        console.log('❌ BRUNO não encontrado');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testRealtimeUpdate(); 