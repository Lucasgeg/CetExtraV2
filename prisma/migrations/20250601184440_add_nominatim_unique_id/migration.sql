/*
  Warnings:

  - The primary key for the `MissionLocation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `UserLocation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[nominatimId]` on the table `MissionLocation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nominatimId]` on the table `UserLocation` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Mission" DROP CONSTRAINT "Mission_missionLocationId_fkey";

-- AlterTable
ALTER TABLE "Mission" ALTER COLUMN "missionLocationId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "MissionLocation" DROP CONSTRAINT "MissionLocation_pkey",
ADD COLUMN     "nominatimId" INTEGER,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "MissionLocation_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "MissionLocation_id_seq";

-- AlterTable
ALTER TABLE "UserLocation" DROP CONSTRAINT "UserLocation_pkey",
ADD COLUMN     "nominatimId" INTEGER,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "UserLocation_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "UserLocation_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "MissionLocation_nominatimId_key" ON "MissionLocation"("nominatimId");

-- CreateIndex
CREATE UNIQUE INDEX "UserLocation_nominatimId_key" ON "UserLocation"("nominatimId");

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_missionLocationId_fkey" FOREIGN KEY ("missionLocationId") REFERENCES "MissionLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
