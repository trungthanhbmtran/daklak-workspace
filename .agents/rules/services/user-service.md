# User Service (Admin Systems)
- **Database**: `admin_systems`
- **Vai trò cốt lõi**:
  1. Quản lý định danh User, Account, Xác thực Auth, Phân quyền PBAC (Roles, Permissions).
  2. Quản lý Cơ cấu tổ chức (`OrganizationUnit` - Cây đơn vị, phòng ban).
  3. **Cấu trúc Vị trí việc làm (VTVL) & Định biên (BẮT BUỘC LÀ SOURCE OF TRUTH)**:
     - Danh mục chức danh nghề nghiệp / VTVL (`JobTitle`).
     - Đề án vị trí việc làm và biên chế theo từng đơn vị (`OrganizationStaffing`).
     - Quản lý từng suất biên chế cụ thể (`StaffingSlot`).
  4. **Phân công nghiệp vụ theo dõi**:
     - Phân công lĩnh vực phụ trách (`StaffingSlotDomain`).
     - Phân công địa bàn quản lý (`StaffingSlotGeographicArea`).
     - Phân công phòng ban/đơn vị theo dõi (`StaffingSlotMonitoredUnit`).
- **Ràng buộc đối với các Service khác**:
  - `hrm-service`, `workflow-service`, `document-service` khi phân công công việc, giao chỉ tiêu KPI hay gán thẩm quyền xử lý **BẮT BUỘC** phải tham chiếu cấu trúc VTVL và thông tin phân công từ `user-service`.
  - Tuyệt đối KHÔNG tự ý xây dựng bảng hoặc định nghĩa lại khung VTVL độc lập gây xung đột hoặc lược bỏ ranh giới dữ liệu chuẩn.
