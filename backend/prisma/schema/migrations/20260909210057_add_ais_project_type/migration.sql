-- AlterTable
ALTER TABLE `projects` MODIFY `projectType` ENUM('PMIS', 'VTS', 'AIS', 'COASTAL', 'PILOT', 'OTHER') NOT NULL;
