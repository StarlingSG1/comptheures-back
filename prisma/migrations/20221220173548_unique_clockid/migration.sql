/*
  Warnings:

  - A unique constraint covering the columns `[clockId]` on the table `Stats` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Stats_clockId_key" ON "Stats"("clockId");
