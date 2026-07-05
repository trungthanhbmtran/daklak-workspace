-- CreateTable
CREATE TABLE `workflows` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `definition` JSON NOT NULL,
    `trigger` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `version` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workflow_instances` (
    `id` VARCHAR(191) NOT NULL,
    `workflowId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `currentNodeId` VARCHAR(191) NULL,
    `context` JSON NOT NULL,
    `businessId` VARCHAR(191) NULL,
    `businessType` VARCHAR(191) NULL,
    `initiatorId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `execution_logs` (
    `id` VARCHAR(191) NOT NULL,
    `instanceId` VARCHAR(191) NOT NULL,
    `nodeId` VARCHAR(191) NOT NULL,
    `nodeType` VARCHAR(191) NOT NULL,
    `nodeLabel` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `data` JSON NULL,
    `error` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `integration_connections` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'REST',
    `baseUrl` VARCHAR(191) NOT NULL,
    `authConfig` JSON NULL,
    `headers` JSON NULL,
    `endpoints` JSON NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `integration_connections_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `workflow_instances` ADD CONSTRAINT `workflow_instances_workflowId_fkey` FOREIGN KEY (`workflowId`) REFERENCES `workflows`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `execution_logs` ADD CONSTRAINT `execution_logs_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `workflow_instances`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
