/*
  Warnings:

  - You are about to drop the column `maNguoiDung` on the `TINTUC` table. All the data in the column will be lost.
  - Added the required column `maNguoiDang` to the `TINTUC` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TINTUC" DROP CONSTRAINT "TINTUC_maNguoiDung_fkey";

-- AlterTable
ALTER TABLE "TINTUC" DROP COLUMN "maNguoiDung",
ADD COLUMN     "maNguoiDang" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "BANNERQUANGCAO" (
    "maBanner" TEXT NOT NULL,
    "hinhAnh" TEXT NOT NULL,
    "duongDanLienKet" TEXT NOT NULL,
    "viTriHienThi" INTEGER NOT NULL,
    "hienThi" BOOLEAN NOT NULL DEFAULT true,
    "maNguoiTao" TEXT NOT NULL,

    CONSTRAINT "BANNERQUANGCAO_pkey" PRIMARY KEY ("maBanner")
);

-- CreateIndex
CREATE UNIQUE INDEX "BANNERQUANGCAO_viTriHienThi_key" ON "BANNERQUANGCAO"("viTriHienThi");

-- AddForeignKey
ALTER TABLE "TINTUC" ADD CONSTRAINT "TINTUC_maNguoiDang_fkey" FOREIGN KEY ("maNguoiDang") REFERENCES "NGUOIDUNG"("maNguoiDung") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BANNERQUANGCAO" ADD CONSTRAINT "BANNERQUANGCAO_maNguoiTao_fkey" FOREIGN KEY ("maNguoiTao") REFERENCES "NGUOIDUNG"("maNguoiDung") ON DELETE RESTRICT ON UPDATE CASCADE;
