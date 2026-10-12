# AGENT CHARTER - DAKLAK GOVERNMENT WORKFLOW PLATFORM

File này là Hiến chương kỹ thuật dùng chung cho Codex và Antigravity trong dự án. Điều phối viên phải tuân thủ quy trình lập kế hoạch, phản biện plan, thực thi song song theo ranh giới file, tích hợp và kiểm chứng cùng 7 bộ ràng buộc dưới đây.

---

## 1. Nguyên tắc cốt lõi (Core Principles)
- **Thực hiện ĐÚNG yêu cầu**: Không tự ý thêm bớt tính năng ngoài phạm vi được giao. Bám sát mục tiêu của từng tác vụ.
- **Bằng chứng xác thực (Evidence-Based Verification)**: Không bao giờ kết luận giả định. Mọi thay đổi code bắt buộc phải được kiểm chứng bằng lệnh thực tế (`rtk tsc --noEmit`, test máy, build container) trước khi báo cáo hoàn thành.
- **Dọn dẹp rác thừa (Cleanup Gate)**: Quét sạch 100% imports dư thừa, biến không dùng, file tạm, và toàn bộ debug logs (`console.log`, `debugger`) trước khi kết thúc tác vụ.
- **Định dạng file chuẩn (Encoding Strictness)**: Mọi file tạo mới hoặc sửa đổi bằng script/PowerShell BẮT BUỘC phải mã hóa **UTF-8 (không BOM)**. Tuyệt đối không để lưu nhầm UTF-16LE làm crash Turbopack/Next.js.

---

## 2. Quy trình điều phối bắt buộc

Codex là điều phối viên mặc định cho quy trình hỗn hợp tài khoản. Codex lập plan và tự phản biện trước; chỉ sau khi plan đạt mới giao hai phần code độc lập cho hai phiên Antigravity. Hai agent coder không tự mở rộng phạm vi hoặc sửa phần của nhau.

### Bước 1: Khảo sát & Lập kế hoạch (Codex, chỉ đọc mã sản phẩm)
- Khảo sát yêu cầu và các file liên quan (schema, interface, dependencies).
- Trước khi plan, kiểm tra git status/diff; tra blacklist, các bản đồ kiến trúc/source-of-truth liên quan, mục execution_log theo từ khóa và Git history của file bị ảnh hưởng. Đối chiếu quyết định cũ với code/schema/proto hiện tại; không áp lại bản sửa lịch sử một cách máy móc.
- Ghi context digest có đường dẫn nguồn, lỗi lịch sử liên quan và sự kiện hiện tại đã xác minh vào plan để hai coder cùng dùng.
- Không sửa roadmap trong pha plan. Ghi đề xuất roadmap vào plan; điều phối viên chỉ cập nhật roadmap sau khi implementation được tích hợp nếu task cần.
- Lưu plan step-by-step vào .agents/current_plan.md, gồm yêu cầu, contract, tiêu chí nghiệm thu, danh sách file, chủ sở hữu từng file, phụ thuộc và lệnh kiểm chứng dự kiến.

### Bước 2: Phản biện Plan (Codex, chưa cho phép viết mã sản phẩm)
- Đối chiếu plan với rule/checklist phù hợp: PBAC, tenant boundary, additive migration, service sovereignty, CSS min-w-0, API contract và gRPC delegation.
- Kiểm tra phạm vi file giữa Backend và Frontend không giao nhau; file dùng chung phải có đúng một chủ sở hữu trong plan.
- Ghi PLAN_APPROVED hoặc PLAN_REVISE trong .agents/current_plan.md. Nếu PLAN_REVISE, sửa plan và phản biện lại. Chỉ bắt đầu code sau PLAN_APPROVED.

### Bước 3: Thực thi song song (hai tài khoản Antigravity)
- Chuẩn bị hai handoff riêng cho backend-coder và frontend-coder khi plan xác định hai phần độc lập và đã chốt contract. Khi các tool MCP cục bộ daklak-agent-orchestrator sẵn sàng, dùng chúng để tạo worktree riêng và dispatch hai lane. Nếu tool hoặc runner tài khoản chưa sẵn sàng, xuất hai prompt sẵn dùng và nêu rõ blocker; không được tuyên bố agent đã chạy.
- Mỗi agent làm trong Git worktree riêng. Chỉ sửa file được giao; không sửa .agents/current_plan.md, .agents/execution_log.md, roadmap.md hoặc file của agent còn lại.
- Nếu cần sửa file shared (libs/**, root configs, hoặc contract), plan phải chỉ định duy nhất một agent sở hữu file đó; agent còn lại chỉ đọc.
- Mỗi agent đọc cùng context digest, báo cáo file đã sửa, kiểm chứng đã chạy, vấn đề còn mở, decision record và không tự merge worktree.

### Bước 4: Kiểm chứng, Tích hợp & Phản biện Kết quả (Codex điều phối)
- Nghiệm thu từng worktree riêng ngay khi agent hoàn tất, đối chiếu đúng phần file được giao, tiêu chí trong plan và các ràng buộc kỹ thuật.
- Ghi AGENT_ACCEPTED hoặc AGENT_REVISION_REQUIRED cho từng lane. Nếu cần sửa, gửi finding cho đúng coder; không tích hợp phần chưa được chấp nhận.
- Sau khi cả hai lane được chấp nhận, tích hợp và rà soát chéo contract, file overlap, tương thích Backend/Frontend rồi chạy kiểm chứng toàn cục.
- **Kiểm chứng máy (Automated Verification):** Chạy lệnh kiểm tra thực tế (`rtk tsc --noEmit`, `rtk lint`, hoặc build test tương ứng).
- **Phản biện Kết quả Thực thi (Post-Execution Diff Critique Gate):**
  * Không bao giờ thỏa mãn chỉ vì `tsc` báo pass. BẮT BUỘC soi từng dòng `git diff` vừa sinh ra đối chiếu trực tiếp với 7 Bộ ràng buộc kỹ thuật:
    - *UI/UX*: Có thẻ con flex nào thiếu `min-w-0`? Chuỗi dài thiếu `break-words`? Form dài có bị nhét nhầm vào `<Dialog>` thay vì `<Sheet>`?
    - *Routing*: Có lọt tiền tố thừa `/admin` vào `apiClient` không?
    - *Backend & DB*: Cột mới có đảm bảo `nullable` hoặc `@default` không? Query CSDL có bị lọt ngoài `organizationId` scope không? Lời gọi gRPC có thiếu metadata token không?
    - *Logic & Edge Cases*: Có nuốt lỗi âm thầm (`catch {}` rỗng) không? Tham số `null`/`undefined`/mảng rỗng có bị vỡ app không?
  * **Chống thử mù quáng (Anti-thrashing):** Nếu gặp lỗi hoặc phát hiện vi phạm khi phản biện diff, phân tích tận gốc và tự sửa ngay trước khi bàn giao.
  * **Phản biện độc lập chuyên sâu (Khi cần):** Với các tác vụ nhạy cảm liên quan tới CSDL lớn hoặc PBAC đa service, có thể kích hoạt skill `critical-review` hoặc `code_auditor_agent` để có góc nhìn thẩm định độc lập.

### Bước 5: Cập nhật tài liệu & Nghiệm thu
- Dọn sạch toàn bộ console.log, import thừa, file tạm.
- Điều phối viên check-off .agents/current_plan.md, cập nhật roadmap.md nếu phù hợp và ghi quyết định/lỗi đáng lưu ý vào .agents/execution_log.md.
- Xuất Báo cáo Thực thi đầy đủ.

---

## 3. BẢY BỘ RÀNG BUỘC KỸ THUẬT BẮT BUỘC (INVIOLABLE CONSTRAINTS)
*(Toàn bộ các ràng buộc dưới đây bắt buộc phải được tuân thủ trực tiếp trong mã nguồn, không được bỏ sót bất kỳ tiêu chí nào)*

### 1. Ràng buộc UI/UX & CSS Layout (Frontend)
- **`min-w-0` bắt buộc:** LUÔN LUÔN thêm `min-w-0` vào các thẻ con trực tiếp của `flex` hoặc `grid` container nếu bên trong có chứa text động, badge hoặc thẻ con có thể co giãn. Điều này giúp container có thể thu hẹp (shrink) đúng kích thước thật thay vì tràn ra ngoài màn hình (overflow).
- **`break-words` bắt buộc:** LUÔN LUÔN thêm `break-words` hoặc `break-all` kết hợp `whitespace-pre-wrap` cho các thẻ hiển thị chuỗi dài không dấu cách (ID, Token, API Key, URL, CUID/UUID) để ép text xuống dòng, không đâm xuyên card/bảng.
- **`truncate` / `line-clamp-x`:** Bắt buộc áp dụng cho thẻ Title/Description dài.
- **Fluid Layout:** Ưu tiên `w-full flex-1`. HẠN CHẾ dùng class giới hạn cứng (`max-w-5xl`, `max-w-[1400px]`) ở Dashboard lớn gây thừa mảng trắng vô nghĩa trên màn hình rộng.
- **Quy chuẩn `<Sheet>` vs `<Dialog>`:**
  * **`<Sheet>` (Trượt từ cạnh phải):** BẮT BUỘC dùng cho form dài, cấu hình chi tiết, nhiều tabs, flow builder, hoặc dữ liệu cần đối chiếu song song với màn hình chính (`sm:max-w-xl` hoặc `w-[600px]`).
  * **`<Dialog>` (Giữa màn hình):** CHỈ DÙNG cho tương tác ngắn, quyết định tức thời (Xác nhận Xóa, Cảnh báo, form cực ngắn 1-3 inputs). TUYỆT ĐỐI KHÔNG nhồi nhét form cấu hình dài vào Dialog!

### 2. Ràng buộc BaseURL & Routing Frontend (`admin_khcn`)
- Instance `apiClient` và `serverFetch` đã cấu hình sẵn `baseURL = "/api/v1/admin"`.
- **CẤM TUYỆT ĐỐI thêm tiền tố `/admin` vào string path gọi API:** Ví dụ gọi `/integration/routes`, CẤM gọi `/admin/integration/routes` vì sẽ bị double prefix thành `/api/v1/admin/admin/...` gây lỗi 404!
- **Response Unwrapping:** Axios interceptor unwrap `{ success, data }` -> Luôn sử dụng hàm chuẩn `unwrapData<T>()`, KHÔNG ĐƯỢC gọi `.data.data` mù quáng khiến dữ liệu thành `undefined`.

### 3. Ràng buộc Next.js 15 App Router & Server Components
- Trong Next.js 15, `params` và `searchParams` là Promise -> BẮT BUỘC dùng `const { id } = await params;` trước khi sử dụng trong Server Component / Page.
- Giữ file `page.tsx` là Server Component gọn gàng, chuyển toàn bộ UI tương tác và React hooks vào `*Client.tsx` có chỉ thị `'use client'`.

### 4. Ràng buộc Quản lý gRPC & File `.proto`
- Khi sửa đổi file `.proto`: Sử dụng công cụ ghi đè an toàn, kiểm tra kỹ cú pháp đóng mở `{ }`. Ngay sau khi sửa, PHẢI build/chạy microservice tương ứng để xác nhận bộ tải gRPC không văng `illegal token` hay `InvalidProtoDefinitionException`.
- **Chống lỗi corrupted JSON `[object Object]`:** Dữ liệu JSON phức tạp lồng nhau khi truyền qua gRPC bắt buộc serialize thành chuỗi (`metadataJson`, `schemaJson`) và parse bằng helper an toàn `safeParse`.

### 5. Ràng buộc An toàn CSDL & Additive Migrations
- **Nguyên tắc Additive Migration (Zero-Downtime):** Mọi cột mới thêm vào bảng đang chạy BẮT BUỘC là `nullable` (`type?`) hoặc có `@default(...)`.
- **CẤM TUYỆT ĐỐI thêm cột NOT NULL không có default:** Đây là nguyên nhân trực tiếp gây lỗi sập Prisma `P2022: Column department_path does not exist` từng xảy ra với HRM.
- **CẤM DROP COLUMN hoặc RENAME COLUMN trực tiếp** trên production database.
- **Index bắt buộc:** Mọi trường khóa ngoại (`organizationId`, `userId`, `departmentId`) và trường dùng trong `where`, `orderBy` bắt buộc có `@@index([field])`.
- **Phòng chống N+1 queries:** Tuyệt đối không gọi Prisma queries (`findUnique`, `findFirst`, `update`) bên trong vòng lặp (`for`, `map`). Bắt buộc dùng `where: { id: { in: ids } }`.

### 6. Ràng buộc Bảo mật PBAC & Service Data Sovereignty
- **Service Data Sovereignty:** Một Service tuyệt đối KHÔNG truy cập trực tiếp vào CSDL của Service khác. Mọi giao tiếp liên service bắt buộc qua gRPC contract hoặc message broker.
- **gRPC Metadata Delegation:** Mọi lời gọi gRPC giữa API Gateway và microservices bắt buộc phải đính kèm `GatewayContextToken` (`this.getGrpcMetadata(req)`). Cấm gọi gRPC rỗng metadata (nguyên nhân gây lỗi 401 Infinite Logout Loop).
- **PBAC Tenant Scope:** Mọi truy vấn CSDL bắt buộc ràng buộc `organizationId` của tài khoản đăng nhập, chống rò rỉ dữ liệu chéo giữa các đơn vị.
- **Least Data:** Chỉ query và trả về đúng những trường dữ liệu cần thiết.

### 7. Ràng buộc Vệ sinh Mã nguồn & Encoding
- **Xóa sạch 100% debug logs:** Không để lại bất kỳ `console.log`, `debugger`, import dư thừa hay mã giả tạm thời nào.
- **Mã hóa UTF-8 (không BOM):** Tất cả các file phải lưu chuẩn UTF-8 không BOM. Tiếng Việt có dấu hiển thị nguyên vẹn, không bị lỗi font hay crash trình biên dịch.

---

## 4. Báo cáo Thực thi Antigravity (Execution Report)
Kết thúc bất kỳ tác vụ nào, Antigravity bắt buộc xuất báo cáo nghiệm thu theo định dạng:

```markdown
## Báo cáo Thực thi Antigravity
- **Bước 1 - Lên Kế Hoạch (Planning):** [Xác nhận đã lập kế hoạch & đối chiếu roadmap.md, current_plan.md]
- **Bước 2 - Phản biện Kế hoạch (Plan Critique):** [Các rủi ro kiến trúc & 7 Bộ ràng buộc đã đối chiếu và chặn trước khi viết code]
- **Bước 3 - Thực thi Chuẩn xác (Execution):** [Mã nguồn đã triển khai theo kế hoạch]
- **Bước 4 - Kiểm chứng Máy & Phản biện Kết quả (Verification & Result Critique):** [Lệnh kiểm chứng máy thực tế đã chạy (rtk tsc/build) VÀ Kết quả phản biện diff đối chiếu 7 Bộ ràng buộc/edge-cases]
- **Bước 5 - Dọn rác, Roadmap & Tài liệu:** [Xác nhận đã dọn rác 100%, cập nhật roadmap.md, current_plan.md, execution_log.md]
```

---

## 5. Quản lý Tri thức (Execution Log)
Mọi lỗi phức tạp đã fix, quyết định kiến trúc quan trọng bắt buộc phải lưu vết vào [.agents/execution_log.md](file:///c:/Users/Admin/Desktop/daklak-workspace/.agents/execution_log.md) để tra cứu tái sử dụng, tránh lặp lại lỗi cũ.
