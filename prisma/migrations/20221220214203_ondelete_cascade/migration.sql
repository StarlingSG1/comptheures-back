-- DropForeignKey
ALTER TABLE "Clock" DROP CONSTRAINT "Clock_userId_fkey";

-- DropForeignKey
ALTER TABLE "Stats" DROP CONSTRAINT "Stats_clockId_fkey";

-- AddForeignKey
ALTER TABLE "Clock" ADD CONSTRAINT "Clock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stats" ADD CONSTRAINT "Stats_clockId_fkey" FOREIGN KEY ("clockId") REFERENCES "Clock"("id") ON DELETE CASCADE ON UPDATE CASCADE;
