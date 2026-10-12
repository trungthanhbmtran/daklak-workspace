# HỆ THỐNG SƠ ĐỒ KIẾN TRÚC & QUY TRÌNH (DIAGRAMS REPOSITORY)

Thư mục này tập trung toàn bộ các sơ đồ kiến trúc, luồng nghiệp vụ (Business Workflow) và máy trạng thái (State Machine) của hệ thống Nền tảng Điều hành Tỉnh ủy Đắk Lắk.

---

## Danh mục Sơ đồ Chi tiết

| STT | Tên tài liệu / Sơ đồ | Phạm vi nghiệp vụ | Định dạng | Liên kết |
| :---: | :--- | :--- | :---: | :--- |
| 1 | **Sơ đồ Luồng Quản lý Công việc Ban Tổ chức Tỉnh ủy** | Toàn bộ vòng đời công việc, quy trình giao việc, kiểm soát chất lượng 3 mức lỗi, quy trình đánh giá xếp loại chất lượng KPI/OKR (Mẫu 01 - Mẫu 05) của Ban Tổ chức Tỉnh ủy Đắk Lắk. | Mermaid (Flowchart, Sequence, State Machine) | [Xem chi tiết](./quan-ly-cong-viec-ban-to-chuc.md) |
| 2 | **Sơ đồ Kiến trúc Hệ thống & An toàn Thông tin Cấp độ 3** | Kiến trúc tổng thể các Microservices (Gateway, User, Task, Workflow, Evaluation, Document), hạ tầng MySQL, Redis, RabbitMQ, MinIO và an toàn thông tin Ban Tổ chức Tỉnh ủy. | Mermaid & Spec | [Xem chi tiết](../Informationsecurityleveldossier/ban-to-chuc-tinh-uy/SYSTEM_DIAGRAMS_ADDENDUM.md) |
| 3 | **Sơ đồ Tuần tự Chuyển đổi Trạng thái Task (Task State Transition)** | Luồng tương tác giữa Frontend, Gateway, HRM-Service, Workflow-Service và RabbitMQ Broker. | Mermaid Sequence | [Xem chi tiết](../modules/task-workflow.md) |

---

## Hướng dẫn Render & Sử dụng

1. **Xem trực tiếp trong Markdown**: Tất cả các sơ đồ sử dụng cú pháp chuẩn **Mermaid.js**, tự động hiển thị trong GitHub, GitLab, VS Code Markdown Preview, Antigravity IDE hoặc các công cụ tài liệu.
2. **Xuất ảnh chất lượng cao**: Sử dụng công cụ `mermaid-cli` (`mmdc`) hoặc trình duyệt để kết xuất ra định dạng SVG/PNG phục vụ in ấn thuyết minh và hồ sơ hành chính.
