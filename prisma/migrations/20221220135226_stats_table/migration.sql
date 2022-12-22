-- CreateTable
CREATE TABLE "Stats" (
    "id" TEXT NOT NULL,
    "clockId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stats_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Stats" ADD CONSTRAINT "Stats_clockId_fkey" FOREIGN KEY ("clockId") REFERENCES "Clock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
