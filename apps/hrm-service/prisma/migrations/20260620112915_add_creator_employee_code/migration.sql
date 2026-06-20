-- AlterTable
ALTER TABLE `task_participants` ADD COLUMN `employee_code` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `tasks` ADD COLUMN `creator_employee_code` VARCHAR(191) NULL;
