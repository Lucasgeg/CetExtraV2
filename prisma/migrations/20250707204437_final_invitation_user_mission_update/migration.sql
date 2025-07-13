/*
  Warnings:

  - You are about to drop the column `duration` on the `Invitation` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `UserMission` table. All the data in the column will be lost.
  - Made the column `missionEndDate` on table `Invitation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `missionEndDate` on table `UserMission` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Invitation" DROP COLUMN "duration",
ALTER COLUMN "missionEndDate" SET NOT NULL;

-- AlterTable
ALTER TABLE "UserMission" DROP COLUMN "duration",
ALTER COLUMN "missionEndDate" SET NOT NULL;
