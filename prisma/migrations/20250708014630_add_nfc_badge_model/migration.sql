-- CreateEnum
CREATE TYPE "NFCBadgeStatus" AS ENUM ('AVAILABLE', 'ASSIGNED', 'REVOKED', 'LOST', 'DAMAGED', 'EXPIRED');

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
ALTER TABLE "NFCBadge" ADD CONSTRAINT "NFCBadge_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NFCBadge" ADD CONSTRAINT "NFCBadge_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NFCBadge" ADD CONSTRAINT "NFCBadge_revokedBy_fkey" FOREIGN KEY ("revokedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
