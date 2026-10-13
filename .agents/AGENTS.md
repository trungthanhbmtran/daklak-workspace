# AGENT CHARTER - DAKLAK GOVERNMENT WORKFLOW PLATFORM

File này là Hiến chương kỹ thuật và tài liệu vận hành duy nhất của dự án. Mọi tác vụ lập trình (Code 1 / Code 2 / Code 3 hoặc gọi trực tiếp) đều là code chung, bám sát các bước thực hiện của riêng từng yêu cầu và tuân thủ nghiêm ngặt 7 bộ ràng buộc kỹ thuật dưới đây.

---

## 1. Cấu trúc thư mục .agents
- `commands/`: Quy trình thực hiện chuẩn cho các coder lane (`commands/code1.md`, `commands/code2.md`, `commands/code3.md`).
- `checklists/`: Bộ tiêu chuẩn nghiệm thu và phản biện kỹ thuật.
- `rules/`: Quy tắc bất biến bắt buộc phải tuân thủ (kiến trúc, boundaries, security, UI/UX, service sovereignty).
- `skills/`: Hướng dẫn công nghệ chuyên sâu và kỹ năng thực thi (`code1`, `code2`, `code3`, `critical-review`, v.v.).
- `architecture/`: Bản đồ các services, dependencies, workflow flow và source of truth.
- `execution_logs/`: Nhật ký thực thi theo từng lane (`code1.md`, `code2.md`, `code3.md`).

---

## 2. Nguyên tắc cốt lõi & Architecture Guardian
- **Hiểu sâu sắc Cấu trúc Hệ thống & Chống Trùng lặp Chức năng (Architecture Pre-flight & Deduplication):** Agent BẮT BUỘC phải đọc và thấu hiểu bản đồ kiến trúc hệ thống (`.agents/architecture/`, `.agents/rules/source-of-truth.md`) trước khi thực hiện bất kỳ tác vụ nào. Tuyệt đối không tự ý tạo mới module, bảng CSDL, service logic hoặc chức năng đã tồn tại hoặc thuộc quyền sở hữu của service khác. Mọi thực thể phải thuộc về đúng Service chủ quản (Source of Truth).
- **Triệt tiêu Ảo giác AI (Anti-AI Hallucination & Zero Assumptions):** Không bao giờ suy đoán hoặc giả định rằng một bảng, cột, API endpoint, gRPC method, interface, hay biến môi trường tồn tại. Agent BẮT BUỘC phải dùng công cụ kiểm tra trực tiếp các file mã nguồn thực tế trong repo (`schema.prisma`, `.proto`, controllers, types). Nếu không tìm thấy, phải đối chiếu kiến trúc hoặc báo cáo rõ ràng, tuyệt đối không "bịa" ra code/mockup giả định.
- **Tuân thủ Chặt chẽ Quy trình Phát triển Phần mềm (Strict SDLC Compliance):** Mọi tác vụ phải tuân thủ nghiêm ngặt quy trình phát triển phần mềm gồm các cửa ải bắt buộc (SDLC Gates): từ khảo sát kiến trúc, kiểm tra trùng lặp, khảo sát mã nguồn thực tế đến kiểm chứng máy và phản biện diff trước khi hoàn thành.
- **Thực hiện ĐÚNG yêu cầu:** Không tự ý thêm bớt tính năng ngoài phạm vi được giao. Bám sát mục tiêu của từng tác vụ.
- **Bằng chứng xác thực (Evidence-Based Verification):** Không bao giờ kết luận giả định. Mọi thay đổi code bắt buộc phải được kiểm chứng bằng lệnh thực tế (`rtk tsc --noEmit`, test máy, build container) trước khi báo cáo hoàn thành.
- **Dọn dẹp rác thừa (Cleanup Gate):** Quét sạch 100% imports dư thừa, biến không dùng, file tạm, và toàn bộ debug logs (`console.log`, `debugger`) trước khi kết thúc tác vụ.
- **Định dạng file chuẩn (Encoding Strictness):** Mọi file tạo mới hoặc sửa đổi bằng script/PowerShell BẮT BUỘC phải mã hóa **UTF-8 (không BOM)**. Tuyệt đối không để lưu nhầm UTF-16LE làm crash Turbopack/Next.js.
- **Service Data Sovereignty:** Tuyệt đối không query trực tiếp DB của service khác.
- **Domain First & Smart Backend:** Framework không định nghĩa model nghiệp vụ; bảo mật, phân quyền (PBAC) và tenant boundaries xử lý hoàn toàn tại server.
- **Least Data:** Chỉ query và trả về đúng trường dữ liệu cần thiết.

---

## 3. Quy trình thực thi theo từng lệnh (End-to-End & Tuân thủ SDLC nghiêm ngặt)

Mỗi lệnh (`/code1 <prompt>`, `/code2 <prompt>` hoặc `/code3 <prompt>`) là một **quy trình thực thi độc lập, trọn vẹn từ đầu đến cuối (Full End-to-End SDLC)**. Không có chuyện lập kế hoạch chung rồi đến bước code mới chẻ nhánh.

### Mục đích phân tách & Quyền quyết định của người dùng:
- **Tuân thủ kỹ năng & quy chuẩn như nhau (Uniform Skills & Rules Compliance):** Cả Code 1, Code 2 và Code 3 đều có quyền hạn, trách nhiệm và phải tuân thủ 100% các kỹ năng (`.agents/skills/`) cùng 7 Bộ ràng buộc kỹ thuật như nhau. Không có con agent nào bị giới hạn hay phân biệt kỹ năng.
- **Người dùng toàn quyền chỉ định (User-Determined Lane Routing):** Chỉ dựa vào yêu cầu công việc thực tế, người dùng tự quyết định dùng con nào (`/code1 <prompt>`, `/code2 <prompt>` hay `/code3 <prompt>`) để chạy prompt xử lý tương ứng.
- **Cách ly phạm vi để chống trùng đè code (Code Conflict Isolation):** Mục đích của các lane là cho phép người dùng chạy tác vụ độc lập; mỗi lane khóa chặt tập file riêng biệt và tuyệt đối không dẫm chân lên lane khác.
- **Không phân chia Backend / Frontend:** Cả Code 1, Code 2 và Code 3 đều là Coder toàn diện (Full-stack), có đầy đủ năng lực thực hiện trọn gói mọi bước từ khảo sát, giải pháp kiến trúc, triển khai mã nguồn đến kiểm chứng.

```
[User gọi /code1 <prompt>, /code2 <prompt> hoặc /code3 <prompt>]
      │
      ▼
[Autonomous End-to-End SDLC Lane]
      ├── Bước 1: Hiểu Cấu trúc Hệ thống & Kiểm tra Trùng lặp Chức năng (Architecture Pre-flight & Deduplication)
      ├── Bước 2: Khảo sát Mã nguồn Thực tế & Khóa Ranh giới File (Real Code Inspection & Anti-Hallucination)
      ├── Bước 3: Hoạch định Giải pháp Kỹ thuật & Đối chiếu 7 Bộ ràng buộc
      ├── Bước 4: Thực thi Mã nguồn Chuẩn xác theo 7 Bộ ràng buộc
      ├── Bước 5: Kiểm chứng Máy Thực tế (rtk tsc --noEmit / build) & Phản biện Diff Dòng-theo-dòng
      └── Bước 6: Dọn rác 100%, Ghi Nhật ký & Báo cáo Nghiệm thu Hoàn tất
```

### Bước 1: Hiểu Cấu trúc Hệ thống & Kiểm tra Trùng lặp Chức năng (Architecture Pre-flight & Deduplication)
- Tra cứu bản đồ kiến trúc hệ thống (`.agents/architecture/service-map.md`, `.agents/rules/source-of-truth.md`).
- Xác định đúng Service chủ quản sở hữu thực thể/nghiệp vụ được giao.
- Kiểm tra tính năng/model/DTO đã có trong hệ thống chưa. **Tuyệt đối KHÔNG code trùng lặp tính năng** hoặc xây dựng lại cấu trúc dữ liệu đã được service khác quản lý (ví dụ: VTVL, định biên, phân công nằm tại `user-service`; quy trình nằm tại `workflow-service`; API nội bộ/liên thông tại `api-gateway`; báo cáo/dashboard tại `report-service`).

### Bước 2: Khảo sát Mã nguồn Thực tế & Khóa Ranh giới File (Real Code Inspection & Anti-Hallucination)
- **Triệt tiêu ảo giác AI:** Dùng công cụ đọc file (`view_file`, tìm kiếm code) mở trực tiếp các file schema (`schema.prisma`), contract gRPC (`shared/protos/`), controllers, routes liên quan trong repo. Không được suy đoán trường dữ liệu hoặc endpoint.
- Khóa cứng danh sách các file thuộc sở hữu của tác vụ này; tuyệt đối không chạm vào file nằm ngoài phạm vi hoặc file đang do lane khác xử lý để triệt tiêu nguy cơ xung đột mã nguồn.
- Với tác vụ frontend, bắt buộc đọc `.agents/rules/frontend.md` và contract/API thực tế; xác nhận Backend/service nào sở hữu từng business rule và source of truth.

### Bước 3: Hoạch định Giải pháp Kỹ thuật
- Phân tích logic nghiệp vụ, luồng dữ liệu, API contract hoặc schema cần sửa đổi dựa trên dữ liệu thực tế đã khảo sát ở Bước 2.
- Chuẩn bị giải pháp đối chiếu chặt chẽ với **7 Bộ ràng buộc kỹ thuật** trước khi chỉnh sửa file.

### Bước 4: Thực thi Chuẩn xác theo 7 Bộ Ràng buộc Kỹ thuật
- Triển khai code bám sát yêu cầu nghiệp vụ của prompt, không tự ý thêm bớt tính năng ngoài phạm vi.
- Tuân thủ tuyệt đối 7 Bộ ràng buộc kỹ thuật (PBAC tenant scope, additive migration CSDL, BaseURL không lặp `/admin`, Next.js 15 App Router, UI flex `min-w-0` / `wrap-break-word`, Sheet thay vì Dialog cho form dài, serialize JSON gRPC an toàn, mã hóa UTF-8 không BOM).

### Bước 5: Kiểm chứng Máy Thực tế & Phản biện Kết quả (Verification & Diff Critique Gate)
- **Kiểm chứng máy (Automated Verification):** Chạy lệnh kiểm tra thực tế (`rtk tsc --noEmit`, `rtk lint`, hoặc build test của service tương ứng).
- **Không chấp nhận warning mới:** Warning lint phát sinh từ dòng/file đang sửa là lỗi nghiệm thu, kể cả khi lệnh trả exit code 0. Sửa theo gợi ý canonical của công cụ; không bỏ qua hoặc thêm suppress/disable để che warning. Warning cũ ngoài phạm vi phải ghi rõ file và rule, không được nhận là warning đã xử lý.
- **Phản biện kết quả thực thi (Post-Execution Diff Critique Gate):**
  * Không bao giờ thỏa mãn chỉ vì `tsc` báo pass. BẮT BUỘC soi từng dòng `git diff` vừa sinh ra đối chiếu trực tiếp với 7 Bộ ràng buộc kỹ thuật:
    - *UI/UX*: Có thẻ con flex nào thiếu `min-w-0`? Chuỗi dài thiếu `wrap-break-word`? Có utility Tailwind nào bị lint cảnh báo hoặc có tên canonical được công cụ gợi ý không? Form dài có bị nhét nhầm vào `<Dialog>` thay vì `<Sheet>`? Có bị hardcode chiều cao cố định (`h-[600px]`) hoặc lạm dụng `overflow-hidden` khóa nghẽn thanh cuộn không? Breakpoint chia 2 cột có bị ép sớm ở `md` làm đè chữ không? Accordion dữ liệu async có bị lỗi đóng sập do uncontrolled `defaultValue` không?
    - *Routing*: Có lọt tiền tố thừa `/admin` vào `apiClient` không?
    - *Frontend dumb client*: Có rule/decision nghiệp vụ, quyền cuối cùng, workflow, KPI hoặc validation authoritative nào bị đặt/nhân đôi ở frontend không? Nếu thiếu API/contract thì nêu gap đúng service owner, không hoàn tất bằng mock hoặc rule tạm trong UI.
    - *Backend & DB*: Cột mới có đảm bảo `nullable` hoặc `@default` không? Query CSDL có bị lọt ngoài `organizationId` scope không? Lời gọi gRPC có thiếu metadata token không?
    - *Logic & Edge Cases*: Có nuốt lỗi âm thầm (`catch {}` rỗng) không? Tham số `null`/`undefined`/mảng rỗng có bị vỡ app không?
  * **Chống thử mù quáng (Anti-thrashing):** Nếu phát hiện lỗi hoặc vi phạm khi phản biện diff, phân tích tận gốc và tự sửa ngay trước khi bàn giao.
  * **Phản biện độc lập chuyên sâu (Khi cần):** Với các tác vụ nhạy cảm liên quan tới CSDL lớn hoặc PBAC đa service, có thể kích hoạt skill `critical-review` để có góc nhìn thẩm định độc lập.

### Bước 6: Dọn rác & Báo cáo Kết quả (Cleanup & Audit Gate)
- Dọn sạch 100% debug logs (`console.log`, `debugger`), imports dư thừa, biến không dùng, file tạm.
- Ghi nhận tóm tắt kết quả vào execution log tương ứng ([`.agents/execution_logs/code1.md`](file:///c:/Users/Admin/Desktop/daklak-workspace/.agents/execution_logs/code1.md) hoặc [`.agents/execution_logs/code2.md`](file:///c:/Users/Admin/Desktop/daklak-workspace/.agents/execution_logs/code2.md) hoặc [`.agents/execution_logs/code3.md`](file:///c:/Users/Admin/Desktop/daklak-workspace/.agents/execution_logs/code3.md)).
- Xuất Báo cáo Thực thi đầy đủ theo đúng mẫu quy chuẩn.

---

## 4. BẢY BỘ RÀNG BUỘC KỸ THUẬT BẮT BUỘC (INVIOLABLE CONSTRAINTS)
*(Toàn bộ các ràng buộc dưới đây bắt buộc phải được tuân thủ trực tiếp trong mã nguồn, không được bỏ sót bất kỳ tiêu chí nào)*

### 1. Ràng buộc UI/UX & CSS Layout (Frontend)
- **`min-w-0` bắt buộc:** LUÔN LUÔN thêm `min-w-0` vào các thẻ con trực tiếp của `flex` hoặc `grid` container nếu bên trong có chứa text động, badge hoặc thẻ con có thể co giãn. Điều này giúp container có thể thu hẹp (shrink) đúng kích thước thật thay vì tràn ra ngoài màn hình (overflow).
- **Quy tắc ngắt dòng Tailwind CSS v4:** Dùng `wrap-break-word` để ngắt từ cho nội dung dài; không dùng class `break-words` trong code mới vì lint báo thay bằng `wrap-break-word`. Với chuỗi định danh dài không có dấu cách (ID, Token, API Key, URL, CUID/UUID), dùng `break-all` khi cần ngắt giữa chuỗi và kết hợp `whitespace-pre-wrap` nếu cần giữ xuống dòng. Nội dung nhiệm vụ/văn bản dài dùng `whitespace-normal wrap-break-word leading-relaxed` để không tràn card hoặc chèn ép cụm nút.
- **`truncate` / `line-clamp-x`:** Bắt buộc áp dụng cho thẻ Title/Description dài.
- **Fluid Layout & Chống Khóa Cứng Thanh Cuộn (Anti-Scroll Trap & Zero Layout Clipping):**
  * **CẤM TUYỆT ĐỐI áp dụng `overflow-hidden` và chiều cao cố định (`h-[600px]`, `h-full`) tại layout trang con / feature layout**: `service-layout` bên ngoài đã cấu hình sẵn vùng cuộn (`overflow-y-auto`). Việc lạm dụng `overflow-hidden` tại sub-layout sẽ khóa cứng trang, làm mất thanh cuộn và cắt phăng phần dưới của danh sách dài khiến người dùng không thể xem đầy đủ thông tin.
  * **Chuẩn cuộn phân tầng:** Sub-layout bắt buộc dùng `w-full min-h-full flex flex-col flex-1 min-w-0` để toàn trang cuộn tự nhiên trên `service-layout`. Khi thiết kế danh sách/card dài cần cuộn nội bộ, BẮT BUỘC dùng `max-h-[...] overflow-y-auto pr-1` chuẩn CSS native.
  * HẠN CHẾ dùng class giới hạn cứng (`max-w-5xl`, `max-w-[1400px]`) ở Dashboard lớn gây thừa mảng trắng vô nghĩa trên màn hình rộng.
- **Chống Chồng Đè Nội Dung & Thiết Kế Đa Cột Responsive (Zero Overlap & Multi-Column Breakpoints):**
  * **CẤM dùng breakpoint vội vàng `md:flex-row` (768px) cho layout 2 cột có sidebar/danh mục:** Khi trừ đi sidebar chính của hệ thống (~260px) và cột trái (~320px), cột còn lại chỉ còn dưới 400px, khiến các input và nội dung bị bóp nghẹt chồng đè lên nhau.
  * **Quy chuẩn 2 cột Enterprise:** Layout 2 cột (Sidebar danh mục + Chi tiết) BẮT BUỘC dùng `lg:flex-row` (>= 1024px) để đảm bảo không gian. Khi màn hình < 1024px, BẮT BUỘC tự động chuyển về xếp dọc (stacked `flex-col`) 100% chiều rộng. Khuyến khích hỗ trợ nút gập/mở sidebar (`PanelLeftClose`/`PanelLeftOpen`) để giải phóng không gian.
  * **Form thêm/sửa nhanh trên toolbar:** CẤM xếp ngang 3-4 inputs trong không gian hẹp. BẮT BUỘC dùng Responsive Grid (`grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end`) với nhãn (Label) rõ ràng trên từng input.
  * **Cấu trúc Thẻ danh sách (List Items):** Tên/nội dung text dài BẮT BUỘC nằm ở vùng riêng (`min-w-0 flex-1`), cụm metadata và nút thao tác (Sửa, Xóa) BẮT BUỘC có vùng neo riêng (`shrink-0`), tuyệt đối không để nút bấm hay badge đè lên chữ.
- **Xử lý Thành phần Radix UI Bất đồng bộ (Async Radix UI State Handling):**
  * Khi sử dụng `Accordion` hay `Collapsible` cho dữ liệu bất đồng bộ tải từ API (React Query), CẤM dùng `defaultValue` kiểu uncontrolled vì Radix chỉ khởi tạo 1 lần lúc mount khi data còn rỗng, dẫn đến toàn bộ danh mục bị đóng sập/trắng trơn khi data về.
  * BẮT BUỘC dùng **Controlled State** (`value={openKeys} onValueChange={setOpenKeys}`) và tự động mở tất cả các nhóm khi dữ liệu tải xong (`useEffect`).
- **Quy chuẩn `<Sheet>` vs `<Dialog>`:**
  * **`<Sheet>` (Trượt từ cạnh phải):** BẮT BUỘC dùng cho form dài, cấu hình chi tiết, nhiều tabs, flow builder, hoặc dữ liệu cần đối chiếu song song với màn hình chính (`sm:max-w-xl` hoặc `w-[600px]`).
  * **`<Dialog>` (Giữa màn hình):** CHỈ DÙNG cho tương tác ngắn, quyết định tức thời (Xác nhận Xóa, Cảnh báo, form cực ngắn 1-3 inputs). TUYỆT ĐỐI KHÔNG nhồi nhét form cấu hình dài vào Dialog!

### Frontend State Ownership, Rendering, and Modal/Sheet Loading
- **State ownership:** Đặt state ở component nhỏ nhất sở hữu hành vi; chỉ lift state lên cha khi nhiều component thực sự dùng chung hoặc state thuộc URL. Không đưa state UI cục bộ vào global store.
- **Single source of truth:** Không lưu lại state có thể suy ra từ props/data; giữ state cần thiết tối thiểu và tránh hai state phải đồng bộ cùng một giá trị.
- **Giảm re-render không cần thiết:** Cô lập state trong subtree sở hữu để cập nhật đúng phần giao diện liên quan; tránh setState ở page/root cho tương tác cục bộ. Chỉ dùng memoization khi có chi phí render lặp cụ thể, không rải `useMemo`/`React.memo` đại trà.
- **Dialog/Sheet controlled open:** Component sở hữu giữ state controlled mặc định đóng (`const [open, setOpen] = useState(false)`) và truyền `open`/`onOpenChange`; mỗi modal/sheet độc lập có state mở riêng.
- **Lazy content/data:** Chỉ mount nội dung nặng và bắt đầu fetch/transform dữ liệu sau thao tác mở; gate query bằng `enabled: open` hoặc guard tương đương. Không tải dữ liệu lúc page mount khi modal/sheet còn đóng. Có thể giữ cache sau lần mở đầu nếu phù hợp UX, tránh refetch không cần thiết.
- **Frontend là dumb client:** Chỉ đảm nhiệm trình bày dữ liệu, state tương tác cục bộ, định dạng hiển thị và gửi thao tác qua API contract/hook có sẵn. Không tự quyết định quyền cuối cùng, chuyển trạng thái workflow, quy tắc nghiệp vụ, tính KPI/số liệu cốt lõi hoặc validation bảo vệ dữ liệu; Backend/service sở hữu nghiệp vụ và là source of truth. Client-side validation chỉ hỗ trợ UX, Backend vẫn phải xác thực. Dùng kết quả Backend (`allowed`, permission, workflow state...) để quyết định UI. Nếu thiếu API/contract cho yêu cầu, ghi rõ gap và chuyển đúng backend owner/lane; không mock hay tự dựng luật trong UI.

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
- **Ràng buộc An toàn Payload gRPC & Khởi tạo Tham số:** Trong các gRPC method handler của NestJS Microservices, bộ giải mã gRPC có thể truyền `data = undefined` khi Client/Gateway gọi request rỗng (GET requests). BẮT BUỘC khởi tạo `data = data || {};` ngay đầu handler trước khi truy xuất hay gán bất kỳ thuộc tính nào.
- **Ràng buộc Phân phối Tài nguyên theo Ngữ cảnh Quyền (PBAC Context Scoping):** Mọi thông tin chứng thực/phân quyền (`id`, `employeeCode`, `unitId`, `permissionsFlatten`) trích xuất từ `@CurrentUser() user` chỉ dùng để: (1) Kiểm tra quyền truy cập tài nguyên (authorization check), (2) Giới hạn phạm vi dữ liệu theo đúng thẩm quyền được cấp (`where: { departmentId: user.unitId }`, `where: { employeeCode: user.employeeCode }` hoặc phân cấp Ban/Phòng/Chuyên viên), (3) Ghi nhận vết kiểm toán (Audit Trail). TUYỆT ĐỐI KHÔNG gán cẩu thả các trường user vào payload `data` mà không kiểm tra khởi tạo hoặc không dùng quyền để phân phối tài nguyên.

### 5. Ràng buộc An toàn CSDL & Additive Migrations
- **Nguyên tắc Additive Migration (Zero-Downtime):** Mọi cột mới thêm vào bảng đang chạy BẮT BUỘC là `nullable` (`type?`) hoặc có `@default(...)`.
- **CẤM TUYỆT ĐỐI thêm cột NOT NULL không có default:** Đây là nguyên nhân trực tiếp gây lỗi sập Prisma `P2022: Column department_path does not exist` từng xảy ra với HRM.
- **CẤM DROP COLUMN hoặc RENAME COLUMN trực tiếp** trên production database.
- **Index bắt buộc:** Mọi trường khóa ngoại (`organizationId`, `userId`, `departmentId`) và trường dùng trong `where`, `orderBy` bắt buộc có `@@index([field])`.
- **Phòng chống N+1 queries:** Tuyệt đối không gọi Prisma queries (`findUnique`, `findFirst`, `update`) bên trong vòng lặp (`for`, `map`). Bắt buộc dùng `where: { id: { in: ids } }`.

### 6. Ràng buộc Bảo mật PBAC & Service Data Sovereignty & Source of Truth
- **Service Data Sovereignty:** Một Service tuyệt đối KHÔNG truy cập trực tiếp vào CSDL của Service khác. Mọi giao tiếp liên service bắt buộc qua gRPC contract hoặc message broker.
- **Ràng buộc Source of Truth của các Service nền tảng (BẮT BUỘC TUÂN THỦ TRƯỚC KHI CODE):**
  * **`user-service` là Source of Truth DUY NHẤT** cho: User, Account, PBAC, Organization và **Cấu trúc Vị trí việc làm (VTVL) định biên** (`job_titles`, `org_staffing`, `staffing_slots`), kèm **Phân công theo dõi** (lĩnh vực `staffing_slot_domains`, địa bàn `staffing_slot_geographic_areas`, phòng ban theo dõi `staffing_slot_monitored_units`). Các coder agents khi làm việc tại `hrm-service` hay bất kỳ service nào TUYỆT ĐỐI KHÔNG được tự ý bỏ qua hoặc dựng lại khung VTVL rời rạc; bắt buộc phải tích hợp và tham chiếu dữ liệu từ `user-service`.
  * **`workflow-service` là trung tâm quy trình:** Nơi lưu trữ, cấu hình và mô tả toàn bộ các nghiệp vụ hệ thống (BPMN Definitions, State Machines, Swimlanes, Transitions). Các service domain chỉ lưu dữ liệu nghiệp vụ và phải ủy quyền điều phối luồng duyệt cho `workflow-service`.
  * **`api-gateway` (API Manager):** Quản lý tập trung các nguồn kết nối chính của toàn hệ thống, xây dựng các API nội bộ và các API liên thông (LGSP, DVC, bên ngoài). Không chứa business logic domain.
  * **`report-service`:** Nơi thiết kế báo cáo hệ thống, xây dựng các Dashboard phân quyền sử dụng báo cáo cho từng cá nhân, đơn vị; là nơi các đơn vị truy cập theo dõi tiến độ, hiệu suất và số liệu toàn diện. Thu thập số liệu qua gRPC/RabbitMQ, không query chéo CSDL.
- **gRPC Metadata Delegation:** Mọi lời gọi gRPC giữa API Gateway và microservices bắt buộc phải đính kèm `GatewayContextToken` (`this.getGrpcMetadata(req)`). Cấm gọi gRPC rỗng metadata (nguyên nhân gây lỗi 401 Infinite Logout Loop).
- **PBAC Tenant Scope:** Mọi truy vấn CSDL bắt buộc ràng buộc `organizationId` của tài khoản đăng nhập, chống rò rỉ dữ liệu chéo giữa các đơn vị.
- **Least Data:** Chỉ query và trả về đúng những trường dữ liệu cần thiết.

### 7. Ràng buộc Vệ sinh Mã nguồn & Encoding
- **Xóa sạch 100% debug logs:** Không để lại bất kỳ `console.log`, `debugger`, import dư thừa hay mã giả tạm thời nào.
- **Mã hóa UTF-8 (không BOM):** Tất cả các file phải lưu chuẩn UTF-8 không BOM. Tiếng Việt có dấu hiển thị nguyên vẹn, không bị lỗi font hay crash trình biên dịch.

---

## 5. Báo cáo Thực thi (Execution Report)
Kết thúc bất kỳ tác vụ nào, agent xuất báo cáo nghiệm thu theo định dạng chuẩn mực:

```markdown
## Báo cáo Thực thi
- **Bước 1 - Kiến trúc & Kiểm tra Trùng lặp:** [Xác nhận Source of Truth của service chủ quản, kiểm tra trùng lặp chức năng/entity]
- **Bước 2 - Khảo sát Thực tế & Chống Ảo giác:** [Danh sách file schema/proto/code thực tế đã đọc, danh sách file khóa phạm vi]
- **Bước 3 - Giải pháp Kỹ thuật:** [Giải pháp thiết kế bám sát 7 Bộ ràng buộc kỹ thuật]
- **Bước 4 - Thực thi Chuẩn xác:** [Mã nguồn đã triển khai theo yêu cầu, tuân thủ 7 Bộ ràng buộc kỹ thuật]
- **Bước 5 - Kiểm chứng Máy & Phản biện Diff:** [Lệnh kiểm chứng máy thực tế đã chạy (rtk tsc/build) VÀ Kết quả phản biện diff đối chiếu 7 Bộ ràng buộc/edge-cases]
- **Bước 6 - Dọn rác & Hoàn tất:** [Xác nhận đã dọn rác 100%, ghi execution log]
```

---

## 6. Quản lý Tri thức (Execution Log)
Mỗi coder ghi nhật ký riêng: Code 1 append `.agents/execution_logs/code1.md`, Code 2 append `.agents/execution_logs/code2.md`, Code 3 append `.agents/execution_logs/code3.md`. Ghi nhận ngắn gọn ngày, tên tác vụ/tính năng, danh sách file đã sửa và bằng chứng lệnh kiểm chứng thực tế đã chạy.
