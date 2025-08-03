/*
  Warnings:

  - You are about to drop the column `lat` on the `UserLocation` table. All the data in the column will be lost.
  - You are about to drop the column `lon` on the `UserLocation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Extra" ALTER COLUMN "birthdateIso" SET DEFAULT '';

-- AlterTable
ALTER TABLE "UserLocation" DROP COLUMN "lat",
DROP COLUMN "lon";
