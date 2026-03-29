-- Đơn vị: Thay domain_sector (text) bằng domain_id (FK danh mục Lĩnh vực)
-- (Chạy sau migration 20260220100000; nếu chưa có domain_sector thì bỏ qua dòng DROP hoặc chạy tay)
ALTER TABLE `organization_units` DROP COLUMN `domain_sector`;
ALTER TABLE `organization_units` ADD COLUMN `domain_id` INTEGER NULL;
ALTER TABLE `organization_units` ADD CONSTRAINT `organization_units_domain_id_fkey` FOREIGN KEY (`domain_id`) REFERENCES `sys_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Chức danh: Thay business_domain/authority_scope bằng domain_id + authority_level
ALTER TABLE `job_titles` DROP COLUMN `business_domain`;
ALTER TABLE `job_titles` DROP COLUMN `authority_scope`;
ALTER TABLE `job_titles` ADD COLUMN `domain_id` INTEGER NULL;
ALTER TABLE `job_titles` ADD COLUMN `authority_level` VARCHAR(191) NULL;

-- Đổi tên cột báo cáo: reports_to_job_title_id -> reports_to_position_id (xóa FK cũ trước)
ALTER TABLE `job_titles` DROP FOREIGN KEY `job_titles_reports_to_job_title_id_fkey`;
ALTER TABLE `job_titles` CHANGE COLUMN `reports_to_job_title_id` `reports_to_position_id` INTEGER NULL;
ALTER TABLE `job_titles` ADD CONSTRAINT `job_titles_reports_to_position_id_fkey` FOREIGN KEY (`reports_to_position_id`) REFERENCES `job_titles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- FK: Chức danh - Lĩnh vực chuyên môn (danh mục)
ALTER TABLE `job_titles` ADD CONSTRAINT `job_titles_domain_id_fkey` FOREIGN KEY (`domain_id`) REFERENCES `sys_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
