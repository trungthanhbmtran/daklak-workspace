-- AlterTable
ALTER TABLE `sys_menus` ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `icon_color` VARCHAR(191) NULL;

-- RenameIndex
ALTER TABLE `job_titles` RENAME INDEX `job_titles_domain_id_fkey` TO `job_titles_domain_id_idx`;

-- RenameIndex
ALTER TABLE `job_titles` RENAME INDEX `job_titles_geographic_area_id_fkey` TO `job_titles_geographic_area_id_idx`;

-- RenameIndex
ALTER TABLE `job_titles` RENAME INDEX `job_titles_reports_to_position_id_fkey` TO `job_titles_reports_to_position_id_idx`;
