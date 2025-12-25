/*
  Warnings:

  - The values [DaDat,DaHuy] on the enum `TRANGTHAIVE` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `trangThaiThanhToan` on the `HOADON` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TRANGTHAIVE_new" AS ENUM ('DaCheckIn', 'DaThanhToan', 'DaHoanTien');
ALTER TABLE "public"."VE" ALTER COLUMN "trangThai" DROP DEFAULT;
ALTER TABLE "VE" ALTER COLUMN "trangThai" TYPE "TRANGTHAIVE_new" USING ("trangThai"::text::"TRANGTHAIVE_new");
ALTER TYPE "TRANGTHAIVE" RENAME TO "TRANGTHAIVE_old";
ALTER TYPE "TRANGTHAIVE_new" RENAME TO "TRANGTHAIVE";
DROP TYPE "public"."TRANGTHAIVE_old";
ALTER TABLE "VE" ALTER COLUMN "trangThai" SET DEFAULT 'DaThanhToan';
COMMIT;

-- AlterTable
ALTER TABLE "HOADON" DROP COLUMN "trangThaiThanhToan";

-- AlterTable
ALTER TABLE "VE" ALTER COLUMN "trangThai" SET DEFAULT 'DaThanhToan';

-- DropEnum
DROP TYPE "TRANGTHAITHANHTOAN";
