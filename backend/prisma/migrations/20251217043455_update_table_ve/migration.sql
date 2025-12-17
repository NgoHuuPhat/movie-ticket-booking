/*
  Warnings:

  - Added the required column `maPhim` to the `VE` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VE" ADD COLUMN     "maPhim" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "VE" ADD CONSTRAINT "VE_maPhim_fkey" FOREIGN KEY ("maPhim") REFERENCES "PHIM"("maPhim") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VE" ADD CONSTRAINT "VE_maKhuyenMai_fkey" FOREIGN KEY ("maKhuyenMai") REFERENCES "KHUYENMAI"("maKhuyenMai") ON DELETE SET NULL ON UPDATE CASCADE;
