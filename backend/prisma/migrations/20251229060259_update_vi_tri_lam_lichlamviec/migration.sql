/*
  Warnings:

  - You are about to drop the column `vitriLam` on the `LICHLAMVIEC` table. All the data in the column will be lost.
  - Added the required column `viTriLam` to the `LICHLAMVIEC` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LICHLAMVIEC" DROP COLUMN "vitriLam",
ADD COLUMN     "viTriLam" "VITRILAM" NOT NULL;
