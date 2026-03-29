# Khắc phục migration thất bại (P3009)

## Bước 1: Đánh dấu migration đã rolled back

```bash
cd project_stc/user-service
npx prisma migrate resolve --rolled-back 20260220000000_menu_many_permissions
```

## Bước 2: Đưa DB về trạng thái có thể chạy lại migration (nếu cần)

- **Nếu bảng `menu_required_permissions` đã được tạo** (migration lỗi sau bước tạo bảng/insert):
  - Xóa bảng để chạy lại từ đầu:
  ```sql
  DROP TABLE IF EXISTS menu_required_permissions;
  ```
  - Đảm bảo `sys_menus` vẫn còn cột `required_permission_id` (và FK `sys_menus_required_permission_id_fkey`). Nếu đã xóa cột thì cần restore backup hoặc chạy tay bước còn lại (xem dưới).

- **Nếu cột `sys_menus.required_permission_id` đã bị xóa** và bảng `menu_required_permissions` đã có dữ liệu:
  - Chỉ cần thêm FK cho bảng nối (chạy trong MySQL), rồi đánh dấu migration đã áp dụng:
  ```sql
  ALTER TABLE menu_required_permissions
    ADD CONSTRAINT menu_required_permissions_menu_id_fkey
    FOREIGN KEY (menu_id) REFERENCES sys_menus(id) ON DELETE CASCADE ON UPDATE CASCADE;
  ALTER TABLE menu_required_permissions
    ADD CONSTRAINT menu_required_permissions_permission_id_fkey
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE ON UPDATE CASCADE;
  ```
  - Sau đó:
  ```bash
  npx prisma migrate resolve --applied 20260220000000_menu_many_permissions
  ```

## Bước 3: Chạy lại migration

```bash
npx prisma migrate deploy
```

(Nếu đã dùng `--applied` ở bước 2 thì không cần deploy lại.)
