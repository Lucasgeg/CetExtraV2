/*
  Warnings:

  - You are about to drop the column `start_date` on the `UserMission` table. All the data in the column will be lost.
  - Added the required column `duration` to the `Invitation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hourlyRate` to the `Invitation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `missionJob` to the `Invitation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `missionStartDate` to the `Invitation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `missionStartDate` to the `UserMission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "hourlyRate" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "missionJob" "MissionJob" NOT NULL,
ADD COLUMN     "missionStartDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "UserMission" RENAME COLUMN "start_date" TO "missionStartDate";

