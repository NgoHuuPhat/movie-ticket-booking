/*
  Warnings:

  - Made the column `moTa` on table `PHIM` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PHIM" ALTER COLUMN "moTa" SET NOT NULL;
