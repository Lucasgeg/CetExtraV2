/*
  Warnings:

 - Manually edited to rename columns in the Mission table from snake_case to camelCase.

*/
-- RenameColumn
ALTER TABLE "Mission" RENAME COLUMN "mission_start_date" TO "missionStartDate";
ALTER TABLE "Mission" RENAME COLUMN "mission_end_date" TO "missionEndDate";