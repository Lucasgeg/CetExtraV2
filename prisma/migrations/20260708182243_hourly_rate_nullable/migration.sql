-- AlterTable
ALTER TABLE "Invitation" ALTER COLUMN "hourlyRate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserMission" ALTER COLUMN "hourlyRate" DROP NOT NULL;

-- Backfill : 0 était une sentinelle « taux pas encore convenu » (jamais un vrai taux)
UPDATE "Invitation" SET "hourlyRate" = NULL WHERE "hourlyRate" = 0;
UPDATE "UserMission" SET "hourlyRate" = NULL WHERE "hourlyRate" = 0;
