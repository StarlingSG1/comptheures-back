/*
  Warnings:

  - You are about to drop the column `userEnterpriseId` on the `RoleEnterprise` table. All the data in the column will be lost.
  - Added the required column `roleEnterpriseId` to the `UserEnterprise` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RoleEnterprise" DROP CONSTRAINT "RoleEnterprise_userEnterpriseId_fkey";

-- DropIndex
DROP INDEX "RoleEnterprise_userEnterpriseId_key";

-- AlterTable
ALTER TABLE "RoleEnterprise" DROP COLUMN "userEnterpriseId";

-- AlterTable
ALTER TABLE "UserEnterprise" ADD COLUMN     "roleEnterpriseId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "UserEnterprise" ADD CONSTRAINT "UserEnterprise_roleEnterpriseId_fkey" FOREIGN KEY ("roleEnterpriseId") REFERENCES "RoleEnterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
