-- =============================================================================
-- Additive drift fix: create tables for models that existed in schema but had
-- no migration (ProcessType, ProcessBinding, WorkflowBinding, WorkflowCommand,
-- DomainAck, OutboxEvent, ProcessedCommand, BindingAudit).
-- Additive only: CREATE TABLE IF NOT EXISTS, no DROP / RENAME.
-- =============================================================================

-- CreateTable ProcessType
CREATE TABLE IF NOT EXISTS `process_types` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `owner_service` VARCHAR(191) NOT NULL,
    `valid_triggers` JSON NOT NULL,
    `valid_actions` JSON NOT NULL,
    `enforcement_mode` VARCHAR(191) NOT NULL DEFAULT 'OBSERVE',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `process_types_code_key`(`code`),
    INDEX `process_types_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable ProcessBinding
CREATE TABLE IF NOT EXISTS `process_bindings` (
    `id` VARCHAR(191) NOT NULL,
    `process_type_id` VARCHAR(191) NOT NULL,
    `definition_id` VARCHAR(191) NOT NULL,
    `pinned_version_id` VARCHAR(191) NULL,
    `organization_id` VARCHAR(191) NULL,
    `trigger` VARCHAR(191) NOT NULL,
    `criteria` JSON NULL,
    `priority` INTEGER NOT NULL DEFAULT 100,
    `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
    `effective_from` DATETIME(3) NULL,
    `effective_to` DATETIME(3) NULL,
    `created_by` VARCHAR(191) NOT NULL,
    `approved_by` VARCHAR(191) NULL,
    `approved_at` DATETIME(3) NULL,
    `reason` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `process_bindings_process_type_id_status_organization_id_idx`(`process_type_id`, `status`, `organization_id`),
    INDEX `process_bindings_definition_id_idx`(`definition_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `process_bindings_process_type_id_fkey` FOREIGN KEY (`process_type_id`) REFERENCES `process_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `process_bindings_definition_id_fkey` FOREIGN KEY (`definition_id`) REFERENCES `process_definitions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `process_bindings_pinned_version_id_fkey` FOREIGN KEY (`pinned_version_id`) REFERENCES `process_versions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable WorkflowBinding
CREATE TABLE IF NOT EXISTS `workflow_bindings` (
    `id` VARCHAR(191) NOT NULL,
    `entity_type` VARCHAR(191) NOT NULL,
    `event_trigger` VARCHAR(191) NOT NULL,
    `workflow_definition_id` VARCHAR(191) NOT NULL,
    `conditions` JSON NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `workflow_bindings_entity_type_event_trigger_key`(`entity_type`, `event_trigger`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable WorkflowCommand
CREATE TABLE IF NOT EXISTS `workflow_commands` (
    `id` VARCHAR(191) NOT NULL,
    `instance_id` VARCHAR(191) NOT NULL,
    `command_type` VARCHAR(191) NOT NULL,
    `target_service` VARCHAR(191) NOT NULL,
    `payload` JSON NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `correlation_id` VARCHAR(191) NULL,
    `retry_count` INTEGER NOT NULL DEFAULT 0,
    `max_retries` INTEGER NOT NULL DEFAULT 3,
    `next_retry_at` DATETIME(3) NULL,
    `error` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sent_at` DATETIME(3) NULL,
    `acked_at` DATETIME(3) NULL,
    `idempotency_key` VARCHAR(191) NULL,
    `actor_id` VARCHAR(191) NULL,

    UNIQUE INDEX `workflow_commands_idempotency_key_key`(`idempotency_key`),
    INDEX `workflow_commands_status_next_retry_at_idx`(`status`, `next_retry_at`),
    INDEX `workflow_commands_instance_id_status_idx`(`instance_id`, `status`),
    PRIMARY KEY (`id`),
    CONSTRAINT `workflow_commands_instance_id_fkey` FOREIGN KEY (`instance_id`) REFERENCES `process_instances`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable DomainAck
CREATE TABLE IF NOT EXISTS `domain_acks` (
    `id` VARCHAR(191) NOT NULL,
    `command_id` VARCHAR(191) NOT NULL,
    `instance_id` VARCHAR(191) NOT NULL,
    `result` VARCHAR(191) NOT NULL,
    `entity_version` INTEGER NULL,
    `payload` JSON NULL,
    `error_message` TEXT NULL,
    `received_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `domain_acks_command_id_key`(`command_id`),
    INDEX `domain_acks_instance_id_idx`(`instance_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable OutboxEvent
CREATE TABLE IF NOT EXISTS `outbox_events` (
    `id` VARCHAR(191) NOT NULL,
    `workflow_instance_id` VARCHAR(191) NOT NULL,
    `process_version` INTEGER NOT NULL,
    `node_id` VARCHAR(191) NOT NULL,
    `command_type` VARCHAR(191) NOT NULL,
    `event_id` VARCHAR(191) NULL,
    `event_type` VARCHAR(191) NULL,
    `schema_version` INTEGER NOT NULL DEFAULT 1,
    `payload` JSON NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `retry_count` INTEGER NOT NULL DEFAULT 0,
    `error` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `processed_at` DATETIME(3) NULL,
    `correlation_id` VARCHAR(191) NULL,
    `max_retries` INTEGER NOT NULL DEFAULT 8,
    `next_retry_at` DATETIME(3) NULL,
    `claimed_at` DATETIME(3) NULL,
    `dead_lettered_at` DATETIME(3) NULL,

    UNIQUE INDEX `outbox_events_event_id_key`(`event_id`),
    INDEX `outbox_events_status_created_at_idx`(`status`, `created_at`),
    INDEX `outbox_events_status_next_retry_at_idx`(`status`, `next_retry_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable ProcessedCommand
CREATE TABLE IF NOT EXISTS `processed_commands` (
    `id` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PROCESSED',
    `processed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable BindingAudit
CREATE TABLE IF NOT EXISTS `binding_audits` (
    `id` VARCHAR(191) NOT NULL,
    `binding_id` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `actor_id` VARCHAR(191) NOT NULL,
    `reason` TEXT NULL,
    `snapshot` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `binding_audits_binding_id_idx`(`binding_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
