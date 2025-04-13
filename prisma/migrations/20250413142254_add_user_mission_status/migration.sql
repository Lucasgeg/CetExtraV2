/*
  Warnings:

  - Added the required column `status` to the `UserMission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `UserMission` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserMissionStatus" AS ENUM ('pending', 'accepted', 'refused');

-- AlterTable
ALTER TABLE "UserMission" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" "UserMissionStatus" NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
