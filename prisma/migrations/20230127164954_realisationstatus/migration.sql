/*
  Warnings:

  - You are about to drop the column `specialClockId` on the `Stats` table. All the data in the column will be lost.
  - You are about to drop the `Clock` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SpecialClock` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[specialTimeId]` on the table `Stats` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "RealisationStatus" AS ENUM ('IN_VALIDATION', 'VALIDATED', 'REFUSED');

-- DropForeignKey
ALTER TABLE "Clock" DROP CONSTRAINT "Clock_statsId_fkey";

-- DropForeignKey
ALTER TABLE "SpecialClock" DROP CONSTRAINT "SpecialClock_specialDayId_fkey";

-- DropForeignKey
ALTER TABLE "Stats" DROP CONSTRAINT "Stats_specialClockId_fkey";

-- DropIndex
DROP INDEX "Stats_specialClockId_key";

-- AlterTable
ALTER TABLE "Stats" DROP COLUMN "specialClockId",
ADD COLUMN     "realisationStatus" "RealisationStatus" NOT NULL DEFAULT E'IN_VALIDATION',
ADD COLUMN     "specialTimeId" TEXT;

-- DropTable
DROP TABLE "Clock";

-- DropTable
DROP TABLE "SpecialClock";

-- CreateTable
CREATE TABLE "SpecialTime" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "specialDayId" TEXT NOT NULL,
    "workHourADay" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpecialTime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomTime" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "start" TEXT NOT NULL,
    "end" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "type" "Type" NOT NULL DEFAULT E'WORK',
    "statsId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomTime_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Stats_specialTimeId_key" ON "Stats"("specialTimeId");

-- AddForeignKey
ALTER TABLE "SpecialTime" ADD CONSTRAINT "SpecialTime_specialDayId_fkey" FOREIGN KEY ("specialDayId") REFERENCES "SpecialDay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomTime" ADD CONSTRAINT "CustomTime_statsId_fkey" FOREIGN KEY ("statsId") REFERENCES "Stats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stats" ADD CONSTRAINT "Stats_specialTimeId_fkey" FOREIGN KEY ("specialTimeId") REFERENCES "SpecialTime"("id") ON DELETE SET NULL ON UPDATE CASCADE;
