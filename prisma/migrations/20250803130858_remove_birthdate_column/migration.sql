/*
  Warnings:

  - You are about to drop the column `birthdate` on the `Extra` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Extra" DROP COLUMN "birthdate",
ALTER COLUMN "birthdateIso" DROP DEFAULT;
