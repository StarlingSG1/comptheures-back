/*
  Warnings:

  - You are about to drop the column `statsId` on the `SpecialTime` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[specialTimeId]` on the table `Stats` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "SpecialTime" DROP CONSTRAINT "SpecialTime_statsId_fkey";

-- DropIndex
DROP INDEX "SpecialTime_statsId_key";

-- AlterTable
ALTER TABLE "SpecialTime" DROP COLUMN "statsId";

-- AlterTable
ALTER TABLE "Stats" ADD COLUMN     "specialTimeId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Stats_specialTimeId_key" ON "Stats"("specialTimeId");

-- AddForeignKey
ALTER TABLE "Stats" ADD CONSTRAINT "Stats_specialTimeId_fkey" FOREIGN KEY ("specialTimeId") REFERENCES "SpecialTime"("id") ON DELETE SET NULL ON UPDATE CASCADE;
