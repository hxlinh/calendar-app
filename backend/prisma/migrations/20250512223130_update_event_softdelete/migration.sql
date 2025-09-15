/*
  Warnings:

  - You are about to drop the column `DeletedAt` on the `event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `event` DROP COLUMN `DeletedAt`,
    ADD COLUMN `deletedAt` DATETIME(3) NULL;
