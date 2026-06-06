/*
  Warnings:

  - You are about to drop the column `firstname` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `lastname` on the `employees` table. All the data in the column will be lost.
  - Added the required column `full_name` to the `employees` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `employees` DROP COLUMN `firstname`,
    DROP COLUMN `lastname`,
    ADD COLUMN `full_name` VARCHAR(191) NOT NULL;
