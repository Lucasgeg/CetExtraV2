/*
  Warnings:

  - You are about to drop the column `missionJob` on the `Extra` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Extra" DROP COLUMN "missionJob",
ADD COLUMN     "missionJobs" "MissionJob"[] DEFAULT ARRAY[]::"MissionJob"[];
