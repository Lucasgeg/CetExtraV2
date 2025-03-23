/*
  Warnings:

  - You are about to drop the column `userLocationId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userLocationId]` on the table `UserLocation` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_userLocationId_fkey";

-- DropIndex
DROP INDEX "User_userLocationId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "userLocationId";

-- AlterTable
ALTER TABLE "UserLocation" ADD COLUMN     "userLocationId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "UserLocation_userLocationId_key" ON "UserLocation"("userLocationId");

-- AddForeignKey
ALTER TABLE "UserLocation" ADD CONSTRAINT "UserLocation_userLocationId_fkey" FOREIGN KEY ("userLocationId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
