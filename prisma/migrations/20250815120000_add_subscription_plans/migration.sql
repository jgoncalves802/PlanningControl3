-- Migration: Adicionar sistema de planos e licenças
-- Data: 2025-08-15
-- Descrição: Implementa controle de planos de assinatura e limites de usuários por empresa

-- Adicionar campos ao modelo Tenant para controle de licenças
ALTER TABLE "Tenant" ADD COLUMN "maxUsers" INTEGER DEFAULT 5;
ALTER TABLE "Tenant" ADD COLUMN "currentUserCount" INTEGER DEFAULT 0;
ALTER TABLE "Tenant" ADD COLUMN "planFeatures" JSONB;
ALTER TABLE "Tenant" ADD COLUMN "planExpiryDate" TIMESTAMP(3);
ALTER TABLE "Tenant" ADD COLUMN "isTrial" BOOLEAN DEFAULT true;
ALTER TABLE "Tenant" ADD COLUMN "trialExpiryDate" TIMESTAMP(3);
ALTER TABLE "Tenant" ADD COLUMN "subscriptionPlanId" TEXT;

-- Criar tabela de planos de assinatura
CREATE TABLE "SubscriptionPlan" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "maxUsers" INTEGER NOT NULL,
  "price" DECIMAL(10,2) NOT NULL,
  "billingCycle" TEXT NOT NULL DEFAULT 'monthly',
  "features" JSONB NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- Criar índices para performance
CREATE UNIQUE INDEX "SubscriptionPlan_name_key" ON "SubscriptionPlan"("name");
CREATE INDEX "SubscriptionPlan_isActive_idx" ON "SubscriptionPlan"("isActive");
CREATE INDEX "Tenant_subscriptionPlanId_idx" ON "Tenant"("subscriptionPlanId");

-- Inserir planos padrão
INSERT INTO "SubscriptionPlan" (
  "id", 
  "name", 
  "description", 
  "maxUsers", 
  "price", 
  "billingCycle", 
  "features", 
  "isActive", 
  "isDefault"
) VALUES 
(
  'plan_basic',
  'Básico',
  'Plano ideal para pequenas empresas',
  5,
  99.00,
  'monthly',
  '{"dashboard": true, "employees": true, "contracts": true, "basic_reports": true, "email_support": true}',
  true,
  true
),
(
  'plan_professional',
  'Profissional',
  'Plano completo para empresas em crescimento',
  20,
  299.00,
  'monthly',
  '{"dashboard": true, "employees": true, "contracts": true, "budgets": true, "planning": true, "transfers": true, "workforce": true, "nfc": true, "advanced_reports": true, "priority_support": true, "api_access": true}',
  true,
  false
),
(
  'plan_enterprise',
  'Enterprise',
  'Solução completa para grandes empresas',
  100,
  999.00,
  'monthly',
  '{"dashboard": true, "employees": true, "contracts": true, "budgets": true, "planning": true, "transfers": true, "workforce": true, "nfc": true, "analytics": true, "backup": true, "custom_integrations": true, "dedicated_support": true, "api_access": true, "white_label": true}',
  true,
  false
);

-- Criar tabela de histórico de mudanças de plano
CREATE TABLE "PlanChangeHistory" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "oldPlanId" TEXT,
  "newPlanId" TEXT NOT NULL,
  "changedBy" TEXT NOT NULL,
  "reason" TEXT,
  "effectiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PlanChangeHistory_pkey" PRIMARY KEY ("id")
);

-- Criar índices para histórico
CREATE INDEX "PlanChangeHistory_tenantId_idx" ON "PlanChangeHistory"("tenantId");
CREATE INDEX "PlanChangeHistory_effectiveDate_idx" ON "PlanChangeHistory"("effectiveDate");

-- Criar tabela de uso de licenças
CREATE TABLE "LicenseUsage" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "activeUsers" INTEGER NOT NULL DEFAULT 0,
  "maxUsers" INTEGER NOT NULL,
  "usagePercentage" DECIMAL(5,2) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LicenseUsage_pkey" PRIMARY KEY ("id")
);

-- Criar índices para uso de licenças
CREATE UNIQUE INDEX "LicenseUsage_tenantId_date_key" ON "LicenseUsage"("tenantId", "date");
CREATE INDEX "LicenseUsage_date_idx" ON "LicenseUsage"("date");

-- Adicionar foreign key constraints
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_subscriptionPlanId_fkey" 
  FOREIGN KEY ("subscriptionPlanId") REFERENCES "SubscriptionPlan"("id") ON DELETE SET NULL;

ALTER TABLE "PlanChangeHistory" ADD CONSTRAINT "PlanChangeHistory_tenantId_fkey" 
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE;

ALTER TABLE "PlanChangeHistory" ADD CONSTRAINT "PlanChangeHistory_oldPlanId_fkey" 
  FOREIGN KEY ("oldPlanId") REFERENCES "SubscriptionPlan"("id") ON DELETE SET NULL;

ALTER TABLE "PlanChangeHistory" ADD CONSTRAINT "PlanChangeHistory_newPlanId_fkey" 
  FOREIGN KEY ("newPlanId") REFERENCES "SubscriptionPlan"("id") ON DELETE RESTRICT;

ALTER TABLE "LicenseUsage" ADD CONSTRAINT "LicenseUsage_tenantId_fkey" 
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE;

-- Função para atualizar contador de usuários
CREATE OR REPLACE FUNCTION update_tenant_user_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE "Tenant" 
    SET "currentUserCount" = "currentUserCount" + 1
    WHERE "id" = NEW."companyId";
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE "Tenant" 
    SET "currentUserCount" = GREATEST("currentUserCount" - 1, 0)
    WHERE "id" = OLD."companyId";
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar contador de usuários automaticamente
CREATE TRIGGER update_tenant_user_count_trigger
  AFTER INSERT OR DELETE ON "UserRoleAssignment"
  FOR EACH ROW
  EXECUTE FUNCTION update_tenant_user_count();

-- Função para calcular uso de licenças
CREATE OR REPLACE FUNCTION calculate_license_usage()
RETURNS void AS $$
BEGIN
  INSERT INTO "LicenseUsage" ("id", "tenantId", "date", "activeUsers", "maxUsers", "usagePercentage")
  SELECT 
    gen_random_uuid()::text,
    t."id",
    CURRENT_DATE,
    t."currentUserCount",
    t."maxUsers",
    CASE 
      WHEN t."maxUsers" > 0 THEN (t."currentUserCount"::decimal / t."maxUsers"::decimal) * 100
      ELSE 0
    END
  FROM "Tenant" t
  WHERE t."isActive" = true
  ON CONFLICT ("tenantId", "date") DO UPDATE SET
    "activeUsers" = EXCLUDED."activeUsers",
    "maxUsers" = EXCLUDED."maxUsers",
    "usagePercentage" = EXCLUDED."usagePercentage";
END;
$$ LANGUAGE plpgsql;

-- Comentários para documentação
COMMENT ON TABLE "SubscriptionPlan" IS 'Planos de assinatura disponíveis para empresas';
COMMENT ON TABLE "PlanChangeHistory" IS 'Histórico de mudanças de plano por empresa';
COMMENT ON TABLE "LicenseUsage" IS 'Uso diário de licenças por empresa';
COMMENT ON COLUMN "Tenant"."maxUsers" IS 'Limite máximo de usuários para o plano atual';
COMMENT ON COLUMN "Tenant"."currentUserCount" IS 'Número atual de usuários ativos';
COMMENT ON COLUMN "Tenant"."planFeatures" IS 'Recursos disponíveis no plano atual (JSON)';
COMMENT ON COLUMN "Tenant"."planExpiryDate" IS 'Data de expiração do plano atual';
COMMENT ON COLUMN "Tenant"."isTrial" IS 'Indica se a empresa está em período de teste';
COMMENT ON COLUMN "Tenant"."trialExpiryDate" IS 'Data de expiração do período de teste';
