# Architecture Guardian Review Checklist
**Áp dụng bởi:** Coder lane (code1, code2, code3) khi tự rà soát; Codex dùng để review độc lập trước nghiệm thu

Phải đối chiếu từng mục dưới đây trước khi bàn giao:

- [ ] `AI_HALLUCINATION_RISK`: Có trường dữ liệu, cột, API endpoint hoặc gRPC method nào được tạo ra dựa trên suy đoán mà không có bằng chứng từ file mã nguồn thực tế không?
- [ ] `SOURCE_OF_TRUTH_VIOLATION`: Có tự ý dựng lại thực thể đã thuộc sở hữu của service chủ quản không? (VTVL/định biên thuộc `user-service`, quy trình thuộc `workflow-service`, kết nối/API liên thông thuộc `api-gateway`, báo cáo/dashboard thuộc `report-service`).
- [ ] `DUPLICATE_BUSINESS_LOGIC`: Có viết lại logic phân quyền, workflow hoặc tính toán đã có ở service khác không?
- [ ] `DUPLICATE_DOMAIN_MODEL`: Có tự định nghĩa lại Domain model thay vì gọi qua contract gRPC chính thức?
- [ ] `DATABASE_BOUNDARY_VIOLATION`: Có service nào cố truy vấn trực tiếp vào Database của service khác không?
- [ ] `SERVICE_BOUNDARY_VIOLATION`: Có import trực tiếp file/code nội bộ từ microservice khác thay vì qua client/gRPC không?
- [ ] `WORKFLOW_RULE_VIOLATION`: Có bypass `workflow-service` khi cập nhật trạng thái hồ sơ/nhiệm vụ không?
- [ ] `PROTO_CONTRACT_VIOLATION`: Có phá vỡ cấu trúc `.proto` hoặc làm mất tương thích ngược không?
- [ ] `GATEWAY_BUSINESS_LOGIC`: Có nhét logic tính toán/nghiệp vụ nặng vào API Gateway không?
- [ ] `FRONTEND_BUSINESS_LOGIC`: UI chỉ trình bày dữ liệu và gọi API; business rules, quyền cuối cùng, workflow, KPI và validation authoritative thuộc Backend/service source of truth?
- [ ] `AUTHORIZATION_VIOLATION`: Có hard-code quyền hạn mà không qua hệ thống PBAC/roles không?
- [ ] `DATA_LEAKAGE_RISK`: Dữ liệu trả về có vi phạm Least Data hoặc rò rỉ giữa các tenant/tổ chức không?
- [ ] `FRONTEND_LAYOUT_RISK`: Component mới có vi phạm CSS `min-w-0`, dùng utility Tailwind v4 không canonical (ví dụ `break-words` thay vì `wrap-break-word`) hoặc dùng sai Sheet vs Dialog không?
- [ ] `FRONTEND_STATE_RENDERING_RISK`: State có được đặt đúng component sở hữu, có gây re-render lan rộng, hoặc làm modal/sheet fetch nội dung trước khi người dùng mở không?
- [ ] `FRONTEND_DUMB_CLIENT_RISK`: Có business logic, quyền cuối cùng, workflow decision, KPI hoặc validation authoritative nào bị đặt/nhân đôi ở frontend không?
- [ ] `API_DOUBLE_PREFIX_RISK`: Endpoint ở frontend có bị lặp tiền tố `/admin` dẫn đến 404 không?
- [ ] `FILE_SCOPE_COLLISION_RISK`: Có sửa lan sang file ngoài phạm vi được giao gây xung đột với lane khác không?
