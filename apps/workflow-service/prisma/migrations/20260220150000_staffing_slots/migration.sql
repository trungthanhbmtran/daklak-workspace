-- Phân công từng vị trí (mỗi phó có lĩnh vực, nhiệm vụ, khu vực riêng)
CREATE TABLE `staffing_slots` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `staffing_id` INTEGER NOT NULL,
    `slot_order` INTEGER NOT NULL,
    `description` VARCHAR(191) NULL,
    `geographic_area_id` INTEGER NULL,

    UNIQUE INDEX `staffing_slots_staffing_id_slot_order_key`(`staffing_id`, `slot_order`),
    INDEX `staffing_slots_staffing_id_idx`(`staffing_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `staffing_slot_domains` (
    `slot_id` INTEGER NOT NULL,
    `domain_id` INTEGER NOT NULL,

    PRIMARY KEY (`slot_id`, `domain_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `staffing_slot_monitored_units` (
    `slot_id` INTEGER NOT NULL,
    `unit_id` INTEGER NOT NULL,

    PRIMARY KEY (`slot_id`, `unit_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `staffing_slots` ADD CONSTRAINT `staffing_slots_staffing_id_fkey` FOREIGN KEY (`staffing_id`) REFERENCES `org_staffing`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `staffing_slots` ADD CONSTRAINT `staffing_slots_geographic_area_id_fkey` FOREIGN KEY (`geographic_area_id`) REFERENCES `sys_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `staffing_slot_domains` ADD CONSTRAINT `staffing_slot_domains_slot_id_fkey` FOREIGN KEY (`slot_id`) REFERENCES `staffing_slots`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `staffing_slot_domains` ADD CONSTRAINT `staffing_slot_domains_domain_id_fkey` FOREIGN KEY (`domain_id`) REFERENCES `sys_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `staffing_slot_monitored_units` ADD CONSTRAINT `staffing_slot_monitored_units_slot_id_fkey` FOREIGN KEY (`slot_id`) REFERENCES `staffing_slots`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `staffing_slot_monitored_units` ADD CONSTRAINT `staffing_slot_monitored_units_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `organization_units`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
