-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('BASIC', 'PROFESSIONAL', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('TENANT_ADMIN', 'HR', 'PLANNING', 'SAFETY', 'CONTRACT_MANAGER', 'SUPERVISOR', 'OPERATOR');

-- CreateEnum
CREATE TYPE "LaborType" AS ENUM ('DIRETO', 'INDIRETO');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ASOType" AS ENUM ('ADMISSIONAL', 'PERIODIC', 'FUNCTION_CHANGE', 'RETURN_TO_WORK', 'DISMISSAL');

-- CreateEnum
CREATE TYPE "ASOResult" AS ENUM ('FIT', 'UNFIT', 'FIT_WITH_RESTRICTIONS');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RecordSource" AS ENUM ('NFC_PROCESSED', 'PAYROLL_IMPORTED');

-- CreateEnum
CREATE TYPE "WorkforceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'LEFT');

-- CreateEnum
CREATE TYPE "NFCBadgeStatus" AS ENUM ('AVAILABLE', 'ASSIGNED', 'REVOKED', 'LOST', 'DAMAGED', 'EXPIRED');

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "subdomain" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "subscriptionPlan" "PlanType" NOT NULL DEFAULT 'BASIC',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "databaseUrl" TEXT NOT NULL,
    "customDomain" TEXT,
    "logoUrl" TEXT,
    "primaryColor" TEXT DEFAULT '#007bff',
    "secondaryColor" TEXT DEFAULT '#6c757d',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "workdayHours" DOUBLE PRECISION NOT NULL,
    "includesWeekends" BOOLEAN NOT NULL DEFAULT false,
    "includesHolidays" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractResponsible" (
    "contractId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ContractResponsible_pkey" PRIMARY KEY ("contractId","userId")
);

-- CreateTable
CREATE TABLE "ContractFunction" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ContractFunction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyFunction" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "laborType" "LaborType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyFunction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "registration" TEXT,
    "role" TEXT,
    "category" TEXT,
    "company" TEXT,
    "cpf" TEXT NOT NULL,
    "rg" TEXT,
    "birthDate" TIMESTAMP(3),
    "admissionDate" TIMESTAMP(3),
    "dismissalDate" TIMESTAMP(3),
    "status" TEXT,
    "workplace" TEXT,
    "shift" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" JSONB,
    "nationality" TEXT,
    "naturalness" TEXT,
    "gender" TEXT,
    "maritalStatus" TEXT,
    "sexo" TEXT,
    "estadoCivil" TEXT,
    "educationLevel" TEXT,
    "pis" TEXT,
    "ctps" TEXT,
    "ctpsSeries" TEXT,
    "ctpsUf" TEXT,
    "voterTitle" TEXT,
    "voterZone" TEXT,
    "voterSection" TEXT,
    "reservist" TEXT,
    "reservistCategory" TEXT,
    "cnh" TEXT,
    "cnhCategory" TEXT,
    "cnhValidity" TIMESTAMP(3),
    "motherName" TEXT,
    "fatherName" TEXT,
    "dependents" JSONB,
    "notes" TEXT,
    "employmentHistory" JSONB,
    "avatar" TEXT,
    "centroCusto" TEXT,
    "obra" TEXT,
    "primeiraExperiencia" TIMESTAMP(3),
    "segundaExperiencia" TIMESTAMP(3),
    "previsaoObra" TIMESTAMP(3),
    "mo" TEXT,
    "horasNormaisTrabalhadas" DOUBLE PRECISION,
    "horasExtrasTrabalhadas" DOUBLE PRECISION,
    "horasNoturnasTrabalhadas" DOUBLE PRECISION,
    "localAlojado" TEXT,
    "pontoReferencia" TEXT,
    "statusBancodoc" TEXT,
    "efetivoRDO" BOOLEAN,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nfcCardId" TEXT,
    "currentContractId" TEXT,
    "currentFunctionId" TEXT,
    "companyFunctionId" TEXT,
    "contractId" TEXT,
    "contractAssignmentDate" TIMESTAMP(3),

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferRequest" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "toContractId" TEXT NOT NULL,
    "toFunctionId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "approvedById" TEXT,
    "status" "TransferStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "TransferRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferHistory" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "functionId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),

    CONSTRAINT "TransferHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ASO" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "examType" "ASOType" NOT NULL,
    "examDate" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "result" "ASOResult" NOT NULL,

    CONSTRAINT "ASO_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Training" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "validityMonths" INTEGER NOT NULL,

    CONSTRAINT "Training_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequiredTraining" (
    "functionId" TEXT NOT NULL,
    "trainingId" TEXT NOT NULL,

    CONSTRAINT "RequiredTraining_pkey" PRIMARY KEY ("functionId","trainingId")
);

-- CreateTable
CREATE TABLE "EmployeeTraining" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "trainingId" TEXT NOT NULL,
    "completedDate" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeTraining_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HourPlanning" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "regularHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overtimeHours" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "HourPlanning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OvertimeApproval" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approvedById" TEXT,

    CONSTRAINT "OvertimeApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NFCCollection" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "collectorId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NFCCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NFCRecord" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "nfcCardId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "cpfFallback" TEXT,

    CONSTRAINT "NFCRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeRecord" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "clockIn" TIMESTAMP(3),
    "clockOut" TIMESTAMP(3),
    "source" "RecordSource" NOT NULL,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TimeRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkforceEntry" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "checkInTime" TIMESTAMP(3),
    "checkOutTime" TIMESTAMP(3),
    "status" "WorkforceStatus" NOT NULL DEFAULT 'PRESENT',
    "location" TEXT,
    "isLate" BOOLEAN NOT NULL DEFAULT false,
    "hoursWorked" DOUBLE PRECISION DEFAULT 0,
    "contractName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkforceEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NFCBadge" (
    "id" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "employeeId" TEXT,
    "status" "NFCBadgeStatus" NOT NULL DEFAULT 'AVAILABLE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "assignedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "assignedBy" TEXT,
    "revokedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NFCBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_subdomain_key" ON "Tenant"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_customDomain_key" ON "Tenant"("customDomain");

-- CreateIndex
CREATE UNIQUE INDEX "users_clerkId_key" ON "users"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_code_key" ON "Contract"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ContractFunction_contractId_name_key" ON "ContractFunction"("contractId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyFunction_name_key" ON "CompanyFunction"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_cpf_key" ON "Employee"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_nfcCardId_key" ON "Employee"("nfcCardId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_registration_company_key" ON "Employee"("registration", "company");

-- CreateIndex
CREATE UNIQUE INDEX "Training_name_key" ON "Training"("name");

-- CreateIndex
CREATE UNIQUE INDEX "HourPlanning_contractId_date_key" ON "HourPlanning"("contractId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "TimeRecord_employeeId_date_source_key" ON "TimeRecord"("employeeId", "date", "source");

-- CreateIndex
CREATE UNIQUE INDEX "WorkforceEntry_employeeId_createdAt_key" ON "WorkforceEntry"("employeeId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "NFCBadge_badgeId_key" ON "NFCBadge"("badgeId");

-- CreateIndex
CREATE UNIQUE INDEX "NFCBadge_employeeId_key" ON "NFCBadge"("employeeId");

-- CreateIndex
CREATE INDEX "NFCBadge_badgeId_idx" ON "NFCBadge"("badgeId");

-- CreateIndex
CREATE INDEX "NFCBadge_employeeId_idx" ON "NFCBadge"("employeeId");

-- CreateIndex
CREATE INDEX "NFCBadge_status_idx" ON "NFCBadge"("status");

-- AddForeignKey
ALTER TABLE "ContractResponsible" ADD CONSTRAINT "ContractResponsible_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractResponsible" ADD CONSTRAINT "ContractResponsible_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractFunction" ADD CONSTRAINT "ContractFunction_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_currentContractId_fkey" FOREIGN KEY ("currentContractId") REFERENCES "Contract"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_currentFunctionId_fkey" FOREIGN KEY ("currentFunctionId") REFERENCES "ContractFunction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_companyFunctionId_fkey" FOREIGN KEY ("companyFunctionId") REFERENCES "CompanyFunction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "TransferRequest" ADD CONSTRAINT "TransferRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferRequest" ADD CONSTRAINT "TransferRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferRequest" ADD CONSTRAINT "TransferRequest_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferHistory" ADD CONSTRAINT "TransferHistory_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ASO" ADD CONSTRAINT "ASO_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequiredTraining" ADD CONSTRAINT "RequiredTraining_functionId_fkey" FOREIGN KEY ("functionId") REFERENCES "ContractFunction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequiredTraining" ADD CONSTRAINT "RequiredTraining_trainingId_fkey" FOREIGN KEY ("trainingId") REFERENCES "Training"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeTraining" ADD CONSTRAINT "EmployeeTraining_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeTraining" ADD CONSTRAINT "EmployeeTraining_trainingId_fkey" FOREIGN KEY ("trainingId") REFERENCES "Training"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HourPlanning" ADD CONSTRAINT "HourPlanning_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OvertimeApproval" ADD CONSTRAINT "OvertimeApproval_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NFCCollection" ADD CONSTRAINT "NFCCollection_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NFCRecord" ADD CONSTRAINT "NFCRecord_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "NFCCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeRecord" ADD CONSTRAINT "TimeRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkforceEntry" ADD CONSTRAINT "WorkforceEntry_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NFCBadge" ADD CONSTRAINT "NFCBadge_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NFCBadge" ADD CONSTRAINT "NFCBadge_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NFCBadge" ADD CONSTRAINT "NFCBadge_revokedBy_fkey" FOREIGN KEY ("revokedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
