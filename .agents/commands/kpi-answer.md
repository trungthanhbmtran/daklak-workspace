# Command: kpi-answer — Xây dựng Bài trả lời & Rà soát Phần mềm Quản lý, Đánh giá KPI/OKR

**Mục tiêu:** Cung cấp giải pháp kỹ thuật, rà soát 9 nhóm chức năng theo đề bài và vẽ sơ đồ kiến trúc dựa trên bằng chứng hiện tại trong repo.

---

> **Yêu cầu kiểm chứng:** Bảng, endpoint, service, công thức và sơ đồ bên dưới là danh sách cần rà soát, không phải kết luận mặc định. Xác minh từng mục bằng schema/proto/controller/service/UI/test hiện hành; dẫn file hoặc lệnh và phân loại ĐÃ XÁC MINH / CHƯA ĐỦ BẰNG CHỨNG / KHÔNG TÌM THẤY. Không khẳng định “100% hoàn thành” hoặc kết luận pháp lý khi thiếu bằng chứng/source chính thức. Lấy phiên bản framework từ package manifest hiện tại.

## I. MA TRẬN RÀ SOÁT TÍNH NĂNG THEO ĐỀ BÀI (FEATURE AUDIT MATRIX)

Bảng đối chiếu 9 nhóm chức năng tối thiểu theo đề bài với hiện trạng mã nguồn thực tế trong repo (`user-service`, `hrm-service`, `workflow-service`, `report-service`, `api-gateway`, `admin_khcn`):

| STT | Nhóm chức năng theo đề bài | Service chủ quản (Source of Truth) & CSDL | Các bảng CSDL / Proto / Endpoint thực tế | Trạng thái hiện tại | Đánh giá & Rà soát chi tiết |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **1** | **Quản lý cán bộ, công chức, phòng chuyên môn và vị trí việc làm (VTVL)** | **`user-service`** (`admin_systems`) & **`hrm-service`** (`admin_hrm`) | • `user-service`: `Organization`, `JobTitle`, `OrganizationStaffing`, `StaffingSlot`, `StaffingSlotDomain`, `StaffingSlotGeographicArea`, `StaffingSlotMonitoredUnit`<br>• `hrm-service`: `Employee`, `JobPosition`<br>• Proto: `users/users.proto`, `hrm/employee.proto` | **Cần kiểm chứng** | Chuẩn hóa toàn bộ VTVL định biên, phòng chuyên môn và cơ cấu tổ chức tại `user-service`. `hrm-service` đồng bộ mã chức danh, số hiệu công chức và lưu hồ sơ nhân sự chi tiết. Giao diện quản lý tại `admin_khcn/features/hrm/components/Employee*Client.tsx`. |
| **2** | **Quản lý nhiệm vụ và bộ tiêu chí KPI/OKR** | **`hrm-service`** (`admin_hrm`) & **`workflow-service`** (`admin_workflow`) | • `hrm-service`: `Task`, `TaskCategory`, `TaskTemplate`, `KpiPeriod`, `KpiCriterion`, `KpiRuleSet`, `KpiFormTemplate`<br>• Proto: `hrm/task.proto`, `hrm/kpi.proto`<br>• Endpoints: `POST /tasks`, `POST /kpi/criteria`, `POST /kpi/periods` | **Cần kiểm chứng** | Hỗ trợ lập kế hoạch công việc (nhiệm vụ thường xuyên, đột xuất, nhiệm vụ trọng tâm theo NQ 18, 05-HD/TU). Quản lý cấu hình tiêu chí KPI 6 trục, ma trận trọng số động theo mảng việc (`DOM_THAM_DINH`, `DOM_VAN_THU`, `DOM_IT_ATTT`, `DOM_THAM_MUU`). |
| **3** | **Cập nhật, theo dõi kết quả thực hiện nhiệm vụ** | **`hrm-service`** (`admin_hrm`) & **`media-service`** (`admin_media`) | • `hrm-service`: `TaskProgress`, `TaskItem`, `TaskAttachment`, `TaskComment`<br>• UI: `task-detail-drawer.tsx`, `task-detail-processing-tab.tsx`, `task-respond-dialog.tsx`<br>• Engine: Cảnh báo trễ hạn (Deadline Warning) | **Cần kiểm chứng** | Cán bộ cập nhật % tiến độ, đính kèm file minh chứng kết quả (kết nối `media-service`). Hỗ trợ luồng xin gia hạn thời gian giải quyết công việc được duyệt trước 24h để không bị trừ điểm tiến độ. |
| **4** | **Tự động tính điểm, xếp loại theo tháng, quý, năm** | **`hrm-service`** (`admin_hrm`) & **`workflow-service`** | • `hrm-service`: `KpiCalculatorEngine` (`kpi-calculator.engine.ts`), `KpiEvaluation`, `RankQuotaRule`<br>• Method: `rpc CalculatePersonalKpi`<br>• Rule: Xếp loại 4 mức (Xuất sắc, Tốt, Hoàn thành, Không hoàn thành) kèm khống chế tỷ lệ theo định ngạch | **Cần kiểm chứng** | Tự động hóa 100% công thức: Điểm tổng = Điểm chung (30đ) + Điểm nhiệm vụ (70đ quy đổi từ KPI 4 thành tố $A\% \times w_A + B\% \times w_B + C\% \times w_C + D\% \times w_D$). Khống chế tỷ lệ Hoàn thành xuất sắc nhiệm vụ không vượt quá trần quy định (15% - 20%). |
| **5** | **Tổng hợp kết quả cá nhân và tập thể** | **`hrm-service`** (`admin_hrm`) & **`report-service`** (`admin_report`) | • `hrm-service`: `KpiEvaluationAggregate`, `task-kpi.service.ts`<br>• Method: `rpc GetEvaluationStats`<br>• UI: `task-dashboard.tsx` | **Cần kiểm chứng** | Tự động gom nhóm điểm theo Phòng ban/Đơn vị (Group By / Average Score), tính điểm trung bình tập thể phòng ban, so sánh hiệu suất giữa các chuyên viên và giữa các phòng chuyên môn trực thuộc. |
| **6** | **Phân quyền người sử dụng và phê duyệt kết quả** | **`user-service`** (PBAC) & **`workflow-service`** (BPMN) | • `user-service`: `PbacPolicy`, `Role`, `UserRole`<br>• `workflow-service`: `WF_BTCTU_DANH_GIA_KPI` (Quy trình đánh giá gồm các bước: Tự chấm -> Trưởng phòng duyệt -> Hội đồng thẩm định -> Lãnh đạo Ban phê duyệt)<br>• Method: `rpc SubmitEvaluation`, `rpc ApproveEvaluation` | **Cần kiểm chứng** | Phân quyền PBAC kiểm soát chặt chẽ theo `organizationId`. Quy trình duyệt đa cấp ủy quyền cho `workflow-service` điều phối trạng thái (`DRAFT` -> `SUBMITTED` -> `REVIEWED` -> `APPROVED`), chống can thiệp chéo thẩm quyền. |
| **7** | **Lưu lịch sử chỉnh sửa, cập nhật dữ liệu** | **`hrm-service`** (`admin_hrm`) | • `hrm-service`: `TaskHistory`, `KpiEvaluationHistory`<br>• UI: `task-detail-history-tab.tsx`<br>• Audit: Ghi nhận `actorId`, `oldValue`, `newValue`, `actionType`, `timestamp` | **Cần kiểm chứng** | Ghi vết kiểm toán (Audit Trail) bất biến cho mọi thao tác cập nhật tiến độ, giao lại việc, gia hạn hạn chót, thay đổi điểm số chấm của lãnh đạo phòng và lãnh đạo ban. |
| **8** | **Tra cứu, thống kê, báo cáo và xuất kết quả** | **`report-service`** (`admin_report`) & **`hrm-service`** | • `report-service`: `ReportDefinition`, `ReportRun`, `DatasetSnapshot`<br>• `hrm-service`: `rpc FindEvaluations`<br>• Xuất dữ liệu: Excel / PDF Export engine | **Cần kiểm chứng** | Tra cứu bộ lọc đa chiều theo phòng ban, quý, năm, ngạch công chức. Tích hợp engine sinh file Excel/PDF bảng tổng hợp kết quả đánh giá xếp loại theo mẫu biểu hành chính. |
| **9** | **Dashboard tự động tổng hợp, dự thảo báo cáo / quyết định theo mẫu** | **`report-service`** & **`document-service`** & **`admin_khcn`** | • `report-service`: `ReportTemplate`, `ReportWidget`<br>• `document-service`: `DocumentTemplate`, `Dossier`<br>• UI: Widget biểu đồ động (Bar, Pie, Radar 6 trục KPI), nút sinh Dự thảo Quyết định xếp loại khen thưởng | **Cần kiểm chứng** | Dashboard trực quan hóa phân bổ điểm số và xếp loại toàn cơ quan; tự động điền dữ liệu KPI vào phôi văn bản (Template engine) để xuất ra dự thảo Báo cáo tổng kết và Quyết định xếp loại cán bộ công chức trình Lãnh đạo ký duyệt. |

---

## II. SƠ ĐỒ KIẾN TRÚC HỆ THỐNG TỔNG THỂ (MERMAID SYSTEM ARCHITECTURES)

### 1. Sơ đồ Kiến trúc Microservices & Luồng Dữ liệu (System Architecture Diagram)

```mermaid
flowchart TB
    subgraph CLIENT_LAYER["LỚP GIAO DIỆN NGƯỜI DÙNG (FRONTEND CLIENT)"]
        UI_ADMIN["Cổng Quản trị Nội bộ (admin_khcn)\nNext.js App Router theo phiên bản trong package manifest | TailwindCSS | Shadcn UI\n(Quản lý VTVL, Giao việc, Chấm điểm KPI/OKR, Dashboard)"]
        UI_PORTAL["Cổng Dịch vụ công & Công khai (portal-goverment)\nNext.js theo phiên bản trong package manifest | Tra cứu minh bạch hóa"]
    end

    subgraph GATEWAY_LAYER["CỬA NGÕ BẢO MẬT & ĐIỀU HƯỚNG (API GATEWAY & MANAGER)"]
        GW["API Gateway (NestJS)\n• Xác thực JWT & PBAC Context Injection\n• Phân giải Routing /api/v1/admin/*\n• gRPC Client Metadata Delegation (GatewayContextToken)\n• Integration Hub (Trục liên thông LGSP / DVC)"]
    end

    subgraph MICROSERVICES_LAYER["LỚP CÁC DỊCH VỤ NGHIỆP VỤ (CORE & DOMAIN MICROSERVICES)"]
        direction TB
        subgraph CORE_SERVICES["Dịch vụ Nền tảng"]
            USER_SVC["user-service (gRPC)\n[DB: admin_systems]\n• Source of Truth Cán bộ & PBAC\n• Cây Cơ cấu tổ chức Phòng ban\n• Vị trí việc làm (VTVL) & Suất biên chế\n• Phân công lĩnh vực/địa bàn phụ trách"]
            WF_SVC["workflow-service (gRPC)\n[DB: admin_workflow]\n• State Machine & BPMN Engine\n• Quy trình giao việc & Phê duyệt KPI\n• Điều phối phân làn (Swimlanes)"]
            MEDIA_SVC["media-service (gRPC)\n[DB: admin_media | MinIO/S3]\n• Lưu trữ minh chứng, sản phẩm công việc"]
        end

        subgraph DOMAIN_SERVICES["Dịch vụ Nghiệp vụ Chuyên sâu"]
            HRM_SVC["hrm-service (gRPC)\n[DB: admin_hrm]\n• Hồ sơ Cán bộ công chức (Employee)\n• Quản lý Nhiệm vụ (Task / TaskItem)\n• Engine Tính điểm KPI 6 trục (kpi-calculator)\n• Quản lý kỳ đánh giá & Định mức xếp loại\n• Lịch sử sửa đổi & Nhật ký Audit"]
            DOC_SVC["document-service (gRPC)\n[DB: admin_document]\n• Văn bản đi/đến & Liên kết nhiệm vụ\n• Quản lý Phôi Dự thảo Quyết định/Báo cáo"]
            REPORT_SVC["report-service (gRPC)\n[DB: admin_report]\n• Thiết kế Báo cáo & Dashboard phân quyền\n• Trực quan hóa số liệu xếp loại tập thể/cá nhân\n• Xuất báo cáo theo mẫu biểu quy định"]
        end
    end

    subgraph EVENT_BUS["HỆ THỐNG TRUYỀN THÔNG ĐỒNG BỘ & BẤT ĐỒNG BỘ"]
        GRPC_CONN["Kênh gRPC Nội bộ (HTTP/2 Proto3 Binary - Tốc độ cao)"]
        RABBIT_MQ["RabbitMQ Message Broker (Async Event Bus)\n• Sự kiện hoàn thành nhiệm vụ\n• Sự kiện chốt điểm KPI\n• Sự kiện phát thông báo (notification-service)"]
    end

    %% Client -> Gateway
    UI_ADMIN -->|"REST API / HTTP/JSON"| GW
    UI_PORTAL -->|"REST API / HTTP/JSON"| GW

    %% Gateway -> Services via gRPC
    GW -->|"gRPC Call + GatewayContextToken"| USER_SVC
    GW -->|"gRPC Call"| HRM_SVC
    GW -->|"gRPC Call"| WF_SVC
    GW -->|"gRPC Call"| DOC_SVC
    GW -->|"gRPC Call"| REPORT_SVC
    GW -->|"gRPC Call"| MEDIA_SVC

    %% Service to Service gRPC & Event
    HRM_SVC -.->|"Lấy cơ cấu VTVL & Định biên (gRPC)"| USER_SVC
    HRM_SVC -.->|"Ủy quyền duyệt đánh giá (gRPC)"| WF_SVC
    HRM_SVC -.->|"Liên kết văn bản minh chứng (gRPC)"| DOC_SVC
    HRM_SVC -.->|"Lưu trữ file sản phẩm (gRPC)"| MEDIA_SVC
    HRM_SVC -->|"Bắn Event cập nhật điểm (AMQP)"| RABBIT_MQ
    RABBIT_MQ -->|"Ghi nhận số liệu Dashboard (CQRS)"| REPORT_SVC
```

---

### 2. Sơ đồ Luồng Đánh giá KPI & Dự thảo Quyết định (BPMN / Sequence Workflow)

```mermaid
sequenceDiagram
    autonumber
    actor CB as Cán bộ / Chuyên viên
    actor TP as Trưởng phòng chuyên môn
    actor LDB as Lãnh đạo Ban / Đơn vị
    participant UI as Admin Dashboard (admin_khcn)
    participant GW as API Gateway
    participant HRM as HRM Service (KPI Engine)
    participant WF as Workflow Service (BPMN)
    participant DOC as Document & Report Service

    Note over CB, LDB: GIAI ĐOẠN 1: THỰC HIỆN NHIỆM VỤ & THEO DÕI TIẾN ĐỘ
    CB->>UI: Cập nhật tiến độ nhiệm vụ & nộp file sản phẩm
    UI->>GW: POST /api/v1/admin/tasks/:id/progress
    GW->>HRM: rpc UpdateTaskProgress(id, percent, attachments)
    HRM-->>UI: Ghi nhận thành công, cập nhật Audit Trail

    Note over CB, LDB: GIAI ĐOẠN 2: TỰ CHẤM & PHÊ DUYỆT ĐIỂM KPI
    CB->>UI: Mở phiếu đánh giá kỳ (Tháng/Quý), nhập điểm tự chấm
    UI->>GW: POST /api/v1/admin/kpi/evaluations/submit
    GW->>HRM: rpc SubmitEvaluation(employeeCode, details)
    HRM->>WF: Kích hoạt Process Instance (WF_BTCTU_DANH_GIA_KPI)
    WF-->>HRM: Chuyển trạng thái 'SUBMITTED' -> Giao việc Trưởng phòng duyệt

    TP->>UI: Mở màn hình Thẩm định cấp phòng, xem KPI 4 thành tố (A, B, C, D)
    TP->>UI: Điều chỉnh điểm chất lượng (lỗi văn bản, tiến độ) & bấm Duyệt
    UI->>GW: POST /api/v1/admin/kpi/evaluations/approve-dept
    GW->>HRM: rpc ReviewEvaluation(evaluationId, scores)
    HRM->>WF: Chuyển bước duyệt lên Lãnh đạo Ban ('REVIEWED')

    LDB->>UI: Kiểm tra bảng tổng hợp cá nhân/tập thể & tỷ lệ khống chế xuất sắc
    LDB->>UI: Ký duyệt chốt điểm xếp loại
    UI->>GW: POST /api/v1/admin/kpi/evaluations/finalize
    GW->>HRM: rpc ApproveEvaluation(evaluationId)
    HRM->>HRM: Chạy KpiCalculatorEngine (Tính tổng điểm 100 & xếp loại 4 mức)
    HRM->>WF: Chuyển trạng thái 'APPROVED' (Hoàn tất)

    Note over CB, LDB: GIAI ĐOẠN 3: DASHBOARD TỔNG HỢP & DỰ THẢO QUYẾT ĐỊNH
    LDB->>UI: Mở Dashboard tổng hợp kết quả toàn cơ quan
    UI->>GW: GET /api/v1/admin/reports/kpi-summary
    GW->>DOC: rpc GenerateDraftDecision(periodId, orgId)
    DOC->>HRM: Lấy danh sách điểm & xếp loại đã duyệt
    DOC-->>UI: Trả về Dashboard biểu đồ + File Dự thảo Báo cáo / Quyết định khen thưởng (.docx/.pdf)
```

---

## III. MÔ TẢ ĐẶC TẢ KỸ THUẬT CHO 9 NHÓM CHỨC NĂNG

### 1. Quản lý cán bộ, công chức, phòng chuyên môn và VTVL
- **Nguyên tắc Source of Truth**: Bắt buộc sử dụng thực thể từ `user-service`.
- **Cấu trúc dữ liệu**:
  - `Organization`: Quản lý sơ đồ hình cây của đơn vị và các phòng chuyên môn trực thuộc.
  - `JobTitle`: Danh mục chức danh, vị trí việc làm (ngạch Chuyên viên, Chuyên viên chính, Trưởng phòng, Phó Trưởng phòng...).
  - `OrganizationStaffing` & `StaffingSlot`: Đề án định biên vị trí việc làm, số lượng biên chế được giao và đã tuyển dụng.
  - `StaffingSlotDomain`: Phân công lĩnh vực phụ trách (Tổ chức cán bộ, Bảo vệ chính trị nội bộ, Đào tạo bồi dưỡng...).
  - `Employee` (`hrm-service`): Hồ sơ công chức, mã số ngạch, chức vụ hiện tại, phòng ban công tác.

### 2. Quản lý nhiệm vụ và bộ tiêu chí KPI/OKR
- **Phân loại nhiệm vụ**:
  - Nhiệm vụ theo kế hoạch thường xuyên (`KHOI_LUONG_KH`).
  - Nhiệm vụ đột xuất do Lãnh đạo Ban giao bổ sung (`KHOI_LUONG_DOT_XUAT`).
  - Nhiệm vụ tham mưu đề án / chuyên đề trọng tâm theo Nghị quyết.
- **Bộ tiêu chí KPI 6 trục & Ma trận trọng số**:
  - Trọng số $w_A$ (Khối lượng công việc - hệ số độ khó $K \in [1.0, 5.0]$).
  - Trọng số $w_B$ (Chất lượng sản phẩm - trừ điểm lỗi nhỏ 5%, lỗi trung bình 15%, lỗi nghiêm trọng 35%, thưởng sản phẩm xuất sắc +10%).
  - Trọng số $w_C$ (Tiến độ thực hiện - trước hạn +10%, đúng hạn 100%, trễ hạn trừ theo tỷ lệ %).
  - Trọng số $w_D$ (Mức độ chủ động / Trách nhiệm lãnh đạo quản lý).
  - Ma trận trọng số động thay đổi theo mảng việc (`domain_code`): Thẩm định (Chất lượng 50%), Văn thư (Khối lượng 40%), CNTT/ATTT (Tiến độ 35%), Tham mưu (Chất lượng 40%).

### 3. Cập nhật, theo dõi kết quả thực hiện nhiệm vụ
- Hỗ trợ cập nhật tiến độ nhiều lần (`TaskProgress`), ghi chú các khó khăn vướng mắc.
- Đính kèm file sản phẩm minh chứng lên `media-service`.
- Cơ chế giám sát thời hạn giải quyết: Tự động gửi cảnh báo qua WebSocket/RabbitMQ khi nhiệm vụ còn 48h, 24h hoặc quá hạn. Cho phép tạo phiếu xin gia hạn giải quyết công việc được duyệt trước 24h để bảo lưu 100% điểm tiến độ.

### 4. Tự động tính điểm, xếp loại theo tháng, quý, năm
- **Công thức tính điểm**:
  $$S_{\text{tổng}} = S_{\text{chung}} (30.0đ) + S_{\text{nhiệm vụ}} (70.0đ)$$
  $$S_{\text{nhiệm vụ}} = \frac{KPI_{\text{trung bình}}}{100} \times 70.0$$
- **Cơ chế xếp loại 4 mức tiêu chuẩn**:
  - Hoàn thành xuất sắc nhiệm vụ: Tổng điểm $\ge 90.0$ điểm (Khống chế không quá 20% tổng số cán bộ của đơn vị).
  - Hoàn thành tốt nhiệm vụ: $70.0 \le$ Tổng điểm $< 90.0$ điểm.
  - Hoàn thành nhiệm vụ: $50.0 \le$ Tổng điểm $< 70.0$ điểm.
  - Không hoàn thành nhiệm vụ: Tổng điểm $< 50.0$ điểm hoặc có vi phạm kỷ luật/lỗi nghiệp vụ nghiêm trọng.

### 5. Tổng hợp kết quả cá nhân và tập thể
- Bảng xếp hạng KPI cá nhân (Leaderboard) theo phòng ban và toàn đơn vị.
- Điểm đánh giá tập thể phòng ban được tính bằng trung bình cộng điểm cá nhân kết hợp với tỷ lệ hoàn thành các nhiệm vụ chung của phòng chuyên môn.

### 6. Phân quyền người sử dụng và phê duyệt kết quả
- Ràng buộc bảo mật PBAC kết hợp `organizationId` của cơ quan chủ quản.
- Phân vai rõ ràng:
  - Chuyên viên: Xem nhiệm vụ được giao, cập nhật tiến độ, tự chấm điểm.
  - Trưởng phòng: Giao việc cho chuyên viên, duyệt điểm cấp phòng, đánh giá điểm chung $S_{\text{chung}}$.
  - Hội đồng thẩm định / Thường trực: Thẩm định hồ sơ, kiểm tra tỷ lệ ngạch xuất sắc.
  - Lãnh đạo Ban / Thủ trưởng cơ quan: Ký phê duyệt quyết định xếp loại cuối cùng.

### 7. Lưu lịch sử chỉnh sửa, cập nhật dữ liệu (Audit Trail)
- Lưu toàn bộ vết thay đổi trong bảng `TaskHistory` và `KpiEvaluationHistory`.
- Ghi nhận định danh người thực hiện, thời gian sửa đổi, giá trị trước và sau khi thay đổi, lý do điều chỉnh điểm.

### 8. Tra cứu, thống kê, báo cáo và xuất kết quả
- Lọc theo nhiều tiêu chí: Họ tên, phòng ban, vị trí việc làm, kỳ đánh giá, mức xếp loại.
- Kết xuất dữ liệu ra file Excel theo mẫu tổng hợp của cơ quan hoặc xuất phiếu đánh giá cá nhân ra file PDF có gắn mã vạch/mã tra cứu.

### 9. Dashboard tự động tổng hợp & Dự thảo báo cáo / quyết định theo mẫu
- Giao diện Dashboard hiển thị các biểu đồ trực quan (Biểu đồ cột so sánh tiến độ phòng ban, biểu đồ tròn phân bổ mức xếp loại, biểu đồ radar 6 trục năng lực).
- Chức năng tự động móc nối số liệu kết quả đánh giá vào phôi văn bản hành chính:
  - Mẫu Báo cáo tổng kết công tác đánh giá, xếp loại cán bộ công chức tháng/quý/năm.
  - Mẫu Quyết định công nhận kết quả đánh giá, xếp loại và khen thưởng cán bộ hoàn thành xuất sắc nhiệm vụ.
