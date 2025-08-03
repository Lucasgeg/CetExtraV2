-- AlterTable
ALTER TABLE "UserLocation" ADD COLUMN     "latEncrypted" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "lonEncrypted" TEXT NOT NULL DEFAULT '';
