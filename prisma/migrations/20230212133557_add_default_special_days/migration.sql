/*
  Warnings:

  - A unique constraint covering the columns `[defaultSpecialDayId]` on the table `SpecialDay` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "SpecialDay" ADD COLUMN     "defaultSpecialDayId" TEXT;

-- CreateTable
CREATE TABLE "DefaultSpecialDay" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "work" BOOLEAN NOT NULL DEFAULT true,
    "paid" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DefaultSpecialDay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SpecialDay_defaultSpecialDayId_key" ON "SpecialDay"("defaultSpecialDayId");

-- AddForeignKey
ALTER TABLE "SpecialDay" ADD CONSTRAINT "SpecialDay_defaultSpecialDayId_fkey" FOREIGN KEY ("defaultSpecialDayId") REFERENCES "DefaultSpecialDay"("id") ON DELETE SET NULL ON UPDATE CASCADE;
