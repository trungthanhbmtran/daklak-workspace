-- CreateTable
CREATE TABLE `organization_unit_monitored_units` (
    `unit_id` INTEGER NOT NULL,
    `monitored_unit_id` INTEGER NOT NULL,

    INDEX `organization_unit_monitored_units_monitored_unit_id_fkey`(`monitored_unit_id`),
    PRIMARY KEY (`unit_id`, `monitored_unit_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `organization_unit_monitored_units` ADD CONSTRAINT `organization_unit_monitored_units_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `organization_units`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `organization_unit_monitored_units` ADD CONSTRAINT `organization_unit_monitored_units_monitored_unit_id_fkey` FOREIGN KEY (`monitored_unit_id`) REFERENCES `organization_units`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
