-- DropForeignKey
ALTER TABLE "Stats" DROP CONSTRAINT "Stats_specialTimeId_fkey";

-- AddForeignKey
ALTER TABLE "Stats" ADD CONSTRAINT "Stats_specialTimeId_fkey" FOREIGN KEY ("specialTimeId") REFERENCES "SpecialTime"("id") ON DELETE SET NULL ON UPDATE CASCADE;
