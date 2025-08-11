const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUsers() {
  console.log('🔍 Verificando usuários no banco de dados...')
  
  try {
    // Buscar todos os usuários
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`\n✅ Encontrados ${users.length} usuários:`)
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`)
      console.log(`   Nome: ${user.name}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Ativo: ${user.isActive}`)
      console.log(`   Criado: ${user.createdAt}`)
      console.log('')
    })
    
    // Verificar role assignments
    console.log('🔍 Verificando role assignments...')
    const roleAssignments = await prisma.userRoleAssignment.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
    
    console.log(`\n✅ Encontrados ${roleAssignments.length} role assignments:`)
    roleAssignments.forEach((assignment, index) => {
      console.log(`${index + 1}. ID: ${assignment.id}`)
      console.log(`   Usuário: ${assignment.user.name} (${assignment.user.email})`)
      console.log(`   Role: ${assignment.role}`)
      console.log(`   Ativo: ${assignment.isActive}`)
      console.log(`   Empresa: ${assignment.company?.name || 'N/A'}`)
      console.log('')
    })
    
  } catch (error) {
    console.error('❌ Erro durante a verificação:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers() 