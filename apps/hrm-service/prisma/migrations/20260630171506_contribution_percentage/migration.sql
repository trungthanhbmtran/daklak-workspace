-- AlterTable
ALTER TABLE `task_participants` ADD COLUMN `contribution_percentage` DOUBLE NOT NULL DEFAULT 100.0;

-- AddForeignKey
ALTER TABLE `task_participants` ADD CONSTRAINT `task_participants_employee_code_fkey` FOREIGN KEY (`employee_code`) REFERENCES `employees`(`employee_code`) ON DELETE RESTRICT ON UPDATE CASCADE;
