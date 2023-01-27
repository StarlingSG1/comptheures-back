/*
  Warnings:

  - Added the required column `enterpriseId` to the `RoleEnterprise` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RoleEnterprise" DROP CONSTRAINT "RoleEnterprise_userEnterpriseId_fkey";

-- AlterTable
ALTER TABLE "RoleEnterprise" ADD COLUMN     "enterpriseId" TEXT NOT NULL,
ALTER COLUMN "userEnterpriseId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "RoleEnterprise" ADD CONSTRAINT "RoleEnterprise_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleEnterprise" ADD CONSTRAINT "RoleEnterprise_userEnterpriseId_fkey" FOREIGN KEY ("userEnterpriseId") REFERENCES "UserEnterprise"("id") ON DELETE SET NULL ON UPDATE CASCADE;
