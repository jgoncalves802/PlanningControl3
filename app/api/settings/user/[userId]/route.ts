import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    if (!userId || userId === 'current') {
      // Retornar configurações padrão para usuário atual
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
      personal: userSettings.personalSettings || {
        name: '',
        email: '',
        phone: '',
        language: 'pt-BR',
        timezone: 'America/Sao_Paulo',
        theme: 'system',
        avatar: null,
      },
      interface: userSettings.interfaceSettings || {
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
      notifications: userSettings.notificationSettings || {
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
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
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

    if (!userId || userId === 'current') {
      // Para usuário atual, apenas retornar sucesso sem salvar no banco
      return NextResponse.json({
        message: 'Configurações aplicadas com sucesso',
        personal: body.personal || {},
        interface: body.interface || {},
        notifications: body.notifications || {},
      });
    }

    // Validar dados recebidos
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      );
    }

    // Usar upsert para criar ou atualizar configurações
    const result = await prisma.userSettings.upsert({
      where: { userId },
      update: {
        updatedAt: new Date(),
        personalSettings: body.personal ? {
          upsert: {
            create: {
              ...body.personal,
              userId: userId,
            },
            update: {
              ...body.personal,
            },
          },
        } : undefined,
        interfaceSettings: body.interface ? {
          upsert: {
            create: {
              ...body.interface,
              userId: userId,
            },
            update: {
              ...body.interface,
            },
          },
        } : undefined,
        notificationSettings: body.notifications ? {
          upsert: {
            create: {
              ...body.notifications,
              userId: userId,
            },
            update: {
              ...body.notifications,
            },
          },
        } : undefined,
      },
      create: {
        userId,
        personalSettings: body.personal ? {
          create: {
            ...body.personal,
            userId: userId,
          },
        } : undefined,
        interfaceSettings: body.interface ? {
          create: {
            ...body.interface,
            userId: userId,
          },
        } : undefined,
        notificationSettings: body.notifications ? {
          create: {
            ...body.notifications,
            userId: userId,
          },
        } : undefined,
      },
      include: {
        personalSettings: true,
        interfaceSettings: true,
        notificationSettings: true,
      },
    });

    return NextResponse.json({
      message: 'Configurações salvas com sucesso',
      personal: result.personalSettings || body.personal || {},
      interface: result.interfaceSettings || body.interface || {},
      notifications: result.notificationSettings || body.notifications || {},
    });
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 