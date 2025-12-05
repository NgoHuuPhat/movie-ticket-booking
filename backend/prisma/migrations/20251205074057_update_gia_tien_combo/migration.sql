/*
  Warnings:

  - You are about to drop the column `giaTien` on the `COMBO` table. All the data in the column will be lost.
  - Added the required column `giaBan` to the `COMBO` table without a default value. This is not possible if the table is not empty.
  - Added the required column `giaGoc` to the `COMBO` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "COMBO" DROP COLUMN "giaTien",
ADD COLUMN     "giaBan" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "giaGoc" DOUBLE PRECISION NOT NULL;
