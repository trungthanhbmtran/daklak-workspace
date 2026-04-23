/*
  Warnings:

  - You are about to drop the column `auto_moderation_note` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `auto_moderation_status` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `moderation_note` on the `posts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `posts` DROP COLUMN `auto_moderation_note`,
    DROP COLUMN `auto_moderation_status`,
    DROP COLUMN `moderation_note`,
    ADD COLUMN `current_version` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `deleted_at` DATETIME(3) NULL,
    ADD COLUMN `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE `posts_categories` ADD COLUMN `attachment_id` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `posts_versions` (
    `id` VARCHAR(191) NOT NULL,
    `post_id` VARCHAR(191) NOT NULL,
    `version` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `content` LONGTEXT NULL,
    `content_json` LONGTEXT NULL,
    `editor_id` VARCHAR(191) NOT NULL,
    `change_note` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `posts_versions_post_id_idx`(`post_id`),
    INDEX `posts_versions_version_idx`(`version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `posts_moderation_logs` (
    `id` VARCHAR(191) NOT NULL,
    `post_id` VARCHAR(191) NOT NULL,
    `reviewer_id` VARCHAR(191) NOT NULL,
    `old_status` VARCHAR(191) NOT NULL,
    `new_status` VARCHAR(191) NOT NULL,
    `decision` VARCHAR(191) NOT NULL,
    `note` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `posts_moderation_logs_post_id_idx`(`post_id`),
    INDEX `posts_moderation_logs_reviewer_id_idx`(`reviewer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `posts_audit_logs` (
    `id` VARCHAR(191) NOT NULL,
    `post_id` VARCHAR(191) NULL,
    `actor_id` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `entity_type` VARCHAR(191) NOT NULL DEFAULT 'POST',
    `entity_id` VARCHAR(191) NOT NULL,
    `metadata` LONGTEXT NULL,
    `ip_address` VARCHAR(191) NULL,
    `user_agent` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `posts_audit_logs_post_id_idx`(`post_id`),
    INDEX `posts_audit_logs_actor_id_idx`(`actor_id`),
    INDEX `posts_audit_logs_action_idx`(`action`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `posts_is_deleted_idx` ON `posts`(`is_deleted`);

-- AddForeignKey
ALTER TABLE `posts_versions` ADD CONSTRAINT `posts_versions_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `posts_moderation_logs` ADD CONSTRAINT `posts_moderation_logs_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `posts_audit_logs` ADD CONSTRAINT `posts_audit_logs_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
