-- AlterTable organization_units: 3 yếu tố cốt lõi Đơn vị (Lĩnh vực quản lý, Phạm vi quản lý; Lãnh đạo qua JobPosition)
ALTER TABLE `organization_units` ADD COLUMN `domain_sector` VARCHAR(191) NULL;
ALTER TABLE `organization_units` ADD COLUMN `scope` VARCHAR(191) NULL;

-- AlterTable job_titles: 3 yếu tố cốt lõi Chức danh / Vị trí việc làm (Lĩnh vực nghiệp vụ, Phạm vi quyền hạn, Cấp báo cáo)
ALTER TABLE `job_titles` ADD COLUMN `business_domain` VARCHAR(191) NULL;
ALTER TABLE `job_titles` ADD COLUMN `authority_scope` VARCHAR(191) NULL;
ALTER TABLE `job_titles` ADD COLUMN `reports_to_job_title_id` INTEGER NULL;

-- AlterTable job_positions: Lãnh đạo đơn vị (ai là Giám đốc/Trưởng phòng, ai là cấp phó)
ALTER TABLE `job_positions` ADD COLUMN `is_unit_leader` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `job_positions` ADD COLUMN `is_deputy_leader` BOOLEAN NOT NULL DEFAULT false;

-- FK: Chức danh báo cáo lên chức danh nào
ALTER TABLE `job_titles` ADD CONSTRAINT `job_titles_reports_to_job_title_id_fkey` FOREIGN KEY (`reports_to_job_title_id`) REFERENCES `job_titles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
