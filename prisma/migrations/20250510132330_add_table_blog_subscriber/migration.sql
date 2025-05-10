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
CREATE UNIQUE INDEX "BlogSubscriber_email_key" ON "BlogSubscriber"("email");

-- CreateIndex
CREATE INDEX "BlogSubscriber_email_idx" ON "BlogSubscriber"("email");
