USE admin_systems;

SELECT @parentId := id FROM sys_menus WHERE code = 'USER_SERVICE_ROOT';

INSERT INTO sys_menus (code, name, route, icon, `order`, service_code, application, target, parent_id, is_active, created_at, updated_at) 
VALUES ('ADMIN_SETTINGS', 'Thiết lập hệ thống', 'settings', 'settings-outline', 7, 'USER_SERVICE', 'ADMIN_PORTAL', 'SELF', @parentId, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE name='Thiết lập hệ thống';

SELECT @settingsId := id FROM sys_menus WHERE code = 'ADMIN_SETTINGS';

INSERT INTO sys_menus (code, name, route, icon, `order`, service_code, application, target, parent_id, is_active, created_at, updated_at) 
VALUES ('ADMIN_SETTINGS_GENERAL', 'Thông số chung', 'settings', 'options-outline', 1, 'USER_SERVICE', 'ADMIN_PORTAL', 'SELF', @settingsId, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE name='Thông số chung', parent_id=@settingsId;

UPDATE sys_menus SET parent_id = @settingsId, `order` = 2, route = 'notifications' WHERE code = 'ADMIN_NOTIFICATIONS';
