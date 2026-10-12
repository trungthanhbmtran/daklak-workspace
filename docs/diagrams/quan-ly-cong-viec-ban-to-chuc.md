# SƠ ĐỒ LUỒNG QUẢN LÝ CÔNG VIỆC - BAN TỔ CHỨC TỈNH ỦY ĐẮK LẮK (BTCTU)

Tài liệu này chuẩn hóa toàn bộ luồng nghiệp vụ và luồng kỹ thuật của hệ thống Quản lý Công việc (Task & Work Management Lifecycle) tại **Ban Tổ chức Tỉnh ủy Đắk Lắk**, tuân thủ theo:
- **Quy định số 01-QĐ/BTCTU** về chức năng, nhiệm vụ và tổ chức bộ máy cơ quan Ban Tổ chức Tỉnh ủy.
- **Hướng dẫn số 05-HD/TU & Quy định số 39-QĐ/TU** của Ban Thường vụ Tỉnh ủy về đánh giá, xếp loại chất lượng cán bộ, công chức.
- **Quy định số 348-QĐ/BTCTW** của Ban Tổ chức Trung ương về bảo vệ chính trị nội bộ.
- **Nghị định số 85/2016/NĐ-CP** (An toàn thông tin Cấp độ 3) & **Nghị định số 63/2026/NĐ-CP** (Bảo vệ bí mật nhà nước trên môi trường số).

---

## 1. SƠ ĐỒ 1: LUỒNG NGHIỆP VỤ TỔNG THỂ (BUSINESS SWIMLANE WORKFLOW)

Sơ đồ phân làn (Swimlane) thể hiện chu trình khép kín từ khâu tiếp nhận chỉ đạo, phân công, thực thi, kiểm soát chất lượng 3 mức lỗi, ký duyệt phát hành đến nghiệm thu và đánh giá KPI.

```mermaid
flowchart TD
    %% LANES / PHÂN CẤP THẨM QUYỀN
    subgraph BTVTU["BAN THƯỜNG VỤ TỈNH ỦY / THƯỜNG TRỰC TỈNH ỦY"]
        direction TB
        BTV_01["1. Giao nhiệm vụ, phê duyệt chương trình công tác<br>(Lịch công tác, Đề án, Quy hoạch, Nhân sự)"]
        BTV_02["10. Ban hành Nghị quyết / Kết luận / Quyết định<br>(Phê duyệt nhân sự, ban hành đề án)"]
    end

    subgraph LANH_DAO_BAN["LÃNH ĐẠO BAN TỔ CHỨC TỈNH ỦY (Trưởng ban & 4 Phó ban)"]
        direction TB
        LDB_01["2. Tiếp nhận chỉ đạo & Phân công chỉ đạo<br>• Trưởng ban: Điều hành chung<br>• Phó ban 1: TCCB, Biên chế, VTVL<br>• Phó ban 2: TCCSĐ & Đảng viên<br>• Phó ban 3: BVCTNB Mức 3<br>• Phó ban 4: Đào tạo, Chính sách, CĐS"]
        LDB_02{"Phê duyệt Kế hoạch /<br>Giao việc cấp Phòng"}
        LDB_03["8. Xem xét, ký duyệt Tờ trình & Kết luận<br>(Ký số phát hành hoặc trình BTVTU)"]
        LDB_04["12. Chủ trì Hội đồng Đánh giá & Ban hành Quyết định xếp loại (Mẫu 05)"]
    end

    subgraph LANH_DAO_PHONG["LÃNH ĐẠO PHÒNG CHUYÊN MÔN (Trưởng/Phó phòng - 05 Phòng)"]
        direction TB
        LDP_01["3. Tiếp nhận nhiệm vụ & Lập Kế hoạch chi tiết<br>(Xác định độ khó K, thời hạn, trọng số A/B/C/D)"]
        LDP_02["4. Phân công Chuyên viên chủ trì & Phối hợp<br>(Gán Checklist / Steps nghiệp vụ)"]
        LDP_03{"7. Thẩm định sản phẩm<br>& Kiểm soát 3 mức lỗi"}
        LDP_04["Trả lại yêu cầu chỉnh sửa<br>(Trừ điểm chất lượng B%)"]
        LDP_05["Ký nháy & Lập Tờ trình trình Lãnh đạo Ban"]
        LDP_06["11. Họp phòng chấm điểm & Tổng hợp Mẫu 03"]
    end

    subgraph CHUYEN_VIEN["CHUYÊN VIÊN NGHIỆP VỤ & NGƯỜI PHỐI HỢP"]
        direction TB
        CV_01["5. Tiếp nhận việc & Kích hoạt trạng thái Đang làm<br>(Chuyên viên TCCB, TCCSĐ, BVCTNB, CNTT, Văn thư)"]
        CV_02["6. Thực thi nghiệp vụ đặc thù theo lĩnh vực:<br>• TCCB: Thẩm định hồ sơ cán bộ, Mẫu 2C<br>• TCCSĐ: Nghiệp vụ đảng viên, LGSP, Sổ tay ĐV<br>• BVCTNB: Xác minh chính trị, quản lý Mức 3<br>• Văn phòng: Quản lý văn bản Mật, Uptime 99.5%"]
        CV_03["Xin gia hạn hạn chót<br>(Duyệt trước 24h: không trừ điểm C%)"]
        CV_04["Hoàn tất hồ sơ & Nộp sản phẩm kèm minh chứng"]
        CV_05["10b. Tự đánh giá Mẫu 02 & Kê khai Nổi trội Mẫu 04"]
    end

    %% FLOW CONNECTIONS
    BTV_01 --> LDB_01
    LDB_01 --> LDB_02
    LDB_02 --> LDP_01
    LDP_01 --> LDP_02
    LDP_02 --> CV_01
    CV_01 --> CV_02
    CV_02 -.->|Khi có lý do khách quan| CV_03
    CV_03 -.->|Chấp thuận| CV_02
    CV_02 --> CV_04
    CV_04 --> LDP_03

    LDP_03 --"Có lỗi (Sai thể thức/số liệu/pháp lý)"--> LDP_04
    LDP_04 --> CV_02
    LDP_03 --"Đạt chuẩn chất lượng"--> LDP_05
    LDP_05 --> LDB_03

    LDB_03 --"Trình cấp trên"--> BTV_02
    LDB_03 --"Ban hành nội bộ"--> LDP_06
    BTV_02 --> LDP_06

    CV_04 --> CV_05
    CV_05 --> LDP_06
    LDP_06 --> LDB_04
```

---

## 2. SƠ ĐỒ 2: TUẦN TỰ KỸ THUẬT HỆ THỐNG (TECHNICAL SEQUENCE DIAGRAM)

Mô tả tương tác thời gian thực giữa **Web Frontend (Next.js)**, **API Gateway**, **HRM Service**, **Workflow Service**, **Message Queue (RabbitMQ)**, **Storage (MinIO)** và **Database (MySQL)**:

```mermaid
sequenceDiagram
    autonumber
    actor Officer as Cán bộ / Lãnh đạo
    participant UI as Next.js Web Frontend
    participant GW as API Gateway (NestJS)
    participant HRM as hrm-service (Domain Task)
    participant WF as workflow-service (State Engine)
    participant DB as MySQL Database
    participant MinIO as MinIO Object Storage
    participant MQ as RabbitMQ Broker
    participant Notif as notification-service

    %% BƯỚC GIAO VIỆC
    rect rgb(240, 248, 255)
    Note over Officer, HRM: 1. Khởi tạo & Giao việc (Create Task)
    Officer->>UI: Tạo nhiệm vụ, chọn người chủ trì, thời hạn, độ khó K
    UI->>GW: POST /api/v1/admin/tasks (GatewayContextToken)
    GW->>HRM: gRPC CreateTask(CreateTaskRequest)
    HRM->>WF: gRPC GetInitialNode("TASK_PROCESSING_FLOW")
    WF-->>HRM: Return initialNode ("TODO", allowedActions: ["START", "REASSIGN"])
    HRM->>DB: INSERT Task & TaskParticipants
    HRM->>MQ: Publish event: "task.created"
    HRM-->>GW: Return TaskResponse (kèm statusLabel: "Chờ thực hiện")
    GW-->>UI: Hiển thị task mới trong danh sách
    MQ-->>Notif: Consume "task.created"
    Notif-->>Officer: Push Web Socket & Thông báo nhiệm vụ mới
    end

    %% BƯỚC THỰC THI & NỘP SẢN PHẨM
    rect rgb(255, 250, 240)
    Note over Officer, MinIO: 2. Bắt đầu làm & Nộp sản phẩm (In Progress -> Reviewing)
    Officer->>UI: Bấm "Bắt đầu thực hiện"
    UI->>GW: POST /api/v1/admin/tasks/:id/status (Action: "START")
    GW->>HRM: gRPC UpdateTaskStatus
    HRM->>WF: gRPC ResumeWorkflow (action: "START")
    WF-->>HRM: Transition Allowed -> NextStatus: "IN_PROGRESS"
    HRM->>DB: UPDATE Task SET status = 'IN_PROGRESS'
    HRM-->>UI: Cập nhật giao diện: statusLabel = "Đang thực hiện"

    Officer->>UI: Upload tài liệu kết quả/minh chứng & Bấm "Nộp duyệt"
    UI->>GW: Upload Multipart Form
    GW->>MinIO: Lưu trữ file mã hóa an toàn (Buckets nghiệp vụ)
    MinIO-->>GW: Trả về FileId / URL
    GW->>HRM: gRPC UpdateTaskStatus (Action: "SUBMIT_FOR_REVIEW", fileId)
    HRM->>WF: gRPC ResumeWorkflow (action: "SUBMIT_FOR_REVIEW")
    WF-->>HRM: NextStatus: "REVIEWING"
    HRM->>DB: UPDATE Task SET status = 'REVIEWING'
    HRM->>MQ: Publish event: "task.submitted"
    MQ-->>Notif: Báo Lãnh đạo phòng có sản phẩm cần thẩm định
    end

    %% BƯỚC THẨM ĐỊNH & PHÊ DUYỆT
    rect rgb(240, 255, 240)
    Note over Officer, DB: 3. Thẩm định & Phê duyệt (Approval Gate)
    Officer->>UI: Lãnh đạo phòng thẩm định sản phẩm
    alt Phát hiện sai sót (Trả lại sửa)
        Officer->>UI: Bấm "Trả lại" (nhập lý do, phân loại mức lỗi 5%/15%/35%)
        UI->>GW: POST /api/v1/admin/tasks/:id/status (Action: "RETURN", rejectReason)
        GW->>HRM: gRPC UpdateTaskStatus (Action: "RETURN")
        HRM->>WF: gRPC ResumeWorkflow (action: "RETURN")
        WF-->>HRM: NextStatus: "RETURNED"
        HRM->>DB: UPDATE Task SET status = 'RETURNED', rejectCount += 1
        HRM->>MQ: Publish event: "task.returned"
        MQ-->>Notif: Thông báo chuyên viên sửa đổi hồ sơ
    else Đạt yêu cầu chất lượng
        Officer->>UI: Bấm "Duyệt hoàn thành"
        UI->>GW: POST /api/v1/admin/tasks/:id/status (Action: "APPROVE")
        GW->>HRM: gRPC UpdateTaskStatus (Action: "APPROVE")
        HRM->>WF: gRPC ResumeWorkflow (action: "APPROVE")
        WF-->>HRM: NextStatus: "DONE"
        HRM->>DB: UPDATE Task SET status = 'DONE', completedAt = NOW()
        HRM->>DB: Tính toán sơ bộ điểm KPI công việc (KPI_i)
        HRM->>MQ: Publish event: "task.completed"
        HRM-->>GW: Return TaskResponse (statusLabel: "Hoàn thành")
        GW-->>UI: Cập nhật thẻ nhiệm vụ sang "Hoàn thành"
    end
    end
```

---

## 3. SƠ ĐỒ 3: MÁY TRẠNG THÁI VÒNG ĐỜI CÔNG VIỆC (TASK STATE MACHINE LIFECYCLE)

Sơ đồ biểu diễn tất cả các trạng thái chuẩn, sự kiện chuyển đổi và quy tắc chặn (Guard Conditions) của một công việc tại Ban Tổ chức Tỉnh ủy:

```mermaid
stateDiagram-v2
    [*] --> TEMPLATE: Lập Kế hoạch khung đầu kỳ (Mẫu 01)
    TEMPLATE --> TODO: Lãnh đạo giao việc chính thức
    [*] --> TODO: Giao việc đột xuất / Khẩn cấp

    TODO --> IN_PROGRESS: Chuyên viên bấm "Bắt đầu làm"
    TODO --> RETURNED: Từ chối tiếp nhận (có lý do chính đáng)
    RETURNED --> TODO: Lãnh đạo phân công lại người khác

    IN_PROGRESS --> IN_PROGRESS: Xin gia hạn (Duyệt trước 24h: Giữ 100% điểm C)
    IN_PROGRESS --> IN_PROGRESS: Cập nhật tiến độ / Phối hợp liên phòng

    IN_PROGRESS --> REVIEWING: Nộp sản phẩm & Minh chứng đầu ra
    
    REVIEWING --> RETURNED: Lãnh đạo phòng yêu cầu sửa (Trừ điểm lỗi B%)
    RETURNED --> IN_PROGRESS: Chuyên viên chỉnh sửa theo ý kiến thẩm định

    REVIEWING --> PENDING_APPROVAL: Trưởng phòng duyệt -> Trình Lãnh đạo Ban
    PENDING_APPROVAL --> REVIEWING: Lãnh đạo Ban chỉ đạo rà soát lại
    PENDING_APPROVAL --> DONE: Lãnh đạo Ban ký duyệt / Ký số phát hành

    DONE --> EVALUATED: Tự chấm Mẫu 02, Hội đồng Ban xếp loại (Mẫu 05)
    
    TODO --> CANCELLED: Hủy nhiệm vụ (Nhiệm vụ không còn phù hợp)
    IN_PROGRESS --> CANCELLED: Đình chỉ thực hiện theo chỉ đạo BTVTU

    DONE --> [*]
    EVALUATED --> [*]
    CANCELLED --> [*]
```

---

## 4. SƠ ĐỒ 4: LUỒNG ĐÁNH GIÁ KPI & KHỐNG CHẾ CHẤT LƯỢNG (KPI/OKR EVALUATION WORKFLOW)

Quy trình đánh giá, phân loại cán bộ hằng quý dựa trên 05 Mẫu biểu hành chính và thuật toán khống chế trần chất lượng:

```mermaid
flowchart TD
    subgraph GIAI_DOAN_1["GIAI ĐOẠN 1: TỰ ĐÁNH GIÁ (Trước ngày 15 tháng cuối quý)"]
        GD1_1["Công chức tổng hợp danh mục công việc đã hoàn thành"]
        GD1_2["Lập Bản tự đánh giá, chấm điểm KPI (MẪU 02):<br>• S_chung (tối đa 30 điểm)<br>• S_nhiệm vụ (quy đổi từ KPI_i sang thang 70)"]
        GD1_3["Lập Bảng kê khai Nhiệm vụ Nổi trội, Vượt mức (MẪU 04)<br>(Điều kiện bắt buộc để xét Xuất sắc)"]
        GD1_1 --> GD1_2
        GD1_2 --> GD1_3
    end

    subgraph GIAI_DOAN_2["GIAI ĐOẠN 2: TẬP THỂ PHÒNG THẨM ĐỊNH (Từ ngày 15 đến 20)"]
        GD2_1["Họp toàn thể Chi bộ / Phòng chuyên môn"]
        GD2_2["Tập thể góp ý, Trưởng phòng thẩm định điểm từng cá nhân"]
        GD2_3["Tổng hợp kết quả đánh giá Tập thể phòng (MẪU 03):<br>• Điểm tập thể (S_collective)<br>• Bảng đề xuất xếp loại của tất cả công chức"]
        GD2_1 --> GD2_2
        GD2_2 --> GD2_3
    end

    subgraph GIAI_DOAN_3["GIAI ĐOẠN 3: HỘI ĐỒNG BAN THẨM ĐỊNH & SIẾT TRẦN (Từ ngày 21 đến 25)"]
        GD3_1["Hội đồng Thẩm định Ban Tổ chức Tỉnh ủy họp xét duyệt"]
        GD3_2["Đối soát dữ liệu tự động với 08 Nguồn hệ thống:<br>• Sổ văn bản đi/đến, Time-stamp ký số<br>• CSDL Đảng viên, LGSP, CSDL Cán bộ 2C<br>• CSDL BVCTNB Mức 3, CSDL Sức khỏe"]
        GD3_3{"Kiểm tra Điều kiện Bắt buộc Hạ bậc:<br>• Kỷ luật Đảng / Hành chính?<br>• Chỉ tiêu hoàn thành < 70%?<br>• Lọt lộ bí mật nhà nước?"}
        GD3_4["Hạ bậc: 'KHÔNG HOÀN THÀNH NHIỆM VỤ'"]
        
        GD3_5{"Xét danh hiệu<br>'HOÀN THÀNH XUẤT SẮC':<br>• S_tổng ≥ 90.0 điểm?<br>• Có Mẫu 04 Nổi trội hợp lệ?"}
        GD3_6["Áp trần Khống chế 20%:<br>Số Xuất sắc ≤ INT(20% × Tổng số Tốt trở lên)"]
        GD3_7["Áp trần Người đứng đầu:<br>Rank_Trưởng phòng ≤ Rank_Tập thể phòng"]
        GD3_8["Xếp loại: 'HOÀN THÀNH TỐT' hoặc 'HOÀN THÀNH'"]

        GD3_1 --> GD3_2
        GD3_2 --> GD3_3
        GD3_3 --"Có vi phạm"--> GD3_4
        GD3_3 --"Không vi phạm"--> GD3_5
        GD3_5 --"Đủ điều kiện"--> GD3_6
        GD3_5 --"Không đủ điều kiện"--> GD3_8
        GD3_6 --> GD3_7
    end

    subgraph GIAI_DOAN_4["GIAI ĐOẠN 4: BAN HÀNH QUYẾT ĐỊNH (Trước ngày 28)"]
        GD4_1["Dự thảo Quyết định xếp loại chất lượng (MẪU 05)"]
        GD4_2["Trưởng ban ký duyệt ban hành & Công khai toàn cơ quan"]
        GD4_3["Báo cáo kết quả lên Ban Thường vụ Tỉnh ủy"]
        GD4_1 --> GD4_2
        GD4_2 --> GD4_3
    end

    GIAI_DOAN_1 --> GIAI_DOAN_2
    GIAI_DOAN_2 --> GIAI_DOAN_3
    GD3_7 --> GD4_1
    GD3_8 --> GD4_1
    GD3_4 --> GD4_1
```

---

## 5. MA TRẬN PHÂN QUYỀN VÀ TRÁCH NHIỆM THEO 05 PHÒNG BAN (RACI MATRIX)

| Giai đoạn / Tác vụ | Lãnh đạo Ban (`TT-01`) | Phòng TCCB (`TT-03`) | Phòng TCCSĐ (`TT-02`) | Phòng BVCTNB (`TT-04`) | Văn phòng Ban (`TT-05`) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Giao nhiệm vụ BTVTU & Kế hoạch quý** | **A / R** | C | C | C | C |
| **Thẩm định hồ sơ cán bộ bổ nhiệm / Mẫu 2C** | A | **R** | C | C (Xác minh CT) | I |
| **Nghiệp vụ Đảng viên & Sổ tay ĐV qua LGSP** | A | C | **R** | C | I |
| **Xác minh chính trị & Quản lý CSDL Mức 3** | A | C | C | **R** | I |
| **Quản trị văn bản Mật & ATTT Cấp 3 (Uptime 99.5%)** | A | I | I | C | **R** |
| **Chấm điểm cá nhân Mẫu 02 & Nổi trội Mẫu 04** | A | **R** | **R** | **R** | **R** |
| **Tổng hợp điểm Tập thể phòng Mẫu 03** | A | **R** | **R** | **R** | **R** |
| **Hội đồng Ban thẩm định & Áp trần 20%** | **A / R** | C | C | C | C |
| **Ký quyết định phê duyệt xếp loại Mẫu 05** | **A / R** | I | I | I | I |

*(Ký hiệu RACI: **R** = Responsible - Người thực hiện; **A** = Accountable - Người phê duyệt/chịu trách nhiệm tối cao; **C** = Consulted - Đơn vị phối hợp/tham vấn; **I** = Informed - Nhận thông tin thông báo).*
