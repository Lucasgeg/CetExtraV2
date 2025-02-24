/*
  Warnings:

  - You are about to drop the column `birthdate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `first_name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `max_travel_distance` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `missionJob` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Mission" DROP CONSTRAINT "Mission_creatorId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "birthdate",
DROP COLUMN "first_name",
DROP COLUMN "last_name",
DROP COLUMN "max_travel_distance",
DROP COLUMN "missionJob",
DROP COLUMN "phone",
ALTER COLUMN "role" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Extra" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "birthdate" TIMESTAMP(3) NOT NULL,
    "phone" TEXT,
    "missionJob" "MissionJob" NOT NULL DEFAULT 'waiter',
    "max_travel_distance" INTEGER NOT NULL,

    CONSTRAINT "Extra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "registration_number" TEXT NOT NULL,
    "contact_person" TEXT NOT NULL,
    "company_phone" TEXT NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Extra_userId_key" ON "Extra"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_userId_key" ON "Company"("userId");

-- AddForeignKey
ALTER TABLE "Extra" ADD CONSTRAINT "Extra_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
