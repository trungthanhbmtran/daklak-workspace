/*
  Warnings:

  - You are about to drop the column `employee_code` on the `task_comments` table. All the data in the column will be lost.
  - The primary key for the `task_participants` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `employee_code` on the `task_participants` table. All the data in the column will be lost.
  - You are about to drop the column `creator_employee_code` on the `tasks` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `task_participants` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `task_comments` DROP COLUMN `employee_code`,
    ADD COLUMN `user_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `task_participants` DROP PRIMARY KEY,
    DROP COLUMN `employee_code`,
    ADD COLUMN `user_id` INTEGER NOT NULL,
    ADD PRIMARY KEY (`task_id`, `user_id`, `participant_role`);

-- AlterTable
ALTER TABLE `tasks` DROP COLUMN `creator_employee_code`,
    ADD COLUMN `creator_user_id` INTEGER NOT NULL DEFAULT 0;
