/*
  Warnings:

  - A unique constraint covering the columns `[shortUrl]` on the table `BlogPost` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_shortUrl_key" ON "BlogPost"("shortUrl");
