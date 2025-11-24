-- CreateEnum
CREATE TYPE "PHIENBAN" AS ENUM ('TWO_D', 'THREE_D');

-- CreateTable
CREATE TABLE "THELOAI" (
    "maTheLoai" TEXT NOT NULL,
    "tenTheLoai" TEXT NOT NULL,
    "moTa" TEXT,

    CONSTRAINT "THELOAI_pkey" PRIMARY KEY ("maTheLoai")
);

-- CreateTable
CREATE TABLE "PHIM_THELOAI" (
    "maPhim" TEXT NOT NULL,
    "maTheLoai" TEXT NOT NULL,

    CONSTRAINT "PHIM_THELOAI_pkey" PRIMARY KEY ("maPhim","maTheLoai")
);

-- CreateTable
CREATE TABLE "PHIM" (
    "maPhim" TEXT NOT NULL,
    "tenPhim" TEXT NOT NULL,
    "daoDien" TEXT NOT NULL,
    "dienVien" TEXT NOT NULL,
    "thoiLuong" INTEGER NOT NULL,
    "moTa" TEXT,
    "anhBia" TEXT NOT NULL,
    "ngayKhoiChieu" TIMESTAMP(3) NOT NULL,
    "ngayKetThuc" TIMESTAMP(3) NOT NULL,
    "doTuoiChoPhep" TEXT NOT NULL,
    "trailerPhim" TEXT NOT NULL,
    "quocGia" TEXT NOT NULL,
    "ngayTao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "phienBan" "PHIENBAN" NOT NULL,

    CONSTRAINT "PHIM_pkey" PRIMARY KEY ("maPhim")
);

-- AddForeignKey
ALTER TABLE "PHIM_THELOAI" ADD CONSTRAINT "PHIM_THELOAI_maPhim_fkey" FOREIGN KEY ("maPhim") REFERENCES "PHIM"("maPhim") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PHIM_THELOAI" ADD CONSTRAINT "PHIM_THELOAI_maTheLoai_fkey" FOREIGN KEY ("maTheLoai") REFERENCES "THELOAI"("maTheLoai") ON DELETE RESTRICT ON UPDATE CASCADE;
