/*
  Warnings:

  - You are about to drop the column `contact_person` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `registration_number` on the `Company` table. All the data in the column will be lost.
  - Added the required column `contactFirstName` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactLastName` to the `Company` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Company" DROP COLUMN "contact_person",
DROP COLUMN "registration_number",
ADD COLUMN     "contactFirstName" TEXT NOT NULL,
ADD COLUMN     "contactLastName" TEXT NOT NULL,
ADD COLUMN     "logoId" TEXT,
ALTER COLUMN "company_phone" DROP NOT NULL;
