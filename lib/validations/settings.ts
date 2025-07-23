import { z } from 'zod';

// Validação para configurações pessoais
export const personalSettingsSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone deve estar no formato (11) 99999-9999'),
  language: z.enum(['pt-BR', 'en-US', 'es-ES']),
  timezone: z.string(),
  theme: z.enum(['light', 'dark', 'system']),
  avatar: z.string().url().optional().or(z.null()),
});

// Validação para configurações de interface
export const interfaceSettingsSchema = z.object({
  dashboardLayout: z.enum(['grid', 'list', 'compact']),
  sidebarCollapsed: z.boolean(),
  showNotifications: z.boolean(),
  showQuickActions: z.boolean(),
  autoRefresh: z.boolean(),
  refreshInterval: z.number().min(15).max(3600),
  compactMode: z.boolean(),
  showAnimations: z.boolean(),
  colorScheme: z.enum(['blue', 'green', 'purple', 'orange']),
});

// Validação para configurações de notificações
export const notificationSettingsSchema = z.object({
  pushEnabled: z.boolean(),
  pushWorkHours: z.boolean(),
  pushAfterHours: z.boolean(),
  emailEnabled: z.boolean(),
  emailDaily: z.boolean(),
  emailWeekly: z.boolean(),
  emailUrgent: z.boolean(),
  newAssignments: z.boolean(),
  scheduleChanges: z.boolean(),
  systemUpdates: z.boolean(),
  reminders: z.boolean(),
  alerts: z.boolean(),
  quietHours: z.boolean(),
  quietStart: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário deve estar no formato HH:MM'),
  quietEnd: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário deve estar no formato HH:MM'),
});

// Validação completa das configurações do usuário
export const userSettingsSchema = z.object({
  personal: personalSettingsSchema,
  interface: interfaceSettingsSchema,
  notifications: notificationSettingsSchema,
});

// Tipos TypeScript derivados das validações
export type PersonalSettings = z.infer<typeof personalSettingsSchema>;
export type InterfaceSettings = z.infer<typeof interfaceSettingsSchema>;
export type NotificationSettings = z.infer<typeof notificationSettingsSchema>;
export type UserSettings = z.infer<typeof userSettingsSchema>;

// Função para validar configurações pessoais
export const validatePersonalSettings = (data: unknown): PersonalSettings => {
  return personalSettingsSchema.parse(data);
};

// Função para validar configurações de interface
export const validateInterfaceSettings = (data: unknown): InterfaceSettings => {
  return interfaceSettingsSchema.parse(data);
};

// Função para validar configurações de notificações
export const validateNotificationSettings = (data: unknown): NotificationSettings => {
  return notificationSettingsSchema.parse(data);
};

// Função para validar configurações completas
export const validateUserSettings = (data: unknown): UserSettings => {
  return userSettingsSchema.parse(data);
};

// Configurações padrão
export const defaultPersonalSettings: PersonalSettings = {
  name: '',
  email: '',
  phone: '',
  language: 'pt-BR',
  timezone: 'America/Sao_Paulo',
  theme: 'system',
  avatar: undefined,
};

export const defaultInterfaceSettings: InterfaceSettings = {
  dashboardLayout: 'grid',
  sidebarCollapsed: false,
  showNotifications: true,
  showQuickActions: true,
  autoRefresh: true,
  refreshInterval: 30,
  compactMode: false,
  showAnimations: true,
  colorScheme: 'blue',
};

export const defaultNotificationSettings: NotificationSettings = {
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
};

export const defaultUserSettings: UserSettings = {
  personal: defaultPersonalSettings,
  interface: defaultInterfaceSettings,
  notifications: defaultNotificationSettings,
}; 