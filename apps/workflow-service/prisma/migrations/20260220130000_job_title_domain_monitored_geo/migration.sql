-- AlterTable job_titles: thêm khu vực địa lý phụ trách (group GEO_AREA)
ALTER TABLE `job_titles` ADD COLUMN `geographic_area_id` INTEGER NULL;

-- CreateTable job_title_monitored_units: chức danh theo dõi phòng ban (nhiều đơn vị)
CREATE TABLE `job_title_monitored_units` (
    `job_title_id` INTEGER NOT NULL,
    `unit_id` INTEGER NOT NULL,

    PRIMARY KEY (`job_title_id`, `unit_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `job_titles` ADD CONSTRAINT `job_titles_geographic_area_id_fkey` FOREIGN KEY (`geographic_area_id`) REFERENCES `sys_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `job_title_monitored_units` ADD CONSTRAINT `job_title_monitored_units_job_title_id_fkey` FOREIGN KEY (`job_title_id`) REFERENCES `job_titles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `job_title_monitored_units` ADD CONSTRAINT `job_title_monitored_units_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `organization_units`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
