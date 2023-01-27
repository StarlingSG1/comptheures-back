/*
  Warnings:

  - You are about to drop the column `day` on the `Clock` table. All the data in the column will be lost.
  - You are about to drop the column `month` on the `Clock` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Clock` table. All the data in the column will be lost.
  - You are about to drop the column `week` on the `Clock` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `Clock` table. All the data in the column will be lost.
  - Added the required column `day` to the `Stats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `month` to the `Stats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userEnterpriseId` to the `Stats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `week` to the `Stats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `Stats` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Clock" DROP CONSTRAINT "Clock_userId_fkey";

-- AlterTable
ALTER TABLE "Clock" DROP COLUMN "day",
DROP COLUMN "month",
DROP COLUMN "userId",
DROP COLUMN "week",
DROP COLUMN "year";

-- AlterTable
ALTER TABLE "Stats" ADD COLUMN     "day" INTEGER NOT NULL,
ADD COLUMN     "month" INTEGER NOT NULL,
ADD COLUMN     "userEnterpriseId" TEXT NOT NULL,
ADD COLUMN     "week" INTEGER NOT NULL,
ADD COLUMN     "year" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Stats" ADD CONSTRAINT "Stats_userEnterpriseId_fkey" FOREIGN KEY ("userEnterpriseId") REFERENCES "UserEnterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
