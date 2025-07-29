import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase';

// Função para validar UUID
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// GET /api/settings/super-admin/users/[id] - Buscar usuário específico
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        clerkId: true,
        createdAt: true,
        updatedAt: true,
        auditLogs: {
          select: {
            id: true,
            action: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Formatar resposta
    const formattedUser = {
      id: user.id,
      name: user.name || 'Nome não informado',
      email: user.email,
      role: 'USER' as const,
      companyId: null,
      companyName: null,
      isActive: true,
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.auditLogs[0]?.createdAt.toISOString() || null,
      auditLogs: user.auditLogs.map(log => ({
        id: log.id,
        action: log.action,
        createdAt: log.createdAt.toISOString()
      }))
    };

    return NextResponse.json(formattedUser);
  } catch (error: any) {
    console.error('Erro ao buscar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/settings/super-admin/users/[id] - Atualizar usuário
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json();
    const userId = params.id;

    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Validações
    const errors: Record<string, string> = {};

    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.email = 'Email inválido';
      }

      // Verificar se o email já está em uso por outro usuário
      const emailExists = await prisma.user.findFirst({
        where: {
          email: data.email,
          id: { not: userId }
        }
      });

      if (emailExists) {
        errors.email = 'Email já está em uso por outro usuário';
      }
    }

    if (data.name && data.name.trim().length < 2) {
      errors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Preparar dados para atualização
    const updateData: any = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;

    // 1. Atualizar usuário no banco de dados
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        clerkId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // 2. Atualizar usuário no Supabase Auth se necessário
    if ((data.email || data.name) && existingUser.clerkId && isValidUUID(existingUser.clerkId)) {
      const authUpdateData: any = {};
      
      if (data.email) {
        authUpdateData.email = data.email;
      }
      
      if (data.name) {
        authUpdateData.user_metadata = {
          name: data.name,
          role: data.role || 'USER',
          companyId: data.companyId || null
        };
      }

      const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
        existingUser.clerkId,
        authUpdateData
      );

      if (authUpdateError) {
        console.error('Erro ao atualizar usuário no Supabase Auth:', authUpdateError);
        // Não falhar a operação, apenas logar o erro
      }
    }

    // 3. Criar log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: updatedUser.id,
        action: 'USER_UPDATED',
        entityId: updatedUser.id,
        details: {
          updatedBy: 'super_admin',
          updatedFields: Object.keys(updateData),
          previousData: {
            name: existingUser.name,
            email: existingUser.email
          },
          newData: {
            name: updatedUser.name,
            email: updatedUser.email
          }
        }
      }
    });

    // Formatar resposta
    const formattedUser = {
      id: updatedUser.id,
      name: updatedUser.name || 'Nome não informado',
      email: updatedUser.email,
      role: 'USER' as const,
      companyId: null,
      companyName: null,
      isActive: true,
      createdAt: updatedUser.createdAt.toISOString(),
      lastLogin: null
    };

    return NextResponse.json(formattedUser);
  } catch (error: any) {
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/settings/super-admin/users/[id] - Excluir usuário
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id;

    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se é o último usuário admin (proteção)
    if (existingUser.email === 'admin@demo-company.com') {
      const adminCount = await prisma.user.count({
        where: {
          email: 'admin@demo-company.com'
        }
      });

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Não é possível excluir o último administrador do sistema' },
          { status: 400 }
        );
      }
    }

    // 1. Excluir usuário do Supabase Auth (apenas se clerkId for um UUID válido)
    if (existingUser.clerkId && isValidUUID(existingUser.clerkId)) {
      try {
        const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(
          existingUser.clerkId
        );

        if (authDeleteError) {
          console.error('Erro ao excluir usuário do Supabase Auth:', authDeleteError);
          // Não falhar a operação, apenas logar o erro
        } else {
          console.log('Usuário excluído do Supabase Auth com sucesso');
        }
      } catch (authError) {
        console.error('Erro ao tentar excluir do Supabase Auth:', authError);
        // Continuar com a exclusão do banco mesmo se falhar no Auth
      }
    } else {
      console.log('clerkId não é um UUID válido, pulando exclusão do Supabase Auth');
    }

    // 2. Excluir usuário do banco de dados
    await prisma.user.delete({
      where: { id: userId }
    });

    // 3. Criar log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: null, // Usuário já foi excluído
        action: 'USER_DELETED',
        entityId: userId,
        details: {
          deletedBy: 'super_admin',
          deletedUserEmail: existingUser.email,
          deletedUserName: existingUser.name,
          clerkId: existingUser.clerkId,
          authDeleted: existingUser.clerkId && isValidUUID(existingUser.clerkId)
        }
      }
    });

    return NextResponse.json({ 
      message: 'Usuário excluído com sucesso',
      userId: userId,
      authDeleted: existingUser.clerkId && isValidUUID(existingUser.clerkId)
    });
  } catch (error: any) {
    console.error('Erro ao excluir usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
} 