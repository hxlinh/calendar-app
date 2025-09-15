-- AlterTable
ALTER TABLE `event` ADD COLUMN `repeatDate` INTEGER NULL,
    ADD COLUMN `repeatDays` VARCHAR(191) NULL,
    ADD COLUMN `repeatMonth` INTEGER NULL;
