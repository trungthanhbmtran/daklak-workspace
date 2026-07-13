-- CreateTable
CREATE TABLE `task_steps` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `task_id` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'TODO',
    `order` INTEGER NOT NULL DEFAULT 0,
    `assignee_code` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `task_steps_task_id_idx`(`task_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `task_steps` ADD CONSTRAINT `task_steps_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
