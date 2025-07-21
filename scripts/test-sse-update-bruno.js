async function testSSEUpdateBruno() {
  console.log('🧪 Testando atualização do BRUNO via SSE...');

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
        
        // 2. Conectar ao SSE para monitorar eventos
        console.log('\n2. Conectando ao SSE...');
        const eventSource = new EventSource('http://localhost:3000/api/employees/events');
        
        let eventReceived = false;
        
        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log('📡 SSE Event received:', data);
          
          if (data.type === 'updated' && data.employee && data.employee.name === 'BRUNO SERGIO SANTOS LOBO') {
            console.log('🎯 Evento do BRUNO recebido!');
            eventReceived = true;
            eventSource.close();
          }
        };
        
        eventSource.onerror = (error) => {
          console.log('❌ SSE Error:', error);
          eventSource.close();
        };
        
        // 3. Aguardar um pouco para garantir conexão SSE
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 4. Atualizar BRUNO
        console.log('\n3. Atualizando BRUNO...');
        const updateResponse = await fetch(`http://localhost:3000/api/employees/${bruno.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            notes: 'Teste SSE - ' + new Date().toLocaleTimeString()
          })
        });
        
        if (updateResponse.ok) {
          console.log('✅ BRUNO atualizado com sucesso');
          
          // 5. Aguardar evento SSE
          console.log('\n4. Aguardando evento SSE...');
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          if (eventReceived) {
            console.log('✅ Evento SSE recebido corretamente');
          } else {
            console.log('❌ Evento SSE não recebido');
          }
          
          // 6. Buscar BRUNO após a atualização
          console.log('\n5. Buscando BRUNO após atualização...');
          const afterResponse = await fetch('http://localhost:3000/api/employees?search=BRUNO SERGIO SANTOS LOBO');
          const afterData = await afterResponse.json();
          
          if (afterData.employees && afterData.employees.length > 0) {
            const brunoAfter = afterData.employees.find(emp => emp.name === 'BRUNO SERGIO SANTOS LOBO');
            
            if (brunoAfter) {
              console.log('✅ BRUNO encontrado após atualização:');
              console.log('Cargo após:', brunoAfter.companyFunction?.name || '-');
              console.log('Notes após:', brunoAfter.notes || '-');
              
              // 7. Verificar se houve mudança
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
    console.error('❌ Erro no teste SSE:', error.message);
  }
}

testSSEUpdateBruno(); 