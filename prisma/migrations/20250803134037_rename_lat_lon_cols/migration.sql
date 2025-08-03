/*
  Warnings:

  - You are about to drop the column `latEncrypted` on the `UserLocation` table. All the data in the column will be lost.
  - You are about to drop the column `lonEncrypted` on the `UserLocation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserLocation" RENAME COLUMN "latEncrypted" TO "lat";
ALTER TABLE "UserLocation" RENAME COLUMN "lonEncrypted" TO "lon";