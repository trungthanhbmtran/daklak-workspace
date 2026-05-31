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
CREATE TABLE `public_comments` (
    `id` VARCHAR(191) NOT NULL,
    `consultation_id` VARCHAR(191) NOT NULL,
    `full_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone_number` VARCHAR(191) NULL,
    `content` TEXT NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `moderated_by` VARCHAR(191) NULL,
    `moderated_at` DATETIME(3) NULL,
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
CREATE TABLE `document_logs` (
    `id` VARCHAR(191) NOT NULL,
    `document_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NULL,
    `user_name` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `note` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `document_logs_document_id_idx`(`document_id`),
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

-- CreateTable
CREATE TABLE `administrative_procedures` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `duration` VARCHAR(191) NOT NULL,
    `fee` VARCHAR(191) NOT NULL DEFAULT 'Miễn phí',
    `requiredDocs` TEXT NOT NULL,
    `steps` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `administrative_procedures_code_key`(`code`),
    INDEX `administrative_procedures_category_idx`(`category`),
    INDEX `administrative_procedures_code_idx`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `one_stop_dossiers` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `procedure_name` VARCHAR(191) NULL,
    `sender_name` VARCHAR(191) NOT NULL,
    `receive_date` DATETIME(3) NOT NULL,
    `due_date` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'RECEIVED',
    `current_step` INTEGER NOT NULL DEFAULT 1,
    `step_details` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `one_stop_dossiers_code_key`(`code`),
    INDEX `one_stop_dossiers_code_idx`(`code`),
    INDEX `one_stop_dossiers_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dossier_components` (
    `id` VARCHAR(191) NOT NULL,
    `dossier_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `is_required` BOOLEAN NOT NULL DEFAULT true,
    `status` VARCHAR(191) NOT NULL DEFAULT 'MISSING',
    `file_url` VARCHAR(191) NULL,
    `sample_file_url` TEXT NULL,
    `source` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `dossier_components_dossier_id_idx`(`dossier_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `document_cabinets` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NULL,
    `org_id` VARCHAR(191) NULL,
    `file_name` VARCHAR(191) NOT NULL,
    `file_url` TEXT NOT NULL,
    `file_type` VARCHAR(191) NOT NULL,
    `file_size` INTEGER NOT NULL,
    `tags` VARCHAR(191) NOT NULL DEFAULT '[]',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `document_cabinets_user_id_idx`(`user_id`),
    INDEX `document_cabinets_org_id_idx`(`org_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `public_comments` ADD CONSTRAINT `public_comments_consultation_id_fkey` FOREIGN KEY (`consultation_id`) REFERENCES `consultations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `consultation_responses` ADD CONSTRAINT `consultation_responses_consultation_id_fkey` FOREIGN KEY (`consultation_id`) REFERENCES `consultations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
