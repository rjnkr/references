-- CreateTable
CREATE TABLE `project_tag_assignments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `projectId` INTEGER NOT NULL,
    `tagId` INTEGER NOT NULL,

    INDEX `project_tag_assignments_tagId_idx`(`tagId`),
    UNIQUE INDEX `project_tag_assignments_projectId_tagId_key`(`projectId`, `tagId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_tag_assignments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `systemId` INTEGER NOT NULL,
    `tagId` INTEGER NOT NULL,

    INDEX `system_tag_assignments_tagId_idx`(`tagId`),
    UNIQUE INDEX `system_tag_assignments_systemId_tagId_key`(`systemId`, `tagId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tags` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(20) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `backgroundColor` VARCHAR(7) NOT NULL,
    `textColor` VARCHAR(7) NOT NULL,

    UNIQUE INDEX `tags_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `project_tag_assignments` ADD CONSTRAINT `project_tag_assignments_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_tag_assignments` ADD CONSTRAINT `project_tag_assignments_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `tags`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `system_tag_assignments` ADD CONSTRAINT `system_tag_assignments_systemId_fkey` FOREIGN KEY (`systemId`) REFERENCES `systems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `system_tag_assignments` ADD CONSTRAINT `system_tag_assignments_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `tags`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
