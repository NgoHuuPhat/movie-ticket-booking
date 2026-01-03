/*
  Warnings:

  - Added the required column `hinhThucDatVe` to the `HOADON` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "HINHTHUCDATVE" AS ENUM ('Offline', 'Online');

-- AlterTable
ALTER TABLE "HOADON" ADD COLUMN     "hinhThucDatVe" "HINHTHUCDATVE" NOT NULL;

-- DropEnum
DROP TYPE "HINHTHUCVE";
