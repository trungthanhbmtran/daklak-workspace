# Database Rules

- **Database per Service:** Mỗi service sở hữu schema/database của mình. Không query trực tiếp database service khác; trao đổi qua gRPC/event theo contract.
- **Theo cấu hình hiện có:** Trước khi thêm model hoặc sửa schema, kiểm tra prisma schema, generator/output, datasource, Prisma version, driver/adapter và scripts của đúng service. Multi-file schema, output nội bộ và adapter chỉ áp dụng nếu cấu hình hiện tại hỗ trợ và đã dùng.
- **Client generation:** Chạy lệnh generate do package/service khai báo sau khi thay đổi schema; không tự giả định output directory hoặc version.
- **Migration an toàn:** Ưu tiên migration additive và kiểm tra diff/SQL trước khi áp dụng. Không dùng prisma db push trên production/shared database hoặc thay thế migration history. Chỉ dùng db push khi kế hoạch cho phép và database là môi trường test/dev cô lập có thể khôi phục. Không chạy lệnh destructive trên dữ liệu thật.
- **Verification:** Chạy schema validate/generate và kiểm tra migration trên database test cô lập khi cần. Ghi chính xác lệnh, target environment và kết quả; không ghi credential vào repo.