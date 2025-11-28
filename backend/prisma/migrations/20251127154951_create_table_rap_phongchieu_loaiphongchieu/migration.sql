-- CreateTable
CREATE TABLE "RAP" (
    "maRap" TEXT NOT NULL,
    "tenRap" TEXT NOT NULL,
    "diaChi" TEXT NOT NULL,
    "soDienThoai" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "trangThai" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "RAP_pkey" PRIMARY KEY ("maRap")
);

-- CreateTable
CREATE TABLE "PHONGCHIEU" (
    "maPhong" TEXT NOT NULL,
    "tenPhong" TEXT NOT NULL,
    "maLoaiPhong" TEXT NOT NULL,
    "maRap" TEXT NOT NULL,

    CONSTRAINT "PHONGCHIEU_pkey" PRIMARY KEY ("maPhong")
);

-- CreateTable
CREATE TABLE "LOAIPHONGCHIEU" (
    "maLoaiPhong" TEXT NOT NULL,
    "tenLoaiPhong" TEXT NOT NULL,
    "moTa" TEXT,

    CONSTRAINT "LOAIPHONGCHIEU_pkey" PRIMARY KEY ("maLoaiPhong")
);

-- CreateIndex
CREATE UNIQUE INDEX "RAP_email_key" ON "RAP"("email");

-- AddForeignKey
ALTER TABLE "PHONGCHIEU" ADD CONSTRAINT "PHONGCHIEU_maLoaiPhong_fkey" FOREIGN KEY ("maLoaiPhong") REFERENCES "LOAIPHONGCHIEU"("maLoaiPhong") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PHONGCHIEU" ADD CONSTRAINT "PHONGCHIEU_maRap_fkey" FOREIGN KEY ("maRap") REFERENCES "RAP"("maRap") ON DELETE CASCADE ON UPDATE CASCADE;
