/*
  Warnings:

  - A unique constraint covering the columns `[registration,company]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Employee_registration_company_key" ON "Employee"("registration", "company");
