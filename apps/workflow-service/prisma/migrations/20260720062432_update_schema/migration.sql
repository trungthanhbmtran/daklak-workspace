/*
  Warnings:

  - You are about to drop the column `type` on the `integration_connections` table. All the data in the column will be lost.
  - You are about to drop the column `nodeId` on the `workflow_tasks` table. All the data in the column will be lost.
  - You are about to drop the column `startedAt` on the `workflow_tasks` table. All the data in the column will be lost.
  - You are about to drop the `assignment_rules` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `node_actions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `workflow_definitions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `workflow_edges` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `workflow_instances` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `workflow_nodes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `workflow_variables` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `nodeCode` to the `workflow_tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `workflow_tasks` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `assignment_rules` DROP FOREIGN KEY `assignment_rules_nodeId_fkey`;

-- DropForeignKey
ALTER TABLE `node_actions` DROP FOREIGN KEY `node_actions_nodeId_fkey`;

-- DropForeignKey
ALTER TABLE `workflow_edges` DROP FOREIGN KEY `workflow_edges_sourceNodeId_fkey`;

-- DropForeignKey
ALTER TABLE `workflow_edges` DROP FOREIGN KEY `workflow_edges_targetNodeId_fkey`;

-- DropForeignKey
ALTER TABLE `workflow_edges` DROP FOREIGN KEY `workflow_edges_workflowId_fkey`;

-- DropForeignKey
ALTER TABLE `workflow_instances` DROP FOREIGN KEY `workflow_instances_workflowId_fkey`;

-- DropForeignKey
ALTER TABLE `workflow_nodes` DROP FOREIGN KEY `workflow_nodes_workflowId_fkey`;

-- DropForeignKey
ALTER TABLE `workflow_tasks` DROP FOREIGN KEY `workflow_tasks_instanceId_fkey`;

-- DropForeignKey
ALTER TABLE `workflow_variables` DROP FOREIGN KEY `workflow_variables_workflowId_fkey`;

-- DropIndex
DROP INDEX `workflow_tasks_instanceId_fkey` ON `workflow_tasks`;

-- AlterTable
ALTER TABLE `integration_connections` DROP COLUMN `type`,
    ADD COLUMN `authType` VARCHAR(191) NOT NULL DEFAULT 'NONE',
    ADD COLUMN `metadata` JSON NULL,
    ADD COLUMN `protocol` VARCHAR(191) NOT NULL DEFAULT 'REST';

-- AlterTable
ALTER TABLE `workflow_tasks` DROP COLUMN `nodeId`,
    DROP COLUMN `startedAt`,
    ADD COLUMN `assigneeUnit` VARCHAR(191) NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `dueAt` DATETIME(3) NULL,
    ADD COLUMN `nodeCode` VARCHAR(191) NOT NULL,
    ADD COLUMN `title` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `assignment_rules`;

-- DropTable
DROP TABLE `node_actions`;

-- DropTable
DROP TABLE `workflow_definitions`;

-- DropTable
DROP TABLE `workflow_edges`;

-- DropTable
DROP TABLE `workflow_instances`;

-- DropTable
DROP TABLE `workflow_nodes`;

-- DropTable
DROP TABLE `workflow_variables`;

-- CreateTable
CREATE TABLE `process_definitions` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `process_definitions_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `process_versions` (
    `id` VARCHAR(191) NOT NULL,
    `definitionId` VARCHAR(191) NOT NULL,
    `version` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `graph` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `process_versions_definitionId_version_key`(`definitionId`, `version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `process_instances` (
    `id` VARCHAR(191) NOT NULL,
    `definitionId` VARCHAR(191) NOT NULL,
    `versionId` VARCHAR(191) NOT NULL,
    `businessKey` VARCHAR(191) NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `currentNodeCode` VARCHAR(191) NULL,
    `variables` JSON NULL,
    `startedBy` VARCHAR(191) NOT NULL,
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workflow_transitions` (
    `id` VARCHAR(191) NOT NULL,
    `instanceId` VARCHAR(191) NOT NULL,
    `fromNodeCode` VARCHAR(191) NULL,
    `toNodeCode` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `performedBy` VARCHAR(191) NOT NULL,
    `performedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `comment` TEXT NULL,
    `payload` JSON NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workflow_events` (
    `id` VARCHAR(191) NOT NULL,
    `instanceId` VARCHAR(191) NOT NULL,
    `eventType` VARCHAR(191) NOT NULL,
    `payload` JSON NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `retryCount` INTEGER NOT NULL DEFAULT 0,
    `nextRetryAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `process_versions` ADD CONSTRAINT `process_versions_definitionId_fkey` FOREIGN KEY (`definitionId`) REFERENCES `process_definitions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `process_instances` ADD CONSTRAINT `process_instances_versionId_fkey` FOREIGN KEY (`versionId`) REFERENCES `process_versions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_tasks` ADD CONSTRAINT `workflow_tasks_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `process_instances`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_transitions` ADD CONSTRAINT `workflow_transitions_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `process_instances`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_events` ADD CONSTRAINT `workflow_events_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `process_instances`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
