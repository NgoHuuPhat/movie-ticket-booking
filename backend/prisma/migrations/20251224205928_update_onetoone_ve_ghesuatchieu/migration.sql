/*
  Warnings:

  - A unique constraint covering the columns `[maGheSuatChieu]` on the table `VE` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "VE_maGheSuatChieu_key" ON "VE"("maGheSuatChieu");
