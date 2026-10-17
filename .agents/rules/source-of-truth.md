# Source of Truth

Agent không được duplicate business logic hoặc entity chỉ để tiện lợi. Dữ liệu gốc nằm ở đâu, phải lấy từ đó.

- **user-service**: User, Account, PBAC (Roles, Permissions), Organization (Cây đơn vị), **Cấu trúc Vị trí việc làm (VTVL) định biên** (`job_titles`, `org_staffing`, `staffing_slots`), **Phân công theo dõi** (`staffing_slot_domains`, `staffing_slot_geographic_areas`, `staffing_slot_monitored_units`), System Menus, **Master Data & Toàn bộ Danh mục dùng chung** (`sys_categories`: AI_PROVIDER_TYPE, TRANSLATION_SERVICE_TYPE, các nhóm danh mục nghiệp vụ dùng chung), AI Service routing & models catalog.
- **hrm-service**: Employee Profile, Task (Giao việc, nhắc việc, nộp sản phẩm, chấm điểm lỗi), KPI & Mẫu biểu đánh giá (Mẫu 01 - 05), Kế hoạch năm/quý (`master_plan`, `rank_quota`). Kế thừa và sử dụng VTVL định biên từ `user-service`.
- **workflow-service**: Nơi lưu trữ và mô tả toàn bộ quy trình nghiệp vụ hệ thống. Workflow definitions, BPMN Graph, Swimlanes, Instance execution state, Transitions, Rule Engine tính toán.
- **api-gateway (API Manager)**: Cửa ngõ API, quản lý nguồn kết nối API chính, xây dựng API nội bộ và liên thông (LGSP, DVC, hệ thống ngoài), chuyển đổi giao thức HTTP sang gRPC, validate ranh giới API, chuẩn hóa response/error format. Không chứa business logic domain (tham chiếu [`.agents/rules/services/api-gateway.md`](services/api-gateway.md)).
- **report-service**: Nơi thiết kế báo cáo hệ thống, xây dựng Dashboard phân quyền theo dõi cho cá nhân và đơn vị. Lấy dữ liệu thống kê qua gRPC/RabbitMQ.
- **media-service**: File, Media, Encrypted Documents (MinIO storage).
- **document-service**: Electronic Documents (Văn bản đến/đi, hồ sơ lưu trữ, biên bản họp).
- **posts-service**: Posts, News, Banners, Portal CMS.
- **chat-service**: Internal chat, real-time messaging.

Nếu cần dữ liệu của service khác, BẮT BUỘC dùng gRPC client gọi sang service chủ quản hoặc subscribe RabbitMQ event. Tuyệt đối KHÔNG query chéo CSDL hoặc tự ý nhân bản/xây dựng lại các cấu trúc đã có service sở hữu riêng (đặc biệt là VTVL định biên tại `user-service`).
