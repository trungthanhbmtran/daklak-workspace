# Blacklist & Anti-Patterns (Nhật Ký Lỗi Đã Giải Quyết)

Tài liệu này lưu trữ danh sách **những lỗi vi phạm cấu trúc, anti-patterns và các sai lầm đã từng xảy ra** trong dự án. Mục đích của file này là để các AI Agent không bao giờ được phép lặp lại những lỗi tương tự.

BẤT CỨ KHI NÀO AI AGENT SỬA XONG MỘT BUG NGHIÊM TRỌNG DO HIỂU SAI KIẾN TRÚC, PHẢI GHI NHẬN VÀO ĐÂY!

---

## 1. Lỗi Gateway & Response
### ❌ Vi phạm: Gói Response thủ công ở Controller
- **Mô tả:** AI Developer tự ý return `{ success: true, data: result }` trong các Controller ở `api-gateway`.
- **Hậu quả:** Gây ra lỗi `data.data` lồng nhau và cấu trúc không chuẩn vì `TransformInterceptor` ở Gateway đã tự động làm việc này.
- **Giải pháp:** Chỉ return dữ liệu thô (raw data) nhận được từ gRPC.

### ❌ Vi phạm: Nuốt lỗi (Swallow Error) và trả về HTTP 200
- **Mô tả:** Catch lỗi tại Microservice rồi `return { status: "error", message: "xxx" }`.
- **Hậu quả:** Gateway không nhận diện được lỗi, trả về HTTP 200 thay vì 400/500, Frontend không bắt được exception.
- **Giải pháp:** Microservice phải dùng `throw new RpcException(...)`. API Gateway sẽ có ExceptionFilter ánh xạ tự động sang mã lỗi HTTP.

### ❌ Vi phạm: Trộn lẫn quyền thao tác (Actions/Permissions) hoặc phân trang vào trong ruột Data
- **Mô tả:** Nhét `actions`, `permissions`, `pagination` trực tiếp vào trong ruột của từng record `data` hoặc trả về `data: { items: [...], actions: [...] }` khiến `data` bị bọc tầng lồng nhau.
- **Hậu quả:** Gây mất đồng bộ giữa các hệ thống, Client không thể lấy `data` 1 cấp để render trực tiếp, phải chọc nhiều tầng (`data.items`, `data.data`), dễ vỡ giao diện khi thay đổi model.
- **Giải pháp:** Tuân thủ phân định nghiêm ngặt: `data` CHỈ chứa danh sách hoặc thực thể dữ liệu thuần túy để render; toàn bộ quyền thao tác (`meta.actions`, `meta.permissions`) và phân trang (`meta.pagination`) BẮT BUỘC nằm trong `meta`.

### ❌ Vi phạm: Client viết code phòng thủ chọc nhiều cấp (`res.data.data`, `data?.data`)
- **Mô tả:** Viết code phòng thủ chắp vá trong Component kiểu `res?.data?.data`, `(data as any)?.data ?? data` hay `Array.isArray(x?.data) ? x.data : ...`.
- **Hậu quả:** Dung túng cho lỗi bọc đúp envelope ở Backend, làm code UI rườm rà, dễ crash khi cấu trúc dữ liệu chuẩn hóa.
- **Giải pháp:** Tuân thủ nguyên tắc "Gọi là Render": Axios và API Gateway đã chuẩn hóa đầu vào và đầu ra, Component chỉ việc gọi hook/API và nhận data thuần để render trực tiếp (`data.map(...)`). Lược bỏ toàn bộ các bước bóc tách dữ liệu phức tạp, unwrap rườm rà hay convert cấu trúc thủ công. Lấy quyền thao tác từ `meta.actions`, lấy trạng thái ở `success`, lấy thông báo ở `message`.


---

## 2. Lỗi gRPC & Protobuf

### ❌ Vi phạm: Gán thuộc tính vào tham số payload gRPC mà không khởi tạo & Không dùng quyền để phân phối tài nguyên
- **Mô tả:** Trong các Controller gRPC (NestJS), viết `data.currentEmployeeCode = user.employeeCode` hoặc truy cập `data.prop` một cách mù quáng mà không khởi tạo `data = data || {}`, đồng thời không sử dụng quyền của User (`permissionsFlatten`) để phân phối và giới hạn tài nguyên truy cập.
- **Nguyên nhân:** Khi Client/Gateway gửi request gRPC không có payload body hoặc body rỗng (thường gặp ở các API tra cứu GET), bộ giải mã gRPC gán `data = undefined`. Dù `@CurrentUser() user` đã được chứng thực thành công từ gRPC metadata, việc gán trực tiếp thuộc tính vào `data` (đang là undefined) sẽ ném ra ngoại lệ: `TypeError: Cannot set properties of undefined (setting 'currentEmployeeCode')`. Hơn nữa, việc chỉ gán bừa biến người dùng mà không dùng quyền để xác định đúng tài nguyên mà người dùng đó được phép truy cập (theo phòng ban, địa bàn, phạm vi quản lý) là sai lệch nguyên tắc PBAC.
- **Hậu quả:** Microservice crash ngay tại Controller, văng RpcExceptionsHandler 500, ngắt kết nối gRPC và Frontend nhận lỗi timeout / internal server error dù người dùng đã đăng nhập hợp lệ; hoặc tiềm ẩn nguy cơ rò rỉ dữ liệu ngoài thẩm quyền được phân phối.
- **Giải pháp:**
  1. Bắt buộc thêm defensive initialization ở đầu mọi handler gRPC: `data = data || {};` trước khi đọc/ghi bất kỳ thuộc tính nào.
  2. Tuyệt đối không giả định `data` luôn là một object có sẵn khi nhận từ lời gọi gRPC.
  3. **Phân phối tài nguyên theo đúng quyền:** Mọi truy xuất dữ liệu phải dùng ngữ cảnh quyền từ `user` (`user.permissionsFlatten`, `user.unitId`, `user.employeeCode`) để phân phối đúng dữ liệu mà cán bộ đó được phép truy cập (ví dụ: Chuyên viên chỉ thấy việc của mình, Trưởng phòng thấy việc trong phòng ban mình quản lý, Lãnh đạo thấy toàn bộ đơn vị).

### ❌ Vi phạm: Dùng `google.protobuf.Struct` cho JSON động
- **Mô tả:** Dùng kiểu dữ liệu `Struct` trong file `.proto` để truyền tải dữ liệu phi cấu trúc (Unstructured data).
- **Hậu quả:** Code sinh ra cồng kềnh, khó parse ở các ngôn ngữ khác nhau, ảnh hưởng cực xấu đến hiệu năng.
- **Giải pháp:** Bắt buộc dùng `string` trong file `.proto` (Kết hợp `JSON.stringify` và `JSON.parse` tại Gateway/Service).

### ❌ Vi phạm: Mảng Packages gRPC xung đột (InvalidGrpcPackageException)
- **Mô tả:** Cấu hình file `main.ts` khai báo các package thừa không tồn tại trong proto, hoặc bị trùng token Injection (DI).
- **Hậu quả:** Ứng dụng Crash khi bootstrap (Vd: lỗi `ApiManagementService not found`).
- **Giải pháp:** Khai báo đúng duy nhất mảng symbol package đã định nghĩa. (Đã sửa lỗi này vào 07/10/2026).

---

## 3. Lỗi Database & Kiến trúc
### ❌ Vi phạm: Hard-code luồng duyệt (Workflow) tại Service con
- **Mô tả:** Service `hrm-service` hoặc `document-service` tự định nghĩa trạng thái duyệt (PENDING, APPROVED) và tự viết logic đổi trạng thái.
- **Hậu quả:** Vi phạm nghiêm trọng kiến trúc tập trung, làm hệ thống Workflow không theo dõi được quá trình.
- **Giải pháp:** Phải uỷ quyền (gọi RPC) sang `workflow-service`.

### ❌ Vi phạm: Quét toàn bộ cột dữ liệu (`SELECT *`)
- **Mô tả:** Viết câu lệnh `prisma.entity.findMany()` không có khối `select: {}`.
- **Hậu quả:** Gây tắc nghẽn bộ nhớ, sập RAM Node.js khi dữ liệu lớn.
- **Giải pháp:** Bắt buộc query chỉ những trường thực sự cần.

### ❌ Vi phạm: Quên cập nhật tài liệu kiến trúc khi sửa đổi hệ thống (Architecture Drift)
- **Mô tả:** Sửa đổi hoặc thêm mới bảng CSDL (Prisma), gRPC method, API route, RabbitMQ event, workflow hay routing nhưng không cập nhật các file trong `.agents/architecture/`.
- **Hậu quả:** Gây lệch pha giữa mã nguồn và kiến trúc (Architecture Drift). Các AI Agent ở các lượt làm việc tiếp theo đọc phải tài liệu cũ dẫn đến ảo giác (hallucination), duplicate model, vi phạm Source of Truth hoặc phá vỡ cấu trúc microservices.
- **Giải pháp:** Bắt buộc tuân thủ Ràng buộc số 8 và [`.agents/architecture/SYNC-GUIDELINES.md`](../architecture/SYNC-GUIDELINES.md): Rà soát `git diff --name-only`, cập nhật 100% các file kiến trúc tương ứng (`service-map.md`, `source-of-truth.md`, `dependency-map.md`, `request-response-flow.md`, `workflow-map.md`) trước khi nghiệm thu task.


---

## 4. Lỗi Logic Thuật Toán
### ❌ Vi phạm: Sử dụng toán tử OR (`||`) gộp nhiều điều kiện lỗi
- **Mô tả:** Viết `if (!checkA() || !checkB()) throw Error("Lỗi A hoặc B")`.
- **Hậu quả:** Không xác định được lỗi cụ thể, có nguy cơ evaluate dư thừa.
- **Giải pháp:** Áp dụng nguyên tắc **Fail-Fast** -> Check A, ném lỗi A. Check B, ném lỗi B.

### ❌ Vi phạm: N+1 Query trong mảng
- **Mô tả:** Lặp qua mảng users và gọi `await prisma.user.update()` trong vòng lặp.
- **Hậu quả:** Khóa Database, làm chậm toàn hệ thống.
- **Giải pháp:** Dùng `updateMany` với mệnh đề `in: [...]`.

## 5. Lỗi Giao diện UI/UX & CSS Layout (Overflow & Tràn Khung)
### ❌ Vi phạm: Form Control hoặc Select trong CSS Grid / Flexbox làm tràn khung chứa (Container Overflow)
- **Mô tả:** Trong các modal, drawer, sheet hoặc card container (điển hình như modal "Giao việc mới", phần "Tính điểm KPI & Chuẩn hóa Vị trí việc làm", trường "Hệ số độ khó (k)"), đặt `<Select>`, `<SelectTrigger>` hoặc input bên trong lưới `grid` / `flex` mà:
  1. Thẻ cha trực tiếp của cột grid hoặc flex item thiếu `min-w-0` (mặc định trong CSS Grid/Flexbox là `min-width: auto`, không thể co nhỏ hơn kích thước nội dung tối thiểu của phần tử con).
  2. `<SelectTrigger>` thiếu `w-full` và `min-w-0` (mặc định của component thư viện có thể là `w-fit` và `whitespace-nowrap`).
  3. Label của option được chọn dài (ví dụ: `k = 2.0 (Bình thường - Tiêu chuẩn)` dài ~35 ký tự), khiến Trigger nở rộng ra tới ~280px trong khi bề rộng cột chỉ khoảng ~130px - 160px.
  4. Thiếu `truncate` và `[&>span]:truncate`, khiến text tràn thủng viền nút, xé toạc layout cột và đâm xuyên qua viền khung chứa (card container/dialog).
- **Hậu quả:** Giao diện bị vỡ nát trên cả desktop lẫn thiết bị di động, phần tử đâm xuyên ra ngoài đường viền card, sinh ra thanh cuộn ngang ngoài ý muốn hoặc che khuất các nút hành động lân cận.
- **Giải pháp BẮT BUỘC:**
  1. Mọi cột con trong `grid` và mọi item trong `flex` chứa form controls/text động BẮT BUỘC phải có `min-w-0`.
  2. Mọi `<SelectTrigger>` dùng trong form BẮT BUỘC phải khai báo: `className="w-full min-w-0 ... truncate [&>span]:truncate"` và bổ sung thuộc tính `title` để hiển thị tooltip giải nghĩa khi hover.
  3. Cắt ngắn và chuẩn hóa nhãn hiển thị trong Select: Sử dụng nhãn súc tích cho trigger (ví dụ: `k = 2.0 (Tiêu chuẩn)`), đẩy phần diễn giải chi tiết vào option dropdown hoặc tooltip.
  4. Toàn bộ card / container bọc ngoài BẮT BUỘC phải có `min-w-0` (và `overflow-hidden` khi cần giới hạn đường biên).

---

## 6. Lỗi Kết Nối & Chuẩn Hóa Dữ Liệu Frontend
### ❌ Vi phạm: Dùng native fetch phân mảnh phương thức kết nối thay vì axios/apiClient
- **Mô tả:** Sử dụng `fetch()` tự do trong các components, hooks, hoặc serverFetch thay vì dùng chung instance `axios` / `apiClient` có cấu hình quản lý tập trung.
- **Hậu quả:** Gây phân mảnh kết nối, thiếu cơ chế xử lý lỗi/refresh session tập trung, khó debug và kiểm soát cookie/tokens.
- **Giải pháp:** 100% hệ thống thống nhất dùng duy nhất `axios` (`apiClient` ở frontend, instance axios ở server-side). CẤM TUYỆT ĐỐI dùng native `fetch`.

### ❌ Vi phạm: Viết hàm chuẩn hóa, unwrap rườm rà hoặc bọc lồng convert cấu trúc ở Frontend
- **Mô tả:** Tự tạo ra các hàm chuyển đổi cấu trúc phức tạp, các vòng lặp unwrap hoặc gán getter tự tham chiếu (như `Object.defineProperty(res, 'data', ...)`) ở Frontend khi API Gateway và Axios đã chuẩn hóa đầu vào và đầu ra 1 tầng.
- **Hậu quả:** Gây ra nguy cơ vòng lặp vô tận (Infinite Loop / Infinite Loading) làm đơ Main Thread của trình duyệt và code thừa thãi khó bảo trì.
- **Giải pháp:** Do API Backend và Axios Interceptor đã chuẩn hóa đầu vào và đầu ra, Frontend chỉ việc nhận đúng dữ liệu thực thể từ `data` (hoặc qua custom hook) để render trực tiếp ra giao diện (`client chỉ việc gọi và render`). Lược bỏ 100% các hàm chuẩn hóa trung gian và mã phòng thủ cũ dư thừa.

---
*(AI Agent lưu ý: Thường xuyên bổ sung các case thực tế vào file này trong quá trình làm việc)*



## 7. Lỗi Đóng Gói Bundle & Tải Dư Thừa Mã Nguồn (Bundle Bloat & Mega-Bundle Anti-Pattern)
### ❌ Vi phạm: Import tĩnh các thư viện hoặc hộp thoại nặng vào Layout/Page chính
- **Mô tả:** Sử dụng import tĩnh (`import { RichTextEditor } ...`, `import { Recharts } ...`, `import { DocumentUploadModal } ...`, `import * as LucideIcons ...`) vào đầu file của các Page hoặc Component danh sách tổng hợp khi chưa cần dùng đến.
- **Hậu quả:** Kéo hàng Megabyte JavaScript không cần thiết vào First Load JS của trang, khiến cán bộ cơ sở dùng mạng 4G bị tải trang chậm, giật lag, tốn băng thông và tăng thời gian phản hồi (TTI).
- **Giải pháp:** Tuân thủ nguyên tắc "Màn hình nào chỉ tải phần code của màn hình đó":
  1. Sử dụng `next/dynamic` với `{ ssr: false, loading: () => <Skeleton /> }` cho toàn bộ các thư viện nặng (> 30KB: Editor, Chart, Workflow Canvas, PDF Viewer).
  2. Các Modal/Sheet tạo mới hoặc chỉnh sửa phức tạp BẮT BUỘC chỉ được nạp mã nguồn khi người dùng thực sự click vào nút mở (`open && <LazyModal ... />`).
  3. Import icon đích danh từ `lucide-react`, cấm import wildcard `* as Icons`.
  4. Duy trì First Load JS budget dưới **150 KB (gzipped)** cho mỗi route.

---

## 8. Lỗi Tự Ý Hardcode Danh Mục / Master Data ở Client (Client-Side Hardcoded Master Data Anti-Pattern)
### ❌ Vi phạm: Tự khai báo mảng tĩnh hoặc fallback Master Data / Categories ở Frontend
- **Mô tả:** Tự ý khai báo các mảng hằng số (constants) hoặc fallback data tĩnh tại Client UI (ví dụ: `const DEFAULT_AI_PROVIDERS = [...]`, `const DEFAULT_TRANSLATE_SERVICES = [...]`, `const currentModels = [...]`, `const TASK_CATEGORIES = [...]`) để cấp dữ liệu cho Combobox, Select, Dropdown thay vì lấy từ Backend.
- **Hậu quả:**
  1. **Vi phạm nghiêm trọng nguyên tắc Dumb Client và Single Source of Truth:** Frontend tự biến mình thành "nguồn sự thật giả định", phá vỡ tính tập trung của hệ thống Master Data dùng chung.
  2. **Dữ liệu bị lệch pha (Data Drift) giữa Frontend và CSDL:** Khi Quản trị viên cập nhật, đổi tên, thêm mới hoặc vô hiệu hóa danh mục trong CSDL (`admin_systems.sys_categories` trong `user-service`), Frontend vẫn cố chấp hiển thị dữ liệu tĩnh cũ hoặc bị ghi đè dữ liệu sai lệch.
  3. **Nguy cơ crash và lỗi đồng bộ gRPC/REST:** Các mã code (provider code, model ID, category code) bị hardcode ở client có thể không khớp với cấu hình runtime, enum hoặc backend credentials dẫn đến lỗi 400 Bad Request / RpcException.
- **Giải pháp BẮT BUỘC:**
  1. **100% Master Data / Danh mục dùng chung phải do `user-service` quản lý tập trung** (bảng `admin_systems.sys_categories`). Các danh mục này đã được chuẩn hóa theo nhóm (`AI_PROVIDER_TYPE`, `TRANSLATION_SERVICE_TYPE`, `TASK_PRIORITY`, `DOCUMENT_SECURITY_LEVEL`, ...).
  2. **Frontend CHỈ ĐƯỢC PHÉP gọi API hook chuẩn hóa** (ví dụ: `useGetCategoryByGroup('AI_PROVIDER_TYPE')`, `useGetCategoryByGroup('TRANSLATION_SERVICE_TYPE')`, hoặc endpoint chuyên biệt như `/api/v1/admin/ai/models`).
  3. **CẤM TUYỆT ĐỐI mảng fallback tĩnh ở Client UI:** Khi chưa có dữ liệu, hiển thị Skeleton, Spinner hoặc Empty State. Không được tự ý "bịa" ra mảng fallback tĩnh ở UI. Nếu hệ thống cần danh sách giá trị mặc định khi người dùng chưa cấu hình API Key, chính Backend Service (như `ai.service.ts` trong `user-service`) là nơi cung cấp các models mặc định chuẩn.

