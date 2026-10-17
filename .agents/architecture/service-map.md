# Service Map (Detailed Architecture)

Dự án Đắk Lắk Government Platform được thiết kế theo kiến trúc Microservices. Dưới đây là danh sách chi tiết các service, bao gồm chức năng (dựa trên gRPC proto) và cơ sở dữ liệu (Source of Truth).

## 1. Core Services (Nền tảng)

- **`api-gateway`**
  - **Chức năng**: API Gateway đóng vai trò cửa ngõ (routing) cho toàn bộ request từ Client. Chịu trách nhiệm Authentication, giải mã JWT, và chuyển tiếp request tới các service tương ứng thông qua gRPC.
  - **API Manager & Integration Hub**: Nơi quản lý các nguồn kết nối chính bao gồm các API, xây dựng API nội bộ, và xây dựng các API liên thông kết nối với các hệ thống bên ngoài (LGSP, Cổng DVC, các hệ sinh thái CSDL ngành).
  - **Lưu ý kiến trúc**: Tuyệt đối không chứa business logic của domain hay query trực tiếp database của service khác. (DB: `daklak_db`)

- **`user-service`** (DB: `admin_systems`)
  - **Chức năng**: Source of Truth cho toàn bộ danh tính người dùng, phân quyền (PBAC) và **Cơ cấu tổ chức - Vị trí việc làm định biên**.
  - **Quản lý cốt lõi**:
    - `user` (Tài khoản, Hồ sơ người dùng), `auth` (Xác thực), `pbac` (Roles, Permissions).
    - `organization` (Cây cơ cấu tổ chức đơn vị, phòng ban).
    - **Cấu trúc Vị trí việc làm (VTVL) & Định biên**: Chức danh nghề nghiệp (`job_titles`), đề án vị trí việc làm theo đơn vị (`org_staffing`), quản lý suất biên chế (`staffing_slots`).
    - **Phân công theo dõi nghiệp vụ**: Phân công lĩnh vực phụ trách (`staffing_slot_domains`), phân công địa bàn quản lý (`staffing_slot_geographic_areas`), phân công phòng ban theo dõi (`staffing_slot_monitored_units`). Các service khác (như `hrm-service`) khi thực hiện giao việc/đánh giá BẮT BUỘC phải tham chiếu và sử dụng cấu trúc VTVL & phân công từ `user-service`, tuyệt đối không tự dựng khung vị trí việc làm rời rạc hay bỏ qua nguồn này.
    - `menus`, `categories` hệ thống.

- **`workflow-service`** (DB: `admin_workflow`)
  - **Chức năng**: Trái tim của hệ thống quy trình nghiệp vụ. Nơi lưu trữ, cấu hình và mô tả toàn bộ các quy trình nghiệp vụ của hệ thống (BPMN Workflow Definitions, Process Instances, State Transitions).
  - **Quản lý**: Định nghĩa quy trình (`Workflow Definition`), sơ đồ phân làn (Swimlanes), phiên bản tiến trình, các bước duyệt, điều kiện chuyển trạng thái, Rule Engine tính toán tự động. Mọi service khác khi cần duyệt hoặc thực hiện chu trình xử lý (như Task, Document, Cấp phép) BẮT BUỘC phải ủy quyền điều phối logic cho `workflow-service`.

- **`media-service`** (DB: `admin_media`)
  - **Chức năng**: Quản lý tập trung tài nguyên đa phương tiện và file đính kèm. Giao tiếp với MinIO/S3 để upload/download. Trả về FileID hoặc URL cho các service khác lưu trữ Reference.

## 2. Business Domain Services (Nghiệp vụ)

- **`hrm-service`** (DB: `admin_hrm`)
  - **Chức năng**: Quản trị nhân sự và hiệu suất công việc.
  - **Quản lý**: `employee` (Hồ sơ nhân sự), `task` (Giao việc, nhắc việc, nộp sản phẩm, thẩm định chất lượng), `kpi` (Đánh giá hiệu suất cá nhân và tập thể theo các Mẫu biểu), `master_plan`, `rank_quota`. Kế thừa và gắn kết chặt chẽ với VTVL định biên từ `user-service`.

- **`document-service`** (DB: `admin_document`)
  - **Chức năng**: Quản lý văn bản điện tử và điều hành.
  - **Quản lý**: `document` (Văn bản đến/đi), `dossier` (Hồ sơ), `cabinet` (Tủ tài liệu), `minutes` (Biên bản họp), `consultation` (Xin ý kiến). 

- **`posts-service`** (DB: `admin_posts`)
  - **Chức năng**: Nền tảng CMS phục vụ Cổng thông tin (Portal).
  - **Quản lý**: `post` (Bài viết, tin tức), `category`, `banner`, `interaction` (Bình luận, tương tác), `portal_menu`, `portal_config`.

- **`report-service`** (DB: `admin_report`)
  - **Chức năng**: Nơi thiết kế báo cáo hệ thống, xây dựng các Dashboard phân quyền sử dụng báo cáo cho từng cá nhân, đơn vị; là nơi các đơn vị truy cập theo dõi tiến độ, hiệu suất và số liệu toàn diện.
  - **Quản lý**: Báo cáo tổng hợp, thống kê phân tích số liệu động, thiết kế mẫu biểu báo cáo, cấp quyền xem dashboard báo cáo theo thẩm quyền. Thu thập dữ liệu thông qua gRPC hoặc sự kiện RabbitMQ từ các service nghiệp vụ, không query chéo CSDL.

## 3. Communication & Integration Services (Tương tác & Tích hợp)

- **`chat-service`** (DB: `admin_chat`)
  - **Chức năng**: Xử lý tin nhắn nội bộ, chat trực tuyến (real-time), phòng chat công việc và hội thoại dự án.
  - **Quản lý**: `conversation` (Cuộc hội thoại DIRECT/GROUP/TASK), `message` (Tin nhắn văn bản, hệ thống, tệp đính kèm), `participant` (Thành viên tham gia, phân quyền ADMIN/MEMBER, kiểm tra IDOR an toàn qua composite key `conversationId_userId`), `read_receipt` (Trạng thái đọc tin nhắn), `presence` (Trạng thái trực tuyến Redis với TTL 60s tự phục hồi). 

- **`notification-service`** (DB: `admin_notification`)
  - **Chức năng**: Nhận Event/Message từ RabbitMQ để phát thông báo (In-app, Push, Email). Không tự sinh ra sự kiện nghiệp vụ.

- **`translate-service`** (DB: `daklak_translation`)
  - **Chức năng**: Xử lý dịch thuật đa ngữ phục vụ nội dung Portal hoặc văn bản.

## 4. Frontend Applications

- **`admin_khcn`**: Trang quản trị (Admin Dashboard) dành cho cán bộ công chức/viên chức. Gọi API qua `api-gateway`.
- **`portal-goverment`**: Cổng thông tin điện tử (Public Portal) dành cho người dân và doanh nghiệp.
