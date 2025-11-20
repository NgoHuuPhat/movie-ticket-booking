-- CreateEnum
CREATE TYPE "TRANGTHAINGUOIDUNG" AS ENUM ('HoatDong', 'BiKhoa');

-- CreateEnum
CREATE TYPE "GIOITINH" AS ENUM ('Nam', 'Nu', 'Khac');

-- CreateTable
CREATE TABLE "LOAINGUOIDUNG" (
    "maLoaiNguoiDung" TEXT NOT NULL,
    "tenLoaiNguoiDung" TEXT NOT NULL,
    "moTa" TEXT,

    CONSTRAINT "LOAINGUOIDUNG_pkey" PRIMARY KEY ("maLoaiNguoiDung")
);

-- CreateTable
CREATE TABLE "NGUOIDUNG" (
    "maNguoiDung" TEXT NOT NULL,
    "hoTen" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "matKhau" TEXT NOT NULL,
    "soDienThoai" TEXT NOT NULL,
    "maLoaiNguoiDung" TEXT NOT NULL,
    "ngaySinh" TIMESTAMP(3) NOT NULL,
    "gioiTinh" "GIOITINH" NOT NULL,
    "anhDaiDien" TEXT,
    "trangThai" "TRANGTHAINGUOIDUNG" NOT NULL DEFAULT 'HoatDong',
    "ngayTao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diemTichLuy" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "NGUOIDUNG_pkey" PRIMARY KEY ("maNguoiDung")
);

-- CreateIndex
CREATE UNIQUE INDEX "NGUOIDUNG_email_key" ON "NGUOIDUNG"("email");

-- CreateIndex
CREATE UNIQUE INDEX "NGUOIDUNG_soDienThoai_key" ON "NGUOIDUNG"("soDienThoai");

-- AddForeignKey
ALTER TABLE "NGUOIDUNG" ADD CONSTRAINT "NGUOIDUNG_maLoaiNguoiDung_fkey" FOREIGN KEY ("maLoaiNguoiDung") REFERENCES "LOAINGUOIDUNG"("maLoaiNguoiDung") ON DELETE RESTRICT ON UPDATE CASCADE;
