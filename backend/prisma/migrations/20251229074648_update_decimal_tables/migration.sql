/*
  Warnings:

  - You are about to alter the column `giaGoc` on the `COMBO` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `giaBan` on the `COMBO` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `giaTien` on the `GIAGHEPHONG` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `tongTien` on the `HOADON` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `donGia` on the `HOADON_COMBO` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `tongTien` on the `HOADON_COMBO` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `donGia` on the `HOADON_SANPHAM` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `tongTien` on the `HOADON_SANPHAM` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `giaTien` on the `SANPHAM` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `giaVe` on the `VE` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "COMBO" ALTER COLUMN "giaGoc" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "giaBan" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "GIAGHEPHONG" ALTER COLUMN "giaTien" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "HOADON" ALTER COLUMN "tongTien" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "HOADON_COMBO" ALTER COLUMN "donGia" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "tongTien" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "HOADON_SANPHAM" ALTER COLUMN "donGia" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "tongTien" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "SANPHAM" ALTER COLUMN "giaTien" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "VE" ALTER COLUMN "giaVe" SET DATA TYPE DECIMAL(10,2);
