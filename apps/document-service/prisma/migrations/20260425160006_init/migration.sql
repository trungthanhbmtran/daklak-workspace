-- CreateTable
CREATE TABLE `Document` (
    `id` VARCHAR(191) NOT NULL,
    `documentNumber` VARCHAR(191) NOT NULL,
    `notation` VARCHAR(191) NULL,
    `abstract` TEXT NOT NULL,
    `content` LONGTEXT NULL,
    `typeId` VARCHAR(191) NULL,
    `fieldId` VARCHAR(191) NULL,
    `issuingAuthorityId` VARCHAR(191) NULL,
    `issuerName` VARCHAR(191) NULL,
    `signerId` VARCHAR(191) NULL,
    `signerName` VARCHAR(191) NULL,
    `signerPosition` VARCHAR(191) NULL,
    `issueDate` DATETIME(3) NULL,
    `arrivalDate` DATETIME(3) NULL,
    `urgency` VARCHAR(191) NOT NULL DEFAULT 'NORMAL',
    `securityLevel` VARCHAR(191) NOT NULL DEFAULT 'NORMAL',
    `status` VARCHAR(191) NOT NULL DEFAULT 'DRAFT',
    `isPublic` BOOLEAN NOT NULL DEFAULT false,
    `fileId` VARCHAR(191) NULL,
    `signatureValid` BOOLEAN NOT NULL DEFAULT false,
    `linkedDocumentId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Document_documentNumber_idx`(`documentNumber`),
    INDEX `Document_typeId_idx`(`typeId`),
    INDEX `Document_fieldId_idx`(`fieldId`),
    INDEX `Document_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `type` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Category_slug_key`(`slug`),
    INDEX `Category_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_typeId_fkey` FOREIGN KEY (`typeId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_fieldId_fkey` FOREIGN KEY (`fieldId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
