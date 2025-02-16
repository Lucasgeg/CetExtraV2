/*
  Warnings:

  - You are about to drop the column `x` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `y` on the `Location` table. All the data in the column will be lost.
  - Added the required column `lat` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lon` to the `Location` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Location" DROP COLUMN "x",
DROP COLUMN "y",
ADD COLUMN     "lat" INTEGER NOT NULL,
ADD COLUMN     "lon" INTEGER NOT NULL;
