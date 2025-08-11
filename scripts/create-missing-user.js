const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createMissingUser() {
  const missingUserId = '7b31ab25-aa54-46b9-85ed-323d3757002c'
  
  console.log('🔧 Criando usuário faltante:', missingUserId)
  
  try {
    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { id: missingUserId }
    })
    
    if (existingUser) {
      console.log('✅ Usuário já existe:', existingUser.name)
      return
    }
    
    // Criar o usuário
    const newUser = await prisma.user.create({
      data: {
        id: missingUserId,
        email: 'user@example.com',
        name: 'Usuário do Sistema',
        isActive: true
      }
    })
    
    console.log('✅ Usuário criado:', newUser.name)
    
    // Criar role assignment
    const roleAssignment = await prisma.userRoleAssignment.create({
      data: {
        userId: missingUserId,
        role: 'SUPER_ADMIN',
        permissions: null,
        isActive: true
      }
    })
    
    console.log('✅ Role assignment criado:', roleAssignment.id, 'Role:', roleAssignment.role)
    
    console.log('\n🎉 Usuário e role assignment criados com sucesso!')
    console.log('Agora as APIs devem funcionar corretamente.')
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error)
    
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

createMissingUser() 