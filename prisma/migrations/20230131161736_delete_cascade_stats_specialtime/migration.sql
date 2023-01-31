-- DropForeignKey
ALTER TABLE "SpecialTime" DROP CONSTRAINT "SpecialTime_specialDayId_fkey";

-- DropForeignKey
ALTER TABLE "Stats" DROP CONSTRAINT "Stats_specialTimeId_fkey";

-- AddForeignKey
ALTER TABLE "SpecialTime" ADD CONSTRAINT "SpecialTime_specialDayId_fkey" FOREIGN KEY ("specialDayId") REFERENCES "SpecialDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stats" ADD CONSTRAINT "Stats_specialTimeId_fkey" FOREIGN KEY ("specialTimeId") REFERENCES "SpecialTime"("id") ON DELETE CASCADE ON UPDATE CASCADE;
