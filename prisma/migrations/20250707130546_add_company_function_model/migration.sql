-- CreateEnum
CREATE TYPE "LaborType" AS ENUM ('DIRETO', 'INDIRETO');

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "companyFunctionId" TEXT;

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

-- CreateIndex
CREATE UNIQUE INDEX "CompanyFunction_name_key" ON "CompanyFunction"("name");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_companyFunctionId_fkey" FOREIGN KEY ("companyFunctionId") REFERENCES "CompanyFunction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
