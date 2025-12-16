-- CreateEnum
CREATE TYPE "LOAIKHUYENMAI" AS ENUM ('GiamGiaTien', 'GiamPhanTram');

-- CreateEnum
CREATE TYPE "LOAIKHACHHANG" AS ENUM ('TatCa', 'ThanhVien', 'VIP');

-- CreateTable
CREATE TABLE "DIEUKIENKHUYENMAI" (
    "maDieuKien" TEXT NOT NULL,
    "tenLoaiDieuKien" TEXT NOT NULL,
    "loaiKhachHangApDung" "LOAIKHACHHANG" NOT NULL,
    "moTa" TEXT,

    CONSTRAINT "DIEUKIENKHUYENMAI_pkey" PRIMARY KEY ("maDieuKien")
);

-- CreateTable
CREATE TABLE "KHUYENMAI" (
    "maKhuyenMai" TEXT NOT NULL,
    "tenKhuyenMai" TEXT NOT NULL,
    "maCode" TEXT NOT NULL,
    "maDieuKien" TEXT NOT NULL,
    "loaiKhuyenMai" "LOAIKHUYENMAI" NOT NULL,
    "giaTriGiam" INTEGER NOT NULL,
    "soLuong" INTEGER,
    "soLuongDaDung" INTEGER NOT NULL DEFAULT 0,
    "thangApDung" INTEGER,
    "ngayApDung" INTEGER,
    "ngayBatDau" TIMESTAMP(3) NOT NULL,
    "ngayKetThuc" TIMESTAMP(3) NOT NULL,
    "hoatDong" BOOLEAN NOT NULL DEFAULT true,
    "moTa" TEXT,

    CONSTRAINT "KHUYENMAI_pkey" PRIMARY KEY ("maKhuyenMai")
);

-- CreateIndex
CREATE UNIQUE INDEX "KHUYENMAI_maCode_key" ON "KHUYENMAI"("maCode");

-- AddForeignKey
ALTER TABLE "KHUYENMAI" ADD CONSTRAINT "KHUYENMAI_maDieuKien_fkey" FOREIGN KEY ("maDieuKien") REFERENCES "DIEUKIENKHUYENMAI"("maDieuKien") ON DELETE CASCADE ON UPDATE CASCADE;
