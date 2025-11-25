/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `PHIM` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `PHIM` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PHIM" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PHIM_slug_key" ON "PHIM"("slug");
