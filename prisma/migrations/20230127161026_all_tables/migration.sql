/*
  Warnings:

  - You are about to drop the column `clockId` on the `Stats` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[specialClockId]` on the table `Stats` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `statsId` to the `Clock` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Stats" DROP CONSTRAINT "Stats_clockId_fkey";

-- DropIndex
DROP INDEX "Stats_clockId_key";

-- AlterTable
ALTER TABLE "Clock" ADD COLUMN     "statsId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Stats" DROP COLUMN "clockId",
ADD COLUMN     "specialClockId" TEXT;

-- CreateTable
CREATE TABLE "Enterprise" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "adress" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enterprise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserEnterprise" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "enterpriseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserEnterprise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleEnterprise" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isAdmin" INTEGER NOT NULL DEFAULT 0,
    "userEnterpriseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoleEnterprise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfigEnterprise" (
    "id" TEXT NOT NULL,
    "monthDayStart" INTEGER NOT NULL DEFAULT 1,
    "monthDayEnd" INTEGER NOT NULL DEFAULT 31,
    "workHourADay" INTEGER NOT NULL DEFAULT 7,
    "enterpriseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfigEnterprise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecialDay" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "work" BOOLEAN NOT NULL DEFAULT true,
    "paid" BOOLEAN NOT NULL DEFAULT true,
    "configEnterpriseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpecialDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecialClock" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "specialDayId" TEXT NOT NULL,
    "workHourADay" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpecialClock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserEnterprise_userId_key" ON "UserEnterprise"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RoleEnterprise_label_key" ON "RoleEnterprise"("label");

-- CreateIndex
CREATE UNIQUE INDEX "RoleEnterprise_userEnterpriseId_key" ON "RoleEnterprise"("userEnterpriseId");

-- CreateIndex
CREATE UNIQUE INDEX "ConfigEnterprise_enterpriseId_key" ON "ConfigEnterprise"("enterpriseId");

-- CreateIndex
CREATE UNIQUE INDEX "Stats_specialClockId_key" ON "Stats"("specialClockId");

-- AddForeignKey
ALTER TABLE "UserEnterprise" ADD CONSTRAINT "UserEnterprise_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEnterprise" ADD CONSTRAINT "UserEnterprise_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleEnterprise" ADD CONSTRAINT "RoleEnterprise_userEnterpriseId_fkey" FOREIGN KEY ("userEnterpriseId") REFERENCES "UserEnterprise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfigEnterprise" ADD CONSTRAINT "ConfigEnterprise_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecialDay" ADD CONSTRAINT "SpecialDay_configEnterpriseId_fkey" FOREIGN KEY ("configEnterpriseId") REFERENCES "ConfigEnterprise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecialClock" ADD CONSTRAINT "SpecialClock_specialDayId_fkey" FOREIGN KEY ("specialDayId") REFERENCES "SpecialDay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clock" ADD CONSTRAINT "Clock_statsId_fkey" FOREIGN KEY ("statsId") REFERENCES "Stats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stats" ADD CONSTRAINT "Stats_specialClockId_fkey" FOREIGN KEY ("specialClockId") REFERENCES "SpecialClock"("id") ON DELETE SET NULL ON UPDATE CASCADE;
