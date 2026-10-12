-- Create the legacy base tables for installations whose history predates Prisma migrations.
-- On databases where these tables already exist, IF NOT EXISTS leaves their data intact.
CREATE TABLE IF NOT EXISTS `kpi_form_templates` (
  `form_code` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `template_file_id` VARCHAR(191) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  `organization_id` VARCHAR(191) NOT NULL DEFAULT 'DEFAULT',
  PRIMARY KEY (`form_code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `kpi_form_documents` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `form_code` VARCHAR(191) NOT NULL,
  `evaluation_id` INTEGER NOT NULL,
  `document_file_id` VARCHAR(191) NULL,
  `content_json` JSON NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'DRAFT',
  `submitter_code` VARCHAR(191) NULL,
  `signer_code` VARCHAR(191) NULL,
  `decision_number` VARCHAR(191) NULL,
  `decision_date` DATE NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  `organization_id` VARCHAR(191) NOT NULL DEFAULT 'DEFAULT',
  PRIMARY KEY (`id`),
  CONSTRAINT `kpi_form_documents_form_code_fkey`
    FOREIGN KEY (`form_code`) REFERENCES `kpi_form_templates`(`form_code`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `kpi_form_documents_evaluation_id_fkey`
    FOREIGN KEY (`evaluation_id`) REFERENCES `kpi_evaluations`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `kpi_form_templates`
  ADD COLUMN `category` VARCHAR(191) NULL,
  ADD COLUMN `target_role` VARCHAR(191) NULL,
  ADD COLUMN `schema_version` VARCHAR(191) NOT NULL DEFAULT '1.0',
  ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'PUBLISHED',
  ADD COLUMN `version` INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN `xml_content` LONGTEXT NULL;

ALTER TABLE `kpi_form_documents`
  ADD COLUMN `template_version` INTEGER NULL;

CREATE TABLE `kpi_form_template_versions` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `form_code` VARCHAR(191) NOT NULL,
  `version` INTEGER NOT NULL,
  `xml_content` LONGTEXT NOT NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'DRAFT',
  `created_by` VARCHAR(191) NULL,
  `published_by` VARCHAR(191) NULL,
  `published_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `kpi_form_template_versions_form_code_version_key` (`form_code`, `version`),
  INDEX `kpi_form_template_versions_form_code_status_idx` (`form_code`, `status`),
  PRIMARY KEY (`id`),
  CONSTRAINT `kpi_form_template_versions_form_code_fkey`
    FOREIGN KEY (`form_code`) REFERENCES `kpi_form_templates`(`form_code`)
    ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `kpi_form_template_bindings` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `form_code` VARCHAR(191) NOT NULL,
  `organization_id` VARCHAR(191) NOT NULL DEFAULT 'DEFAULT',
  `unit_code` VARCHAR(191) NOT NULL,
  `process_definition_id` VARCHAR(191) NOT NULL,
  `process_code` VARCHAR(191) NOT NULL,
  `template_version` INTEGER NOT NULL DEFAULT 1,
  `node_code` VARCHAR(191) NULL,
  `phase` VARCHAR(191) NULL,
  `effective_from` DATETIME(3) NULL,
  `effective_to` DATETIME(3) NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT true,
  `created_by` VARCHAR(191) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,

  INDEX `kpi_form_template_bindings_organization_id_unit_code_process_definition_id_is_active_idx`
    (`organization_id`, `unit_code`, `process_definition_id`, `is_active`),
  INDEX `kpi_form_template_bindings_form_code_idx` (`form_code`),
  INDEX `kpi_form_template_bindings_effective_from_effective_to_idx` (`effective_from`, `effective_to`),
  PRIMARY KEY (`id`),
  CONSTRAINT `kpi_form_template_bindings_form_code_fkey`
    FOREIGN KEY (`form_code`) REFERENCES `kpi_form_templates`(`form_code`)
    ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
