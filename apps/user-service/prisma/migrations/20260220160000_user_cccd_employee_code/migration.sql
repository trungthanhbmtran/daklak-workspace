-- AlterTable: Thêm cccd (CCCD/CMND) và employee_code (mã số điện tử) từ HRM cho bảng users
ALTER TABLE `users` ADD COLUMN `cccd` VARCHAR(191) NULL;
ALTER TABLE `users` ADD COLUMN `employee_code` VARCHAR(191) NULL;
