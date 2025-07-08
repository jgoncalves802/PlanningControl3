// Script para testar a API de contratos
const baseUrl = 'http://localhost:3000'

async function testContractsAPI() {
  console.log('🧪 Testando API de Contratos...\n')

  try {
    // Teste 1: Listar contratos
    console.log('1. Testando GET /api/contracts')
    const listResponse = await fetch(`${baseUrl}/api/contracts?limit=5`)
    
    if (listResponse.ok) {
      const listData = await listResponse.json()
      console.log('✅ GET /api/contracts funcionando')
      console.log(`   - Total de contratos: ${listData.pagination?.total || 0}`)
      console.log(`   - Contratos retornados: ${listData.contracts?.length || 0}`)
    } else {
      console.log('❌ GET /api/contracts falhou')
      console.log('   - Status:', listResponse.status)
      const error = await listResponse.text()
      console.log('   - Erro:', error)
    }

    // Teste 2: Criar contrato
    console.log('\n2. Testando POST /api/contracts')
    const newContract = {
      name: 'Contrato Teste API',
      code: 'TEST-API-' + Date.now(),
      workdayHours: 8,
      includesWeekends: false,
      includesHolidays: false
    }

    const createResponse = await fetch(`${baseUrl}/api/contracts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newContract)
    })

    if (createResponse.ok) {
      const createdContract = await createResponse.json()
      console.log('✅ POST /api/contracts funcionando')
      console.log(`   - Contrato criado: ${createdContract.name}`)
      console.log(`   - ID: ${createdContract.id}`)
      
      // Teste 3: Buscar contrato específico
      console.log('\n3. Testando GET /api/contracts/[id]')
      const getResponse = await fetch(`${baseUrl}/api/contracts/${createdContract.id}`)
      
      if (getResponse.ok) {
        const contract = await getResponse.json()
        console.log('✅ GET /api/contracts/[id] funcionando')
        console.log(`   - Contrato encontrado: ${contract.name}`)
      } else {
        console.log('❌ GET /api/contracts/[id] falhou')
        console.log('   - Status:', getResponse.status)
      }

      // Teste 4: Atualizar contrato
      console.log('\n4. Testando PUT /api/contracts/[id]')
      const updateData = {
        name: createdContract.name + ' (Atualizado)',
        workdayHours: 10
      }

      const updateResponse = await fetch(`${baseUrl}/api/contracts/${createdContract.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      if (updateResponse.ok) {
        const updatedContract = await updateResponse.json()
        console.log('✅ PUT /api/contracts/[id] funcionando')
        console.log(`   - Nome atualizado: ${updatedContract.name}`)
        console.log(`   - Horas atualizadas: ${updatedContract.workdayHours}`)
      } else {
        console.log('❌ PUT /api/contracts/[id] falhou')
        console.log('   - Status:', updateResponse.status)
      }

      // Teste 5: Excluir contrato (soft delete)
      console.log('\n5. Testando DELETE /api/contracts/[id]')
      const deleteResponse = await fetch(`${baseUrl}/api/contracts/${createdContract.id}`, {
        method: 'DELETE'
      })

      if (deleteResponse.ok) {
        const deleteResult = await deleteResponse.json()
        console.log('✅ DELETE /api/contracts/[id] funcionando')
        console.log(`   - Mensagem: ${deleteResult.message}`)
      } else {
        console.log('❌ DELETE /api/contracts/[id] falhou')
        console.log('   - Status:', deleteResponse.status)
      }

    } else {
      console.log('❌ POST /api/contracts falhou')
      console.log('   - Status:', createResponse.status)
      const error = await createResponse.text()
      console.log('   - Erro:', error)
    }

    // Teste 6: Estatísticas
    console.log('\n6. Testando GET /api/contracts/stats')
    const statsResponse = await fetch(`${baseUrl}/api/contracts/stats`)
    
    if (statsResponse.ok) {
      const stats = await statsResponse.json()
      console.log('✅ GET /api/contracts/stats funcionando')
      console.log(`   - Total de contratos: ${stats.totalContracts}`)
      console.log(`   - Contratos ativos: ${stats.activeContracts}`)
      console.log(`   - Total de funcionários: ${stats.totalEmployees}`)
    } else {
      console.log('❌ GET /api/contracts/stats falhou')
      console.log('   - Status:', statsResponse.status)
    }

    console.log('\n🎉 Teste da API de Contratos concluído!')

  } catch (error) {
    console.error('💥 Erro durante os testes:', error.message)
  }
}

// Executar testes
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch')
  testContractsAPI()
} else {
  // Browser environment
  testContractsAPI()
} 