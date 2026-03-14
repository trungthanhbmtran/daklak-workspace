# Phân quyền – Các bảng CSDL (user-service)

Cơ sở dữ liệu phân quyền nằm trong **user-service** (MySQL/MariaDB). Các bảng chính:

| Bảng (table) | Mô tả |
|--------------|--------|
| **`roles`** | Vai trò (ADMIN, MANAGER, USER_VIEWER, …). Cột: `id`, `code`, `name`, `description`. |
| **`permissions`** | Quyền (action + resource). Cột: `id`, `action`, `resource_id`. |
| **`resources`** | Tài nguyên (USER_MGMT, REPORT_VIEW, …). Cột: `id`, `code`, `name`. |
| **`users`** | Người dùng. Cột: `id`, `email`, `username`, `full_name`, `is_active`, … |
| **`_RoleToUser`** | Bảng trung gian **User ↔ Role** (many-to-many). Cột: `A` (role id), `B` (user id). Gán vai trò cho user = thêm/xóa bản ghi ở đây. |
| **`_PermissionToRole`** | Bảng trung gian **Role ↔ Permission** (many-to-many). Cột: `A` (permission id), `B` (role id). |

## Luồng hiển thị / gán quyền

- **Hiển thị vai trò user:** `FindOne` user có `include: { roles: true }` → đọc từ `users` + `_RoleToUser` + `roles` → trả về `roleNames` và `role_names` (mảng tên/code vai trò) để client luôn nhận đúng.
- **Chính sách hiệu lực (Policies):** `FindOne` include `roles.permissions.resource` → gộp tất cả Permission của các Role user đang có (đã dedupe theo permission id) → trả về `policies`: mảng `{ description: "ACTION - Tên tài nguyên", resource: "CODE" }` để hiển thị tại màn chi tiết user.
- **Gán lại vai trò:** API `AssignRoles(userId, roleIds)` nhận `roleIds` hoặc `role_ids` → `prisma.user.update` với `roles: { set: ... }` → Prisma cập nhật bảng `_RoleToUser` (thay toàn bộ role cũ bằng role mới).

Sau khi gọi **Chỉnh sửa quyền** và **Lưu vai trò** trên admin: backend ghi đúng vào `_RoleToUser`, frontend refetch chi tiết user → "Vai trò được gán" và **Chính sách hiệu lực** hiển thị đúng (policies = quyền kế thừa từ các role).

---

**Nếu Chính sách hiệu lực vẫn trống khi test (vd. tài khoản admintest):**

1. **User phải có ít nhất một vai trò** – Vào Chi tiết user → "Chỉnh sửa quyền" → chọn vai trò (vd. **Quản trị viên cấp cao / ADMIN**) → Lưu vai trò.
2. **Role đó phải có quyền trong DB** – Chạy seed để gán permissions cho các role: `npm run prisma:seed` (trong thư mục user-service). Seed đã cập nhật: khi upsert role sẽ set lại permissions; user admin và **admintest** (email `admintest@example.com`, username `admintest`) được gán role ADMIN.
3. Nếu tài khoản admintest của bạn dùng **email khác** (không phải `admintest@example.com`): không dùng seed tạo mới, mà vào Quản lý user → mở chi tiết user đó → Chỉnh sửa quyền → chọn role **ADMIN** (hoặc role có quyền) → Lưu. Sau đó đóng sheet và mở lại chi tiết để refetch → Chính sách hiệu lực sẽ hiển thị.
4. **Restart user-service và api-gateway** sau khi sửa proto (có `UserPolicy` và `policies`).
