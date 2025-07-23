/*
  Warnings:

  - The values [TRANSFERRED,SUSPENDED,DISMISSED,RETIRED] on the enum `EmployeeStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EmployeeStatus_new" AS ENUM ('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED');
ALTER TABLE "Employee" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Employee" ALTER COLUMN "status" TYPE "EmployeeStatus_new" USING ("status"::text::"EmployeeStatus_new");
ALTER TYPE "EmployeeStatus" RENAME TO "EmployeeStatus_old";
ALTER TYPE "EmployeeStatus_new" RENAME TO "EmployeeStatus";
DROP TYPE "EmployeeStatus_old";
ALTER TABLE "Employee" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- CreateTable
CREATE TABLE "user_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personal_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "language" TEXT NOT NULL DEFAULT 'pt-BR',
    "timezone" TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    "theme" TEXT NOT NULL DEFAULT 'system',
    "avatar" TEXT,

    CONSTRAINT "personal_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interface_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dashboardLayout" TEXT NOT NULL DEFAULT 'grid',
    "sidebarCollapsed" BOOLEAN NOT NULL DEFAULT false,
    "showNotifications" BOOLEAN NOT NULL DEFAULT true,
    "showQuickActions" BOOLEAN NOT NULL DEFAULT true,
    "autoRefresh" BOOLEAN NOT NULL DEFAULT true,
    "refreshInterval" INTEGER NOT NULL DEFAULT 30,
    "compactMode" BOOLEAN NOT NULL DEFAULT false,
    "showAnimations" BOOLEAN NOT NULL DEFAULT true,
    "colorScheme" TEXT NOT NULL DEFAULT 'blue',

    CONSTRAINT "interface_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "pushWorkHours" BOOLEAN NOT NULL DEFAULT true,
    "pushAfterHours" BOOLEAN NOT NULL DEFAULT false,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emailDaily" BOOLEAN NOT NULL DEFAULT false,
    "emailWeekly" BOOLEAN NOT NULL DEFAULT true,
    "emailUrgent" BOOLEAN NOT NULL DEFAULT true,
    "newAssignments" BOOLEAN NOT NULL DEFAULT true,
    "scheduleChanges" BOOLEAN NOT NULL DEFAULT true,
    "systemUpdates" BOOLEAN NOT NULL DEFAULT false,
    "reminders" BOOLEAN NOT NULL DEFAULT true,
    "alerts" BOOLEAN NOT NULL DEFAULT true,
    "quietHours" BOOLEAN NOT NULL DEFAULT true,
    "quietStart" TEXT NOT NULL DEFAULT '22:00',
    "quietEnd" TEXT NOT NULL DEFAULT '07:00',

    CONSTRAINT "notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_userId_key" ON "user_settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "personal_settings_userId_key" ON "personal_settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "interface_settings_userId_key" ON "interface_settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "notification_settings_userId_key" ON "notification_settings"("userId");

-- AddForeignKey
ALTER TABLE "personal_settings" ADD CONSTRAINT "personal_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interface_settings" ADD CONSTRAINT "interface_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
