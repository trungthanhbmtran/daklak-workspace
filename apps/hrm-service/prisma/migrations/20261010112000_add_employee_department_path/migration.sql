-- Add the organization hierarchy path used to scope employee queries.
ALTER TABLE `employees`
  ADD COLUMN `department_path` VARCHAR(191) NULL,
  ADD INDEX `employees_department_path_idx` (`department_path`);
