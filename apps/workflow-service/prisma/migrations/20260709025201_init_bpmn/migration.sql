/*
  Warnings:

  - You are about to drop the column `businessId` on the `workflow_instances` table. All the data in the column will be lost.
  - You are about to drop the column `businessType` on the `workflow_instances` table. All the data in the column will be lost.
  - You are about to drop the column `context` on the `workflow_instances` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `workflow_instances` table. All the data in the column will be lost.
  - You are about to drop the column `initiatorId` on the `workflow_instances` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `workflow_instances` table. All the data in the column will be lost.
  - You are about to drop the `execution_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `workflows` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `execution_logs` DROP FOREIGN KEY `execution_logs_instanceId_fkey`;

-- DropForeignKey
ALTER TABLE `workflow_instances` DROP FOREIGN KEY `workflow_instances_workflowId_fkey`;

-- DropIndex
DROP INDEX `workflow_instances_workflowId_fkey` ON `workflow_instances`;

-- AlterTable
ALTER TABLE `workflow_instances` DROP COLUMN `businessId`,
    DROP COLUMN `businessType`,
    DROP COLUMN `context`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `initiatorId`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `finishedAt` DATETIME(3) NULL,
    ADD COLUMN `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `variables` JSON NULL,
    ADD COLUMN `version` INTEGER NOT NULL DEFAULT 1;

-- DropTable
DROP TABLE `execution_logs`;

-- DropTable
DROP TABLE `workflows`;

-- CreateTable
CREATE TABLE `workflow_definitions` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Draft',
    `description` TEXT NULL,
    `createdBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `workflow_definitions_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workflow_nodes` (
    `id` VARCHAR(191) NOT NULL,
    `workflowId` VARCHAR(191) NOT NULL,
    `nodeKey` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `x` DOUBLE NOT NULL,
    `y` DOUBLE NOT NULL,
    `properties` JSON NULL,
    `order` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workflow_edges` (
    `id` VARCHAR(191) NOT NULL,
    `workflowId` VARCHAR(191) NOT NULL,
    `sourceNodeId` VARCHAR(191) NOT NULL,
    `targetNodeId` VARCHAR(191) NOT NULL,
    `condition` TEXT NULL,
    `priority` INTEGER NOT NULL DEFAULT 0,
    `defaultFlow` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assignment_rules` (
    `id` VARCHAR(191) NOT NULL,
    `nodeId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `node_actions` (
    `id` VARCHAR(191) NOT NULL,
    `nodeId` VARCHAR(191) NOT NULL,
    `actionType` VARCHAR(191) NOT NULL,
    `service` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `payloadTemplate` JSON NULL,
    `order` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workflow_variables` (
    `id` VARCHAR(191) NOT NULL,
    `workflowId` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `defaultValue` JSON NULL,

    UNIQUE INDEX `workflow_variables_workflowId_key_key`(`workflowId`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workflow_tasks` (
    `id` VARCHAR(191) NOT NULL,
    `instanceId` VARCHAR(191) NOT NULL,
    `nodeId` VARCHAR(191) NOT NULL,
    `assigneeId` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL,
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `workflow_nodes` ADD CONSTRAINT `workflow_nodes_workflowId_fkey` FOREIGN KEY (`workflowId`) REFERENCES `workflow_definitions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_edges` ADD CONSTRAINT `workflow_edges_workflowId_fkey` FOREIGN KEY (`workflowId`) REFERENCES `workflow_definitions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_edges` ADD CONSTRAINT `workflow_edges_sourceNodeId_fkey` FOREIGN KEY (`sourceNodeId`) REFERENCES `workflow_nodes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_edges` ADD CONSTRAINT `workflow_edges_targetNodeId_fkey` FOREIGN KEY (`targetNodeId`) REFERENCES `workflow_nodes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assignment_rules` ADD CONSTRAINT `assignment_rules_nodeId_fkey` FOREIGN KEY (`nodeId`) REFERENCES `workflow_nodes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `node_actions` ADD CONSTRAINT `node_actions_nodeId_fkey` FOREIGN KEY (`nodeId`) REFERENCES `workflow_nodes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_variables` ADD CONSTRAINT `workflow_variables_workflowId_fkey` FOREIGN KEY (`workflowId`) REFERENCES `workflow_definitions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_instances` ADD CONSTRAINT `workflow_instances_workflowId_fkey` FOREIGN KEY (`workflowId`) REFERENCES `workflow_definitions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_tasks` ADD CONSTRAINT `workflow_tasks_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `workflow_instances`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
