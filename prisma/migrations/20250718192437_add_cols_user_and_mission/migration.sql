-- CreateEnum
CREATE TYPE "MissionStatus" AS ENUM ('pending', 'active', 'completed', 'cancelled');

-- AlterTable
ALTER TABLE "Mission" ADD COLUMN     "status" "MissionStatus" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profilePictureUrl" TEXT;
