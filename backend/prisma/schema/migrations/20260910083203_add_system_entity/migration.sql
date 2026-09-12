-- AlterTable
ALTER TABLE `projects` ADD COLUMN `systemId` INTEGER NULL;

-- CreateTable
CREATE TABLE `systems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `scope` TEXT NOT NULL,
    `projectType` ENUM('PMIS', 'VTS', 'AIS', 'COASTAL', 'PILOT', 'OTHER') NOT NULL,
    `products` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `customerDetails` TEXT NULL,
    `endUserDetails` TEXT NULL,
    `countryId` INTEGER NOT NULL,
    `systemUnlocodeId` INTEGER NOT NULL,
    `pocName` VARCHAR(150) NULL,
    `pocEmail` VARCHAR(150) NULL,
    `pocPhone` VARCHAR(50) NULL,
    `systemUrl` VARCHAR(500) NULL,
    `isSensitive` BOOLEAN NOT NULL DEFAULT false,
    `canBeUsedAsReference` BOOLEAN NOT NULL DEFAULT false,
    `showOnMap` BOOLEAN NOT NULL DEFAULT true,
    `systemDecommissioned` BOOLEAN NOT NULL DEFAULT false,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `systems_countryId_idx`(`countryId`),
    INDEX `systems_systemUnlocodeId_idx`(`systemUnlocodeId`),
    INDEX `systems_projectType_idx`(`projectType`),
    INDEX `systems_canBeUsedAsReference_idx`(`canBeUsedAsReference`),
    INDEX `systems_deleted_idx`(`deleted`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_audit_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `systemId` INTEGER NOT NULL,
    `systemName` VARCHAR(100) NOT NULL,
    `action` ENUM('CREATE', 'UPDATE', 'DELETE', 'RESTORE') NOT NULL,
    `beforeData` JSON NULL,
    `afterData` JSON NULL,
    `changedFields` JSON NULL,
    `userId` INTEGER NULL,
    `userEmail` VARCHAR(255) NOT NULL,
    `userName` VARCHAR(150) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `system_audit_logs_systemId_idx`(`systemId`),
    INDEX `system_audit_logs_createdAt_idx`(`createdAt`),
    INDEX `system_audit_logs_action_idx`(`action`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_documents` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `systemId` INTEGER NOT NULL,
    `documentTypeId` INTEGER NOT NULL,
    `fileName` VARCHAR(255) NOT NULL,
    `filePath` VARCHAR(500) NOT NULL,
    `fileSize` INTEGER NOT NULL,
    `mimeType` VARCHAR(150) NOT NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `uploadedBy` VARCHAR(255) NULL,

    INDEX `system_documents_systemId_idx`(`systemId`),
    INDEX `system_documents_documentTypeId_idx`(`documentTypeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_external_interfaces` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `systemId` INTEGER NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `description` TEXT NULL,

    INDEX `system_external_interfaces_systemId_idx`(`systemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_modules` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `systemId` INTEGER NOT NULL,
    `name` VARCHAR(150) NOT NULL,

    INDEX `system_modules_systemId_idx`(`systemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_people` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `systemId` INTEGER NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `role` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NULL,

    INDEX `system_people_systemId_idx`(`systemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_ports` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `systemId` INTEGER NOT NULL,
    `unlocodeId` INTEGER NOT NULL,

    INDEX `system_ports_unlocodeId_idx`(`unlocodeId`),
    UNIQUE INDEX `system_ports_systemId_unlocodeId_key`(`systemId`, `unlocodeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_sub_systems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `systemId` INTEGER NOT NULL,
    `name` VARCHAR(150) NOT NULL,

    INDEX `system_sub_systems_systemId_idx`(`systemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `projects_systemId_idx` ON `projects`(`systemId`);

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_systemId_fkey` FOREIGN KEY (`systemId`) REFERENCES `systems`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `systems` ADD CONSTRAINT `systems_countryId_fkey` FOREIGN KEY (`countryId`) REFERENCES `countries`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `systems` ADD CONSTRAINT `systems_systemUnlocodeId_fkey` FOREIGN KEY (`systemUnlocodeId`) REFERENCES `un_locodes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `system_documents` ADD CONSTRAINT `system_documents_systemId_fkey` FOREIGN KEY (`systemId`) REFERENCES `systems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `system_documents` ADD CONSTRAINT `system_documents_documentTypeId_fkey` FOREIGN KEY (`documentTypeId`) REFERENCES `document_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `system_external_interfaces` ADD CONSTRAINT `system_external_interfaces_systemId_fkey` FOREIGN KEY (`systemId`) REFERENCES `systems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `system_modules` ADD CONSTRAINT `system_modules_systemId_fkey` FOREIGN KEY (`systemId`) REFERENCES `systems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `system_people` ADD CONSTRAINT `system_people_systemId_fkey` FOREIGN KEY (`systemId`) REFERENCES `systems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `system_ports` ADD CONSTRAINT `system_ports_systemId_fkey` FOREIGN KEY (`systemId`) REFERENCES `systems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `system_ports` ADD CONSTRAINT `system_ports_unlocodeId_fkey` FOREIGN KEY (`unlocodeId`) REFERENCES `un_locodes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `system_sub_systems` ADD CONSTRAINT `system_sub_systems_systemId_fkey` FOREIGN KEY (`systemId`) REFERENCES `systems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
