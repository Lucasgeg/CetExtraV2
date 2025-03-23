/*
  Warnings:

  - You are about to drop the column `locationId` on the `Mission` table. All the data in the column will be lost.
  - You are about to drop the column `locationId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Location` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[missionLocationId]` on the table `Mission` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userLocationId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Mission" DROP CONSTRAINT "Mission_locationId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_locationId_fkey";

-- AlterTable
ALTER TABLE "Mission" DROP COLUMN "locationId",
ADD COLUMN     "missionLocationId" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "locationId",
ADD COLUMN     "userLocationId" TEXT;

-- DropTable
DROP TABLE "Location";

-- CreateTable
CREATE TABLE "UserLocation" (
    "id" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "fullName" TEXT,
    "userId" TEXT,

    CONSTRAINT "UserLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MissionLocation" (
    "id" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "fullName" TEXT,
    "missionId" TEXT NOT NULL,

    CONSTRAINT "MissionLocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserLocation_userId_key" ON "UserLocation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MissionLocation_missionId_key" ON "MissionLocation"("missionId");

-- CreateIndex
CREATE UNIQUE INDEX "Mission_missionLocationId_key" ON "Mission"("missionLocationId");

-- CreateIndex
CREATE UNIQUE INDEX "User_userLocationId_key" ON "User"("userLocationId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_userLocationId_fkey" FOREIGN KEY ("userLocationId") REFERENCES "UserLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_missionLocationId_fkey" FOREIGN KEY ("missionLocationId") REFERENCES "MissionLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
