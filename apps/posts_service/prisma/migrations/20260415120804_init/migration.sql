-- CreateTable
CREATE TABLE `banners` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `image_url` VARCHAR(255) NOT NULL,
    `link_type` ENUM('internal', 'external') NOT NULL DEFAULT 'internal',
    `custom_url` VARCHAR(255) NULL,
    `target` VARCHAR(20) NOT NULL DEFAULT '_self',
    `position` ENUM('top', 'middle', 'bottom', 'custom') NOT NULL DEFAULT 'top',
    `order_index` INTEGER NOT NULL DEFAULT 0,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `meta_title` VARCHAR(255) NULL,
    `meta_description` TEXT NULL,
    `start_at` DATETIME(3) NULL,
    `end_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `banners_slug_key`(`slug`),
    INDEX `banners_status_idx`(`status`),
    INDEX `banners_order_index_idx`(`order_index`),
    INDEX `banners_position_idx`(`position`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `thumbnail` VARCHAR(255) NULL,
    `link_type` ENUM('standard', 'static', 'external') NOT NULL DEFAULT 'standard',
    `custom_url` VARCHAR(255) NULL,
    `target` VARCHAR(20) NOT NULL DEFAULT '_self',
    `parent_id` CHAR(36) NULL,
    `lft` INTEGER NOT NULL DEFAULT 0,
    `rgt` INTEGER NOT NULL DEFAULT 0,
    `depth` INTEGER NOT NULL DEFAULT 0,
    `order_index` INTEGER NOT NULL DEFAULT 0,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `meta_title` VARCHAR(255) NULL,
    `meta_description` TEXT NULL,
    `is_gov_standard` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `categories_name_key`(`name`),
    UNIQUE INDEX `categories_slug_key`(`slug`),
    INDEX `categories_lft_idx`(`lft`),
    INDEX `categories_lft_rgt_idx`(`lft`, `rgt`),
    INDEX `categories_parent_id_idx`(`parent_id`),
    INDEX `categories_status_slug_idx`(`status`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `posts` (
    `id` CHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `content` LONGTEXT NULL,
    `content_json` JSON NULL,
    `description` TEXT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `author_id` CHAR(36) NOT NULL,
    `category_id` CHAR(36) NULL,
    `reviewer_id` CHAR(36) NULL,
    `moderation_note` TEXT NULL,
    `auto_moderation_status` VARCHAR(50) NULL,
    `auto_moderation_note` TEXT NULL,
    `is_translated` BOOLEAN NOT NULL DEFAULT false,
    `language` VARCHAR(10) NOT NULL DEFAULT 'vi',
    `status` ENUM('draft', 'pending', 'editing', 'approved', 'published', 'rejected', 'archived') NOT NULL DEFAULT 'draft',
    `thumbnail` VARCHAR(255) NULL,
    `is_featured` BOOLEAN NOT NULL DEFAULT false,
    `is_notification` BOOLEAN NOT NULL DEFAULT false,
    `view_count` INTEGER NOT NULL DEFAULT 0,
    `published_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `posts_slug_key`(`slug`),
    INDEX `posts_category_id_status_idx`(`category_id`, `status`),
    INDEX `posts_author_id_idx`(`author_id`),
    INDEX `posts_status_published_at_idx`(`status`, `published_at`),
    INDEX `posts_is_featured_status_idx`(`is_featured`, `status`),
    INDEX `posts_is_notification_status_idx`(`is_notification`, `status`),
    INDEX `posts_title_idx`(`title`),
    INDEX `posts_language_idx`(`language`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tags` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tags_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `post_translates` (
    `id` CHAR(36) NOT NULL,
    `post_id` CHAR(36) NOT NULL,
    `language` VARCHAR(10) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `content_json` JSON NULL,
    `content` LONGTEXT NULL,
    `status` ENUM('draft', 'pending_review', 'published', 'rejected') NOT NULL DEFAULT 'draft',
    `moderation_status` VARCHAR(50) NULL,
    `moderation_note` TEXT NULL,
    `meta_data` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `post_translates_post_id_language_key`(`post_id`, `language`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `variables` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `options` VARCHAR(255) NOT NULL DEFAULT '',
    `data_type` ENUM('text', 'number', 'date', 'email', 'phone', 'information', 'select', 'checkbox', 'radio', 'address') NOT NULL DEFAULT 'text',
    `is_multi_value` BOOLEAN NOT NULL DEFAULT false,
    `required` BOOLEAN NOT NULL DEFAULT false,
    `description` VARCHAR(255) NULL,
    `default_value` VARCHAR(255) NULL,
    `validation` JSON NULL,
    `post_id` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `variables_post_id_idx`(`post_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_PostTags` (
    `A` CHAR(36) NOT NULL,
    `B` CHAR(36) NOT NULL,

    UNIQUE INDEX `_PostTags_AB_unique`(`A`, `B`),
    INDEX `_PostTags_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `categories_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_translates` ADD CONSTRAINT `post_translates_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `variables` ADD CONSTRAINT `variables_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PostTags` ADD CONSTRAINT `_PostTags_A_fkey` FOREIGN KEY (`A`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PostTags` ADD CONSTRAINT `_PostTags_B_fkey` FOREIGN KEY (`B`) REFERENCES `tags`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
