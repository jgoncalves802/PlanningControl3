/*
  Warnings:

  - You are about to drop the column `toFunctionId` on the `TransferRequest` table. All the data in the column will be lost.
  - Added the required column `fromContractId` to the `TransferRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TransferRequest" DROP COLUMN "toFunctionId",
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "finalizedAt" TIMESTAMP(3),
ADD COLUMN     "finalizedById" TEXT,
ADD COLUMN     "fromContractId" TEXT NOT NULL,
ADD COLUMN     "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "responsibleById" TEXT,
ADD COLUMN     "transferredAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "clerkId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "TransferRequest" ADD CONSTRAINT "TransferRequest_responsibleById_fkey" FOREIGN KEY ("responsibleById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferRequest" ADD CONSTRAINT "TransferRequest_finalizedById_fkey" FOREIGN KEY ("finalizedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferRequest" ADD CONSTRAINT "TransferRequest_fromContractId_fkey" FOREIGN KEY ("fromContractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferRequest" ADD CONSTRAINT "TransferRequest_toContractId_fkey" FOREIGN KEY ("toContractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
