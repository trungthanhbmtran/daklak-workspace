CREATE TABLE `kpi_formula_configs` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `organization_id` VARCHAR(191) NOT NULL DEFAULT 'DEFAULT',
  `version` INTEGER NOT NULL DEFAULT 1,
  `settings_json` JSON NOT NULL,
  `updated_by` VARCHAR(191) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `kpi_formula_configs_organization_id_key` (`organization_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `kpi_formula_config_versions` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `organization_id` VARCHAR(191) NOT NULL,
  `version` INTEGER NOT NULL,
  `settings_json` JSON NOT NULL,
  `changed_by` VARCHAR(191) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `kpi_formula_config_versions_organization_id_version_key` (`organization_id`, `version`),
  INDEX `kpi_formula_config_versions_organization_id_created_at_idx` (`organization_id`, `created_at`),
  PRIMARY KEY (`id`),
  CONSTRAINT `kpi_formula_config_versions_organization_id_fkey`
    FOREIGN KEY (`organization_id`) REFERENCES `kpi_formula_configs`(`organization_id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
