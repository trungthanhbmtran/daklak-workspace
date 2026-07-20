-- DropForeignKey
ALTER TABLE `process_instances` DROP FOREIGN KEY `process_instances_versionId_fkey`;

-- DropForeignKey
ALTER TABLE `process_versions` DROP FOREIGN KEY `process_versions_definitionId_fkey`;

-- DropForeignKey
ALTER TABLE `workflow_events` DROP FOREIGN KEY `workflow_events_instanceId_fkey`;

-- DropForeignKey
ALTER TABLE `workflow_tasks` DROP FOREIGN KEY `workflow_tasks_instanceId_fkey`;

-- DropForeignKey
ALTER TABLE `workflow_transitions` DROP FOREIGN KEY `workflow_transitions_instanceId_fkey`;

-- DropIndex
DROP INDEX `process_instances_versionId_fkey` ON `process_instances`;

-- DropIndex
DROP INDEX `process_versions_definitionId_version_key` ON `process_versions`;

-- DropIndex
DROP INDEX `workflow_events_instanceId_fkey` ON `workflow_events`;

-- DropIndex
DROP INDEX `workflow_tasks_instanceId_fkey` ON `workflow_tasks`;

-- DropIndex
DROP INDEX `workflow_transitions_instanceId_fkey` ON `workflow_transitions`;

-- AlterTable
ALTER TABLE `integration_connections` DROP COLUMN `authConfig`,
    DROP COLUMN `baseUrl`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `isActive`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `auth_config` JSON NULL,
    ADD COLUMN `base_url` VARCHAR(191) NOT NULL,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `process_definitions` DROP COLUMN `createdAt`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `process_instances` DROP COLUMN `businessKey`,
    DROP COLUMN `currentNodeCode`,
    DROP COLUMN `definitionId`,
    DROP COLUMN `endedAt`,
    DROP COLUMN `organizationId`,
    DROP COLUMN `startedAt`,
    DROP COLUMN `startedBy`,
    DROP COLUMN `versionId`,
    ADD COLUMN `business_key` VARCHAR(191) NULL,
    ADD COLUMN `current_node_code` VARCHAR(191) NULL,
    ADD COLUMN `definition_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `ended_at` DATETIME(3) NULL,
    ADD COLUMN `organization_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `started_by` VARCHAR(191) NOT NULL,
    ADD COLUMN `version_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `process_versions` DROP COLUMN `createdAt`,
    DROP COLUMN `definitionId`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `definition_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `workflow_events` DROP COLUMN `createdAt`,
    DROP COLUMN `eventType`,
    DROP COLUMN `instanceId`,
    DROP COLUMN `nextRetryAt`,
    DROP COLUMN `retryCount`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `event_type` VARCHAR(191) NOT NULL,
    ADD COLUMN `instance_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `next_retry_at` DATETIME(3) NULL,
    ADD COLUMN `retry_count` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `workflow_tasks` DROP COLUMN `assigneeId`,
    DROP COLUMN `assigneeUnit`,
    DROP COLUMN `completedAt`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `dueAt`,
    DROP COLUMN `instanceId`,
    DROP COLUMN `nodeCode`,
    ADD COLUMN `assignee_id` VARCHAR(191) NULL,
    ADD COLUMN `assignee_unit` VARCHAR(191) NULL,
    ADD COLUMN `completed_at` DATETIME(3) NULL,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `due_at` DATETIME(3) NULL,
    ADD COLUMN `instance_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `node_code` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `workflow_transitions` DROP COLUMN `fromNodeCode`,
    DROP COLUMN `instanceId`,
    DROP COLUMN `performedAt`,
    DROP COLUMN `performedBy`,
    DROP COLUMN `toNodeCode`,
    ADD COLUMN `from_node_code` VARCHAR(191) NULL,
    ADD COLUMN `instance_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `performed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `performed_by` VARCHAR(191) NOT NULL,
    ADD COLUMN `to_node_code` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `integration_connections_protocol_is_active_idx` ON `integration_connections`(`protocol`, `is_active`);

-- CreateIndex
CREATE INDEX `process_definitions_isActive_idx` ON `process_definitions`(`isActive`);

-- CreateIndex
CREATE INDEX `process_instances_organization_id_status_idx` ON `process_instances`(`organization_id`, `status`);

-- CreateIndex
CREATE INDEX `process_instances_business_key_idx` ON `process_instances`(`business_key`);

-- CreateIndex
CREATE INDEX `process_instances_started_at_idx` ON `process_instances`(`started_at`);

-- CreateIndex
CREATE INDEX `process_versions_definition_id_status_idx` ON `process_versions`(`definition_id`, `status`);

-- CreateIndex
CREATE UNIQUE INDEX `process_versions_definition_id_version_key` ON `process_versions`(`definition_id`, `version`);

-- CreateIndex
CREATE INDEX `workflow_events_instance_id_status_idx` ON `workflow_events`(`instance_id`, `status`);

-- CreateIndex
CREATE INDEX `workflow_events_status_next_retry_at_idx` ON `workflow_events`(`status`, `next_retry_at`);

-- CreateIndex
CREATE INDEX `workflow_tasks_instance_id_status_idx` ON `workflow_tasks`(`instance_id`, `status`);

-- CreateIndex
CREATE INDEX `workflow_tasks_assignee_id_status_idx` ON `workflow_tasks`(`assignee_id`, `status`);

-- CreateIndex
CREATE INDEX `workflow_transitions_instance_id_idx` ON `workflow_transitions`(`instance_id`);

-- AddForeignKey
ALTER TABLE `process_versions` ADD CONSTRAINT `process_versions_definition_id_fkey` FOREIGN KEY (`definition_id`) REFERENCES `process_definitions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `process_instances` ADD CONSTRAINT `process_instances_version_id_fkey` FOREIGN KEY (`version_id`) REFERENCES `process_versions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_tasks` ADD CONSTRAINT `workflow_tasks_instance_id_fkey` FOREIGN KEY (`instance_id`) REFERENCES `process_instances`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_transitions` ADD CONSTRAINT `workflow_transitions_instance_id_fkey` FOREIGN KEY (`instance_id`) REFERENCES `process_instances`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_events` ADD CONSTRAINT `workflow_events_instance_id_fkey` FOREIGN KEY (`instance_id`) REFERENCES `process_instances`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
