# Core Rules

## 1. Không được đoán (No Guesswork) & Triệt tiêu Ảo giác AI (Anti-AI Hallucination)
- **Zero Assumptions:** Tuyệt đối không giả định file, thư mục, service, API endpoint, database model, tên cột, gRPC method, biến môi trường, hay business rule tồn tại.
- **Evidence-Based Realism:** Bắt buộc dùng công cụ (`view_file`, tìm kiếm code) để khảo sát trực tiếp các file thực tế trong repo (`schema.prisma`, `.proto`, controllers, types).
- **Cấm bịa đặt (No Hallucinated Code):** Nếu không tìm thấy, báo cáo "NOT FOUND" và đối chiếu lại bản đồ kiến trúc hoặc hỏi người dùng, TUYỆT ĐỐI KHÔNG tự bịa implementation, mockup giả định hay tự chế tên trường/tên bảng làm sập hệ thống.

## 2. Hiểu Cấu trúc Hệ thống & Tuyệt đối Chống Trùng lặp Chức năng (Architecture First & Zero Duplication)
- **Đọc kiến trúc trước khi code:** Trước khi bắt tay làm bất kỳ tác vụ nào, BẮT BUỘC tra cứu `.agents/architecture/service-map.md` và `.agents/rules/source-of-truth.md` để nắm rõ toàn cảnh hệ thống và ranh giới trách nhiệm của từng microservice.
- **Xác định đúng Service chủ quản (Source of Truth):**
  * `user-service`: Duy nhất sở hữu User, Account, PBAC, Tổ chức, và **Cấu trúc Vị trí việc làm (VTVL) định biên** (`JobTitle`, `OrganizationStaffing`, `StaffingSlot`), kèm **Phân công theo dõi** (`StaffingSlotDomain`, `StaffingSlotGeographicArea`, `StaffingSlotMonitoredUnit`). CẤM tự ý tạo bảng hay dựng khung rời rạc ở service khác.
  * `workflow-service`: Trung tâm quy trình, BPMN Definitions, State Machines, Swimlanes, Transitions.
  * `api-gateway` (API Manager): Quản lý nguồn kết nối, xây dựng API nội bộ và API liên thông (LGSP, DVC).
  * `report-service`: Thiết kế báo cáo, xây dựng Dashboard phân quyền theo dõi cho cá nhân/đơn vị.
- **Ưu tiên tái sử dụng (Code & Service Reuse):** Tái sử dụng existing code, abstraction, service, DTO, proto, utility. Tuyệt đối không tạo module/entity trùng lặp (DuplicateService, NewHelper2, TemporaryController).
- **Cấm tự ý phân mảnh:** Nghiêm cấm mọi hành vi thấy thiếu là tự ý tạo bảng mới ở service hiện tại mà không kiểm tra xem nó đã thuộc về service chủ quản nào khác.

## 3. Không xóa code (khi bootstrap)
- DO NOT DELETE APPLICATION CODE
- DO NOT CHANGE BUSINESS LOGIC
- DO NOT REFACTOR SERVICES UNNECESSARILY

## 4. Hierarchy của Rules
SYSTEM / PLATFORM RULE > PROJECT ARCHITECTURE > SERVICE RULE > DOMAIN RULE > SKILL > TASK.
Quy tắc cấp thấp không được ghi đè quy tắc cấp cao.

## 5. Điều phối, Ownership và Tuân thủ SDLC
- **Codex làm coordinator:** Khảo sát, ghi contract/acceptance/ownership/verification vào .agents/current_plan.md, tự phản biện và chỉ dispatch sau PLAN_APPROVED; theo .agents/roles/codex-orchestrator.md.
- **Coder theo phạm vi:** Code 1/2/3 thực thi kế hoạch được duyệt trong tập file được giao. Mỗi lane có command, decision record và execution log riêng; không sửa file điều phối.
- **Chia lane khi an toàn:** Nếu Backend và Frontend độc lập sau khi khóa contract, giao ownership không chồng lấn và dùng worktree riêng; tác vụ một lane chỉ dùng coder phù hợp. Số Code 1/2/3 không gắn với chuyên môn cố định.
- **Review theo lane:** Codex review từng lane trước tích hợp; chỉ chấp nhận khi tiêu chí và kiểm tra bắt buộc có bằng chứng. Review diff tích hợp sau khi mọi lane bắt buộc được chấp nhận. Reviewer khác chỉ tham gia nếu orchestration được cấu hình và ownership ghi trong plan.
## 6. Phân vùng Trách nhiệm Kỹ thuật (Separation of Concerns)
Khi thực hiện tác vụ, Lead Agent tuân thủ ranh giới cấu trúc để tránh xung đột mã nguồn:
1. **Ranh giới Backend:** `apps/api-gateway/`, `apps/*-service/`, `prisma/`, `libs/`, `packages/proto/`.
2. **Ranh giới Frontend:** `apps/admin_khcn/`, `apps/portal-goverment/`, `packages/ui/`.
3. **Quy chuẩn Contract-First:** Trước khi sửa đổi frontend/backend giao tiếp nhau, luôn xác định rõ Data Contract (Endpoint, DTO, Proto) trước khi viết code.

## 7. Nguyên tắc Tốc độ và Chất lượng
1. **Không bỏ gate vì tốc độ:** Dùng một lane cho tác vụ không thể chia an toàn; chia song song khi Backend/Frontend có ownership độc lập. Không có thời lượng cố định nào thay thế khảo sát, phê duyệt kế hoạch, verification hay review diff.
2. **Chất lượng thống nhất:** Ràng buộc UI, BaseURL, App Router theo phiên bản package, migration additive, PBAC và gRPC delegation áp dụng cho mọi lane trước nghiệm thu.
3. **Hai vòng review:** Phản biện kế hoạch trước dispatch; review riêng từng lane sau thực thi, rồi review tích hợp. Typecheck/build đơn lẻ không chứng minh behavior hoạt động.
## 8. Nguyên tắc Đồng bộ Dữ liệu & Ràng buộc Boundary (Data Contract & Type Safety Boundary)
- **Boundary Validation tại Gateway:** Mọi controller tại API Gateway tiếp nhận tham số số nguyên (IDs) BẮT BUỘC dùng Pipe chuẩn (`ParseIntPipe`). Tuyệt đối không để chuỗi rác (`NaN`, `undefined`, chuỗi ký tự) lọt vào tầng gRPC/Microservices làm lỗi Prisma.
- **Hook Encapsulation:** Các hook gọi API (React Query) phải tự bao bọc điều kiện thực thi (`enabled: Number.isInteger(numId) && numId > 0`). Component gọi hook chỉ truyền trực tiếp ID dạng number, KHÔNG ĐƯỢC viết code phòng thủ chắp vá (`validIdStr = ...`, `!isNaN(...)`, ép kiểu chuỗi tạm bợ).
- **Trách nhiệm Phân giải Route:** Trong Next.js App Router, Page Component (`[id]/page.tsx`) là nơi duy nhất phân giải và kiểm tra tính hợp lệ của route params trước khi truyền xuống UI components.

## 9. Phân phối Tài nguyên theo Quyền Hạn (PBAC Resource-Driven Scoping & gRPC Defensive Safety)
- **Cơ chế Phân phối Tài nguyên:** Sau khi User được chứng thực thành công qua Guard (`GrpcAuthGuard` / `PbacGuard`), hệ thống BẮT BUỘC sử dụng quyền hạn (`permissionsFlatten`, `unitId`, `employeeCode`) để phân phối và giới hạn đúng tài nguyên mà người dùng đó được phép xem/sửa (Scope Filtering: Chuyên viên xem việc của mình, Lãnh đạo phòng xem phòng mình, Lãnh đạo Ban xem toàn cơ quan).
- **Tuyệt đối không gán thuộc tính mù quáng:** Không được tự ý nhồi nhét thuộc tính người dùng vào payload `data` nếu không kiểm tra khởi tạo hoặc không dùng thông tin đó để phân quyền dữ liệu. Mọi handler gRPC BẮT BUỘC khởi tạo phòng thủ `data = data || {};` ngay dòng đầu tiên để chống lỗi crash `TypeError: Cannot set properties of undefined`.


