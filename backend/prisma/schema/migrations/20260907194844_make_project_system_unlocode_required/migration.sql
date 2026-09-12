/*
  Warnings:

  - Made the column `systemUnlocodeId` on table `projects` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `projects` DROP FOREIGN KEY `projects_systemUnlocodeId_fkey`;

-- AlterTable
ALTER TABLE `projects` MODIFY `systemUnlocodeId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_systemUnlocodeId_fkey` FOREIGN KEY (`systemUnlocodeId`) REFERENCES `un_locodes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
