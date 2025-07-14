/*
  Warnings:

  - You are about to drop the column `nominatimId` on the `MissionLocation` table. All the data in the column will be lost.
  - You are about to drop the column `nominatimId` on the `UserLocation` table. All the data in the column will be lost.
  - You are about to drop the column `userLocationId` on the `UserLocation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[lat,lon]` on the table `MissionLocation` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Company" DROP CONSTRAINT "Company_userId_fkey";

-- DropForeignKey
ALTER TABLE "Extra" DROP CONSTRAINT "Extra_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserLocation" DROP CONSTRAINT "UserLocation_userLocationId_fkey";

-- DropForeignKey
ALTER TABLE "UserMission" DROP CONSTRAINT "UserMission_userId_fkey";

-- DropIndex
DROP INDEX "MissionLocation_nominatimId_key";

-- DropIndex
DROP INDEX "UserLocation_nominatimId_key";

-- DropIndex
DROP INDEX "UserLocation_userLocationId_key";

-- AlterTable
ALTER TABLE "MissionLocation" DROP COLUMN "nominatimId";

-- AlterTable
ALTER TABLE "UserLocation" DROP COLUMN "nominatimId",
DROP COLUMN "userLocationId";

-- CreateIndex
CREATE UNIQUE INDEX "MissionLocation_lat_lon_key" ON "MissionLocation"("lat", "lon");

-- AddForeignKey
ALTER TABLE "Extra" ADD CONSTRAINT "Extra_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLocation" ADD CONSTRAINT "UserLocation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMission" ADD CONSTRAINT "UserMission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
