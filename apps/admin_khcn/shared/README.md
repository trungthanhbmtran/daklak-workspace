# Shared

Thư mục chứa code dùng chung cho **nhiều feature**, không gắn một domain cụ thể.

- **utils/** – Hàm tiện ích (format, validate, transform…).
- **constants/** – Hằng dùng chung (nhóm danh mục, mã trạng thái…).
- **types/** – Interface/type dùng ở nhiều feature.

Chỉ thêm file khi có ít nhất 2 feature sử dụng. Nếu chỉ một feature dùng thì giữ trong feature đó.
