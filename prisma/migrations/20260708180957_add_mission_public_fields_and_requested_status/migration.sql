-- AlterEnum
ALTER TYPE "UserMissionStatus" ADD VALUE 'requested';

-- AlterTable
ALTER TABLE "Mission" ADD COLUMN     "hourlyRateMax" DOUBLE PRECISION,
ADD COLUMN     "hourlyRateMin" DOUBLE PRECISION,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT true;
