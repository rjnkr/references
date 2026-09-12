-- CreateTable
CREATE TABLE `project_audit_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `projectId` INTEGER NOT NULL,
    `projectNumber` VARCHAR(50) NULL,
    `projectName` VARCHAR(100) NOT NULL,
    `action` ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    `beforeData` JSON NULL,
    `afterData` JSON NULL,
    `changedFields` JSON NULL,
    `userId` INTEGER NULL,
    `userEmail` VARCHAR(255) NOT NULL,
    `userName` VARCHAR(150) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `project_audit_logs_projectId_idx`(`projectId`),
    INDEX `project_audit_logs_createdAt_idx`(`createdAt`),
    INDEX `project_audit_logs_action_idx`(`action`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
