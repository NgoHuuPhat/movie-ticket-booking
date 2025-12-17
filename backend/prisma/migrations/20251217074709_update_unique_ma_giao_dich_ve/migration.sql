/*
  Warnings:

  - A unique constraint covering the columns `[maGiaoDich]` on the table `VE` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "VE_maGiaoDich_key" ON "VE"("maGiaoDich");
