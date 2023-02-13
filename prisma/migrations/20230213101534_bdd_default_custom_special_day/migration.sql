-- AlterTable
ALTER TABLE "DefaultSpecialDay" ADD COLUMN     "configEnterpriseId" TEXT;

-- AddForeignKey
ALTER TABLE "DefaultSpecialDay" ADD CONSTRAINT "DefaultSpecialDay_configEnterpriseId_fkey" FOREIGN KEY ("configEnterpriseId") REFERENCES "ConfigEnterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
