# Frontend Rules & Architecture

## 1. Công nghệ cốt lõi (Tech Stack)
- **Framework**: React / Next.js (Dự án đang sử dụng Next.js App Router hoặc Pages Router với React 18+).
- **Data Fetching & State Management**: Sử dụng **TanStack Query (React Query)** kết hợp với **Duy nhất Axios** (`apiClient`). **CẤM TUYỆT ĐỐI dùng `fetch`**.
  - `apiClient` (Axios Singleton): Base HTTP client duy nhất cho toàn bộ Frontend, quản lý tập trung baseURL, session recovery, token và chuẩn hóa response.
  - Không tự xây server-state fetching bằng useEffect/useState nếu package đã có query client; theo convention của feature.
- **UI Component Library**: Ưu tiên sử dụng **Shadcn UI** (`components/ui/*`) và Tailwind CSS cho giao diện.
  - Dialog, Select, Input, Button, Table và dropdown ưu tiên dùng component Shadcn đã có; không tự dựng overlay/dropdown thiếu keyboard, focus hoặc accessible behavior.
  - Tuyệt đối không tự chế lại modal hay dropdown bằng các thẻ `div` cố định để đảm bảo UI/UX thống nhất.

## 2. Nguyên tắc thiết kế (Architecture Principles)
- **Separation of Concerns**: Tách API/query logic khỏi UI theo cấu trúc feature hiện có; giữ conventions và tên file thực tế của package.
- **No Business Rules in Frontend**:
  - UI + Client State + API consumption + Presentation.
  - Frontend KHÔNG ĐƯỢC trở thành *source of truth* hay thực thi các business rules nhạy cảm (như quyết định quyền hạn cuối cùng, logic tính toán số liệu cốt lõi). Tất cả những logic này do Backend sở hữu.
  - **Dumb Client Boundary (BẮT BUỘC):** Frontend chỉ render/present dữ liệu, quản lý interaction state cục bộ, định dạng hiển thị và gửi thao tác theo API contract/hook. Quyền cuối cùng, workflow transitions, business rules, KPI/số liệu cốt lõi, validation bảo vệ dữ liệu và dữ liệu chuẩn thuộc Backend/service source of truth. Client validation chỉ hỗ trợ UX; không dùng để thay validation Backend. Render quyền/nút/trạng thái theo response từ API. Nếu thiếu contract/API, nêu rõ gap cho backend owner/lane; không mock hoặc tự dựng business rule trong UI.
  - **CẤM Tự Ý Hardcode Master Data / Categories ở Frontend (Zero Hardcoded Static Data):** Tuyệt đối không khai báo các mảng dữ liệu tĩnh (như danh sách nhà cung cấp AI, danh sách model, dịch thuật, độ ưu tiên, danh mục văn bản...) ở Client để làm fallback hay cấp option cho Select/Combobox. Mọi danh mục dùng chung (Master Data) bắt buộc phải do `user-service` quản lý và trả về qua API. Client chỉ gọi hook (`useGetCategoryByGroup`, `useAiFetchModels`) và render trực tiếp kết quả.
- **Data-Driven UI**:
  - Dựa hoàn toàn vào kết quả trả về từ Backend (permission, workflowState, allowed, denied) để render giao diện (ẩn/hiện nút bấm, điều hướng).

## 3. Đồng bộ chuẩn dữ liệu Frontend - Backend (API Response & Direct Rendering)

API Gateway và Axios Interceptor đã chuẩn hóa 100% cả đầu vào và đầu ra. Mọi response HTTP JSON từ Gateway tuân thủ nghiêm ngặt cấu trúc 5 trường chuẩn:

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

- **Quy tắc Phân Định Dữ Liệu Rõ Ràng & Trích Xuất Dữ Liệu 1 Cấp (Single-Level Direct Access):**
  * **Lấy Data để Render:** Lấy trực tiếp từ `data` (hoặc biến trả về từ custom hook: `const { data = [] } = use...()`). `data` luôn là thực thể hoặc mảng thực thể thuần túy, TUYỆT ĐỐI không bọc đúp `data.data`.
  * **Lấy Quyền hành động (Action/Permissions):** Lấy trong `meta.actions` hoặc `meta.permissions` (ví dụ: `res.meta?.actions?.canEdit`, `res.meta?.actions?.canApprove`).
  * **Lấy Thông tin phân trang:** Lấy trong `meta.pagination` (`meta.pagination.total`, `meta.pagination.page`, `meta.pagination.pageSize`, `meta.pagination.totalPages`).
  * **Lấy Trạng thái thực thi:** Lấy ở `success` (`res.success === true`).
  * **Lấy Thông báo phản hồi:** Lấy ở `message` (`res.message` để hiển thị toast notification hoặc alert).

- **Client Gọi và Render Trực Tiếp — Lược Bỏ Hoàn Toàn Xử Lý Chuẩn Hóa Dư Thừa:**
  * **Đầu vào và đầu ra Axios đã được chuẩn hóa:** Toàn bộ việc xử lý session, refresh token, format envelope và unwrap đã được đảm bảo ở tầng Axios / API Gateway.
  * **Client UI Component CHỈ VIỆC GỌI VÀ RENDER:** Component chỉ gọi hook / API và render trực tiếp dữ liệu (`data.map(...)`). TUYỆT ĐỐI KHÔNG viết thêm các hàm/bước chuẩn hóa dữ liệu thừa thãi, các vòng lặp bóc tách nhiều tầng hay các getter monkey-patching cũ.
  * **Triệt tiêu mã phòng thủ chắp vá:** CẤM viết code phòng thủ ad-hoc như `(data as any)?.data ?? data` hay `Array.isArray(x?.data) ? x.data : ...` hay `res?.data?.data`. Dưới client, chỉ đúng 1 cấp là lấy được dữ liệu render!
- Thất bại HTTP thường theo error payload `success=false, message, errorType, code, statusCode, timestamp` từ AllExceptionsFilter. Đọc errorType/message theo contract đã xác minh; không tự phân loại lỗi nghiệp vụ bằng statusCode. Với file download, proxy hoặc endpoint đặc biệt, kiểm tra response thực tế và kiểu Axios trước khi xử lý.

## 4. Chuẩn hóa Quản lý State
- **Server State (Dữ liệu từ API)**: Bắt buộc dùng `React Query`. Không được lưu kết quả fetch API vào `Zustand` hay `useState`.
- **Client State (Trạng thái UI toàn cục)**: Chỉ dùng global store theo pattern đã có khi nhiều khu vực thực sự cùng sở hữu state; không thêm store mới cho state của một màn hình.
- **Local State**: Chỉ dùng `useState` hoặc `useReducer` cho các trạng thái nhỏ lẻ, cục bộ nằm gọn trong một component (như form chưa submit).

## 5. Thống Nhất Duy Nhất Axios & Loại Bỏ Hoàn Toàn Xử Lý Chuẩn Hóa Dư Thừa
- **CẤM TUYỆT ĐỐI dùng `fetch` trong toàn bộ dự án:** Toàn bộ frontend và các tác vụ server-side communication BẮT BUỘC thống nhất dùng **DUY NHẤT `axios`** (`apiClient` singleton ở frontend hoặc axios client ở server-side). Không để phân mảnh nhiều phương thức kết nối.
- TUYỆT ĐỐI KHÔNG `import axios from 'axios'` và gọi `.get()` trực tiếp ở bất kỳ UI component hay file hook nào đối với API nội bộ; phải gọi qua `apiClient` hoặc service API module có sẵn.
- Mọi lệnh gọi API nội bộ **bắt buộc** phải sử dụng thông qua `apiClient` được khởi tạo duy nhất (singleton) trong cấu hình dự án (`lib/axiosInstance.ts`).
- Đối với các dịch vụ bên ngoài (như presigned MinIO/S3 PUT upload), được phép dùng instance `axios` độc lập để tránh gửi kèm Authorization Header nội bộ gây lỗi CORS.
- **Không cần bước chuẩn hóa dữ liệu lặp lại ở Frontend:** Do API Gateway và Axios đã chuẩn hóa đầu vào và đầu ra thành Single-Level Data, Frontend chỉ việc nhận đúng cấu trúc thực thể từ `data` (hoặc thông qua custom hook) để render trực tiếp, KHÔNG viết thêm các hàm/bước chuẩn hóa dữ liệu cũ thừa thãi.

## 6. UI/UX & CSS Layout (Design System & Responsive Standards)
*(Chi tiết định chuẩn toàn diện xem tại: [`.agents/rules/ui-ux-design-system.md`](ui-ux-design-system.md))*

### A. Kích cỡ hiển thị trên từng màn hình (Screen Breakpoints)
- **`< 375px` (Mobile XS / Compact):** Toàn bộ xếp 1 cột (`grid-cols-1`, `flex-col`); Dialog/Sheet co dãn `w-[95vw]`; TabsList cuộn ngang `overflow-x-auto`; Padding `p-3` hoặc `px-2 py-3`.
- **`375px - 639px` (Mobile Standard):** Lưới form 1 cột; tiêu đề tự co rút (`truncate`); menu điều hướng ẩn vào Mobile Drawer. Padding `p-4`.
- **`640px - 767px` (`sm:` Phablet / Tablet Portrait):** Bắt đầu chia 2 cột cho các trường ngắn (`sm:grid-cols-2`); Dialog mở rộng `sm:max-w-[500px]`. Padding `p-5`.
- **`768px - 1023px` (`md:` Tablet Landscape / Small Laptop):** Sidebar thu gọn (icon-only); Lưới chia 2-3 cột (`md:grid-cols-2`, `md:grid-cols-3`); Bảng dữ liệu desktop đầy đủ có thanh cuộn ngang độc lập.
- **`1024px - 1279px` (`lg:` Laptop Văn phòng Tiêu chuẩn):** Sidebar mở rộng đầy đủ (240px - 260px); Form chia 3-4 cột; TabsList chuyển sang dạng lưới cân đối (`lg:grid`).
- **`1280px - 1535px` (`xl:` Desktop Tiêu chuẩn):** Bố cục đa cột hoàn chỉnh (`max-w-7xl mx-auto`); Cột danh mục và bảng làm việc song song (`xl:flex-row`).
- **`≥ 1536px` (`2xl:` Màn hình Lớn / Dashboard IOC):** Thẻ chia 4-5 cột (`2xl:grid-cols-4`, `2xl:grid-cols-5`); Giới hạn bề rộng `2xl:max-w-[1600px]`.

### B. Quy chuẩn Kiểu chữ (Typography Hierarchy)
- **Phông chữ:** `font-sans` (Inter / Roboto) tối ưu hiển thị Unicode Tiếng Việt, độ tương phản chuẩn WCAG AA.
- **Thang cỡ chữ (Font Scale):**
  - **`text-[10px]` / `text-[11px]`:** Micro text, Badge số đếm, tag trạng thái nhỏ (Khẩn, Mật, Hỏa tốc), helper text form.
  - **`text-xs` (12px / 16px):** Nhãn form (`text-xs font-semibold text-slate-700`), Tiêu đề cột bảng (`TableHead` uppercase text-slate-500), Nút bấm phụ (`size="sm"`), Breadcrumbs.
  - **`text-sm` (14px / 20px):** **CỠ CHỮ CỐT LÕI CỦA TOÀN BỘ HỆ THỐNG:** Body text, Input text, Select value, Dropdown item, Ô nội dung bảng (`TableCell`). Đảm bảo mật độ thông tin công vụ sắc nét, tối ưu.
  - **`text-base` (16px / 24px):** Tiêu đề Card con, Subheadings, Trích yếu văn bản nổi bật.
  - **`text-lg` (18px / 28px):** Tiêu đề Dialog/Modal (`DialogTitle`), Tiêu đề Drawer, Heading `h3`.
  - **`text-xl` (20px / 28px):** Tiêu đề Page Subheading, Chỉ số thống kê lớn trong Card Dashboard.
  - **`text-2xl` (24px / 32px):** Tiêu đề Trang chính (`h2` tại Service Header: `text-xl md:text-2xl font-bold`).
- **Ngắt dòng & Co rút:**
  - Chuỗi văn bản thông thường: Dùng `break-words` hoặc `wrap-break-word`.
  - Chuỗi mã/UUID dài không dấu cách: Dùng `break-all`.
  - Form controls & Select: BẮT BUỘC 100% `<SelectTrigger>` có `w-full min-w-0 truncate [&>span]:truncate`, thẻ cha trong flex/grid có `min-w-0`.

### C. Quy chuẩn Danh sách (Lists) & Bảng biểu (Tables)
- **Danh sách (List Components):**
  - Viền phân cách: `divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border bg-white dark:bg-slate-950 overflow-hidden`.
  - Khoảng đệm hàng: `py-2.5 px-3` (compact / drawer) hoặc `py-3.5 px-4` (tiêu chuẩn).
  - Tương tác: `hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors min-w-0`.
  - Trạng thái rỗng (Empty State): Bắt buộc icon (36-44px text-slate-400) + tiêu đề (`text-sm font-semibold`) + mô tả phụ (`text-xs text-slate-500`) + nút CTA nếu có quyền.
- **Bảng dữ liệu (Data Tables):**
  - Bọc ngoài: Bắt buộc bọc trong `w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800`.
  - Tiêu đề cột (`TableHead`): `text-xs font-semibold uppercase tracking-wider text-slate-500 py-3 px-4 bg-slate-50/80`.
  - Ô nội dung (`TableCell`): `text-sm text-slate-700 dark:text-slate-200 py-3 px-4`.
  - Canh lề (Alignment): Left (Trích yếu, tên, phòng ban), Center (Mã, STT, Trạng thái, Ngày tháng), Right (Số tiền, KPI, Thao tác nút bấm).
  - Co rút cột: Cột nội dung dài dùng `min-w-[200px] whitespace-normal break-words` (CẤM dùng `whitespace-nowrap` kéo dãn bảng). Cột cố định dùng `whitespace-nowrap shrink-0`.
- **Lưới thẻ (Card Grids):**
  - Breakpoints: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6`.
  - Cấu trúc Card: `rounded-xl sm:rounded-2xl border-slate-200 p-4 sm:p-6 min-w-0 shadow-xs hover:shadow-md transition-shadow`.

### D. Nguyên tắc layout & kiểm chứng trực quan
- **Co giãn và chữ dài:** Dùng min-w-0 trên flex/grid item khi nội dung động cần co lại; chọn wrap-break-word cho văn bản thường và break-all chỉ khi chuỗi định danh không thể xuống dòng hợp lý.
- **Rút gọn có chủ đích:** Chỉ dùng truncate/line-clamp khi giao diện thực sự cần giới hạn dòng; bảo đảm người dùng vẫn xem hoặc truy cập được nội dung đầy đủ (tooltip `title`).
- **Luồng cuộn:** Không để nội dung người dùng cần xem bị cắt hoặc mất đường cuộn. Bắt buộc kiểm tra bounds trên route thật.
- **Accordion/Collapsible async:** Chọn controlled state khi cần đồng bộ danh sách mục mở với dữ liệu async.
- **Sheet và Dialog:** Sheet thường phù hợp với form dài; Dialog phù hợp với xác nhận và tác vụ ngắn. Bắt buộc `w-[95vw]` trên mobile và `max-h-[90vh] overflow-y-auto`.
- **Kiểm chứng trực quan:** Với thay đổi UI, kiểm tra trực tiếp ở các kích thước 360px, 768px, 1280px, 1920px; không chỉ dựa vào lint/typecheck.

## 7. BaseURL & API Endpoint Routing
- **Tại `admin_khcn`**: `apiClient` và `serverFetch` đã có `baseURL = "/api/v1/admin"`. TUYỆT ĐỐI KHÔNG thêm tiền tố `/admin` hoặc `/api/v1/admin` vào chuỗi URL khi gọi API (ví dụ: dùng `apiClient.get('/integration/routes')`, KHÔNG ĐƯỢC dùng `apiClient.get('/admin/integration/routes')` hay `apiClient.get('/api/v1/admin/integration/routes')` sẽ dẫn tới URL đúp `.../admin/admin/...` gây 404).
- **Tại `portal-goverment`**: `apiClient` đã có `baseURL = "/api/v1"`. TUYỆT ĐỐI KHÔNG thêm `/api/v1` vào chuỗi URL.

## 8. Chuẩn hóa Type Binding, Route Params & Tránh Code Phòng Thủ Chắp Vá (Anti-Pattern)
- **Cấm Code Phòng Thủ Chắp Vá ở UI Component**:
  - TUYỆT ĐỐI KHÔNG viết các đoạn xử lý chắp vá trong Component kiểu:
    `const validIdStr = id && !isNaN(id) ? id.toString() : '';`
    `useGetSomething(validIdStr);`
  - Nếu ID là số nguyên (numeric ID), kiểu dữ liệu BẮT BUỘC phải là `number`. Hook API phải nhận `id?: number | string | null` và tự đóng gói (encapsulate) validation:
    ```typescript
    export const useGetEntity = (id?: number | string | null) => {
      const numId = Number(id);
      const isValid = Number.isInteger(numId) && numId > 0;
      return useQuery({
        queryKey: entityKeys.detail(isValid ? numId : 0),
        queryFn: () => axiosInstance.get(`/entities/${numId}`),
        enabled: isValid,
      });
    };
    ```
- **Trách nhiệm Phân giải Route Params tại Page Component (Next.js App Router theo phiên bản package)**:
  - Kiểm tra package và route types để xử lý `params`/`searchParams`; nếu kiểu khai báo là Promise thì await trước khi đọc.
  - Page Component (`app/.../[id]/page.tsx`) là cửa ngõ duy nhất chịu trách nhiệm phân giải `params.id` thành một `id: number` hợp lệ trước khi truyền xuống Component con (`ReportViewer`, `EntityDetail`).
  - Nếu `id` chưa sẵn sàng hoặc không hợp lệ (`!Number.isInteger(numId) || numId <= 0`), Page Component PHẢI hiển thị Loading Skeleton hoặc Not Found. TUYỆT ĐỐI KHÔNG truyền `NaN`, `0`, `undefined` xuống UI component con.
- **Ràng buộc Backend Boundary Validation**:
  - Tại API Gateway và Controller NestJS, mọi route param số nguyên BẮT BUỘC phải dùng `ParseIntPipe`:
    `@Get(':id') getById(@Param('id', ParseIntPipe) id: number)`
  - Gateway sẽ tự động chặn đứng và trả về `400 Bad Request` nếu client gửi các chuỗi rác như `"NaN"`, `"undefined"`, bảo vệ toàn diện các Microservices phía sau khỏi lỗi cú pháp CSDL (như Prisma P2022).

## 9. Kiến trúc Tách nhỏ Endpoint & Lazy Mount On-Demand (Granular Decoupled Endpoints & Visited Tabs Lazy Loading)
- **Bối cảnh & Vấn đề Cốt lõi (Anti-Pattern):**
  - **Mega-fetch Anti-Pattern:** Gom toàn bộ dữ liệu của màn hình chi tiết (thông tin chính, danh sách công việc con, các bước quy trình, lịch sử xử lý, trao đổi bình luận, đánh giá KPI...) vào một endpoint duy nhất hoặc fetch đồng loạt tất cả các tabs ngay khi mở trang/drawer/modal.
  - Hậu quả: Backend phải thực thi hàng loạt query nặng cùng lúc, gây nghẽn I/O, tăng TTFB, lãng phí tài nguyên cho các tabs người dùng không xem; phía Client bị giật giật, lag trang, re-render lặp vòng và flicker giao diện khi dữ liệu cha ghi đè dữ liệu con.
- **Quy tắc Thiết kế Phía Server (Backend / Gateway / Microservice):**
  1. **Granular Endpoints (Xuất phát từ endpoint chuyên biệt ở Server):**
     - Endpoint chi tiết thực thể chính (`GET /entities/:id`) CHỈ query và trả về các trường thông tin cốt lõi (Metadata, Status, Basic Info, Participants chính). TUYỆT ĐỐI KHÔNG `include` hay bundle các bảng quan hệ nặng (Sub-tasks, Steps, History, Comments, KPIs).
     - Mỗi Tab / Khối chức năng chuyên biệt BẮT BUỘC phải có một endpoint API riêng biệt từ Server:
       * `GET /entities/:id/sub-items` (danh sách công việc con, dùng closure table hoặc flat query có phân trang)
       * `GET /entities/:id/steps` (quy trình các bước)
       * `GET /entities/:id/history` (lịch sử / audit log, BẮT BUỘC có `take: 100` hoặc pagination, không query toàn bộ)
       * `GET /entities/:id/evaluations` (đánh giá KPI)
       * `GET /chat/conversation/:id/messages` (bình luận / thảo luận)
  2. **PBAC Scoping & Least Data:**
     - Từng endpoint con phải tự kiểm tra phân quyền (PBAC scoping) qua `@CurrentUser() user` (xác định `isAdmin` chuẩn qua `user.isAdmin || user.employeeCode === 'ADMIN001' || user.permissionsFlatten.includes('*')`).
     - Đảm bảo trả về đúng và đủ dữ liệu cần thiết của tab đó.
- **Quy tắc Thiết kế Phía Frontend (Client & UI Components):**
  1. **Decoupled Tab Components:**
     - Mỗi Tab được tách thành một component độc lập (`EntityProcessingTab`, `EntityDiscussionTab`, `EntityHistoryTab`, `EntityKpiTab`).
     - Component của Tab tự quản lý hook TanStack Query tương ứng, là single source of truth. TUYỆT ĐỐI KHÔNG lấy dữ liệu fallback chập chờn từ props của component cha (`currentTask.subTasks || []`).
  2. **Pattern `visitedTabs` Lazy Mount On-Demand:**
     - Quản lý tập hợp các tab người dùng đã tương tác: `const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set([defaultTab]))`.
     - Khi người dùng click chuyển tab: `setVisitedTabs(prev => new Set(prev).add(tabKey))`.
     - Chỉ mount component của tab khi tab đó đã được mở:
       `{visitedTabs.has('discussion') && <DiscussionTab active={activeTab === 'discussion'} />}`.
     - Trong hook TanStack Query của tab: Đặt guard `enabled: isValidId && (activeTab === 'discussion' || hasLoaded)`.
     - Giữ DOM state đã tải sau lần click đầu tiên để tránh giật lag khi chuyển qua lại giữa các tab, nhưng không bao giờ tải dữ liệu trước khi người dùng click vào tab!




## 10. Tối ưu Hóa Bundle & Tải Mã Nguồn Theo Nhu Cầu Từng Màn Hình (Route-Level Code-Splitting & Dynamic Imports)
- **Bối cảnh & Vấn đề Cốt lõi (Bundle Bloat Anti-Pattern):**
  - Mặc định nếu dùng static import (`import { HeavyEditor } from './HeavyEditor'`), Webpack/Turbopack sẽ đóng gói toàn bộ mã nguồn của component đó vào bundle chính của trang.
  - Khi một màn hình chứa nhiều Modal (Upload, Sửa, Giao việc), biểu đồ (Recharts/ApexCharts), trình soạn thảo (Lexical/TipTap) hoặc Canvas (ReactFlow), người dùng chỉ mở trang danh sách để xem cũng bị ép tải hàng Megabyte mã nguồn JS/CSS không dùng đến. Gây lag trang, tốn băng thông 4G của cán bộ cơ sở và tăng thời gian Time-to-Interactive (TTI).
- **Nguyên tắc "Màn hình nào chỉ tải phần code của màn hình đó" (Strict Route Isolation):**
  1. **Page Server Component Mỏng Nhẹ:**
     - Các file `app/**/page.tsx` giữ vai trò Server Component mỏng nhẹ nhất có thể: Chỉ làm nhiệm vụ đọc params, check auth server-side, nạp metadata và render component Client tương ứng.
     - Tuyệt đối không import thư viện giao diện nặng hoặc CSS canvas vào `page.tsx`.
  2. **Bắt Buộc Sử Dụng `next/dynamic` cho các Khối Giao Diện Nặng:**
     - Mọi component sử dụng các thư viện bên thứ ba có dung lượng lớn (> 30KB) BẮT BUỘC phải được tải bất đồng bộ theo nhu cầu bằng `next/dynamic` kèm fallback Skeleton:
       * **Trình soạn thảo văn bản phong phú (Rich Text Editors):** Lexical, TipTap, CKEditor, Quill.
       * **Biểu đồ thống kê & Giám sát (Charts & Dashboards):** Recharts, ApexCharts, Chart.js.
       * **Trình thiết kế quy trình & Sơ đồ động (BPMN / Flow):** ReactFlow, Canvas Designer, Mermaid renderer.
       * **Trình đọc/xử lý tài liệu (Document Viewers):** PDF Viewer (PDF.js), Image Cropper, OCR highlighters.
     - Cú pháp chuẩn hóa:
       ```tsx
       import dynamic from 'next/dynamic';
       import { Skeleton } from '@/components/ui/skeleton';

       const WorkflowCanvas = dynamic(
         () => import('@/features/workflow/components/WorkflowCanvas'),
         {
           ssr: false,
           loading: () => <div className="h-[600px] w-full animate-pulse bg-slate-100 rounded-xl" />
         }
       );
       ```
  3. **Tách Rời Mã Nguồn Modal / Drawer (Interaction-Driven Code Loading):**
     - Các Dialog/Sheet tạo mới, chỉnh sửa phức tạp (như `DocumentUploadModal`, `JobTitleConfigDialog`, `TaskAssignDialog`, `EditMenuModal`) KHÔNG ĐƯỢC nạp sẵn vào bundle chính của trang danh sách.
     - Sử dụng dynamic import kết hợp điều kiện mở (`open && <LazyModal ... />`):
       ```tsx
       const DocumentUploadModal = dynamic(
         () => import('./DocumentUploadModal').then((mod) => mod.DocumentUploadModal),
         { ssr: false }
       );

       // Trong JSX:
       {isUploadOpen && (
         <DocumentUploadModal
           isOpen={isUploadOpen}
           onClose={() => setIsUploadOpen(false)}
         />
       )}
       ```
       *Lợi ích:* Trình duyệt CHỈ tải file JS chunk của Modal khi người dùng thực sự click vào nút "Vào sổ / Tải lên", giảm ngay 40% - 60% dung lượng tải trang ban đầu!
  4. **Kỷ Luật Tree-shaking & Tối Ưu Import Thư Viện:**
     - Cấm import wildcard `import * as Icons from 'lucide-react'` (làm kéo toàn bộ hàng nghìn SVG icon vào bundle). Bắt buộc import đích danh: `import { FileText, CheckCircle2 } from 'lucide-react'`.
     - Với thư viện ngày giờ: Dùng các hàm mô-đun hóa của `date-fns` (`format`, `parseISO`), tuyệt đối không dùng `moment.js` cồng kềnh.
  5. **Ngưỡng Kiểm Soát Dung Lượng (Bundle Budget):**
     - First Load JS của mỗi route không được vượt quá **150 KB (gzipped)**.
