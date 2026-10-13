-- AlterTable
ALTER TABLE `rank_quotas` 
  ADD COLUMN `department_id` INTEGER NULL,
  ADD COLUMN `unit_code` VARCHAR(191) NULL,
  ADD COLUMN `monthly_target` DOUBLE NULL DEFAULT 0,
  ADD COLUMN `quarterly_target` DOUBLE NULL DEFAULT 0,
  ADD COLUMN `yearly_target` DOUBLE NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX `rank_quotas_department_id_idx` ON `rank_quotas`(`department_id`);
CREATE INDEX `rank_quotas_rank_code_domain_code_idx` ON `rank_quotas`(`rank_code`, `domain_code`);
