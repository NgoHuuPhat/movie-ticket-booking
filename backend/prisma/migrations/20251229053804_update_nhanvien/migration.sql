/*
  Warnings:

  - You are about to drop the column `maNhanVienDat` on the `HOADON` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "VITRILAM" AS ENUM ('NhanVienBanVe', 'NhanVienSoatVe', 'NhanVienSoatBapNuoc');

-- DropForeignKey
ALTER TABLE "HOADON" DROP CONSTRAINT "HOADON_maNguoiDung_fkey";

-- DropForeignKey
ALTER TABLE "HOADON" DROP CONSTRAINT "HOADON_maNhanVienDat_fkey";

-- AlterTable
ALTER TABLE "HOADON" DROP COLUMN "maNhanVienDat",
ADD COLUMN     "maNhanVienBanVe" TEXT,
ALTER COLUMN "maNguoiDung" DROP NOT NULL;

-- AlterTable
ALTER TABLE "HOADON_COMBO" ADD COLUMN     "maNhanVienSoatBapNuoc" TEXT;

-- AlterTable
ALTER TABLE "HOADON_SANPHAM" ADD COLUMN     "maNhanVienSoatBapNuoc" TEXT;

-- CreateTable
CREATE TABLE "CALAM" (
    "maCaLam" TEXT NOT NULL,
    "tenCaLam" TEXT NOT NULL,
    "gioBatDau" TIME NOT NULL,
    "gioKetThuc" TIME NOT NULL,

    CONSTRAINT "CALAM_pkey" PRIMARY KEY ("maCaLam")
);

-- CreateTable
CREATE TABLE "LICHLAMVIEC" (
    "maNhanVien" TEXT NOT NULL,
    "maCaLam" TEXT NOT NULL,
    "ngayLam" DATE NOT NULL,
    "vitriLam" "VITRILAM" NOT NULL,

    CONSTRAINT "LICHLAMVIEC_pkey" PRIMARY KEY ("maNhanVien","maCaLam")
);

-- AddForeignKey
ALTER TABLE "LICHLAMVIEC" ADD CONSTRAINT "LICHLAMVIEC_maNhanVien_fkey" FOREIGN KEY ("maNhanVien") REFERENCES "NGUOIDUNG"("maNguoiDung") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LICHLAMVIEC" ADD CONSTRAINT "LICHLAMVIEC_maCaLam_fkey" FOREIGN KEY ("maCaLam") REFERENCES "CALAM"("maCaLam") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HOADON" ADD CONSTRAINT "HOADON_maNguoiDung_fkey" FOREIGN KEY ("maNguoiDung") REFERENCES "NGUOIDUNG"("maNguoiDung") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HOADON" ADD CONSTRAINT "HOADON_maNhanVienBanVe_fkey" FOREIGN KEY ("maNhanVienBanVe") REFERENCES "NGUOIDUNG"("maNguoiDung") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HOADON_COMBO" ADD CONSTRAINT "HOADON_COMBO_maNhanVienSoatBapNuoc_fkey" FOREIGN KEY ("maNhanVienSoatBapNuoc") REFERENCES "NGUOIDUNG"("maNguoiDung") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HOADON_SANPHAM" ADD CONSTRAINT "HOADON_SANPHAM_maNhanVienSoatBapNuoc_fkey" FOREIGN KEY ("maNhanVienSoatBapNuoc") REFERENCES "NGUOIDUNG"("maNguoiDung") ON DELETE SET NULL ON UPDATE CASCADE;
