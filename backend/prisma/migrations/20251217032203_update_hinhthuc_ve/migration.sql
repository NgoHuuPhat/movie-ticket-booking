/*
  Warnings:

  - Added the required column `phuongThucThanhToan` to the `VE` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `hinhThuc` on the `VE` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "HINHTHUCVE" AS ENUM ('Offline', 'Online');

-- CreateEnum
CREATE TYPE "PHUONGTHUCTHANHTOAN" AS ENUM ('VNPAY', 'MOMO', 'TIENMAT');

-- AlterTable
ALTER TABLE "VE" ADD COLUMN     "phuongThucThanhToan" "PHUONGTHUCTHANHTOAN" NOT NULL,
DROP COLUMN "hinhThuc",
ADD COLUMN     "hinhThuc" "HINHTHUCVE" NOT NULL;
