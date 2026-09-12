-- CreateTable
CREATE TABLE `countries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `isoCode` VARCHAR(2) NOT NULL,
    `name` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `countries_isoCode_key`(`isoCode`),
    UNIQUE INDEX `countries_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `currencies` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(3) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `symbol` VARCHAR(8) NULL,

    UNIQUE INDEX `currencies_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `document_types` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `document_types_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `projects` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `projectNumber` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `awardDate` DATE NOT NULL,
    `implementationPrice` INTEGER NOT NULL,
    `maintenancePricePerYear` INTEGER NOT NULL,
    `currencyId` INTEGER NOT NULL,
    `scope` TEXT NOT NULL,
    `projectType` ENUM('PMIS', 'VTS', 'COASTAL', 'PILOT', 'OTHER') NOT NULL,
    `products` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `customerDetails` TEXT NULL,
    `endUserDetails` TEXT NULL,
    `countryId` INTEGER NOT NULL,
    `pocName` VARCHAR(150) NULL,
    `pocEmail` VARCHAR(150) NULL,
    `pocPhone` VARCHAR(50) NULL,
    `newDevelopments` TEXT NULL,
    `implementationDetails` TEXT NULL,
    `pipedriveNumber` VARCHAR(50) NULL,
    `pipedriveUrl` VARCHAR(500) NULL,
    `isSensitive` BOOLEAN NOT NULL DEFAULT false,
    `canBeUsedAsReference` BOOLEAN NOT NULL DEFAULT false,
    `systemDecommissioned` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `projects_projectNumber_key`(`projectNumber`),
    INDEX `projects_currencyId_idx`(`currencyId`),
    INDEX `projects_countryId_idx`(`countryId`),
    INDEX `projects_projectType_idx`(`projectType`),
    INDEX `projects_canBeUsedAsReference_idx`(`canBeUsedAsReference`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_completion_dates` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `projectId` INTEGER NOT NULL,
    `completionDate` DATE NOT NULL,
    `description` VARCHAR(150) NULL,

    INDEX `project_completion_dates_projectId_idx`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_documents` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `projectId` INTEGER NOT NULL,
    `documentTypeId` INTEGER NOT NULL,
    `fileName` VARCHAR(255) NOT NULL,
    `filePath` VARCHAR(500) NOT NULL,
    `fileSize` INTEGER NOT NULL,
    `mimeType` VARCHAR(150) NOT NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `uploadedBy` VARCHAR(255) NULL,

    INDEX `project_documents_projectId_idx`(`projectId`),
    INDEX `project_documents_documentTypeId_idx`(`documentTypeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_external_interfaces` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `projectId` INTEGER NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `description` TEXT NULL,

    INDEX `project_external_interfaces_projectId_idx`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_modules` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `projectId` INTEGER NOT NULL,
    `name` VARCHAR(150) NOT NULL,

    INDEX `project_modules_projectId_idx`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_people` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `projectId` INTEGER NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `role` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NULL,

    INDEX `project_people_projectId_idx`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_ports` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `projectId` INTEGER NOT NULL,
    `unlocodeId` INTEGER NOT NULL,

    INDEX `project_ports_unlocodeId_idx`(`unlocodeId`),
    UNIQUE INDEX `project_ports_projectId_unlocodeId_key`(`projectId`, `unlocodeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_sub_systems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `projectId` INTEGER NOT NULL,
    `name` VARCHAR(150) NOT NULL,

    INDEX `project_sub_systems_projectId_idx`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `un_locodes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(5) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `countryId` INTEGER NULL,

    UNIQUE INDEX `un_locodes_code_key`(`code`),
    INDEX `un_locodes_countryId_idx`(`countryId`),
    INDEX `un_locodes_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `name` VARCHAR(150) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastLoginAt` DATETIME(3) NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_currencyId_fkey` FOREIGN KEY (`currencyId`) REFERENCES `currencies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_countryId_fkey` FOREIGN KEY (`countryId`) REFERENCES `countries`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_completion_dates` ADD CONSTRAINT `project_completion_dates_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_documents` ADD CONSTRAINT `project_documents_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_documents` ADD CONSTRAINT `project_documents_documentTypeId_fkey` FOREIGN KEY (`documentTypeId`) REFERENCES `document_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_external_interfaces` ADD CONSTRAINT `project_external_interfaces_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_modules` ADD CONSTRAINT `project_modules_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_people` ADD CONSTRAINT `project_people_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_ports` ADD CONSTRAINT `project_ports_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_ports` ADD CONSTRAINT `project_ports_unlocodeId_fkey` FOREIGN KEY (`unlocodeId`) REFERENCES `un_locodes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_sub_systems` ADD CONSTRAINT `project_sub_systems_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `un_locodes` ADD CONSTRAINT `un_locodes_countryId_fkey` FOREIGN KEY (`countryId`) REFERENCES `countries`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
