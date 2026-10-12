ALTER TABLE `process_definitions`
  ADD COLUMN `owner_unit_code` VARCHAR(191) NULL;

CREATE INDEX `process_definitions_owner_unit_code_idx`
  ON `process_definitions`(`owner_unit_code`);
