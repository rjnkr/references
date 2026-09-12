-- AlterTable
ALTER TABLE `projects` ADD COLUMN `endDate` DATE NULL,
    ADD COLUMN `name` VARCHAR(100) NULL,
    ADD COLUMN `tags` JSON NOT NULL;
