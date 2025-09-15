/*
  Warnings:

  - Added the required column `originalEndTime` to the `EventOverride` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalStartTime` to the `EventOverride` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `eventoverride` ADD COLUMN `originalEndTime` DATETIME(3) NOT NULL,
    ADD COLUMN `originalStartTime` DATETIME(3) NOT NULL;
