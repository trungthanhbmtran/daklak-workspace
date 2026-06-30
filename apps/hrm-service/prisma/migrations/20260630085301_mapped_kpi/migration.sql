-- AlterTable
ALTER TABLE `tasks` ADD COLUMN `kpi_criteria_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_kpi_criteria_id_fkey` FOREIGN KEY (`kpi_criteria_id`) REFERENCES `kpi_criteria`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
