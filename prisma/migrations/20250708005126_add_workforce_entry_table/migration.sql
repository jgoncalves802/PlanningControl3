-- CreateEnum
CREATE TYPE "WorkforceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'LEFT');

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

-- CreateIndex
CREATE UNIQUE INDEX "WorkforceEntry_employeeId_createdAt_key" ON "WorkforceEntry"("employeeId", "createdAt");

-- AddForeignKey
ALTER TABLE "WorkforceEntry" ADD CONSTRAINT "WorkforceEntry_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
