/*
  Warnings:

  - A unique constraint covering the columns `[siret]` on the table `Company` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `siret` to the `Company` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BusinessSector" AS ENUM ('TRAITEUR', 'ORGANISATEUR_EVENEMENTS', 'SALLE_RECEPTION', 'RESTAURANT', 'HOTEL', 'CAFE', 'BAR', 'DISCOTEQUE', 'CASINO', 'CAMPING', 'AUTRE');

-- CreateEnum
CREATE TYPE "CollectiveAgreement" AS ENUM ('HCR', 'SYNTEC', 'EVENEMENTIEL', 'AUDIOVISUEL', 'SPORT', 'ANIMATION', 'TOURISME', 'AUTRE');

-- CreateEnum
CREATE TYPE "RetirementFund" AS ENUM ('AGIRC_ARRCO', 'IRCANTEC', 'CARCDSF', 'CIPAV', 'AUTRE');

-- CreateEnum
CREATE TYPE "ProvidentFund" AS ENUM ('AG2R', 'MALAKOFF_HUMANIS', 'APICIL', 'PRO_BTP', 'KLESIA', 'AUDIENS', 'AUTRE');

-- CreateEnum
CREATE TYPE "LegalRepresentativeFunction" AS ENUM ('GERANT', 'PRESIDENT', 'DIRECTEUR_GENERAL', 'ADMINISTRATEUR', 'ASSOCIE', 'MANDATAIRE', 'AUTRE');

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "billingAddress" TEXT,
ADD COLUMN     "businessSector" "BusinessSector" NOT NULL DEFAULT 'TRAITEUR',
ADD COLUMN     "collectiveAgreement" "CollectiveAgreement" NOT NULL DEFAULT 'HCR',
ADD COLUMN     "headOfficeAddress" TEXT NOT NULL DEFAULT 'adress',
ADD COLUMN     "insuranceDetails" TEXT,
ADD COLUMN     "legalRepresentativeFunction" "LegalRepresentativeFunction" NOT NULL DEFAULT 'GERANT',
ADD COLUMN     "profileCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "providentFund" "ProvidentFund",
ADD COLUMN     "retirementFund" "RetirementFund",
ADD COLUMN     "siret" TEXT,
ADD COLUMN     "urssafId" TEXT,
ALTER COLUMN "contactFirstName" SET DEFAULT 'firstName',
ALTER COLUMN "contactLastName" SET DEFAULT 'lastName';

UPDATE "Company" SET "siret" = "userId" WHERE "siret" IS NULL;

ALTER TABLE "Company" ALTER COLUMN "siret" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Company_siret_key" ON "Company"("siret");
