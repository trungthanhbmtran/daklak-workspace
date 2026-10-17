# Workflow Map (Kiến Trúc Quy Trình & Máy Trạng Thái BPMN)

Tài liệu này đặc tả kiến trúc điều phối quy trình nghiệp vụ tập trung của nền tảng, cơ chế ủy quyền giữa các Domain Services (`hrm-service`, `document-service`) và `workflow-service`, cùng vòng đời trạng thái (Lifecycle State Machines).

---

## 1. Mô Hình Điều Phối Quy Trình Tập Trung

`workflow-service` là **Source of Truth duy nhất** cho toàn bộ định nghĩa tiến trình (BPMN Workflow Definitions), vòng đời thực thể và điều kiện chuyển bước (State Transitions).

```mermaid
sequenceDiagram
    autonumber
    actor Officer as Cán bộ xử lý (Client)
    participant Gateway as API Gateway
    participant Domain as Domain Service (HRM/Document)
    participant WF as Workflow Service (Core Engine)
    participant DB as Domain Database
    participant RMQ as RabbitMQ Bus

    Officer->>Gateway: Gửi yêu cầu chuyển trạng thái (vd: Nộp duyệt / Thẩm định)
    Gateway->>Domain: gRPC invokeAction(entityId, action, actor)
    
    Note over Domain,WF: Domain Service không tự đổi trạng thái!
    Domain->>WF: gRPC ValidateTransition(processInstanceId, currentStatus, targetStatus, actorPermissions)
    
    alt Chuyển trạng thái hợp lệ
        WF-->>Domain: Result: { allowed: true, nextState: "PENDING_APPROVAL", transitionId }
        Domain->>DB: Cập nhật entity (status = nextState, audit trail)
        Domain->>WF: gRPC CompleteStep(processInstanceId, transitionId, payload)
        Domain->>RMQ: Publish Event (entity.state_changed)
        Domain-->>Gateway: Trả kết quả thành công kèm next actions
        Gateway-->>Officer: Envelope response (success: true, data, meta.actions)
    else Chuyển trạng thái bị từ chối
        WF-->>Domain: Result: { allowed: false, reason: "Thiếu quyền hoặc chưa hoàn thành bước tiên quyết" }
        Domain-->>Gateway: Throw RpcException (PERMISSION_DENIED / PRECONDITION_FAILED)
        Gateway-->>Officer: Envelope error (success: false, message: "Lý do từ chối")
    end
```

---

## 2. Máy Trạng Thái Điển Hình (Ví dụ: Vòng Đời Nhiệm Vụ - Task Lifecycle)

Quy trình giao việc và kiểm soát chất lượng thực hiện theo máy trạng thái chuẩn:

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Khởi tạo nhiệm vụ
    DRAFT --> ASSIGNED: Lãnh đạo giao việc / Phân công
    ASSIGNED --> IN_PROGRESS: Chuyên viên tiếp nhận & Bắt đầu xử lý
    
    state IN_PROGRESS {
        [*] --> DOING: Đang thực hiện
        DOING --> SUBTASK_REVIEW: Hoàn thành các bước chuyên môn
    }

    IN_PROGRESS --> PENDING_REVIEW: Chuyên viên nộp sản phẩm & Minh chứng
    
    PENDING_REVIEW --> REJECTED: Lãnh đạo trả lời / Yêu cầu chỉnh sửa
    REJECTED --> IN_PROGRESS: Chuyên viên tiếp thu & Bổ sung
    
    PENDING_REVIEW --> COMPLETED: Lãnh đạo thẩm định đạt chất lượng (100%)
    COMPLETED --> KPI_EVALUATED: Đánh giá xếp loại & Chấm điểm KPI
    KPI_EVALUATED --> CLOSED: Lưu trữ hồ sơ công việc
    CLOSED --> [*]
```

---

## 3. Phân Làn Trách Nhiệm (Swimlanes & Phân Quyền PBAC)

| Phân làn (Swimlane) | Vai trò thẩm quyền | Quyền hạn tương ứng trong Quy trình |
|---|---|---|
| **Lãnh đạo Cơ quan / Ban** | Phê duyệt cấp cao, ký phát hành, đánh giá toàn diện | Phê duyệt kế hoạch tổng thể, ký duyệt văn bản, chấm điểm tập thể. |
| **Lãnh đạo Phòng / Đơn vị** | Giao việc, đôn đốc, thẩm định sản phẩm | Phân công chuyên viên chủ trì/phối hợp, trả lại hồ sơ yêu cầu sửa, xác nhận hoàn thành công việc. |
| **Chuyên viên / Người xử lý** | Thực hiện nghiệp vụ trực tiếp | Cập nhật tiến độ (% hoàn thành), nộp minh chứng, giải trình, gửi yêu cầu gia hạn. |
| **Rule Engine Tự Động** | `workflow-service` | Tự động chuyển trạng thái "Quá hạn" (OVERDUE) khi hết thời hạn, tự tính điểm KPI theo công thức. |

---

## 4. Ràng Buộc Kiến Trúc Bắt Buộc Đối Với Workflow

1. **Tuyệt đối cấm Hard-code State Transitions ở Domain Service:**
   - Các coder agent khi viết logic tại `hrm-service` hay `document-service` **CẤM TUYỆT ĐỐI** tự ý viết:
     `if (status === 'DOING') status = 'COMPLETED'` mà không thông qua `workflow-service`.
2. **Idempotency & Distributed Outbox:**
   - Khi mạng chập chờn, mọi lệnh chuyển trạng thái phải sử dụng `ProcessedCommand` (chống Duplicate Event) và `OutboxEvent` (đảm bảo tính toàn vẹn dữ liệu) tại CSDL local trước khi đồng bộ về `workflow-service`.
3. **Data Sovereignty:**
   - `workflow-service` chỉ lưu trữ cấu trúc tiến trình (`WorkflowInstance`, `CurrentNode`, `StateHistory`), không lưu ruột chi tiết dữ liệu nghiệp vụ (như nội dung bài viết, file đính kèm hay danh sách nhân sự).
