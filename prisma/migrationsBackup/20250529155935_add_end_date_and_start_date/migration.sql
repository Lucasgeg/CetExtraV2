/*
  Warnings:

  - You are about to drop the column `mission_date` on the `Mission` table. All the data in the column will be lost.
  - Added the required column `mission_end_date` to the `Mission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mission_start_date` to the `Mission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Mission" DROP COLUMN "mission_date",
ADD COLUMN     "mission_end_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "mission_start_date" TIMESTAMP(3) NOT NULL;
