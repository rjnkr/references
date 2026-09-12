/*
  Warnings:

  - You are about to drop the column `pipedriveUrl` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `systemUrl` on the `systems` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `projects` DROP COLUMN `pipedriveUrl`;

-- AlterTable
ALTER TABLE `systems` DROP COLUMN `systemUrl`;

-- CreateTable
CREATE TABLE `project_urls` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `projectId` INTEGER NOT NULL,
    `urlTypeId` INTEGER NOT NULL,
    `description` VARCHAR(255) NULL,
    `url` VARCHAR(500) NOT NULL,

    INDEX `project_urls_projectId_idx`(`projectId`),
    INDEX `project_urls_urlTypeId_idx`(`urlTypeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_urls` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `systemId` INTEGER NOT NULL,
    `urlTypeId` INTEGER NOT NULL,
    `description` VARCHAR(255) NULL,
    `url` VARCHAR(500) NOT NULL,

    INDEX `system_urls_systemId_idx`(`systemId`),
    INDEX `system_urls_urlTypeId_idx`(`urlTypeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `project_urls` ADD CONSTRAINT `project_urls_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_urls` ADD CONSTRAINT `project_urls_urlTypeId_fkey` FOREIGN KEY (`urlTypeId`) REFERENCES `url_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `system_urls` ADD CONSTRAINT `system_urls_systemId_fkey` FOREIGN KEY (`systemId`) REFERENCES `systems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `system_urls` ADD CONSTRAINT `system_urls_urlTypeId_fkey` FOREIGN KEY (`urlTypeId`) REFERENCES `url_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
