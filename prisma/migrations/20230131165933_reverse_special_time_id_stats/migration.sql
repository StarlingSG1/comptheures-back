/*
  Warnings:

  - You are about to drop the column `specialTimeId` on the `Stats` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[statsId]` on the table `SpecialTime` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Stats" DROP CONSTRAINT "Stats_specialTimeId_fkey";

-- DropIndex
DROP INDEX "Stats_specialTimeId_key";

-- AlterTable
ALTER TABLE "SpecialTime" ADD COLUMN     "statsId" TEXT;

-- AlterTable
ALTER TABLE "Stats" DROP COLUMN "specialTimeId";

-- CreateIndex
CREATE UNIQUE INDEX "SpecialTime_statsId_key" ON "SpecialTime"("statsId");

-- AddForeignKey
ALTER TABLE "SpecialTime" ADD CONSTRAINT "SpecialTime_statsId_fkey" FOREIGN KEY ("statsId") REFERENCES "Stats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
