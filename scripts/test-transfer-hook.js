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

async function testTransferHook() {
  try {
    console.log('🧪 Testando Hook useTransferRequests')
    console.log('====================================')
    console.log('')

    const baseUrl = 'http://localhost:3001'

    // Simular exatamente o que o hook faz
    console.log('📡 Simulando chamada do hook useTransferRequests')
    console.log('')

    // Parâmetros que o hook está enviando
    const params = {
      page: 1,
      limit: 10,
      status: '',
      search: ''
    }

    console.log('Parâmetros do hook:')
    console.log(`   page: ${params.page}`)
    console.log(`   limit: ${params.limit}`)
    console.log(`   status: "${params.status}"`)
    console.log(`   search: "${params.search}"`)
    console.log('')

    // Construir URL como o hook faz
    const urlParams = new URLSearchParams()
    urlParams.set('page', String(params.page))
    urlParams.set('limit', String(params.limit))
    if (params.status) urlParams.set('status', params.status)
    if (params.search) urlParams.set('search', params.search)

    const url = `${baseUrl}/api/transfer-requests?${urlParams.toString()}`
    console.log(`URL construída: ${url}`)
    console.log('')

    // Fazer a chamada
    const response = await fetch(url)
    
    if (!response.ok) {
      console.error(`❌ Erro HTTP: ${response.status} ${response.statusText}`)
      return
    }

    const data = await response.json()
    
    console.log('✅ Resposta da API:')
    console.log(`   Status: ${response.status}`)
    console.log(`   Total de transferências: ${data.transferRequests?.length || 0}`)
    console.log(`   Paginação: ${JSON.stringify(data.pagination)}`)
    console.log('')

    if (data.transferRequests && data.transferRequests.length > 0) {
      console.log('📋 Transferências retornadas:')
      data.transferRequests.forEach((transfer, index) => {
        console.log(`   ${index + 1}. ID: ${transfer.id}`)
        console.log(`      Funcionário: ${transfer.employee?.name || 'N/A'}`)
        console.log(`      Status: ${transfer.status}`)
        console.log(`      Solicitado por: ${transfer.requestedBy?.name || 'N/A'}`)
        console.log('')
      })
    } else {
      console.log('❌ Nenhuma transferência retornada')
    }

    // Verificar se há problemas com a estrutura dos dados
    console.log('🔍 Verificando estrutura dos dados:')
    console.log(`   data existe: ${!!data}`)
    console.log(`   data.transferRequests existe: ${!!data.transferRequests}`)
    console.log(`   Array.isArray(data.transferRequests): ${Array.isArray(data.transferRequests)}`)
    console.log(`   data.transferRequests.length: ${data.transferRequests?.length}`)
    console.log('')

    // Verificar se há problemas com filtros vazios
    console.log('🔍 Testando com filtros vazios:')
    
    const emptyStatusUrl = `${baseUrl}/api/transfer-requests?page=1&limit=10&status=&search=`
    const emptyStatusResponse = await fetch(emptyStatusUrl)
    const emptyStatusData = await emptyStatusResponse.json()
    
    console.log(`   Com status vazio: ${emptyStatusData.transferRequests?.length || 0} transferências`)
    
    const noFiltersUrl = `${baseUrl}/api/transfer-requests?page=1&limit=10`
    const noFiltersResponse = await fetch(noFiltersUrl)
    const noFiltersData = await noFiltersResponse.json()
    
    console.log(`   Sem filtros: ${noFiltersData.transferRequests?.length || 0} transferências`)
    console.log('')

    console.log('🎉 Teste do hook concluído!')
    console.log('')
    console.log('💡 Se os dados estão chegando aqui mas não no frontend:')
    console.log('   1. Problema com React Query cache')
    console.log('   2. Problema com re-renderização do componente')
    console.log('   3. Problema com condição de renderização')
    console.log('   4. Problema com estado do componente')

  } catch (error) {
    console.error('❌ Erro durante o teste:', error)
  }
}

// Executar teste
testTransferHook() 