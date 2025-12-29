/*
  Warnings:

  - You are about to drop the column `maNhanVienSoatBapNuoc` on the `HOADON_COMBO` table. All the data in the column will be lost.
  - You are about to drop the column `maNhanVienSoatBapNuoc` on the `HOADON_SANPHAM` table. All the data in the column will be lost.
  - You are about to drop the column `maNhanVienSoat` on the `VE` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "HOADON_COMBO" DROP CONSTRAINT "HOADON_COMBO_maNhanVienSoatBapNuoc_fkey";

-- DropForeignKey
ALTER TABLE "HOADON_SANPHAM" DROP CONSTRAINT "HOADON_SANPHAM_maNhanVienSoatBapNuoc_fkey";

-- DropForeignKey
ALTER TABLE "VE" DROP CONSTRAINT "VE_maNhanVienSoat_fkey";

-- AlterTable
ALTER TABLE "HOADON_COMBO" DROP COLUMN "maNhanVienSoatBapNuoc";

-- AlterTable
ALTER TABLE "HOADON_SANPHAM" DROP COLUMN "maNhanVienSoatBapNuoc";

-- AlterTable
ALTER TABLE "VE" DROP COLUMN "maNhanVienSoat";
