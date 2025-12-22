/*
  Warnings:

  - The values [KhongSuDung] on the enum `TRANGTHAIGHE` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TRANGTHAIGHE_new" AS ENUM ('DangTrong', 'DaDat');
ALTER TABLE "public"."GHE_SUATCHIEU" ALTER COLUMN "trangThaiGhe" DROP DEFAULT;
ALTER TABLE "GHE_SUATCHIEU" ALTER COLUMN "trangThaiGhe" TYPE "TRANGTHAIGHE_new" USING ("trangThaiGhe"::text::"TRANGTHAIGHE_new");
ALTER TYPE "TRANGTHAIGHE" RENAME TO "TRANGTHAIGHE_old";
ALTER TYPE "TRANGTHAIGHE_new" RENAME TO "TRANGTHAIGHE";
DROP TYPE "public"."TRANGTHAIGHE_old";
ALTER TABLE "GHE_SUATCHIEU" ALTER COLUMN "trangThaiGhe" SET DEFAULT 'DangTrong';
COMMIT;
