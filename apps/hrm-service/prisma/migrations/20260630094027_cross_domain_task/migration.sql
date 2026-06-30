-- AlterTable
ALTER TABLE `tasks` ADD COLUMN `cross_domain_multiplier` DOUBLE NOT NULL DEFAULT 1.0,
    ADD COLUMN `is_cross_domain` BOOLEAN NOT NULL DEFAULT false;
