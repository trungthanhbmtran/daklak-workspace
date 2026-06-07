-- CreateTable
CREATE TABLE `ApiPermission` (
    `id` VARCHAR(191) NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `method` VARCHAR(191) NOT NULL,
    `permissions` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ServiceEndpoint` (
    `id` VARCHAR(191) NOT NULL,
    `serviceName` VARCHAR(191) NOT NULL,
    `endpoint` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LgspIntegrationConfig` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `serviceCode` VARCHAR(191) NOT NULL,
    `apiUrl` VARCHAR(191) NOT NULL,
    `authType` VARCHAR(191) NOT NULL DEFAULT 'NONE',
    `authUrl` VARCHAR(191) NULL,
    `authPayload` JSON NULL,
    `tokenPath` VARCHAR(191) NULL,
    `cachedToken` TEXT NULL,
    `tokenExpiresAt` DATETIME(3) NULL,
    `requestMethod` VARCHAR(191) NOT NULL DEFAULT 'GET',
    `requestParams` JSON NULL,
    `displayType` VARCHAR(191) NOT NULL DEFAULT 'RAW',
    `chartConfig` JSON NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `LgspIntegrationConfig_serviceCode_key`(`serviceCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GatewayConfig` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL DEFAULT 'Default Gateway',
    `provider` VARCHAR(191) NOT NULL DEFAULT 'NGINX',
    `httpPort` INTEGER NOT NULL DEFAULT 80,
    `httpsPort` INTEGER NOT NULL DEFAULT 443,
    `enableHttps` BOOLEAN NOT NULL DEFAULT false,
    `sslCert` TEXT NULL,
    `sslKey` TEXT NULL,
    `rawConfig` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `version` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GatewayRoute` (
    `id` VARCHAR(191) NOT NULL,
    `gatewayId` VARCHAR(191) NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `targetService` VARCHAR(191) NOT NULL,
    `stripPrefix` BOOLEAN NOT NULL DEFAULT false,
    `rateLimit` INTEGER NULL,
    `timeout` INTEGER NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `GatewayRoute` ADD CONSTRAINT `GatewayRoute_gatewayId_fkey` FOREIGN KEY (`gatewayId`) REFERENCES `GatewayConfig`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
