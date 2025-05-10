/*
  Warnings:

  - You are about to drop the column `kewords` on the `BlogPost` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BlogPost" DROP COLUMN "kewords",
ADD COLUMN     "keywords" TEXT[];
