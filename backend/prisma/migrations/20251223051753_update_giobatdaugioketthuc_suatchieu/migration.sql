/*
  Warnings:

  - You are about to drop the column `gioChieu` on the `SUATCHIEU` table. All the data in the column will be lost.
  - You are about to drop the column `ngayChieu` on the `SUATCHIEU` table. All the data in the column will be lost.
  - Added the required column `gioBatDau` to the `SUATCHIEU` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `gioKetThuc` on the `SUATCHIEU` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "SUATCHIEU" DROP COLUMN "gioChieu",
DROP COLUMN "ngayChieu",
ADD COLUMN     "gioBatDau" TIMESTAMP(3) NOT NULL,
DROP COLUMN "gioKetThuc",
ADD COLUMN     "gioKetThuc" TIMESTAMP(3) NOT NULL;
