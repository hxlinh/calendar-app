/*
  Warnings:

  - You are about to drop the column `isDeleted` on the `event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `event` DROP COLUMN `isDeleted`,
    ADD COLUMN `DeletedAt` DATETIME(3) NULL,
    MODIFY `location` VARCHAR(191) NULL,
    MODIFY `description` VARCHAR(191) NULL;
