-- AlterTable
ALTER TABLE `project_audit_logs` MODIFY `action` ENUM('CREATE', 'UPDATE', 'DELETE', 'RESTORE') NOT NULL;

-- AlterTable
ALTER TABLE `projects` ADD COLUMN `deleted` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `projects_deleted_idx` ON `projects`(`deleted`);
