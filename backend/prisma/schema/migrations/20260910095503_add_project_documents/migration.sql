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

-- AddForeignKey
ALTER TABLE `project_documents` ADD CONSTRAINT `project_documents_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_documents` ADD CONSTRAINT `project_documents_documentTypeId_fkey` FOREIGN KEY (`documentTypeId`) REFERENCES `document_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
