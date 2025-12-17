/*
  Warnings:

  - Added the required column `trangThaiThanhToan` to the `VE` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TRANGTHAITHANHTOAN" AS ENUM ('DaThanhToan', 'ChuaThanhToan', 'LoiThanhToan');

-- AlterTable
ALTER TABLE "VE" ADD COLUMN     "trangThaiThanhToan" "TRANGTHAITHANHTOAN" NOT NULL;
