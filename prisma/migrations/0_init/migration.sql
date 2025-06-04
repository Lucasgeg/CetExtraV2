-- CreateEnum
CREATE TYPE "MissionJob" AS ENUM ('waiter', 'cook');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('extra', 'company');

-- CreateEnum
CREATE TYPE "UserMissionStatus" AS ENUM ('pending', 'accepted', 'refused');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "clerkId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Extra" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "birthdate" TIMESTAMP(3) NOT NULL,
    "phone" TEXT,
    "missionJob" "MissionJob" NOT NULL DEFAULT 'waiter',
    "max_travel_distance" INTEGER NOT NULL,

    CONSTRAINT "Extra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "company_phone" TEXT,
    "contactFirstName" TEXT NOT NULL,
    "contactLastName" TEXT NOT NULL,
    "logoId" TEXT,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequiredPosition" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "jobType" "MissionJob" NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "RequiredPosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "mission_start_date" TIMESTAMP(3) NOT NULL,
    "mission_end_date" TIMESTAMP(3) NOT NULL,
    "creatorId" TEXT NOT NULL,
    "missionLocationId" INTEGER,

    CONSTRAINT "Mission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLocation" (
    "lat" DOUBLE PRECISION NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "fullName" TEXT NOT NULL,
    "userId" TEXT,
    "userLocationId" TEXT,
    "id" SERIAL NOT NULL,

    CONSTRAINT "UserLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MissionLocation" (
    "lat" DOUBLE PRECISION NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "fullName" TEXT NOT NULL,
    "id" SERIAL NOT NULL,

    CONSTRAINT "MissionLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserMission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "missionJob" "MissionJob" NOT NULL,
    "duration" INTEGER NOT NULL,
    "hourly_rate" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "UserMissionStatus" NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserMission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorName" TEXT NOT NULL DEFAULT 'Cet Extra',
    "shortDesc" TEXT NOT NULL DEFAULT '',
    "keywords" TEXT[],
    "email_subject" TEXT NOT NULL DEFAULT 'Cet Extra',
    "shortUrl" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postId" TEXT NOT NULL,
    "author" TEXT NOT NULL,

    CONSTRAINT "BlogComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogSubscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subscribed" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogSubscriber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "Extra_userId_key" ON "Extra"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_userId_key" ON "Company"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RequiredPosition_missionId_jobType_key" ON "RequiredPosition"("missionId", "jobType");

-- CreateIndex
CREATE UNIQUE INDEX "UserLocation_userId_key" ON "UserLocation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserLocation_userLocationId_key" ON "UserLocation"("userLocationId");

-- CreateIndex
CREATE UNIQUE INDEX "UserMission_userId_missionId_key" ON "UserMission"("userId", "missionId");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_shortUrl_key" ON "BlogPost"("shortUrl");

-- CreateIndex
CREATE UNIQUE INDEX "BlogSubscriber_email_key" ON "BlogSubscriber"("email");

-- CreateIndex
CREATE INDEX "BlogSubscriber_email_idx" ON "BlogSubscriber"("email");

-- AddForeignKey
ALTER TABLE "Extra" ADD CONSTRAINT "Extra_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequiredPosition" ADD CONSTRAINT "RequiredPosition_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_missionLocationId_fkey" FOREIGN KEY ("missionLocationId") REFERENCES "MissionLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLocation" ADD CONSTRAINT "UserLocation_userLocationId_fkey" FOREIGN KEY ("userLocationId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMission" ADD CONSTRAINT "UserMission_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMission" ADD CONSTRAINT "UserMission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogComment" ADD CONSTRAINT "BlogComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

