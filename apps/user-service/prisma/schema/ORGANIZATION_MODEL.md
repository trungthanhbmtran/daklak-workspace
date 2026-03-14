# Mô hình Tổ chức & Chức danh theo Nghị định 24/2014/NĐ-CP và 107/2020/NĐ-CP

Tổ chức cơ quan chuyên môn thuộc UBND tỉnh, thành phố trực thuộc trung ương được quy định tại **Nghị định 24/2014/NĐ-CP** (quy định tổ chức các cơ quan chuyên môn thuộc UBND tỉnh, TP trực thuộc TW), được **sửa đổi, bổ sung bởi Nghị định 107/2020/NĐ-CP**.

---

## 1. Phân cấp tổ chức (Cơ cấu Sở theo Điều 5 NĐ 24/2014, 107/2020)

**Cơ cấu tổ chức của Sở** gồm:

| Thành phần | Mã loại đơn vị (UNIT_TYPE) | Ghi chú |
|------------|----------------------------|---------|
| Phòng chuyên môn, nghiệp vụ | `DIVISION` | Bắt buộc; tiêu chí tối thiểu 5–7 biên chế (tùy loại tỉnh) |
| Thanh tra | `INSPECTORATE` | Nếu có |
| Văn phòng | `OFFICE` | Nếu có; không thì giao 1 phòng chuyên môn kiêm nhiệm |
| Chi cục và tổ chức tương đương | `CHI_CUC` | Nếu có; tiêu chí tối thiểu 12 biên chế |
| Đơn vị sự nghiệp công lập | `CENTER` | Nếu có |

**Cấp trên trực tiếp:**

- **UBND tỉnh / TP trực thuộc TW** (`PROVINCE_PC`): cấp cao nhất trong phạm vi tỉnh.
- **Sở / Ban / Ngành** (`DEPARTMENT`): cơ quan chuyên môn thuộc UBND cấp tỉnh.
- **UBND quận/huyện** (`DISTRICT_PC`), **UBND phường/xã** (`WARD_PC`): theo Luật Tổ chức chính quyền địa phương.

Chi cục thuộc Sở có thể có **Phòng và tương đương** (tối thiểu 5 biên chế) → dùng chung loại `DIVISION` hoặc phòng thuộc chi cục.

---

## 2. Chức danh theo Nghị định (Điều 6 NĐ 24/2014, 107/2020)

### 2.1. Người đứng đầu và cấp phó Sở

| Chức danh | Áp dụng cho loại đơn vị | Số lượng (theo NĐ 107/2020) |
|-----------|--------------------------|-----------------------------|
| Giám đốc sở | Sở (`DEPARTMENT`) | 1/sở |
| Phó Giám đốc sở | Sở | Bình quân 3 Phó GĐ/sở; HN, HCM có thể tăng thêm không quá 10 |

### 2.2. Phòng chuyên môn, nghiệp vụ thuộc Sở

| Chức danh | Áp dụng | Số lượng Phó (theo biên chế) |
|-----------|---------|------------------------------|
| Trưởng phòng | Phòng (`DIVISION`), Chi cục (phòng thuộc chi cục) | 1 Phó (dưới ngưỡng); không quá 2 (từ ngưỡng đến 14); không quá 3 (từ 15 trở lên) |
| Phó Trưởng phòng | Như trên | Theo quy định chi tiết theo loại tỉnh |

### 2.3. Thanh tra, Văn phòng, Chi cục thuộc Sở

| Chức danh | Áp dụng | Số lượng Phó |
|-----------|---------|--------------|
| Chánh Thanh tra / Phó Chánh Thanh tra | Thanh tra Sở (`INSPECTORATE`) | 1 Phó (dưới 8 biên chế); không quá 2 (từ 8 trở lên) |
| Chánh Văn phòng / Phó Chánh Văn phòng | Văn phòng Sở (`OFFICE`) | Như Phó Trưởng phòng thuộc sở |
| Chi cục trưởng / Phó Chi cục trưởng | Chi cục (`CHI_CUC`) | 1 Phó (1–3 phòng); không quá 2 (không có phòng hoặc từ 4 phòng trở lên) |

### 2.4. UBND cấp tỉnh / cấp huyện

| Chức danh | Áp dụng |
|-----------|---------|
| Chủ tịch / Phó Chủ tịch | UBND tỉnh (`PROVINCE_PC`), UBND huyện (`DISTRICT_PC`) |

### 2.5. Đơn vị sự nghiệp công lập

| Chức danh | Áp dụng |
|-----------|---------|
| Giám đốc / Phó Giám đốc | Đơn vị sự nghiệp (`CENTER`) |

### 2.6. Công chức chuyên môn

| Chức danh | Áp dụng |
|-----------|---------|
| Chuyên viên, Chuyên viên chính | Các đơn vị có bố trí công chức chuyên môn (Phòng, Sở, Chi cục, Văn phòng, Thanh tra, Đơn vị sự nghiệp, UBND...) |

---

## 3. Lĩnh vực và theo dõi phòng ban (dành cho lãnh đạo)

- **Lĩnh vực quản lý** do **cấp trên trực thuộc** giao. Ví dụ: UBND giao Sở Tài chính quản lý đầu tư, quản lý tiền, quyết toán… thì các phòng ban trực thuộc Sở thực hiện theo các lĩnh vực đó. **Một đơn vị có thể được giao nhiều lĩnh vực** (bảng trung gian UnitDomain).
- **Lãnh đạo mỗi đơn vị** chỉ theo dõi được **theo nhiệm vụ của cấp trên trực thuộc**:
  - **Lĩnh vực phụ trách** (chức danh): chỉ chọn trong lĩnh vực quản lý mà cấp trên đã giao cho đơn vị đó.
  - **Theo dõi phòng ban**: chỉ chọn **đơn vị trực thuộc (con)** của đơn vị — tức các phòng/ban mà lãnh đạo đơn vị này theo dõi trong phạm vi nhiệm vụ được giao.

---

## 4. Mô hình dữ liệu (Schema)

### 4.1. Đơn vị (OrganizationUnit)

- **typeId** → Danh mục loại đơn vị (group `UNIT_TYPE`): PROVINCE_PC, DEPARTMENT, DIVISION, CHI_CUC, INSPECTORATE, OFFICE, CENTER, DISTRICT_PC, WARD_PC.
- **Lĩnh vực quản lý**: bảng trung gian `UnitDomain` (nhiều lĩnh vực, do cấp trên giao).
- **Phạm vi (scope)**, **Lãnh đạo**: xác định qua JobPosition (is_unit_leader, is_deputy_leader).

### 4.2. Chức danh (JobTitle)

- **Áp dụng theo loại đơn vị**: bảng `JobTitleUnitType` (chức danh ↔ unit_type_id). Ví dụ: Sở không có Chủ tịch; Phòng không có Giám đốc; Chi cục có Chi cục trưởng/Phó.
- **Lĩnh vực phụ trách** (domainId): trong lĩnh vực quản lý của đơn vị (theo nhiệm vụ cấp trên giao). **Khu vực địa lý** (geographicAreaId). **Theo dõi phòng ban** (JobTitleMonitoredUnit): chỉ đơn vị con trực thuộc.
- **Vị trí việc làm** (Nghị định 62/2020): authority_level, reports_to (báo cáo trực tiếp).

### 4.3. Định biên (OrganizationStaffing)

- Mỗi đơn vị + chức danh: **quantity** (số lượng định biên), **currentCount** (hiện có).
- Số lượng Phó Giám đốc, Phó Trưởng phòng... tuân theo NĐ 107/2020 (có thể kiểm tra/ghi chú trong description hoặc quy tắc nghiệp vụ).

---

## 5. Tài liệu tham chiếu

- **Nghị định 24/2014/NĐ-CP** ngày 04/4/2014: Quy định tổ chức các cơ quan chuyên môn thuộc UBND tỉnh, thành phố trực thuộc trung ương.
- **Nghị định 107/2020/NĐ-CP** ngày 14/9/2020: Sửa đổi, bổ sung một số điều của Nghị định 24/2014/NĐ-CP (cơ cấu Sở, tiêu chí thành lập phòng/chi cục, số lượng Phó Giám đốc, Phó Trưởng phòng...).
- **Nghị định 62/2020/NĐ-CP**: Vị trí việc làm, biên chế công chức (chức danh, ngạch).
