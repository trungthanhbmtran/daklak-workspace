-- Chức danh áp dụng cho loại đơn vị nào (Chủ tịch chỉ UBND, Giám đốc chỉ Sở,...)
CREATE TABLE `job_title_unit_types` (
    `job_title_id` INTEGER NOT NULL,
    `unit_type_id` INTEGER NOT NULL,

    PRIMARY KEY (`job_title_id`, `unit_type_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `job_title_unit_types` ADD CONSTRAINT `job_title_unit_types_job_title_id_fkey` FOREIGN KEY (`job_title_id`) REFERENCES `job_titles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `job_title_unit_types` ADD CONSTRAINT `job_title_unit_types_unit_type_id_fkey` FOREIGN KEY (`unit_type_id`) REFERENCES `sys_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
