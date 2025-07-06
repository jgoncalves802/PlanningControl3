/*
  Warnings:

  - The `previsaoObra` column on the `Employee` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `primeiraExperiencia` column on the `Employee` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `segundaExperiencia` column on the `Employee` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "previsaoObra",
ADD COLUMN     "previsaoObra" TIMESTAMP(3),
DROP COLUMN "primeiraExperiencia",
ADD COLUMN     "primeiraExperiencia" TIMESTAMP(3),
DROP COLUMN "segundaExperiencia",
ADD COLUMN     "segundaExperiencia" TIMESTAMP(3);
