-- DropForeignKey
ALTER TABLE "SpecialDay" DROP CONSTRAINT "SpecialDay_configEnterpriseId_fkey";

-- DropForeignKey
ALTER TABLE "SpecialDay" DROP CONSTRAINT "SpecialDay_defaultSpecialDayId_fkey";

-- DropForeignKey
ALTER TABLE "Stats" DROP CONSTRAINT "Stats_specialTimeId_fkey";

-- DropForeignKey
ALTER TABLE "UserEnterprise" DROP CONSTRAINT "UserEnterprise_roleEnterpriseId_fkey";

-- AddForeignKey
ALTER TABLE "UserEnterprise" ADD CONSTRAINT "UserEnterprise_roleEnterpriseId_fkey" FOREIGN KEY ("roleEnterpriseId") REFERENCES "RoleEnterprise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecialDay" ADD CONSTRAINT "SpecialDay_configEnterpriseId_fkey" FOREIGN KEY ("configEnterpriseId") REFERENCES "ConfigEnterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecialDay" ADD CONSTRAINT "SpecialDay_defaultSpecialDayId_fkey" FOREIGN KEY ("defaultSpecialDayId") REFERENCES "DefaultSpecialDay"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stats" ADD CONSTRAINT "Stats_specialTimeId_fkey" FOREIGN KEY ("specialTimeId") REFERENCES "SpecialTime"("id") ON DELETE CASCADE ON UPDATE CASCADE;
