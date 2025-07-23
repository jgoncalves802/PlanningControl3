import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    // Em produção, validar se o usuário tem permissão para acessar estas configurações
    // const user = await getCurrentUser();
    // if (user.id !== userId && !user.isAdmin) {
    //   return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    // }

    // Buscar configurações do usuário
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId },
      include: {
        personalSettings: true,
        interfaceSettings: true,
        notificationSettings: true,
      },
    });

    if (!userSettings) {
      // Retornar configurações padrão se não existirem
      return NextResponse.json({
        personal: {
          name: '',
          email: '',
          phone: '',
          language: 'pt-BR',
          timezone: 'America/Sao_Paulo',
          theme: 'system',
          avatar: null,
        },
        interface: {
          dashboardLayout: 'grid',
          sidebarCollapsed: false,
          showNotifications: true,
          showQuickActions: true,
          autoRefresh: true,
          refreshInterval: 30,
          compactMode: false,
          showAnimations: true,
          colorScheme: 'blue',
        },
        notifications: {
          pushEnabled: true,
          pushWorkHours: true,
          pushAfterHours: false,
          emailEnabled: true,
          emailDaily: false,
          emailWeekly: true,
          emailUrgent: true,
          newAssignments: true,
          scheduleChanges: true,
          systemUpdates: false,
          reminders: true,
          alerts: true,
          quietHours: true,
          quietStart: '22:00',
          quietEnd: '07:00',
        },
      });
    }

    return NextResponse.json({
      personal: userSettings.personalSettings,
      interface: userSettings.interfaceSettings,
      notifications: userSettings.notificationSettings,
    });

  } catch (error: any) {
    console.error('Erro ao buscar configurações do usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const body = await req.json();

    // Em produção, validar se o usuário tem permissão para modificar estas configurações
    // const user = await getCurrentUser();
    // if (user.id !== userId && !user.isAdmin) {
    //   return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    // }

    const { personal, interface: interfaceSettings, notifications } = body;

    // Atualizar ou criar configurações do usuário
    const userSettings = await prisma.userSettings.upsert({
      where: { userId },
      update: {
        personalSettings: {
          upsert: {
            create: personal,
            update: personal,
          },
        },
        interfaceSettings: {
          upsert: {
            create: interfaceSettings,
            update: interfaceSettings,
          },
        },
        notificationSettings: {
          upsert: {
            create: notifications,
            update: notifications,
          },
        },
      },
      create: {
        userId,
        personalSettings: {
          create: personal,
        },
        interfaceSettings: {
          create: interfaceSettings,
        },
        notificationSettings: {
          create: notifications,
        },
      },
      include: {
        personalSettings: true,
        interfaceSettings: true,
        notificationSettings: true,
      },
    });

    return NextResponse.json({
      message: 'Configurações atualizadas com sucesso',
      settings: {
        personal: userSettings.personalSettings,
        interface: userSettings.interfaceSettings,
        notifications: userSettings.notificationSettings,
      },
    });

  } catch (error: any) {
    console.error('Erro ao atualizar configurações do usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
} 