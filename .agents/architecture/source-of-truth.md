# Source of Truth & Service Data Ownership

Xem chi tiết nguyên tắc bất biến trong `rules/source-of-truth.md` và `rules/service-boundaries.md`.

## Nguyên tắc cốt lõi:
- **KHÔNG LƯU TRÙNG LẶP DỮ LIỆU NGUYÊN GỐC**: Dữ liệu gốc thuộc về service nào, service đó là cơ quan có thẩm quyền và duy nhất quản lý. Các service khác chỉ lưu Reference ID (vd: `userId`, `jobTitleId`, `workflowId`).
- **KHÔNG TỰ TIỆN XÂY DỰNG KHUNG DỮ LIỆU RỜI RẠC**: Coder agents phải tra cứu kiến trúc trước khi code.

## Danh mục quyền sở hữu Source of Truth:
1. **`user-service`**:
   - Định danh: `User`, `Account`, `Auth`, `PBAC (Roles, Permissions)`.
   - Cơ cấu tổ chức: `OrganizationUnit` (Cây phân cấp đơn vị, phòng ban).
   - **Cấu trúc Vị trí việc làm (VTVL) & Định biên**: `JobTitle` (Chức danh VTVL), `OrganizationStaffing` (Đề án định biên phòng ban), `StaffingSlot` (Suất biên chế).
   - **Phân công nghiệp vụ theo dõi**: `StaffingSlotDomain` (Phân công lĩnh vực), `StaffingSlotGeographicArea` (Phân công địa bàn), `StaffingSlotMonitoredUnit` (Phân công phòng ban theo dõi).
   - *Lưu ý*: `hrm-service` khi giao việc hoặc đánh giá KPI phải tham chiếu cấu trúc VTVL và thông tin phân công này từ `user-service`.

2. **`workflow-service`**:
   - Nơi lưu trữ, cấu hình và mô tả toàn bộ các quy trình nghiệp vụ hệ thống.
   - Sở hữu: `WorkflowDefinition`, `ProcessVersion`, `ProcessInstance`, `WorkflowTransition`, `WorkflowTask`, BPMN Graph, Swimlanes, State Machines, Rule Engine tính điểm/rẽ nhánh.

3. **`api-gateway` (API Manager)**:
   - Cửa ngõ API hệ thống.
   - Nơi quản lý các nguồn kết nối chính: Quản lý danh mục API, cấu hình Upstream, xây dựng các API nội bộ và xây dựng các API liên thông hệ thống (LGSP Tỉnh, Cổng DVC, hệ thống bên ngoài). Không chứa business logic domain.

4. **`report-service`**:
   - Nơi thiết kế báo cáo hệ thống, xây dựng các Dashboard phân quyền sử dụng báo cáo cho từng cá nhân, đơn vị; là nơi các đơn vị truy cập theo dõi tiến độ, hiệu suất và số liệu toàn diện.

5. **`hrm-service`**:
   - Hồ sơ nhân viên (`employee`), Giao việc và kiểm soát chất lượng (`task`), Đánh giá KPI & Mẫu biểu (Mẫu 01 - 05), Kế hoạch năm/quý (`master_plan`, `rank_quota`).

6. **`document-service`**:
   - Văn bản điện tử (`document`), Hồ sơ công việc (`dossier`), Tủ tài liệu (`cabinet`), Biên bản họp (`minutes`).

7. **`media-service`**:
   - Tài nguyên đa phương tiện, file đính kèm MinIO, tài liệu mật mã hóa.
