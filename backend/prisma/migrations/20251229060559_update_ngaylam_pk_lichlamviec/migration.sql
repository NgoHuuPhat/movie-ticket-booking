/*
  Warnings:

  - The primary key for the `LICHLAMVIEC` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "LICHLAMVIEC" DROP CONSTRAINT "LICHLAMVIEC_pkey",
ADD CONSTRAINT "LICHLAMVIEC_pkey" PRIMARY KEY ("maNhanVien", "maCaLam", "ngayLam");
