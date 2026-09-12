-- AlterTable
ALTER TABLE `system_modules` DROP COLUMN `name`,
    ADD COLUMN `moduleId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `modules` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,

    UNIQUE INDEX `modules_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `system_modules_moduleId_idx` ON `system_modules`(`moduleId`);

-- CreateIndex
CREATE UNIQUE INDEX `system_modules_systemId_moduleId_key` ON `system_modules`(`systemId`, `moduleId`);

-- AddForeignKey
ALTER TABLE `system_modules` ADD CONSTRAINT `system_modules_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `modules`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
