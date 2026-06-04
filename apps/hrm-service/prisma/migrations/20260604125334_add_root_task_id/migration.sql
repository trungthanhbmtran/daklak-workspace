-- AlterTable: TEXT/BLOB columns cannot have DEFAULT in MySQL, so split into separate statements
ALTER TABLE `tasks` ADD COLUMN `co_assignee_codes` TEXT NULL,
    ADD COLUMN `progress` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `root_task_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_root_task_id_fkey` FOREIGN KEY (`root_task_id`) REFERENCES `tasks`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
