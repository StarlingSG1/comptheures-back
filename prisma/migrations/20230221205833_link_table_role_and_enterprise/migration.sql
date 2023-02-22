/*
  Warnings:

  - You are about to drop the column `enterpriseId` on the `RoleEnterprise` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "RoleEnterprise" DROP CONSTRAINT "RoleEnterprise_enterpriseId_fkey";

-- DropIndex
DROP INDEX "RoleEnterprise_label_key";

-- AlterTable
ALTER TABLE "RoleEnterprise" DROP COLUMN "enterpriseId";

-- CreateTable
CREATE TABLE "EnterpriseRoleLink" (
    "id" TEXT NOT NULL,
    "enterpriseId" TEXT NOT NULL,
    "roleEnterpriseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnterpriseRoleLink_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EnterpriseRoleLink" ADD CONSTRAINT "EnterpriseRoleLink_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnterpriseRoleLink" ADD CONSTRAINT "EnterpriseRoleLink_roleEnterpriseId_fkey" FOREIGN KEY ("roleEnterpriseId") REFERENCES "RoleEnterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
