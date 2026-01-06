/*
  Warnings:

  - A unique constraint covering the columns `[tenPhong]` on the table `PHONGCHIEU` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PHONGCHIEU_tenPhong_key" ON "PHONGCHIEU"("tenPhong");
