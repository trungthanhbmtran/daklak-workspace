-- Drop foreign keys from employees (references to departments, job_titles)
ALTER TABLE `employees` DROP FOREIGN KEY `employees_department_id_fkey`;
ALTER TABLE `employees` DROP FOREIGN KEY `employees_job_title_id_fkey`;

-- Drop tables that moved to user-service (order: positions -> job_titles -> departments)
DROP TABLE IF EXISTS `positions`;
DROP TABLE IF EXISTS `job_titles`;
DROP TABLE IF EXISTS `departments`;
