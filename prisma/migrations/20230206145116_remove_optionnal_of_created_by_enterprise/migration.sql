/*
  Warnings:

  - Made the column `createdById` on table `Enterprise` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Enterprise" ALTER COLUMN "createdById" SET NOT NULL;
