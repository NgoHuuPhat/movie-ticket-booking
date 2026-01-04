/*
  Warnings:

  - You are about to drop the column `anhTinTuc` on the `TINTUC` table. All the data in the column will be lost.
  - Added the required column `anhDaiDien` to the `TINTUC` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TINTUC" DROP COLUMN "anhTinTuc",
ADD COLUMN     "anhDaiDien" TEXT NOT NULL;
