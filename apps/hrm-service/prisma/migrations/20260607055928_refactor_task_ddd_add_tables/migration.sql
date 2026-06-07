/*
  Warnings:

  - You are about to drop the column `author_code` on the `task_comments` table. All the data in the column will be lost.
  - You are about to drop the column `completion_date` on the `tasks` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `task_comments` DROP FOREIGN KEY `task_comments_author_code_fkey`;

-- DropForeignKey
ALTER TABLE `tasks` DROP FOREIGN KEY `tasks_assignee_code_fkey`;

-- DropForeignKey
ALTER TABLE `tasks` DROP FOREIGN KEY `tasks_assigner_code_fkey`;

-- DropIndex
DROP INDEX `task_comments_author_code_fkey` ON `task_comments`;

-- DropIndex
DROP INDEX `tasks_assignee_code_fkey` ON `tasks`;

-- DropIndex
DROP INDEX `tasks_assigner_code_fkey` ON `tasks`;

-- AlterTable
ALTER TABLE `employees` ADD COLUMN `contract_information` JSON NULL,
    ADD COLUMN `employment_status` VARCHAR(191) NOT NULL DEFAULT 'active',
    ADD COLUMN `employment_type` VARCHAR(191) NULL,
    ADD COLUMN `user_id` VARCHAR(191) NULL,
    MODIFY `department_id` INTEGER NULL,
    MODIFY `job_title_id` INTEGER NULL;

-- AlterTable (Add new columns first)
ALTER TABLE `task_comments` ADD COLUMN `user_id` VARCHAR(191) NULL;

-- Data Migration for task_comments
UPDATE `task_comments` SET `user_id` = `author_code`;

-- Drop old column
ALTER TABLE `task_comments` DROP COLUMN `author_code`;

-- AlterTable (Add new columns first)
ALTER TABLE `tasks` ADD COLUMN `completed_at` DATETIME(3) NULL,
    ADD COLUMN `created_by_employee_id` VARCHAR(191) NOT NULL DEFAULT 'SYSTEM',
    ADD COLUMN `creator_user_id` VARCHAR(191) NOT NULL DEFAULT 'SYSTEM',
    ADD COLUMN `metadata` JSON NULL,
    MODIFY `assignee_code` VARCHAR(191) NULL,
    MODIFY `assigner_code` VARCHAR(191) NULL;

-- Data Migration for tasks completion_date
UPDATE `tasks` SET `completed_at` = `completion_date`;

-- Drop old column
ALTER TABLE `tasks` DROP COLUMN `completion_date`;

-- CreateTable
CREATE TABLE `task_participants` (
    `task_id` INTEGER NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `participant_role` VARCHAR(191) NOT NULL,
    `assigned_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`task_id`, `user_id`, `participant_role`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `task_closure` (
    `ancestor_id` INTEGER NOT NULL,
    `descendant_id` INTEGER NOT NULL,
    `depth` INTEGER NOT NULL,

    PRIMARY KEY (`ancestor_id`, `descendant_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_assignee_code_fkey` FOREIGN KEY (`assignee_code`) REFERENCES `employees`(`employee_code`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_assigner_code_fkey` FOREIGN KEY (`assigner_code`) REFERENCES `employees`(`employee_code`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task_participants` ADD CONSTRAINT `task_participants_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task_closure` ADD CONSTRAINT `task_closure_ancestor_id_fkey` FOREIGN KEY (`ancestor_id`) REFERENCES `tasks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task_closure` ADD CONSTRAINT `task_closure_descendant_id_fkey` FOREIGN KEY (`descendant_id`) REFERENCES `tasks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- DATA MIGRATION: task_participants
INSERT INTO `task_participants` (`task_id`, `user_id`, `participant_role`)
SELECT `id`, `assignee_code`, 'ASSIGNEE' FROM `tasks` WHERE `assignee_code` IS NOT NULL;

INSERT INTO `task_participants` (`task_id`, `user_id`, `participant_role`)
SELECT `id`, `assigner_code`, 'OWNER' FROM `tasks` WHERE `assigner_code` IS NOT NULL
ON DUPLICATE KEY UPDATE `participant_role` = 'OWNER';

INSERT INTO `task_participants` (`task_id`, `user_id`, `participant_role`)
SELECT `id`, `supervisor_code`, 'APPROVER' FROM `tasks` WHERE `supervisor_code` IS NOT NULL
ON DUPLICATE KEY UPDATE `participant_role` = 'APPROVER';

-- DATA MIGRATION: task_closure
-- Insert self-references (depth = 0)
INSERT INTO `task_closure` (`ancestor_id`, `descendant_id`, `depth`)
SELECT `id`, `id`, 0 FROM `tasks`;

-- Insert parent references (depth = 1)
INSERT INTO `task_closure` (`ancestor_id`, `descendant_id`, `depth`)
SELECT `parent_id`, `id`, 1 FROM `tasks` WHERE `parent_id` IS NOT NULL;
