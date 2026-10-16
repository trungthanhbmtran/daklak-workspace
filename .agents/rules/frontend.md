# Frontend Rules & Architecture

## 1. Công nghệ cốt lõi (Tech Stack)
- **Framework**: React / Next.js (Dự án đang sử dụng Next.js App Router hoặc Pages Router với React 18+).
- **Data Fetching & State Management**: Sử dụng **TanStack Query (React Query)** kết hợp với **Axios**.
  - `Axios`: Dùng để cấu hình base HTTP client (bao gồm interceptors để đính kèm Token, handle 401/refresh token, v.v.).
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
- **Data-Driven UI**:
  - Dựa hoàn toàn vào kết quả trả về từ Backend (permission, workflowState, allowed, denied) để render giao diện (ẩn/hiện nút bấm, điều hướng).

## 3. Đồng bộ chuẩn dữ liệu Frontend - Backend (API Response)

API Gateway có TransformInterceptor và AllExceptionsFilter; trước khi dựa vào envelope hoặc error shape, kiểm tra implementation hiện tại cùng contract của endpoint bị sửa. TransformInterceptor thường trả success/data/meta/timestamp và có thể giữ message; file/stream không được bọc như JSON, và response có cấu trúc sẵn được normalize theo logic riêng.

- Axios client trả response body qua lớp Axios; không có response interceptor toàn cục bóc envelope trong axiosInstance hiện tại. Ở API/query layer, dùng unwrapData hoặc typed helper của feature khi contract trả envelope; chỉ unwrap một lần và giữ meta nếu flow cần. Không thêm unwrap vào component một cách ad hoc và không bọc/unwarp hai lần.
- serverFetch trả JSON body cho caller xử lý theo contract; không mặc định response của serverFetch và apiClient được chuẩn hóa giống nhau.
- Thất bại HTTP thường theo error payload success=false, message, errorType, code, statusCode, timestamp từ AllExceptionsFilter. Đọc errorType/message theo contract đã xác minh; không tự phân loại lỗi nghiệp vụ bằng statusCode. Với file download, proxy hoặc endpoint đặc biệt, kiểm tra response thực tế và kiểu Axios trước khi xử lý.
- Kiểu dữ liệu trong api.types.ts là helper/contract phía client, không chứng minh mọi endpoint luôn trả cùng shape. Kiểm tra controller, interceptor, API helper và test của luồng liên quan.

Ví dụ envelope JSON thường gặp:

    {
      "success": true,
      "data": [],
      "meta": {},
      "timestamp": "..."
    }

## 4. Chuẩn hóa Quản lý State
- **Server State (Dữ liệu từ API)**: Bắt buộc dùng `React Query`. Không được lưu kết quả fetch API vào `Zustand` hay `useState`.
- **Client State (Trạng thái UI toàn cục)**: Chỉ dùng global store theo pattern đã có khi nhiều khu vực thực sự cùng sở hữu state; không thêm store mới cho state của một màn hình.
- **Local State**: Chỉ dùng `useState` hoặc `useReducer` cho các trạng thái nhỏ lẻ, cục bộ nằm gọn trong một component (như form chưa submit).

## 5. Chuẩn hóa Axios Singleton
- TUYỆT ĐỐI KHÔNG `import axios from 'axios'` và gọi `.get()` trực tiếp ở bất kỳ UI component hay file hook nào.
- Mọi lệnh gọi API **bắt buộc** phải sử dụng thông qua một `axiosInstance` được khởi tạo duy nhất (singleton) trong cấu hình dự án.
- Lý do: client hiện cài request/session interceptors; không mặc định có response interceptor unwrap envelope. API/query layer dùng helper phù hợp đúng một lần theo contract.

## 6. UI/UX & CSS Layout
### Nguyên tắc layout theo ngữ cảnh
- **Co giãn và chữ dài:** Dùng min-w-0 trên flex/grid item khi nội dung động cần co lại; chọn wrap-break-word cho văn bản thường và break-all chỉ khi chuỗi định danh không thể xuống dòng hợp lý. Với các Form Controls (nhất là Shadcn `<Select>` / `<SelectTrigger>`), BẮT BUỘC dùng `w-full min-w-0` và `[&>span]:truncate` (kèm `title` hover) trên trigger, đồng thời đặt `min-w-0` trên cột grid cha để chống lỗi vỡ layout/tràn khung chứa (tham chiếu Blacklist mục 5).
- **Rút gọn có chủ đích:** Chỉ dùng truncate/line-clamp khi giao diện thực sự cần giới hạn dòng; bảo đảm người dùng vẫn xem hoặc truy cập được nội dung đầy đủ, kể cả bằng keyboard/screen reader khi phù hợp.
- **Luồng cuộn:** Không để nội dung người dùng cần xem bị cắt hoặc mất đường cuộn. overflow-hidden, h-full, chiều cao giới hạn được phép cho canvas, chart, animation hoặc panel có bounds rõ ràng; với vùng cuộn lồng nhau, xác định parent có chiều cao và min-h-0 phù hợp rồi kiểm tra trên route thật.
- **Layout responsive:** Chọn breakpoint theo chiều rộng khả dụng của container và độ rộng tối thiểu để điều khiển nội dung; tính cả navigation/sidebar. md và lg chỉ là lựa chọn, không phải quy tắc cố định. Ưu tiên layout/grid/container query thích ứng; chọn xếp dọc, thu gọn sidebar hoặc cuộn ngang có kiểm soát khi phù hợp.
- **Toolbar và danh sách:** Nhóm input theo số lượng, độ dài nhãn và hành động thực tế; nhãn phải rõ, thao tác không đè lên nội dung. Grid 12 cột, shrink-0 và max-width là công cụ chọn lọc, không bắt buộc cho mọi component.
- **Accordion/Collapsible async:** Chọn controlled state khi cần đồng bộ danh sách mục mở với dữ liệu tải/cập nhật bất đồng bộ. defaultValue phù hợp nếu component chỉ mount sau khi có dữ liệu và trạng thái khởi tạo không cần đổi. Không ép mở tất cả nhóm trừ khi thiết kế yêu cầu; giữ lựa chọn mở/đóng của người dùng.
- **Sheet và Dialog:** Sheet thường phù hợp với form dài hoặc nội dung cần đối chiếu; Dialog phù hợp với xác nhận và tác vụ ngắn. Chọn theo luồng người dùng, thiết bị, accessibility và pattern hiện có; mọi phương án phải giữ keyboard/focus behavior đúng.
- **Chất lượng thị giác:** Bám design system và các màn hình cùng khu vực; giữ phân cấp thị giác, khoảng cách, typography và mật độ thông tin nhất quán. Kiểm tra trạng thái loading/empty/error và viewport thực tế thay vì chỉ thêm utility class theo checklist.

### Kiểm chứng trực quan và khả năng truy cập
- Với thay đổi UI, chạy route thật ở viewport nhỏ và lớn phù hợp; đối chiếu components/design system hiện có và kiểm tra tràn, chồng lấn, nội dung dài cùng trạng thái loading/empty/error liên quan.
- Kiểm tra điều khiển bằng bàn phím, focus nhìn thấy được, nhãn/tên accessible và hành vi focus của Dialog/Sheet; ưu tiên phần tử semantic thay cho click handler trên phần tử không tương tác.
- Nếu không có browser/runtime phù hợp, ghi phần kiểm chứng UI là `UNVERIFIED`; không kết luận giao diện đạt chỉ từ build hoặc lint.

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


