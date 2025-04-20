/*
  Warnings:

  - You are about to drop the column `missionId` on the `MissionLocation` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Mission_missionLocationId_key";

-- DropIndex
DROP INDEX "MissionLocation_missionId_key";

-- AlterTable
ALTER TABLE "MissionLocation" DROP COLUMN "missionId";
