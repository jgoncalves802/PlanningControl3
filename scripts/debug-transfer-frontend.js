const fs = require('fs')
const path = require('path')

// Carregar variáveis de ambiente do .env.local
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  const envLines = envContent.split('\n')
  
  envLines.forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim()
      if (value && !key.startsWith('#')) {
        process.env[key.trim()] = value.replace(/^["']|["']$/g, '')
      }
    }
  })
}

async function debugTransferFrontend() {
  try {
    console.log('🔍 Debugando Frontend das Transferências')
    console.log('========================================')
    console.log('')

    const baseUrl = 'http://localhost:3001'

    // Teste 1: Verificar se a página está acessível
    console.log('📡 Teste 1: Verificar se a página está acessível')
    console.log(`URL: ${baseUrl}/dashboard/transfers`)
    console.log('')

    try {
      const pageResponse = await fetch(`${baseUrl}/dashboard/transfers`)
      console.log(`✅ Página acessível: ${pageResponse.status}`)
    } catch (error) {
      console.log(`❌ Página não acessível: ${error.message}`)
    }
    console.log('')

    // Teste 2: Verificar se a API está retornando dados corretos
    console.log('📡 Teste 2: Verificar dados da API')
    console.log(`URL: ${baseUrl}/api/transfer-requests`)
    console.log('')

    const apiResponse = await fetch(`${baseUrl}/api/transfer-requests`)
    const apiData = await apiResponse.json()

    console.log('✅ Dados da API:')
    console.log(`   Status: ${apiResponse.status}`)
    console.log(`   Total: ${apiData.transferRequests?.length || 0}`)
    console.log(`   Paginação: ${JSON.stringify(apiData.pagination)}`)
    console.log('')

    if (apiData.transferRequests && apiData.transferRequests.length > 0) {
      console.log('📋 Primeira transferência:')
      const firstTransfer = apiData.transferRequests[0]
      console.log(`   ID: ${firstTransfer.id}`)
      console.log(`   Employee: ${JSON.stringify(firstTransfer.employee)}`)
      console.log(`   RequestedBy: ${JSON.stringify(firstTransfer.requestedBy)}`)
      console.log(`   Status: ${firstTransfer.status}`)
      console.log(`   ScheduledDate: ${firstTransfer.scheduledDate}`)
      console.log('')

      // Verificar se os dados estão completos
      console.log('🔍 Verificando integridade dos dados:')
      console.log(`   Employee existe: ${!!firstTransfer.employee}`)
      console.log(`   Employee.name existe: ${!!firstTransfer.employee?.name}`)
      console.log(`   RequestedBy existe: ${!!firstTransfer.requestedBy}`)
      console.log(`   RequestedBy.name existe: ${!!firstTransfer.requestedBy?.name}`)
      console.log(`   Status existe: ${!!firstTransfer.status}`)
      console.log(`   ScheduledDate existe: ${!!firstTransfer.scheduledDate}`)
      console.log('')
    }

    // Teste 3: Verificar se há problemas de CORS
    console.log('📡 Teste 3: Verificar CORS')
    console.log('')

    const corsResponse = await fetch(`${baseUrl}/api/transfer-requests`, {
      method: 'OPTIONS'
    })

    console.log('Headers CORS:')
    corsResponse.headers.forEach((value, key) => {
      if (key.toLowerCase().includes('access-control') || key.toLowerCase().includes('cors')) {
        console.log(`   ${key}: ${value}`)
      }
    })
    console.log('')

    // Teste 4: Verificar se há problemas com React Query
    console.log('📡 Teste 4: Simular chamada do React Query')
    console.log('')

    // Simular os parâmetros que o React Query está enviando
    const params = new URLSearchParams()
    params.set('page', '1')
    params.set('limit', '10')
    // params.set('status', '') // status vazio
    // params.set('search', '') // search vazio

    const reactQueryResponse = await fetch(`${baseUrl}/api/transfer-requests?${params.toString()}`)
    const reactQueryData = await reactQueryResponse.json()

    console.log('✅ Dados do React Query:')
    console.log(`   Status: ${reactQueryResponse.status}`)
    console.log(`   Total: ${reactQueryData.transferRequests?.length || 0}`)
    console.log(`   URL: ${reactQueryResponse.url}`)
    console.log('')

    // Teste 5: Verificar se há problemas com filtros
    console.log('📡 Teste 5: Testar diferentes filtros')
    console.log('')

    const filterTests = [
      { name: 'Sem filtros', params: '' },
      { name: 'Status PENDING', params: 'status=PENDING' },
      { name: 'Status vazio', params: 'status=' },
      { name: 'Search vazio', params: 'search=' },
      { name: 'Page 1', params: 'page=1' },
      { name: 'Limit 10', params: 'limit=10' }
    ]

    for (const test of filterTests) {
      const filterResponse = await fetch(`${baseUrl}/api/transfer-requests?${test.params}`)
      const filterData = await filterResponse.json()
      
      console.log(`   ${test.name}: ${filterData.transferRequests?.length || 0} transferências`)
    }
    console.log('')

    // Teste 6: Verificar se há problemas com o hook useTransferRequests
    console.log('📡 Teste 6: Verificar parâmetros do hook')
    console.log('')

    console.log('Parâmetros que o hook está enviando:')
    console.log('   page: 1')
    console.log('   limit: 10')
    console.log('   status: "" (string vazia)')
    console.log('   search: "" (string vazia)')
    console.log('')

    // Simular exatamente os parâmetros do hook
    const hookParams = new URLSearchParams()
    hookParams.set('page', '1')
    hookParams.set('limit', '10')
    hookParams.set('status', '') // string vazia
    hookParams.set('search', '') // string vazia

    const hookResponse = await fetch(`${baseUrl}/api/transfer-requests?${hookParams.toString()}`)
    const hookData = await hookResponse.json()

    console.log('✅ Dados com parâmetros do hook:')
    console.log(`   Status: ${hookResponse.status}`)
    console.log(`   Total: ${hookData.transferRequests?.length || 0}`)
    console.log(`   URL: ${hookResponse.url}`)
    console.log('')

    console.log('🎉 Debug concluído!')
    console.log('')
    console.log('💡 Possíveis problemas:')
    console.log('   1. React Query não está fazendo a chamada corretamente')
    console.log('   2. Dados não estão chegando ao componente')
    console.log('   3. Condição de renderização está incorreta')
    console.log('   4. Problema de cache do React Query')

  } catch (error) {
    console.error('❌ Erro durante o debug:', error)
  }
}

// Executar debug
debugTransferFrontend() 