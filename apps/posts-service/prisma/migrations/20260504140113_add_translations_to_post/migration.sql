-- AlterTable
ALTER TABLE `posts` ADD COLUMN `translations` JSON NULL;

-- AlterTable
ALTER TABLE `posts_versions` ADD COLUMN `translations` JSON NULL;
