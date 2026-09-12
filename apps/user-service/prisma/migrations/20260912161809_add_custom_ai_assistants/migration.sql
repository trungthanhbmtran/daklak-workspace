-- CreateTable
CREATE TABLE `ai_assistants` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `system_prompt` TEXT NOT NULL,
    `is_public` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `ai_assistants_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_knowledge_sources` (
    `id` VARCHAR(191) NOT NULL,
    `assistant_id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` LONGTEXT NULL,
    `metadata` TEXT NULL,
    `qdrant_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `ai_knowledge_sources_assistant_id_idx`(`assistant_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_assistant_tools` (
    `id` VARCHAR(191) NOT NULL,
    `assistant_id` VARCHAR(191) NOT NULL,
    `tool_name` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ai_assistant_tools_assistant_id_idx`(`assistant_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ai_assistants` ADD CONSTRAINT `ai_assistants_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_knowledge_sources` ADD CONSTRAINT `ai_knowledge_sources_assistant_id_fkey` FOREIGN KEY (`assistant_id`) REFERENCES `ai_assistants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_assistant_tools` ADD CONSTRAINT `ai_assistant_tools_assistant_id_fkey` FOREIGN KEY (`assistant_id`) REFERENCES `ai_assistants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
