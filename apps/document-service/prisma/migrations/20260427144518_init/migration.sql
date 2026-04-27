-- CreateTable
CREATE TABLE `document_categories` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `parent_id` VARCHAR(191) NULL,
    `lft` INTEGER NOT NULL DEFAULT 0,
    `rgt` INTEGER NOT NULL DEFAULT 0,
    `depth` INTEGER NOT NULL DEFAULT 0,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `order_index` INTEGER NOT NULL DEFAULT 0,
    `description` TEXT NULL,
    `type` VARCHAR(191) NOT NULL,
    `is_gov_standard` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `document_categories_slug_key`(`slug`),
    INDEX `document_categories_lft_rgt_idx`(`lft`, `rgt`),
    INDEX `document_categories_parent_id_idx`(`parent_id`),
    INDEX `document_categories_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `consultations` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `document_id` VARCHAR(191) NULL,
    `deadline` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'OPEN',
    `issuer_id` VARCHAR(191) NULL,
    `issuer_name` VARCHAR(191) NULL,
    `is_urgent` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `consultation_responses` (
    `id` VARCHAR(191) NOT NULL,
    `consultation_id` VARCHAR(191) NOT NULL,
    `unit_id` VARCHAR(191) NOT NULL,
    `unit_name` VARCHAR(191) NULL,
    `user_id` VARCHAR(191) NULL,
    `content` TEXT NULL,
    `file_id` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `responded_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `documents` (
    `id` VARCHAR(191) NOT NULL,
    `document_number` VARCHAR(191) NOT NULL,
    `notation` VARCHAR(191) NULL,
    `abstract` TEXT NOT NULL,
    `content` LONGTEXT NULL,
    `type_id` VARCHAR(191) NULL,
    `field_id` VARCHAR(191) NULL,
    `issuing_authority_id` VARCHAR(191) NULL,
    `issuer_name` VARCHAR(191) NULL,
    `signer_id` VARCHAR(191) NULL,
    `signer_name` VARCHAR(191) NULL,
    `signer_position` VARCHAR(191) NULL,
    `issue_date` DATETIME(3) NULL,
    `arrival_date` DATETIME(3) NULL,
    `arrival_number` VARCHAR(191) NULL,
    `processing_deadline` DATETIME(3) NULL,
    `recipients` TEXT NULL,
    `urgency` VARCHAR(191) NOT NULL DEFAULT 'NORMAL',
    `securityLevel` VARCHAR(191) NOT NULL DEFAULT 'NORMAL',
    `status` VARCHAR(191) NOT NULL DEFAULT 'DRAFT',
    `is_public` BOOLEAN NOT NULL DEFAULT false,
    `is_incoming` BOOLEAN NOT NULL DEFAULT true,
    `file_id` VARCHAR(191) NULL,
    `signature_valid` BOOLEAN NOT NULL DEFAULT false,
    `page_count` INTEGER NOT NULL DEFAULT 1,
    `attachment_count` INTEGER NOT NULL DEFAULT 0,
    `linked_document_id` VARCHAR(191) NULL,
    `fiscal_year` INTEGER NULL,
    `transparency_category` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `documents_document_number_idx`(`document_number`),
    INDEX `documents_type_id_idx`(`type_id`),
    INDEX `documents_field_id_idx`(`field_id`),
    INDEX `documents_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `minutes` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `start_time` DATETIME(3) NOT NULL,
    `end_time` DATETIME(3) NULL,
    `location` VARCHAR(191) NULL,
    `chairman` VARCHAR(191) NULL,
    `secretary` VARCHAR(191) NULL,
    `attendees` TEXT NULL,
    `content` LONGTEXT NULL,
    `conclusion` TEXT NULL,
    `document_id` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'DRAFT',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `document_categories` ADD CONSTRAINT `document_categories_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `document_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `consultation_responses` ADD CONSTRAINT `consultation_responses_consultation_id_fkey` FOREIGN KEY (`consultation_id`) REFERENCES `consultations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_type_id_fkey` FOREIGN KEY (`type_id`) REFERENCES `document_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_field_id_fkey` FOREIGN KEY (`field_id`) REFERENCES `document_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
