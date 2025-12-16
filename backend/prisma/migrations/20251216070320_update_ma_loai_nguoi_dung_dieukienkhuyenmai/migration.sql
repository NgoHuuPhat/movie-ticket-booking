/*
  Warnings:

  - You are about to drop the column `loaiKhachHangApDung` on the `DIEUKIENKHUYENMAI` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DIEUKIENKHUYENMAI" DROP COLUMN "loaiKhachHangApDung",
ADD COLUMN     "maLoaiNguoiDung" TEXT;

-- DropEnum
DROP TYPE "LOAIKHACHHANG";

-- AddForeignKey
ALTER TABLE "DIEUKIENKHUYENMAI" ADD CONSTRAINT "DIEUKIENKHUYENMAI_maLoaiNguoiDung_fkey" FOREIGN KEY ("maLoaiNguoiDung") REFERENCES "LOAINGUOIDUNG"("maLoaiNguoiDung") ON DELETE CASCADE ON UPDATE CASCADE;
