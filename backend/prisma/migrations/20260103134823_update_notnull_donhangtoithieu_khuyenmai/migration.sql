/*
  Warnings:

  - Made the column `donHangToiThieu` on table `KHUYENMAI` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "KHUYENMAI" ALTER COLUMN "donHangToiThieu" SET NOT NULL;
