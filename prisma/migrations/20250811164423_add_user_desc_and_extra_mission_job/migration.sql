/*
  Warnings:

  - You are about to drop the column `missionJobs` on the `Extra` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MissionJob" ADD VALUE 'chefDeRang';
ALTER TYPE "MissionJob" ADD VALUE 'maitreHotel';
ALTER TYPE "MissionJob" ADD VALUE 'commisSalle';
ALTER TYPE "MissionJob" ADD VALUE 'runner';
ALTER TYPE "MissionJob" ADD VALUE 'bartender';
ALTER TYPE "MissionJob" ADD VALUE 'sommelier';
ALTER TYPE "MissionJob" ADD VALUE 'host';
ALTER TYPE "MissionJob" ADD VALUE 'diningManager';
ALTER TYPE "MissionJob" ADD VALUE 'chefDePartie';
ALTER TYPE "MissionJob" ADD VALUE 'commisKitchen';
ALTER TYPE "MissionJob" ADD VALUE 'sousChef';
ALTER TYPE "MissionJob" ADD VALUE 'dishwasher';
ALTER TYPE "MissionJob" ADD VALUE 'pastryChef';

-- AlterTable
ALTER TABLE "Extra" DROP COLUMN "missionJobs";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "description" TEXT;

-- CreateTable
CREATE TABLE "ExtraMissionJob" (
    "id" TEXT NOT NULL,
    "extraId" TEXT NOT NULL,
    "missionJob" "MissionJob" NOT NULL,
    "experience" INTEGER NOT NULL,

    CONSTRAINT "ExtraMissionJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExtraMissionJob_extraId_missionJob_key" ON "ExtraMissionJob"("extraId", "missionJob");

-- AddForeignKey
ALTER TABLE "ExtraMissionJob" ADD CONSTRAINT "ExtraMissionJob_extraId_fkey" FOREIGN KEY ("extraId") REFERENCES "Extra"("id") ON DELETE CASCADE ON UPDATE CASCADE;
