async function testBrunoUpdateWithLogs() {
  console.log('🧪 Testando atualização do BRUNO com logs...');

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
            notes: 'Teste com logs - ' + new Date().toLocaleTimeString()
          })
        });
        
        if (updateResponse.ok) {
          console.log('✅ BRUNO atualizado com sucesso');
          
          // 3. Aguardar um pouco para o SSE processar
          console.log('\n3. Aguardando processamento SSE...');
          console.log('📝 Verifique os logs no console do navegador para ver se a query foi invalidada');
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
              
              console.log('\n🔍 INSTRUÇÕES:');
              console.log('1. Abra o console do navegador (F12)');
              console.log('2. Vá para a página de funcionários');
              console.log('3. Atualize um funcionário');
              console.log('4. Verifique se aparecem os logs:');
              console.log('   - [Employees SSE] Received event');
              console.log('   - [Employees SSE] Processing event');
              console.log('   - [Employees Page] Data updated');
              console.log('5. Se não aparecerem, o problema está na invalidação da query');
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

testBrunoUpdateWithLogs(); 