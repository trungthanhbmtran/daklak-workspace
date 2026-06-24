/*
  Warnings:

  - You are about to drop the `organization_unit_monitored_units` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `organization_unit_monitored_units` DROP FOREIGN KEY `organization_unit_monitored_units_monitored_unit_id_fkey`;

-- DropForeignKey
ALTER TABLE `organization_unit_monitored_units` DROP FOREIGN KEY `organization_unit_monitored_units_unit_id_fkey`;

-- DropTable
DROP TABLE `organization_unit_monitored_units`;
