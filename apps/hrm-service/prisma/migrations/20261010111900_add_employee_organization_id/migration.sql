-- Persist the employee tenant projection added to the Prisma Employee model.
ALTER TABLE `employees`
  ADD COLUMN `organization_id` VARCHAR(191) NOT NULL DEFAULT 'DEFAULT';
