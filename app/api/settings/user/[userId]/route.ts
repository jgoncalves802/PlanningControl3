import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
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
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { personal, interface: interfaceSettings, notifications } = body;

    // Validar dados obrigatórios
    if (!personal && !interfaceSettings && !notifications) {
      return NextResponse.json(
        { error: 'Pelo menos uma seção de configurações deve ser fornecida' },
        { status: 400 }
      );
    }

    // Criar ou atualizar configurações do usuário
    let userSettings = await prisma.userSettings.findUnique({
      where: { userId },
      include: {
        personalSettings: true,
        interfaceSettings: true,
        notificationSettings: true,
      },
    });

    if (!userSettings) {
      // Criar novo registro de configurações
      userSettings = await prisma.userSettings.create({
        data: {
          userId,
          personalSettings: personal ? {
            create: {
              name: personal.name || '',
              email: personal.email || '',
              phone: personal.phone || '',
              language: personal.language || 'pt-BR',
              timezone: personal.timezone || 'America/Sao_Paulo',
              theme: personal.theme || 'system',
              avatar: personal.avatar || null,
            },
          } : undefined,
          interfaceSettings: interfaceSettings ? {
            create: {
              dashboardLayout: interfaceSettings.dashboardLayout || 'grid',
              sidebarCollapsed: interfaceSettings.sidebarCollapsed || false,
              showNotifications: interfaceSettings.showNotifications ?? true,
              showQuickActions: interfaceSettings.showQuickActions ?? true,
              autoRefresh: interfaceSettings.autoRefresh ?? true,
              refreshInterval: interfaceSettings.refreshInterval || 30,
              compactMode: interfaceSettings.compactMode || false,
              showAnimations: interfaceSettings.showAnimations ?? true,
              colorScheme: interfaceSettings.colorScheme || 'blue',
            },
          } : undefined,
          notificationSettings: notifications ? {
            create: {
              pushEnabled: notifications.pushEnabled ?? true,
              pushWorkHours: notifications.pushWorkHours ?? true,
              pushAfterHours: notifications.pushAfterHours || false,
              emailEnabled: notifications.emailEnabled ?? true,
              emailDaily: notifications.emailDaily || false,
              emailWeekly: notifications.emailWeekly ?? true,
              emailUrgent: notifications.emailUrgent ?? true,
              newAssignments: notifications.newAssignments ?? true,
              scheduleChanges: notifications.scheduleChanges ?? true,
              systemUpdates: notifications.systemUpdates || false,
              reminders: notifications.reminders ?? true,
              alerts: notifications.alerts ?? true,
              quietHours: notifications.quietHours ?? true,
              quietStart: notifications.quietStart || '22:00',
              quietEnd: notifications.quietEnd || '07:00',
            },
          } : undefined,
        },
        include: {
          personalSettings: true,
          interfaceSettings: true,
          notificationSettings: true,
        },
      });
    } else {
      // Atualizar configurações existentes
      if (personal) {
        await prisma.personalSettings.upsert({
          where: { userId: userSettings.id },
          create: {
            userId: userSettings.id,
            name: personal.name || '',
            email: personal.email || '',
            phone: personal.phone || '',
            language: personal.language || 'pt-BR',
            timezone: personal.timezone || 'America/Sao_Paulo',
            theme: personal.theme || 'system',
            avatar: personal.avatar || null,
          },
          update: {
            name: personal.name,
            email: personal.email,
            phone: personal.phone,
            language: personal.language,
            timezone: personal.timezone,
            theme: personal.theme,
            avatar: personal.avatar,
          },
        });
      }

      if (interfaceSettings) {
        await prisma.interfaceSettings.upsert({
          where: { userId: userSettings.id },
          create: {
            userId: userSettings.id,
            dashboardLayout: interfaceSettings.dashboardLayout || 'grid',
            sidebarCollapsed: interfaceSettings.sidebarCollapsed || false,
            showNotifications: interfaceSettings.showNotifications ?? true,
            showQuickActions: interfaceSettings.showQuickActions ?? true,
            autoRefresh: interfaceSettings.autoRefresh ?? true,
            refreshInterval: interfaceSettings.refreshInterval || 30,
            compactMode: interfaceSettings.compactMode || false,
            showAnimations: interfaceSettings.showAnimations ?? true,
            colorScheme: interfaceSettings.colorScheme || 'blue',
          },
          update: {
            dashboardLayout: interfaceSettings.dashboardLayout,
            sidebarCollapsed: interfaceSettings.sidebarCollapsed,
            showNotifications: interfaceSettings.showNotifications,
            showQuickActions: interfaceSettings.showQuickActions,
            autoRefresh: interfaceSettings.autoRefresh,
            refreshInterval: interfaceSettings.refreshInterval,
            compactMode: interfaceSettings.compactMode,
            showAnimations: interfaceSettings.showAnimations,
            colorScheme: interfaceSettings.colorScheme,
          },
        });
      }

      if (notifications) {
        await prisma.notificationSettings.upsert({
          where: { userId: userSettings.id },
          create: {
            userId: userSettings.id,
            pushEnabled: notifications.pushEnabled ?? true,
            pushWorkHours: notifications.pushWorkHours ?? true,
            pushAfterHours: notifications.pushAfterHours || false,
            emailEnabled: notifications.emailEnabled ?? true,
            emailDaily: notifications.emailDaily || false,
            emailWeekly: notifications.emailWeekly ?? true,
            emailUrgent: notifications.emailUrgent ?? true,
            newAssignments: notifications.newAssignments ?? true,
            scheduleChanges: notifications.scheduleChanges ?? true,
            systemUpdates: notifications.systemUpdates || false,
            reminders: notifications.reminders ?? true,
            alerts: notifications.alerts ?? true,
            quietHours: notifications.quietHours ?? true,
            quietStart: notifications.quietStart || '22:00',
            quietEnd: notifications.quietEnd || '07:00',
          },
          update: {
            pushEnabled: notifications.pushEnabled,
            pushWorkHours: notifications.pushWorkHours,
            pushAfterHours: notifications.pushAfterHours,
            emailEnabled: notifications.emailEnabled,
            emailDaily: notifications.emailDaily,
            emailWeekly: notifications.emailWeekly,
            emailUrgent: notifications.emailUrgent,
            newAssignments: notifications.newAssignments,
            scheduleChanges: notifications.scheduleChanges,
            systemUpdates: notifications.systemUpdates,
            reminders: notifications.reminders,
            alerts: notifications.alerts,
            quietHours: notifications.quietHours,
            quietStart: notifications.quietStart,
            quietEnd: notifications.quietEnd,
          },
        });
      }

      // Buscar configurações atualizadas
      userSettings = await prisma.userSettings.findUnique({
        where: { userId },
        include: {
          personalSettings: true,
          interfaceSettings: true,
          notificationSettings: true,
        },
      });
    }

    return NextResponse.json({
      message: 'Configurações atualizadas com sucesso',
      settings: {
        personal: userSettings?.personalSettings || {
          name: '',
          email: '',
          phone: '',
          language: 'pt-BR',
          timezone: 'America/Sao_Paulo',
          theme: 'system',
          avatar: null,
        },
        interface: userSettings?.interfaceSettings || {
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
        notifications: userSettings?.notificationSettings || {
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