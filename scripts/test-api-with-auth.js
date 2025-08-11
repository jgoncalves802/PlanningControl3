const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testAPIWithAuth() {
  const userId = 'cmdt1nl930001i8bc2qwokeuu'
  
  console.log('🧪 Testando API com autenticação para userId:', userId)
  
  try {
    // 1. Verificar se o usuário existe
    console.log('\n1. Verificando usuário...')
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    if (!user) {
      console.log('❌ Usuário não encontrado')
      return
    }
    
    console.log('✅ Usuário encontrado:', {
      id: user.id,
      name: user.name,
      email: user.email,
      isActive: user.isActive
    })
    
    // 2. Verificar se há role assignments
    console.log('\n2. Verificando role assignments...')
    const userRoles = await prisma.userRoleAssignment.findMany({
      where: { userId: userId }
    })
    
    console.log('Role assignments encontrados:', userRoles.length)
    userRoles.forEach(role => {
      console.log('  - ID:', role.id, 'Role:', role.role, 'Ativo:', role.isActive)
    })
    
    // 3. Criar um role assignment se não existir (para teste)
    if (userRoles.length === 0) {
      console.log('\n🔄 Criando role assignment para teste...')
      const newRole = await prisma.userRoleAssignment.create({
        data: {
          userId: userId,
          role: 'COMPANY_ADMIN',
          permissions: null,
          isActive: true
        }
      })
      console.log('✅ Role assignment criado:', newRole.id, 'Role:', newRole.role)
    }
    
    // 4. Testar a API via fetch (simulando o frontend)
    console.log('\n3. Testando API via fetch...')
    
    // Nota: Este teste requer que o usuário esteja logado no frontend
    // O erro 401 é esperado se não houver sessão ativa
    try {
      const response = await fetch(`http://localhost:3000/api/settings/user-permissions/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      console.log('Status da resposta:', response.status)
      console.log('Headers:', Object.fromEntries(response.headers.entries()))
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Resposta da API:', JSON.stringify(data, null, 2))
      } else {
        const errorText = await response.text()
        console.log('❌ Erro da API:', errorText)
        
        if (response.status === 401) {
          console.log('ℹ️ Erro 401 é esperado - usuário não está autenticado')
          console.log('Para testar completamente, faça login no frontend primeiro')
        }
      }
    } catch (fetchError) {
      console.error('❌ Erro ao fazer requisição:', fetchError.message)
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error)
    
    if (error instanceof Error) {
      console.error('Erro detalhado:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
    }
  } finally {
    await prisma.$disconnect()
  }
}

testAPIWithAuth() 