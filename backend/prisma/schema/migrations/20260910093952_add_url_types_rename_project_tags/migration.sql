-- CreateTable
CREATE TABLE `url_types` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `url_types_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- RenameColumn (CHANGE COLUMN preserves the existing valid JSON data)
ALTER TABLE `projects` CHANGE COLUMN `tags` `projectType` JSON NOT NULL;
