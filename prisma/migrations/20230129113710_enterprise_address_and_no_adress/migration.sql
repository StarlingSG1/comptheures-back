/*
  Warnings:

  - You are about to drop the column `adress` on the `Enterprise` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Enterprise" DROP COLUMN "adress",
ADD COLUMN     "address" TEXT;
