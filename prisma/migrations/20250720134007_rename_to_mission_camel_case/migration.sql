/*
  Warnings:

  - You are about to drop the column `mission_end_date` on the `Mission` table. All the data in the column will be lost.
  - You are about to drop the column `mission_start_date` on the `Mission` table. All the data in the column will be lost.
  - Added the required column `missionEndDate` to the `Mission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `missionStartDate` to the `Mission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- 1. D'abord ajouter les nouvelles colonnes
ALTER TABLE "Mission" ADD COLUMN "missionEndDate" TIMESTAMP(3);
ALTER TABLE "Mission" ADD COLUMN "missionStartDate" TIMESTAMP(3);

-- 2. Copier les données des anciennes colonnes vers les nouvelles
UPDATE "Mission" SET "missionEndDate" = "mission_end_date";
UPDATE "Mission" SET "missionStartDate" = "mission_start_date";

-- 3. Rendre les nouvelles colonnes NOT NULL maintenant que les données sont copiées
ALTER TABLE "Mission" ALTER COLUMN "missionEndDate" SET NOT NULL;
ALTER TABLE "Mission" ALTER COLUMN "missionStartDate" SET NOT NULL;

-- 4. Enfin, supprimer les anciennes colonnes
ALTER TABLE "Mission" DROP COLUMN "mission_end_date";
ALTER TABLE "Mission" DROP COLUMN "mission_start_date";