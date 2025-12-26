/*
  Warnings:

  - You are about to drop the column `trangThai` on the `NGUOIDUNG` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "NGUOIDUNG" DROP COLUMN "trangThai",
ADD COLUMN     "hoatDong" BOOLEAN NOT NULL DEFAULT true;

-- DropEnum
DROP TYPE "TRANGTHAINGUOIDUNG";
