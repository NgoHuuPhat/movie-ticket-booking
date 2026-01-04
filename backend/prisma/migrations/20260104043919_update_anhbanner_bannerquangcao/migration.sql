/*
  Warnings:

  - You are about to drop the column `hinhAnh` on the `BANNERQUANGCAO` table. All the data in the column will be lost.
  - Added the required column `anhBanner` to the `BANNERQUANGCAO` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BANNERQUANGCAO" DROP COLUMN "hinhAnh",
ADD COLUMN     "anhBanner" TEXT NOT NULL;
