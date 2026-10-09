# Kế hoạch khắc phục sơ đồ workflow không hiển thị

- [x] Tái hiện lỗi: ID CUID của quy trình khiến GET detail bị bộ bọc response phân loại nhầm thành list.
- [x] Bổ sung nhận diện CUID để response chi tiết giữ nguyên một đối tượng.
- [ ] Kiểm tra lại giao diện sau khi bản sửa được triển khai lên máy chủ.
- [x] Ghi nhận nguyên nhân và thay đổi mã nguồn vào roadmap.

## Kết quả kiểm tra

- `npm run typecheck --prefix apps/admin_khcn`: thành công.
- `npx tsc --noEmit --target ES2022 --module ESNext --moduleResolution Bundler --skipLibCheck --experimentalDecorators --types node shared/core/interceptors/transform.interceptor.ts`: thành công.
- Mẫu ID CUID `cmuyaf3ob000dfweq7wuqrtyu` khớp biểu thức nhận diện mới.
- Trang quản trị đang chạy trên máy chủ chưa được triển khai lại; cần xác nhận UI sau khi phát hành bản sửa.
