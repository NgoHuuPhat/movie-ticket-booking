/*
  Warnings:

  - You are about to drop the column `hienThi` on the `PHONGCHIEU` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PHONGCHIEU" DROP COLUMN "hienThi",
ADD COLUMN     "hoatDong" BOOLEAN NOT NULL DEFAULT true;
