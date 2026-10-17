-- =============================================================================
-- Additive drift fix: create outbox/inbox tables for OutboxEvent + ProcessedCommand
-- (declared in schema/workflow_infrastructure.prisma but missing from migrations).
-- Additive only: CREATE TABLE IF NOT EXISTS, no DROP / RENAME.
-- =============================================================================

-- CreateTable OutboxEvent
CREATE TABLE IF NOT EXISTS `outbox_events` (
    `id` VARCHAR(191) NOT NULL,
    `workflow_instance_id` VARCHAR(191) NOT NULL,
    `process_version` INTEGER NOT NULL,
    `node_id` VARCHAR(191) NOT NULL,
    `command_type` VARCHAR(191) NOT NULL,
    `payload` JSON NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `retry_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `processed_at` DATETIME(3) NULL,
    `error_reason` TEXT NULL,
    `organization_id` VARCHAR(191) NOT NULL DEFAULT 'DEFAULT',

    INDEX `outbox_events_status_idx`(`status`),
    INDEX `outbox_events_workflow_instance_id_idx`(`workflow_instance_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable ProcessedCommand
CREATE TABLE IF NOT EXISTS `processed_commands` (
    `command_id` VARCHAR(191) NOT NULL,
    `workflow_instance_id` VARCHAR(191) NOT NULL,
    `processed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `action` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'SUCCESS',
    `organization_id` VARCHAR(191) NOT NULL DEFAULT 'DEFAULT',

    INDEX `processed_commands_workflow_instance_id_idx`(`workflow_instance_id`),
    PRIMARY KEY (`command_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
