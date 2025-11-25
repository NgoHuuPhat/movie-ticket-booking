/*
  Warnings:

  - You are about to drop the column `doTuoiChoPhep` on the `PHIM` table. All the data in the column will be lost.
  - You are about to drop the column `ngayTao` on the `PHIM` table. All the data in the column will be lost.
  - Added the required column `maPhanLoaiDoTuoi` to the `PHIM` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ngonNgu` to the `PHIM` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NGONNGU" AS ENUM ('LongTieng', 'PhuDe');

-- AlterTable
ALTER TABLE "PHIM" DROP COLUMN "doTuoiChoPhep",
DROP COLUMN "ngayTao",
ADD COLUMN     "hienThi" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "maPhanLoaiDoTuoi" TEXT NOT NULL,
ADD COLUMN     "ngonNgu" "NGONNGU" NOT NULL;

-- CreateTable
CREATE TABLE "PHANLOAIDOTUOI" (
    "maPhanLoaiDoTuoi" TEXT NOT NULL,
    "tenPhanLoaiDoTuoi" TEXT NOT NULL,
    "moTa" TEXT NOT NULL,

    CONSTRAINT "PHANLOAIDOTUOI_pkey" PRIMARY KEY ("maPhanLoaiDoTuoi")
);

-- AddForeignKey
ALTER TABLE "PHIM" ADD CONSTRAINT "PHIM_maPhanLoaiDoTuoi_fkey" FOREIGN KEY ("maPhanLoaiDoTuoi") REFERENCES "PHANLOAIDOTUOI"("maPhanLoaiDoTuoi") ON DELETE RESTRICT ON UPDATE CASCADE;
