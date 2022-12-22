/*
  Warnings:

  - Added the required column `break` to the `Stats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `work` to the `Stats` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Stats" ADD COLUMN     "break" TEXT NOT NULL,
ADD COLUMN     "work" TEXT NOT NULL;
