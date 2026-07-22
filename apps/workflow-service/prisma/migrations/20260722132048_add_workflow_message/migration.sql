-- CreateTable
CREATE TABLE `workflow_messages` (
    `id` VARCHAR(191) NOT NULL,
    `instance_id` VARCHAR(191) NOT NULL,
    `task_id` VARCHAR(191) NULL,
    `sender_id` VARCHAR(191) NOT NULL,
    `sender_name` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `attachments` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `workflow_messages_instance_id_created_at_idx`(`instance_id`, `created_at`),
    INDEX `workflow_messages_task_id_idx`(`task_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `workflow_messages` ADD CONSTRAINT `workflow_messages_instance_id_fkey` FOREIGN KEY (`instance_id`) REFERENCES `process_instances`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_messages` ADD CONSTRAINT `workflow_messages_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `workflow_tasks`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
