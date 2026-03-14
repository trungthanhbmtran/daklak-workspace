-- CreateTable: menu_required_permissions (nhiều quyền cho mỗi menu)
CREATE TABLE IF NOT EXISTS `menu_required_permissions` (
    `menu_id` INTEGER NOT NULL,
    `permission_id` INTEGER NOT NULL,

    PRIMARY KEY (`menu_id`, `permission_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Migrate dữ liệu từ cột cũ (1 quyền/menu) sang bảng nối (IGNORE để tránh lỗi trùng khi chạy lại)
INSERT IGNORE INTO `menu_required_permissions` (`menu_id`, `permission_id`)
SELECT `id`, `required_permission_id` FROM `sys_menus` WHERE `required_permission_id` IS NOT NULL;

-- Bắt buộc xóa FK trên sys_menus trước khi DROP cột (nếu không migration sẽ lỗi)
ALTER TABLE `sys_menus` DROP FOREIGN KEY `sys_menus_required_permission_id_fkey`;

-- Drop cột required_permission_id
ALTER TABLE `sys_menus` DROP COLUMN `required_permission_id`;

-- Add foreign keys (chỉ thêm nếu chưa có - bỏ qua lỗi duplicate constraint nếu chạy lại)
ALTER TABLE `menu_required_permissions` ADD CONSTRAINT `menu_required_permissions_menu_id_fkey` FOREIGN KEY (`menu_id`) REFERENCES `sys_menus`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `menu_required_permissions` ADD CONSTRAINT `menu_required_permissions_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
