-- AlterTable
ALTER TABLE `projects` ADD COLUMN `systemUnlocodeId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `projects_systemUnlocodeId_idx` ON `projects`(`systemUnlocodeId`);

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_systemUnlocodeId_fkey` FOREIGN KEY (`systemUnlocodeId`) REFERENCES `un_locodes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
