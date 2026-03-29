-- CreateTable: Đơn vị - Nhiều lĩnh vực phụ trách (many-to-many)
CREATE TABLE IF NOT EXISTS `organization_unit_domains` (
    `unit_id` INTEGER NOT NULL,
    `domain_id` INTEGER NOT NULL,
    PRIMARY KEY (`unit_id`, `domain_id`),
    CONSTRAINT `organization_unit_domains_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `organization_units` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `organization_unit_domains_domain_id_fkey` FOREIGN KEY (`domain_id`) REFERENCES `sys_categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migrate existing domain_id into junction table
INSERT IGNORE INTO `organization_unit_domains` (`unit_id`, `domain_id`)
SELECT `id`, `domain_id` FROM `organization_units` WHERE `domain_id` IS NOT NULL;

-- Drop FK then column
ALTER TABLE `organization_units` DROP FOREIGN KEY `organization_units_domain_id_fkey`;
ALTER TABLE `organization_units` DROP COLUMN `domain_id`;
