-- DropForeignKey
ALTER TABLE "SpecialDay" DROP CONSTRAINT "SpecialDay_defaultSpecialDayId_fkey";

-- AlterTable
ALTER TABLE "Enterprise" ADD COLUMN     "city" TEXT,
ADD COLUMN     "postalCode" TEXT;

-- AddForeignKey
ALTER TABLE "SpecialDay" ADD CONSTRAINT "SpecialDay_defaultSpecialDayId_fkey" FOREIGN KEY ("defaultSpecialDayId") REFERENCES "DefaultSpecialDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;
