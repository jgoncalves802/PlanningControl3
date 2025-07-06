/*
  Warnings:

  - Added the required column `address` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissionDate` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `birthDate` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cnh` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cnhCategory` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cnhValidity` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ctps` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ctpsSeries` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ctpsUf` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dependents` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `educationLevel` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fatherName` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maritalStatus` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `motherName` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nationality` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `naturalness` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pis` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registration` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reservist` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reservistCategory` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rg` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shift` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `voterSection` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `voterTitle` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `voterZone` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workplace` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "address" JSONB NOT NULL,
ADD COLUMN     "admissionDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "birthDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "cnh" TEXT NOT NULL,
ADD COLUMN     "cnhCategory" TEXT NOT NULL,
ADD COLUMN     "cnhValidity" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "company" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "ctps" TEXT NOT NULL,
ADD COLUMN     "ctpsSeries" TEXT NOT NULL,
ADD COLUMN     "ctpsUf" TEXT NOT NULL,
ADD COLUMN     "dependents" JSONB NOT NULL,
ADD COLUMN     "dismissalDate" TIMESTAMP(3),
ADD COLUMN     "educationLevel" TEXT NOT NULL,
ADD COLUMN     "fatherName" TEXT NOT NULL,
ADD COLUMN     "gender" TEXT NOT NULL,
ADD COLUMN     "maritalStatus" TEXT NOT NULL,
ADD COLUMN     "motherName" TEXT NOT NULL,
ADD COLUMN     "nationality" TEXT NOT NULL,
ADD COLUMN     "naturalness" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "pis" TEXT NOT NULL,
ADD COLUMN     "registration" TEXT NOT NULL,
ADD COLUMN     "reservist" TEXT NOT NULL,
ADD COLUMN     "reservistCategory" TEXT NOT NULL,
ADD COLUMN     "rg" TEXT NOT NULL,
ADD COLUMN     "role" TEXT NOT NULL,
ADD COLUMN     "shift" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "voterSection" TEXT NOT NULL,
ADD COLUMN     "voterTitle" TEXT NOT NULL,
ADD COLUMN     "voterZone" TEXT NOT NULL,
ADD COLUMN     "workplace" TEXT NOT NULL;
