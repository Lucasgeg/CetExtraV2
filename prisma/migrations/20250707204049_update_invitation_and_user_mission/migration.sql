-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN     "missionEndDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "UserMission" ADD COLUMN     "missionEndDate" TIMESTAMP(3);

UPDATE "Invitation"
SET "missionEndDate" = "missionStartDate" + INTERVAL '1 hour' * "duration"
WHERE "missionEndDate" IS NULL;

UPDATE "UserMission"
SET "missionEndDate" = "missionStartDate" + INTERVAL '1 hour' * "duration"
WHERE "missionEndDate" IS NULL;

