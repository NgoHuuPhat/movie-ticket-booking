/*
  Warnings:

  - You are about to drop the column `anhDaiDien` on the `TINTUC` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `TINTUC` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `anhTinTuc` to the `TINTUC` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `TINTUC` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TINTUC" DROP COLUMN "anhDaiDien",
ADD COLUMN     "anhTinTuc" TEXT NOT NULL,
ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "TINTUC_slug_key" ON "TINTUC"("slug");
