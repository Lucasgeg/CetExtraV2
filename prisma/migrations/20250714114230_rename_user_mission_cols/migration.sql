/*
  Warnings:

  - You are about to drop the column `created_at` on the `UserMission` table. All the data in the column will be lost.
  - You are about to drop the column `hourly_rate` on the `UserMission` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `UserMission` table. All the data in the column will be lost.
  - Added the required column `hourlyRate` to the `UserMission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `UserMission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserMission" 
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "hourlyRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "UserMission" 
SET "createdAt" = "created_at",
    "hourlyRate" = "hourly_rate",
    "updatedAt" = "updated_at";

ALTER TABLE "UserMission" 
DROP COLUMN "created_at",
DROP COLUMN "hourly_rate",
DROP COLUMN "updated_at";