
-- DropForeignKey
ALTER TABLE `project_documents` DROP FOREIGN KEY `project_documents_documentTypeId_fkey`;

-- DropForeignKey
ALTER TABLE `project_documents` DROP FOREIGN KEY `project_documents_projectId_fkey`;

-- DropForeignKey
ALTER TABLE `project_external_interfaces` DROP FOREIGN KEY `project_external_interfaces_projectId_fkey`;

-- DropForeignKey
ALTER TABLE `project_modules` DROP FOREIGN KEY `project_modules_projectId_fkey`;

-- DropForeignKey
ALTER TABLE `project_people` DROP FOREIGN KEY `project_people_projectId_fkey`;

-- DropForeignKey
ALTER TABLE `project_ports` DROP FOREIGN KEY `project_ports_projectId_fkey`;

-- DropForeignKey
ALTER TABLE `project_ports` DROP FOREIGN KEY `project_ports_unlocodeId_fkey`;

-- DropForeignKey
ALTER TABLE `project_sub_systems` DROP FOREIGN KEY `project_sub_systems_projectId_fkey`;

-- DropForeignKey
ALTER TABLE `projects` DROP FOREIGN KEY `projects_countryId_fkey`;

-- DropForeignKey
ALTER TABLE `projects` DROP FOREIGN KEY `projects_systemUnlocodeId_fkey`;

-- DropIndex
DROP INDEX `projects_canBeUsedAsReference_idx` ON `projects`;

-- DropIndex
DROP INDEX `projects_countryId_idx` ON `projects`;

-- DropIndex
DROP INDEX `projects_projectType_idx` ON `projects`;

-- DropIndex
DROP INDEX `projects_systemUnlocodeId_idx` ON `projects`;

-- AlterTable
ALTER TABLE `projects` DROP COLUMN `canBeUsedAsReference`,
    DROP COLUMN `countryId`,
    DROP COLUMN `customerDetails`,
    DROP COLUMN `description`,
    DROP COLUMN `endUserDetails`,
    DROP COLUMN `isSensitive`,
    DROP COLUMN `name`,
    DROP COLUMN `pocEmail`,
    DROP COLUMN `pocName`,
    DROP COLUMN `pocPhone`,
    DROP COLUMN `products`,
    DROP COLUMN `projectType`,
    DROP COLUMN `projectUrl`,
    DROP COLUMN `scope`,
    DROP COLUMN `showOnMap`,
    DROP COLUMN `systemDecommissioned`,
    DROP COLUMN `systemUnlocodeId`;

-- DropTable
DROP TABLE `project_documents`;

-- DropTable
DROP TABLE `project_external_interfaces`;

-- DropTable
DROP TABLE `project_modules`;

-- DropTable
DROP TABLE `project_people`;

-- DropTable
DROP TABLE `project_ports`;

-- DropTable
DROP TABLE `project_sub_systems`;

