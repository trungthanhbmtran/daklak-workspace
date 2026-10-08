# Tài liệu Rà soát, Đánh giá Hệ thống API và Thiết kế Báo cáo

Tài liệu này trình bày kết quả rà soát, bản vẽ các luồng nghiệp vụ tạo API, đánh giá kiến trúc hệ thống API (API Gateway & API Management), cùng với thiết kế luồng nghiệp vụ tạo, lưu trữ và gán báo cáo (Report Assignments) cho từng cá nhân và đơn vị sử dụng trong hệ thống Daklak Workspace.

---

## 1. Rà soát và Luồng Nghiệp vụ Tạo API (API Management)

Hệ thống quản lý API (API Management) được đặt tại `user-service` kết hợp với `API Gateway` để xử lý khai báo Inbound/Outbound, quản lý phiên bản (Revision) và cấp phát khóa (API Partner/Consumer).

### 1.1. Luồng Nghiệp vụ Khai báo và Tạo API

```mermaid
sequenceDiagram
    participant Admin as Admin / API Manager
    participant UI as Admin UI (React)
    participant GW as API Gateway (NestJS)
    participant US as User Service (gRPC)
    participant DB as MySQL (Prisma)
    
    Admin->>UI: Nhập thông tin Upstream & Endpoints mới
    UI->>GW: POST /api/v1/api-management/upstreams
    GW->>GW: Auth & PermissionsGuard (kiểm tra quyền INTEGRATION:MANAGE)
    GW->>US: gRPC CreateUpstream()
    US->>DB: Lưu IntegrationUpstream & ApiEndpoint
    US-->>GW: Trả về Upstream ID
    GW-->>UI: 200 OK (Kèm dữ liệu meta)
    
    Admin->>UI: Cấp phát khóa API (Tạo API Partner)
    UI->>GW: POST /api/v1/api-management/partners
    GW->>US: gRPC CreatePartnerKey()
    US->>DB: Lưu ApiPartner & ApiPartnerKey (Mã hóa Secret)
    US-->>GW: Trả về Public Key / Secret (Một lần)
    GW-->>UI: 200 OK (Kèm Secret)
    UI-->>Admin: Hiển thị Khóa API để đối tác cấu hình
```

### 1.2. Bảng Mô tả Dữ liệu Hệ thống API (ERD)

```mermaid
erDiagram
    IntegrationUpstream ||--o{ ApiEndpoint : has
    IntegrationUpstream ||--o{ ApiRevision : versions
    ApiPartner ||--o{ ApiPartnerKey : holds
    IntegrationUpstream {
        string id PK
        string name
        string baseUrl
        string authType
    }
    ApiEndpoint {
        string id PK
        string upstreamId FK
        string path
        string method
        string requireScopes
    }
    ApiPartner {
        string id PK
        string name
        string organizationId
    }
    ApiPartnerKey {
        string id PK
        string partnerId FK
        string apiKeyHash
        string scopes
        datetime expiresAt
    }
```

### 1.3. Đánh giá Hệ thống API
- **Bảo mật 3 Lớp (Defense in Depth)**: Hệ thống sử dụng SecurityMiddleware (Anti-DDoS, IP blocklist), JwtAuthGuard (RS256 + Redis JTI Denylist), và PermissionsGuard. Đây là kiến trúc rất mạnh mẽ, giảm tải xử lý cho Backend.
- **Khả năng Mở rộng (Scalability)**: Tách bạch rõ ràng Gateway (nhẹ, xử lý I/O HTTP) và Core Services (chạy gRPC, tương tác DB).
- **Chính sách Quyền riêng tư (Data Sovereignty)**: Gateway không tương tác DB, không làm rò rỉ dữ liệu nhạy cảm của các service nội bộ.
- **Khuyến nghị**: Đối với tính năng Rate Limit cho API Inbound, cần đảm bảo sử dụng Quota linh hoạt theo từng `ApiPartner` (Consumer-based rate limiting) thay vì chỉ IP/User hiện tại.

---

## 2. Thiết kế Luồng Nghiệp vụ Báo cáo & Phân quyền Báo cáo

Theo thiết kế hiện tại, `report-service` đã có khả năng tạo `ReportTemplate`, `ReportWidget` và nhận `StatisticsSnapshot`. Để đáp ứng yêu cầu **"gán báo cáo cho từng cá nhân, đơn vị sử dụng"**, chúng ta cần bổ sung thêm khái niệm **Report Assignment** (Phân quyền Báo cáo).

### 2.1. Đề xuất Lược đồ Dữ liệu (ERD Bổ sung cho Báo cáo)

```mermaid
erDiagram
    ReportTemplate ||--o{ ReportWidget : contains
    ReportTemplate ||--o{ ReportAssignment : has_assignments
    
    ReportTemplate {
        int id PK
        string title
        string description
        json layout
    }
    ReportWidget {
        int id PK
        int templateId FK
        string chartType
        string dataSourceCode
    }
    ReportAssignment {
        string id PK
        int templateId FK
        string assigneeType "USER | UNIT | GROUP"
        string assigneeId "userId hoặc unitId"
        string permissions "VIEW | EDIT"
    }
    StatisticsSnapshot {
        int id PK
        string dataSourceCode
        json data
        datetime recordedAt
    }
```

### 2.2. Luồng Nghiệp vụ Lưu Mẫu Báo cáo và Gán Quyền

```mermaid
sequenceDiagram
    participant User as Người dùng (Admin/Manager)
    participant UI as Bảng điều khiển Báo cáo
    participant GW as API Gateway
    participant RS as Report Service
    participant DB as Report DB
    
    User->>UI: Kéo thả Widget, phân tích dữ liệu API
    UI->>GW: POST /reports/table/preview (Kiểm tra dữ liệu)
    GW->>RS: Analyze Data Source (Dynamic/Static)
    RS-->>UI: Hiển thị Bảng xem trước (Preview)
    
    User->>UI: Bấm "Lưu Báo Cáo"
    UI->>GW: POST /reports/templates { widgets, layout, title }
    GW->>RS: gRPC CreateTemplate()
    RS->>DB: Lưu ReportTemplate & ReportWidget
    RS-->>GW: Trả về templateId
    GW-->>UI: 200 OK
    
    User->>UI: Chọn Cá nhân / Đơn vị để Gán quyền (Share)
    UI->>GW: POST /reports/templates/:id/assignments { assigneeType, assigneeId }
    GW->>RS: gRPC AssignReport()
    RS->>DB: Lưu ReportAssignment (Loại = USER hoặc UNIT)
    RS-->>GW: 200 OK
    GW-->>UI: Thông báo "Gán báo cáo thành công"
```

### 2.3. Luồng Tải Báo cáo cho Cá nhân/Đơn vị (Đọc dữ liệu)

```mermaid
sequenceDiagram
    participant User as Người dùng thông thường
    participant UI as Dashboard Báo cáo
    participant GW as API Gateway
    participant RS as Report Service
    
    User->>UI: Truy cập Trang Báo Cáo
    UI->>GW: GET /reports/templates/my-reports
    Note right of GW: Gateway truyền UserID và UnitID xuống Service
    GW->>RS: gRPC GetUserReports(userId, unitId)
    RS->>RS: Tìm các ReportTemplate có ReportAssignment mapping với userId/unitId
    RS-->>GW: Danh sách ReportTemplate hợp lệ
    GW-->>UI: Hiển thị các Template Báo cáo được cấp quyền
    
    UI->>GW: GET /reports/templates/:id/data (Load dữ liệu)
    GW->>RS: ExecuteTable/Load Snapshot
    RS-->>UI: Dữ liệu JSON (Đã phân trang & nhóm)
    UI-->>User: Hiển thị Đồ thị / Bảng
```

## 3. Tổng kết Hành động Kế tiếp (Action Items)

1. **Cập nhật Schema**: Thêm model `ReportAssignment` vào `schema.prisma` của `report-service`.
2. **Triển khai gRPC**: Thêm RPC `AssignReport` và `GetMyAssignedReports` vào `report.proto`.
3. **Cập nhật Gateway & UI**: Tạo giao diện cho phép chọn danh sách Nhân viên/Đơn vị (`user-service` cung cấp) và gọi API phân quyền trên trang quản lý báo cáo.
