/*
  Warnings:

  - A unique constraint covering the columns `[email,missionId]` on the table `Invitation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Invitation_email_missionId_key" ON "Invitation"("email", "missionId");
