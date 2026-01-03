/*
  Warnings:

  - The values [GiamGiaTien] on the enum `LOAIKHUYENMAI` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `maDieuKien` on the `KHUYENMAI` table. All the data in the column will be lost.
  - You are about to drop the column `ngayApDung` on the `KHUYENMAI` table. All the data in the column will be lost.
  - You are about to drop the column `thangApDung` on the `KHUYENMAI` table. All the data in the column will be lost.
  - You are about to drop the `DIEUKIENKHUYENMAI` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LOAIKHUYENMAI_new" AS ENUM ('GiamTien', 'GiamPhanTram');
ALTER TABLE "KHUYENMAI" ALTER COLUMN "loaiKhuyenMai" TYPE "LOAIKHUYENMAI_new" USING ("loaiKhuyenMai"::text::"LOAIKHUYENMAI_new");
ALTER TYPE "LOAIKHUYENMAI" RENAME TO "LOAIKHUYENMAI_old";
ALTER TYPE "LOAIKHUYENMAI_new" RENAME TO "LOAIKHUYENMAI";
DROP TYPE "public"."LOAIKHUYENMAI_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "DIEUKIENKHUYENMAI" DROP CONSTRAINT "DIEUKIENKHUYENMAI_maLoaiNguoiDung_fkey";

-- DropForeignKey
ALTER TABLE "KHUYENMAI" DROP CONSTRAINT "KHUYENMAI_maDieuKien_fkey";

-- AlterTable
ALTER TABLE "KHUYENMAI" DROP COLUMN "maDieuKien",
DROP COLUMN "ngayApDung",
DROP COLUMN "thangApDung",
ADD COLUMN     "donHangToiThieu" DECIMAL(10,2),
ADD COLUMN     "giamToiDa" DECIMAL(10,2),
ADD COLUMN     "maLoaiNguoiDung" TEXT,
ALTER COLUMN "ngayBatDau" SET DATA TYPE DATE,
ALTER COLUMN "ngayKetThuc" SET DATA TYPE DATE;

-- DropTable
DROP TABLE "DIEUKIENKHUYENMAI";

-- AddForeignKey
ALTER TABLE "KHUYENMAI" ADD CONSTRAINT "KHUYENMAI_maLoaiNguoiDung_fkey" FOREIGN KEY ("maLoaiNguoiDung") REFERENCES "LOAINGUOIDUNG"("maLoaiNguoiDung") ON DELETE SET NULL ON UPDATE CASCADE;
