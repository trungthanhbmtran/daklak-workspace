# AGENT CHARTER - DAKLAK GOVERNMENT WORKFLOW PLATFORM

File này là Hiến chương kỹ thuật và tài liệu vận hành duy nhất của dự án. Mọi tác vụ lập trình (Code 1 / Code 2 / Code 3 hoặc gọi trực tiếp) tuân thủ quy trình điều phối và 8 bộ ràng buộc kỹ thuật dưới đây.

---

## 1. Cấu trúc thư mục .agents
- `commands/`: Quy trình thực hiện chuẩn cho các coder lane (`commands/code1.md`, `commands/code2.md`, `commands/code3.md`).
- `checklists/`: Bộ tiêu chuẩn nghiệm thu và phản biện kỹ thuật.
- `rules/`: Quy tắc bất biến bắt buộc phải tuân thủ (kiến trúc, boundaries, security, UI/UX, service sovereignty).
- `skills/`: Hướng dẫn công nghệ chuyên sâu và kỹ năng thực thi (`code1`, `code2`, `code3`, `critical-review`, v.v.).
- `architecture/`: Bản đồ các services, dependencies, workflow flow và source of truth.
- execution_logs/: Nhật ký riêng theo từng lane (code1.md, code2.md, code3.md).
- roles/: Vai trò điều phối Codex.
- agents/: Profile Antigravity nếu repo có lưu; profile chỉ mô tả vai trò, không chứa thông tin xác thực hay khởi chạy account.

---

## 2. Nguyên tắc cốt lõi & Architecture Guardian
- **Hiểu sâu sắc Cấu trúc Hệ thống & Chống Trùng lặp Chức năng (Architecture Pre-flight & Deduplication):** Agent BẮT BUỘC phải đọc và thấu hiểu bản đồ kiến trúc hệ thống (`.agents/architecture/`, `.agents/rules/source-of-truth.md`) trước khi thực hiện bất kỳ tác vụ nào. Tuyệt đối không tự ý tạo mới module, bảng CSDL, service logic hoặc chức năng đã tồn tại hoặc thuộc quyền sở hữu của service khác. Mọi thực thể phải thuộc về đúng Service chủ quản (Source of Truth).
- **Triệt tiêu Ảo giác AI (Anti-AI Hallucination & Zero Assumptions):** Không bao giờ suy đoán hoặc giả định rằng một bảng, cột, API endpoint, gRPC method, interface, hay biến môi trường tồn tại. Agent BẮT BUỘC phải dùng công cụ kiểm tra trực tiếp các file mã nguồn thực tế trong repo (`schema.prisma`, `.proto`, controllers, types). Nếu không tìm thấy, phải đối chiếu kiến trúc hoặc báo cáo rõ ràng, tuyệt đối không "bịa" ra code/mockup giả định.
- **Tuân thủ Chặt chẽ Quy trình Phát triển Phần mềm (Strict SDLC Compliance):** Mọi tác vụ phải tuân thủ nghiêm ngặt quy trình phát triển phần mềm gồm các cửa ải bắt buộc (SDLC Gates): từ khảo sát kiến trúc, kiểm tra trùng lặp, khảo sát mã nguồn thực tế đến kiểm chứng máy và phản biện diff trước khi hoàn thành.
- **Thực hiện ĐÚNG yêu cầu:** Không tự ý thêm bớt tính năng ngoài phạm vi được giao. Bám sát mục tiêu của từng tác vụ.
- **Bằng chứng xác thực:** Chọn lệnh theo package manifest, cấu hình và acceptance criteria đã duyệt; chạy kiểm chứng thực tế phù hợp và báo đúng kết quả. Không mặc định một lệnh hoặc công cụ dùng chung cho mọi package.
- **Dọn dẹp rác thừa (Cleanup Gate):** Quét sạch 100% imports dư thừa, biến không dùng, file tạm, và toàn bộ debug logs (`console.log`, `debugger`) trước khi kết thúc tác vụ.
- **Định dạng file chuẩn (Encoding Strictness):** Mọi file tạo mới hoặc sửa đổi bằng script/PowerShell BẮT BUỘC phải mã hóa **UTF-8 (không BOM)**. Tuyệt đối không để lưu nhầm UTF-16LE làm crash Turbopack/Next.js.
- **Service Data Sovereignty:** Tuyệt đối không query trực tiếp DB của service khác.
- **Domain First & Smart Backend:** Framework không định nghĩa model nghiệp vụ; bảo mật, phân quyền (PBAC) và tenant boundaries xử lý hoàn toàn tại server.
- **Least Data:** Chỉ query và trả về đúng trường dữ liệu cần thiết.

---

## 3. Quy trình điều phối và thực thi (Plan, Review, Handoff, Integration)

Mọi tác vụ tuân thủ quy trình điều phối chung trong .agents/roles/codex-orchestrator.md. Coder lane thực thi kế hoạch đã duyệt; lane không tự phê duyệt kế hoạch hoặc tích hợp kết quả của lane khác.

- **Lập kế hoạch và phê bình:** Codex khảo sát yêu cầu, working tree, blacklist, architecture/source-of-truth, execution logs, reports và Git history; xác minh thông tin lịch sử với code hiện tại. Ghi contract, acceptance criteria, dependency, lệnh kiểm chứng và ownership file chính xác vào .agents/current_plan.md. Codex tự phản biện và chỉ dispatch sau PLAN_APPROVED.
- **Chọn phạm vi lane:** Nếu Backend và Frontend độc lập sau khi contract được khóa, giao mỗi phạm vi file không chồng lấn cho một coder riêng và chuẩn bị handoff/worktree riêng; chạy song song khi orchestrator/runners sẵn sàng. Tác vụ một lane dùng coder phù hợp. Nếu runner không có, trả prompt sẵn chạy và nêu blocker, không tuyên bố đã dispatch.
- **Năng lực và định danh lane:** Code 1, Code 2 và Code 3 đều có thể làm full-stack. Số lane chọn command, ranh giới file được giao và execution log riêng; nó không cố định chuyên môn Backend/Frontend. Không chia lại ownership sau khi coding bắt đầu.
- **Review và tích hợp:** Codex review riêng từng worktree, ghi decision record và chỉ tích hợp lane được AGENT_ACCEPTED. Sau khi tất cả lane bắt buộc được chấp nhận, review contract/diff tích hợp và chạy các kiểm tra đã duyệt. UNVERIFIED ở runtime/regression bắt buộc chặn nghiệm thu.
- **Handoff lịch sử:** Prompt trong .agents/reports/ là bằng chứng theo task, không phải mẫu chạy hiện tại. Tạo handoff mới từ kế hoạch đã duyệt và command hiện hành; không sao chép log path/profile cũ nếu chưa xác minh.

[User request]
      │
      ▼
[Codex: analyze → plan → critique]
      │ PLAN_APPROVED
      ▼
[One applicable coder, or disjoint Backend + Frontend lanes]
      │
      ▼
[Codex: per-lane review → AGENT_ACCEPTED]
      │ all required lanes accepted
      ▼
[Integration review + approved verification → PASSED / FAILED]

Các coder tuân thủ cùng 7 Bộ ràng buộc kỹ thuật và ghi log riêng theo mục 6. Không lane nào sửa shared coordinator archive hoặc log lane khác.

---

## 4. TÁM BỘ RÀNG BUỘC KỸ THUẬT BẮT BUỘC (INVIOLABLE CONSTRAINTS)
*(Các ranh giới bảo mật, dữ liệu và contract là bắt buộc. Các hướng dẫn UI/CSS nêu kết quả cần đạt; lựa chọn triển khai phải dựa trên component, container và design system thực tế.)*

### 1. Ràng buộc UI/UX & CSS Layout (Design System & Responsive Standards)
*(Quy chuẩn chi tiết xem tại [`.agents/rules/ui-ux-design-system.md`](rules/ui-ux-design-system.md))*

- **Kích cỡ hiển thị trên từng màn hình (Screen Viewport Breakpoints):**
  * **`< 375px` (Mobile XS / Compact):** Toàn bộ bố cục xếp 1 cột dọc (`grid-cols-1`, `flex-col`); Dialog/Sheet co giãn theo bề rộng màn hình (`w-[95vw]`); TabsList chuyển sang thanh trượt ngang có cuộn (`overflow-x-auto`); Padding an toàn `p-3` hoặc `px-2 py-3`.
  * **`375px - 639px` (Mobile Standard):** Lưới form 1 cột; tiêu đề tự động co rút (`truncate`); menu điều hướng ẩn vào Mobile Drawer / Hamburger Menu; Padding `p-4`.
  * **`640px - 767px` (`sm:` Phablet / Tablet Portrait):** Form nhập liệu chia 2 cột cho các trường ngắn (`sm:grid-cols-2`); Dialog hiển thị kích thước chuẩn `sm:max-w-[500px]`; Thẻ chỉ số chia 2 cột; Padding `p-5`.
  * **`768px - 1023px` (`md:` Tablet Landscape / Small Laptop):** Sidebar thu gọn (icon-only); Lưới dữ liệu chia 2-3 cột (`md:grid-cols-2`, `md:grid-cols-3`); Bảng dữ liệu desktop đầy đủ có thanh cuộn ngang độc lập; Padding `p-6`.
  * **`1024px - 1279px` (`lg:` Laptop Văn phòng Tiêu chuẩn):** Sidebar mở rộng đầy đủ (240px - 260px); Form chia 3-4 cột; TabsList chuyển sang dạng lưới cân đối (`lg:grid`).
  * **`1280px - 1535px` (`xl:` Desktop Làm Việc Tiêu Chuẩn):** Bố cục đa cột hoàn chỉnh (`max-w-7xl mx-auto`); Cột danh sách điều hướng và bảng làm việc song song (`xl:flex-row`).
  * **`≥ 1536px` (`2xl:` Màn hình Lớn / Dashboard IOC):** Thẻ chia 4-5 cột (`2xl:grid-cols-4`, `2xl:grid-cols-5`); Giới hạn bề rộng bằng container `2xl:max-w-[1600px]`.
- **Hệ thống Kiểu chữ Chuẩn hóa (Typography Hierarchy):**
  * Phông chữ hệ thống `font-sans` (Inter / Roboto) tối ưu hiển thị Unicode Tiếng Việt, độ tương phản đáp ứng chuẩn WCAG AA.
  * **`text-[10px]` / `text-[11px]`:** Micro text, Badge số đếm, tag trạng thái nhỏ (Khẩn, Mật, Hỏa tốc), helper text form.
  * **`text-xs` (12px / 16px):** Nhãn form (`text-xs font-semibold text-slate-700`), Tiêu đề cột bảng (`TableHead` uppercase text-slate-500), Nút bấm phụ (`size="sm"`), Breadcrumbs.
  * **`text-sm` (14px / 20px):** **CỠ CHỮ CỐT LÕI CỦA TOÀN BỘ HỆ THỐNG:** Body text, Input text, Select value, Dropdown menu item, Nội dung ô bảng (`TableCell`). Đảm bảo mật độ thông tin công vụ sắc nét, tối ưu.
  * **`text-base` (16px / 24px):** Tiêu đề Card con, Subheadings, Trích yếu văn bản nổi bật.
  * **`text-lg` (18px / 28px):** Tiêu đề Dialog/Modal (`DialogTitle`), Tiêu đề Drawer, Heading `h3`.
  * **`text-xl` (20px / 28px):** Tiêu đề Page Subheading, Chỉ số thống kê lớn trong Card Dashboard.
  * **`text-2xl` (24px / 32px):** Tiêu đề Trang chính (`h2` tại Service Header: `text-xl md:text-2xl font-bold tracking-tight text-slate-900`).
- **Quy chuẩn Danh sách (Lists), Bảng biểu (Tables) & Thẻ (Cards):**
  * **Danh sách (List Components):** Phân cách bằng `divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border bg-white dark:bg-slate-950 overflow-hidden`; padding hàng `py-2.5 px-3` (compact) hoặc `py-3.5 px-4` (tiêu chuẩn); hover `hover:bg-slate-50/80`; trạng thái rỗng (Empty State) bắt buộc có icon (36-44px), tiêu đề `text-sm font-semibold`, mô tả `text-xs text-slate-500` và nút CTA.
  * **Bảng dữ liệu (Data Tables):** Bắt buộc bọc trong container `w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800`; Header `text-xs font-semibold uppercase text-slate-500 py-3 px-4 bg-slate-50/80`; Body `text-sm text-slate-700 py-3 px-4`; Canh lề Left (Trích yếu, tên), Center (Mã, STT, Trạng thái, Ngày tháng), Right (Số tiền, KPI, Thao tác). Cột nội dung dài dùng `min-w-[200px] whitespace-normal break-words` (CẤM dùng `whitespace-nowrap` kéo dãn bảng).
  * **Lưới thẻ (Card Grids):** Quy chuẩn cột theo breakpoint `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6`; Card chuẩn `rounded-xl sm:rounded-2xl border-slate-200 p-4 sm:p-6 min-w-0 shadow-xs`.
- **Co giãn và chữ dài:** Dùng min-w-0 trên flex/grid item khi nội dung động cần co lại; chọn wrap-break-word cho văn bản thường và break-all chỉ khi chuỗi định danh không thể xuống dòng hợp lý. Với các Form Controls (nhất là Shadcn `<Select>` / `<SelectTrigger>`), BẮT BUỘC dùng `w-full min-w-0` và `[&>span]:truncate` (kèm `title` hover) trên trigger, đồng thời đặt `min-w-0` trên cột grid cha để chống lỗi vỡ layout/tràn khung chứa (tham chiếu Blacklist mục 5).
- **Rút gọn có chủ đích:** Chỉ dùng truncate/line-clamp khi giao diện thực sự cần giới hạn dòng; bảo đảm người dùng vẫn xem hoặc truy cập được nội dung đầy đủ, kể cả bằng keyboard/screen reader khi phù hợp.
- **Luồng cuộn:** Không để nội dung người dùng cần xem bị cắt hoặc mất đường cuộn. overflow-hidden, h-full, chiều cao giới hạn được phép cho canvas, chart, animation hoặc panel có bounds rõ ràng; với vùng cuộn lồng nhau, xác định parent có chiều cao và min-h-0 phù hợp rồi kiểm tra trên route thật.
- **Layout responsive:** Chọn breakpoint theo chiều rộng khả dụng của container và độ rộng tối thiểu để điều khiển nội dung; tính cả navigation/sidebar. md và lg chỉ là lựa chọn, không phải quy tắc cố định. Ưu tiên layout/grid/container query thích ứng; chọn xếp dọc, thu gọn sidebar hoặc cuộn ngang có kiểm soát khi phù hợp.
- **Toolbar và danh sách:** Nhóm input theo số lượng, độ dài nhãn và hành động thực tế; nhãn phải rõ, thao tác không đè lên nội dung. Grid 12 cột, shrink-0 và max-width là công cụ chọn lọc, không bắt buộc cho mọi component.
- **Accordion/Collapsible async:** Chọn controlled state khi cần đồng bộ danh sách mục mở với dữ liệu tải/cập nhật bất đồng bộ. defaultValue phù hợp nếu component chỉ mount sau khi có dữ liệu và trạng thái khởi tạo không cần đổi. Không ép mở tất cả nhóm trừ khi thiết kế yêu cầu; giữ lựa chọn mở/đóng của người dùng.
- **Sheet và Dialog:** Sheet thường phù hợp với form dài hoặc nội dung cần đối chiếu; Dialog phù hợp với xác nhận và tác vụ ngắn. Bắt buộc khai báo `w-[95vw]` trên mobile và `max-h-[90vh] overflow-y-auto`. Chọn theo luồng người dùng, thiết bị, accessibility và pattern hiện có; mọi phương án phải giữ keyboard/focus behavior đúng.
- **Chất lượng thị giác:** Bám design system và các màn hình cùng khu vực; giữ phân cấp thị giác, khoảng cách, typography và mật độ thông tin nhất quán. Kiểm tra trạng thái loading/empty/error và viewport thực tế thay vì chỉ thêm utility class theo checklist.

### Frontend State Ownership, Rendering, and Modal/Sheet Loading
- **State ownership:** Đặt state ở component nhỏ nhất sở hữu hành vi; chỉ lift state lên cha khi nhiều component thực sự dùng chung hoặc state thuộc URL. Không đưa state UI cục bộ vào global store.
- **Single source of truth:** Không lưu lại state có thể suy ra từ props/data; giữ state cần thiết tối thiểu và tránh hai state phải đồng bộ cùng một giá trị.
- **Giảm re-render không cần thiết:** Cô lập state trong subtree sở hữu để cập nhật đúng phần giao diện liên quan; tránh setState ở page/root cho tương tác cục bộ. Chỉ dùng memoization khi có chi phí render lặp cụ thể, không rải `useMemo`/`React.memo` đại trà.
- **Dialog/Sheet controlled open:** Component sở hữu giữ state controlled mặc định đóng (`const [open, setOpen] = useState(false)`) và truyền `open`/`onOpenChange`; mỗi modal/sheet độc lập có state mở riêng.
- **Lazy content/data:** Chỉ mount nội dung nặng và bắt đầu fetch/transform dữ liệu sau thao tác mở; gate query bằng `enabled: open` hoặc guard tương đương. Không tải dữ liệu lúc page mount khi modal/sheet còn đóng. Có thể giữ cache sau lần mở đầu nếu phù hợp UX, tránh refetch không cần thiết.
- **Frontend là dumb client:** Chỉ đảm nhiệm trình bày dữ liệu, state tương tác cục bộ, định dạng hiển thị và gửi thao tác qua API contract/hook có sẵn. Không tự quyết định quyền cuối cùng, chuyển trạng thái workflow, quy tắc nghiệp vụ, tính KPI/số liệu cốt lõi hoặc validation bảo vệ dữ liệu; Backend/service sở hữu nghiệp vụ và là source of truth. Client-side validation chỉ hỗ trợ UX, Backend vẫn phải xác thực. Dùng kết quả Backend (`allowed`, permission, workflow state...) để quyết định UI. Nếu thiếu API/contract cho yêu cầu, ghi rõ gap và chuyển đúng backend owner/lane; không mock hay tự dựng luật trong UI.
- **Granular Endpoints & Lazy Tabs On-Demand (Chống Mega-fetch):** Từng API của các tab phải xuất phát từ endpoint chuyên biệt ở server (chống pattern gom 1 cục endpoint lớn "mega-fetch"). Modal/Drawer/Trang chi tiết chỉ fetch endpoint thực thể chính và tab mặc định khi mở; các tabs con (`Discussion`, `History`, `KPI`, `Subtasks`) dùng pattern `visitedTabs` để chỉ mount component và trigger React Query hook khi người dùng thực sự click vào tab đó (`enabled: activeTab === '...' && isValidId`). Tuyệt đối không lấy dữ liệu fallback chập chờn từ object cha truyền xuống làm giật lag giao diện.


### 2. Ràng buộc Thống Nhất Duy Nhất Axios, Chuẩn Hóa Đầu Vào - Đầu Ra & Client Gọi - Render Trực Tiếp (BẮT BUỘC)
- **Thống nhất Tuyệt đối Dùng Duy Nhất `axios` — CẤM DÙNG `fetch`:** Toàn bộ hệ thống gọi tới API (bao gồm `apps/admin_khcn`, `apps/portal-goverment`, serverFetch và các microservices) BẮT BUỘC dùng **DUY NHẤT `axios`** (`apiClient` singleton tại Frontend, instance `axios` tại Server-side/Backend). CẤM TUYỆT ĐỐI việc sử dụng native `fetch` phân mảnh phương thức kết nối.
- **Chuẩn Hóa Đầu Vào (Input Standardization):**
  * Instance `apiClient` đã được cấu hình toàn diện tập trung: `baseURL` (`/api/v1/admin` cho Admin, `/api/v1` cho Portal), `timeout`, `withCredentials: true`, `headers: { 'Content-Type': 'application/json' }`, tự động gắn session, quản lý refresh token và xử lý lỗi tập trung.
  * **CẤM TUYỆT ĐỐI thêm tiền tố `/admin` vào string path gọi API:** Ví dụ gọi `/integration/routes`, CẤM gọi `/admin/integration/routes` vì sẽ bị double prefix thành `/api/v1/admin/admin/...` gây lỗi 404!
- **Chuẩn Hóa Đầu Ra (Output Standardization) & Response Envelope:**
  * Đầu ra từ API Gateway và Axios đã được chuẩn hóa đồng bộ 100%. Response luôn đảm bảo cấu trúc Envelope 1 tầng duy nhất:
    ```json
    {
      "success": true,        // boolean: trạng thái thực thi thành công hay thất bại
      "data": [...],          // T | T[]: Thực thể dữ liệu thuần túy - DÙNG ĐỂ RENDER TRỰC TIẾP
      "meta": {               // PlainObject: Siêu dữ liệu phụ trợ
        "pagination": { "total": 100, "page": 1, "pageSize": 20, "totalPages": 5 },
        "actions": { "canEdit": true, "canDelete": false, "canApprove": true },
        "permissions": [...]  // Danh sách quyền hạn thao tác trên tài nguyên hiện tại
      },
      "message": "...",       // string: Thông báo phản hồi cho người dùng (nếu có)
      "timestamp": "..."      // string: Thời gian ISO
    }
    ```
  * **Tại Backend (API Gateway & Microservices):**
    - `data` CHỈ chứa thực thể dữ liệu nghiệp vụ thuần túy để render. Tuyệt đối không tự ý gói đúp `{ success: true, data: { data: ... } }` hay `{ data: { items: ... } }`.
    - `TransformInterceptor` tại Gateway là Source of Truth đảm bảo phẳng hóa mọi envelope lồng nhau.
    - Phân định rõ ràng: Dữ liệu render nằm ở `data`; quyền thao tác nằm ở `meta.actions` / `meta.permissions`; phân trang nằm ở `meta.pagination`; thông báo ở `message`; trạng thái ở `success`.
- **Client Chỉ Việc Gọi và Render Kết Quả — Lược Bỏ Hoàn Toàn Phần Dư Thừa Cũ:**
  * **Gọi là Render (Direct Call & Render):** Do đầu vào và đầu ra Axios đã được chuẩn hóa, dưới Client UI component CHỈ VIỆC gọi hook / API và render trực tiếp kết quả (`const { data: documents = [] } = useListDocuments(...)` -> `documents.map(...)`). Chỉ đúng 1 cấp là lấy được dữ liệu render!
  * **Lược bỏ toàn bộ xử lý dư thừa cũ:** TUYỆT ĐỐI KHÔNG viết thêm các bước chuẩn hóa trung gian, các hàm convert cấu trúc ad-hoc, các vòng lặp bóc tách nhiều tầng hay getter monkey-patching cũ.
  * **Triệt tiêu mã phòng thủ chắp vá:** CẤM viết code chọc nhiều cấp dạng `res?.data?.data`, `(data as any)?.data`, `data?.data?.map(...)` hay `Array.isArray(x?.data)...`.
  * **Quy tắc trích xuất dữ liệu chuẩn:**
    + **Dữ liệu Render:** Lấy trực tiếp từ `data` (hoặc biến unwrap từ custom hook).
    + **Quyền hành động:** Lấy từ `meta.actions` hoặc `meta.permissions`.
    + **Thông tin phân trang:** Lấy từ `meta.pagination` (`total`, `page`, `pageSize`, `totalPages`).
    + **Trạng thái thực thi:** Lấy từ `success`.
    + **Thông báo người dùng:** Lấy từ `message`.

### 3. Ràng buộc Next.js App Router theo phiên bản khai báo trong package & Server Components
- Dùng đúng APIs của phiên bản Next.js khai báo trong package bị ảnh hưởng. Với route params/searchParams được khai báo là Promise, phải await trước khi đọc; xác minh kiểu từ code/config hiện có.
- Giữ file `page.tsx` là Server Component gọn gàng, chuyển toàn bộ UI tương tác và React hooks vào `*Client.tsx` có chỉ thị `'use client'`.

### 4. Ràng buộc Quản lý gRPC & File `.proto`
- Khi sửa đổi file `.proto`: Sử dụng công cụ ghi đè an toàn, kiểm tra kỹ cú pháp đóng mở `{ }`. Ngay sau khi sửa, PHẢI build/chạy microservice tương ứng để xác nhận bộ tải gRPC không văng `illegal token` hay `InvalidProtoDefinitionException`.
- **Chống lỗi corrupted JSON `[object Object]`:** Dữ liệu JSON phức tạp lồng nhau khi truyền qua gRPC bắt buộc serialize thành chuỗi (`metadataJson`, `schemaJson`) và parse bằng helper an toàn `safeParse`.
- **Payload gRPC:** Nếu request có thể vắng mặt và handler cần đọc/ghi field object, kiểm tra/khởi tạo object trước khi truy cập. Giữ đúng kiểu contract và không ép mọi payload thành object rỗng.
- **Ràng buộc Phân phối Tài nguyên theo Ngữ cảnh Quyền (PBAC Context Scoping):** Mọi thông tin chứng thực/phân quyền (`id`, `employeeCode`, `unitId`, `permissionsFlatten`) trích xuất từ `@CurrentUser() user` chỉ dùng để: (1) Kiểm tra quyền truy cập tài nguyên (authorization check), (2) Giới hạn phạm vi dữ liệu theo đúng thẩm quyền được cấp (`where: { departmentId: user.unitId }`, `where: { employeeCode: user.employeeCode }` hoặc phân cấp Ban/Phòng/Chuyên viên), (3) Ghi nhận vết kiểm toán (Audit Trail). TUYỆT ĐỐI KHÔNG gán cẩu thả các trường user vào payload `data` mà không kiểm tra khởi tạo hoặc không dùng quyền để phân phối tài nguyên.

### 5. Ràng buộc An toàn CSDL & Additive Migrations
- **Nguyên tắc Additive Migration (Zero-Downtime):** Mọi cột mới thêm vào bảng đang chạy BẮT BUỘC là `nullable` (`type?`) hoặc có `@default(...)`.
- **CẤM TUYỆT ĐỐI thêm cột NOT NULL không có default:** Đây là nguyên nhân trực tiếp gây lỗi sập Prisma `P2022: Column department_path does not exist` từng xảy ra với HRM.
- **CẤM DROP COLUMN hoặc RENAME COLUMN trực tiếp** trên production database.
- **Index theo query thực tế:** Đánh giá index dựa trên filter/order/join và query plan; kiểm tra index/composite index hiện có trước khi thêm. Không tạo index riêng cho mọi trường một cách máy móc.
- **Phòng chống N+1:** Ưu tiên batch/include/select khi cần dữ liệu liên quan. Promise.all chỉ song song hóa request, không loại bỏ N+1; nếu thao tác từng bản ghi là cần thiết, dùng transaction hoặc concurrency có giới hạn và ghi lý do.

### 6. Ràng buộc Bảo mật PBAC & Service Data Sovereignty & Source of Truth
- **Service Data Sovereignty:** Một Service tuyệt đối KHÔNG truy cập trực tiếp vào CSDL của Service khác. Mọi giao tiếp liên service bắt buộc qua gRPC contract hoặc message broker.
- **Ràng buộc Source of Truth của các Service nền tảng (BẮT BUỘC TUÂN THỦ TRƯỚC KHI CODE):**
  * **`user-service` là Source of Truth DUY NHẤT** cho: User, Account, PBAC, Organization và **Cấu trúc Vị trí việc làm (VTVL) định biên** (`job_titles`, `org_staffing`, `staffing_slots`), kèm **Phân công theo dõi** (lĩnh vực `staffing_slot_domains`, địa bàn `staffing_slot_geographic_areas`, phòng ban theo dõi `staffing_slot_monitored_units`). Các coder agents khi làm việc tại `hrm-service` hay bất kỳ service nào TUYỆT ĐỐI KHÔNG được tự ý bỏ qua hoặc dựng lại khung VTVL rời rạc; bắt buộc phải tích hợp và tham chiếu dữ liệu từ `user-service`.
  * **`workflow-service` là trung tâm quy trình:** Nơi lưu trữ, cấu hình và mô tả toàn bộ các nghiệp vụ hệ thống (BPMN Definitions, State Machines, Swimlanes, Transitions). Các service domain chỉ lưu dữ liệu nghiệp vụ và phải ủy quyền điều phối luồng duyệt cho `workflow-service`.
  * **`api-gateway` (API Manager):** Quản lý tập trung các nguồn kết nối chính của toàn hệ thống, xây dựng các API nội bộ và các API liên thông (LGSP, DVC, bên ngoài). Không chứa business logic domain.
  * **`report-service`:** Nơi thiết kế báo cáo hệ thống, xây dựng các Dashboard phân quyền sử dụng báo cáo cho từng cá nhân, đơn vị; là nơi các đơn vị truy cập theo dõi tiến độ, hiệu suất và số liệu toàn diện. Thu thập số liệu qua gRPC/RabbitMQ, không query chéo CSDL.
- **gRPC Metadata Delegation:** Mọi lời gọi gRPC giữa API Gateway và microservices bắt buộc phải đính kèm `GatewayContextToken` (`this.getGrpcMetadata(req)`). Cấm gọi gRPC rỗng metadata (nguyên nhân gây lỗi 401 Infinite Logout Loop).
- **PBAC Tenant Scope:** Với entity thuộc tenant, mọi truy vấn phải áp dụng organization/tenant scope từ user đã xác thực. Dữ liệu dùng chung/toàn cục tuân theo chính sách truy cập tương ứng; không thêm scope giả định khi model không thuộc tenant.
- **Least Data:** Chỉ query và trả về đúng những trường dữ liệu cần thiết.

### 7. Ràng buộc Vệ sinh Mã nguồn & Encoding
- **Xóa sạch 100% debug logs:** Không để lại bất kỳ `console.log`, `debugger`, import dư thừa hay mã giả tạm thời nào.
- **Mã hóa UTF-8 (không BOM):** Tất cả các file phải lưu chuẩn UTF-8 không BOM. Tiếng Việt có dấu hiển thị nguyên vẹn, không bị lỗi font hay crash trình biên dịch.

### 8. Ràng buộc Đồng bộ Kiến trúc Hệ thống Bắt buộc (Mandatory Architecture Synchronization Gate)
- **Quy tắc "Code thay đổi, Kiến trúc phải đồng bộ" (1:1 Reflection):** Tài liệu kiến trúc tại `.agents/architecture/` (`service-map.md`, `source-of-truth.md`, `dependency-map.md`, `request-response-flow.md`, `workflow-map.md`) là Source of Truth tài liệu kỹ thuật duy nhất của toàn hệ thống. Mọi thay đổi mã nguồn làm biến động cấu trúc hệ thống BẮT BUỘC phải được cập nhật đồng bộ ngay vào các file kiến trúc tương ứng trước khi báo cáo hoàn thành.
- **Các trường hợp bắt buộc kích hoạt đồng bộ (Trigger Events):**
  * **Database/Prisma:** Thêm bảng mới, sửa quan hệ, thêm cột khóa ngoại, sửa enum -> Cập nhật `service-map.md` và `source-of-truth.md`.
  * **API Gateway & Routing:** Thêm/sửa route path, method, DTO, vai trò PBAC -> Cập nhật `request-response-flow.md` và `service-map.md`.
  * **gRPC & Protobuf:** Thêm/sửa RPC method, message definition, streaming contract trong file `.proto` -> Cập nhật `dependency-map.md` và `service-map.md`.
  * **RabbitMQ & Events:** Thêm/sửa event name, queue name, routing key, publisher/consumer -> Cập nhật `dependency-map.md` và `request-response-flow.md`.
  * **Workflow & State Machine:** Thêm/sửa trạng thái duyệt (states), điều kiện chuyển bước (transitions), sơ đồ phân làn (swimlanes) -> Cập nhật `workflow-map.md` và `source-of-truth.md`.
  * **Frontend Feature/Route:** Thêm phân hệ trang mới, parallel route `@sheet`, drawer/dialog chính -> Cập nhật `service-map.md`.
- **Cửa ải Nghiệm thu (Architecture Gate):** Một tác vụ chỉ được coi là hoàn tất khi diff mã nguồn đã được phản chiếu chính xác vào `.agents/architecture/`. Tác vụ có code thay đổi mà bỏ qua việc cập nhật kiến trúc sẽ bị **TỪ CHỐI NGHIỆM THU (GATE REJECTED)**. Tham chiếu chi tiết hướng dẫn thực thi tại [`.agents/architecture/SYNC-GUIDELINES.md`](.agents/architecture/SYNC-GUIDELINES.md).

---

## 5. Báo cáo Thực thi (Execution Report)
Kết thúc bất kỳ tác vụ nào, agent xuất báo cáo nghiệm thu theo định dạng chuẩn mực:

```markdown
## Báo cáo Thực thi
- **Bước 1 - Kiến trúc & Kiểm tra Trùng lặp:** [Xác nhận Source of Truth của service chủ quản, kiểm tra trùng lặp chức năng/entity]
- **Bước 2 - Khảo sát Thực tế & Chống Ảo giác:** [Danh sách file schema/proto/code thực tế đã đọc, danh sách file khóa phạm vi]
- **Bước 3 - Giải pháp Kỹ thuật:** [Giải pháp thiết kế bám sát 8 Bộ ràng buộc kỹ thuật]
- **Bước 4 - Thực thi Chuẩn xác:** [Mã nguồn đã triển khai theo yêu cầu, tuân thủ 8 Bộ ràng buộc kỹ thuật]
- **Bước 5 - Kiểm chứng:** [Lệnh typecheck/lint/build và test đã chạy; runtime smoke route/API hoặc migration; kết quả PASS/FAIL/UNVERIFIED, blocker và phần chưa kiểm tra; phản biện diff/edge cases.]
- **Bước 6 - Đồng bộ Kiến trúc (Architecture Sync):** [Danh sách file trong .agents/architecture/ đã cập nhật phản ánh đúng mã nguồn thực tế]
- **Bước 7 - Dọn rác & Hoàn tất:** [Xác nhận đã dọn rác 100%, ghi execution log]
```

---

## 6. Quản lý Tri thức (Execution Log)
Mỗi coder ghi nhật ký riêng: Code 1 append `.agents/execution_logs/code1.md`, Code 2 append `.agents/execution_logs/code2.md`, Code 3 append `.agents/execution_logs/code3.md`. Ghi nhận ngắn gọn ngày, tên tác vụ/tính năng, danh sách file đã sửa và bằng chứng lệnh kiểm chứng thực tế đã chạy.
