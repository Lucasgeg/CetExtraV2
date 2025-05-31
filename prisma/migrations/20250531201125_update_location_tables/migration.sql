/*
  Warnings:

  - The values [both] on the enum `MissionJob` will be removed. If these variants are still used in the database, this will fail.
  - The `missionLocationId` column on the `Mission` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `MissionLocation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `MissionLocation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `UserLocation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `UserLocation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `fullName` on table `MissionLocation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fullName` on table `UserLocation` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MissionJob_new" AS ENUM ('waiter', 'cook');
ALTER TABLE "Extra" ALTER COLUMN "missionJob" DROP DEFAULT;
ALTER TABLE "Extra" ALTER COLUMN "missionJob" TYPE "MissionJob_new" USING ("missionJob"::text::"MissionJob_new");
ALTER TABLE "RequiredPosition" ALTER COLUMN "jobType" TYPE "MissionJob_new" USING ("jobType"::text::"MissionJob_new");
ALTER TABLE "UserMission" ALTER COLUMN "missionJob" TYPE "MissionJob_new" USING ("missionJob"::text::"MissionJob_new");
ALTER TYPE "MissionJob" RENAME TO "MissionJob_old";
ALTER TYPE "MissionJob_new" RENAME TO "MissionJob";
DROP TYPE "MissionJob_old";
ALTER TABLE "Extra" ALTER COLUMN "missionJob" SET DEFAULT 'waiter';
COMMIT;

-- DropForeignKey
ALTER TABLE "Mission" DROP CONSTRAINT "Mission_missionLocationId_fkey";

-- AlterTable
ALTER TABLE "Mission" DROP COLUMN "missionLocationId",
ADD COLUMN     "missionLocationId" INTEGER;

-- AlterTable
ALTER TABLE "MissionLocation" DROP CONSTRAINT "MissionLocation_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "fullName" SET NOT NULL,
ADD CONSTRAINT "MissionLocation_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "UserLocation" DROP CONSTRAINT "UserLocation_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "fullName" SET NOT NULL,
ADD CONSTRAINT "UserLocation_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_missionLocationId_fkey" FOREIGN KEY ("missionLocationId") REFERENCES "MissionLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
