/*
  Warnings:

  - Added the required column `stat` to the `Clock` table without a default value. This is not possible if the table is not empty.
  - Made the column `order` on table `Clock` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Clock" ADD COLUMN     "stat" INTEGER NOT NULL,
ALTER COLUMN "order" SET NOT NULL;
