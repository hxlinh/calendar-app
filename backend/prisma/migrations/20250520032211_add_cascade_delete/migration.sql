-- DropForeignKey
ALTER TABLE `eventoverride` DROP FOREIGN KEY `EventOverride_eventId_fkey`;

-- DropIndex
DROP INDEX `EventOverride_eventId_fkey` ON `eventoverride`;

-- AddForeignKey
ALTER TABLE `EventOverride` ADD CONSTRAINT `EventOverride_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
