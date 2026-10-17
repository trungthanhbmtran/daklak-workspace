# QUY CHUẨN THIẾT KẾ GIAO DIỆN & HỆ THỐNG RESPONSIVE (UI/UX DESIGN SYSTEM)
**Hệ thống Nền tảng Điều hành Tỉnh Đắk Lắk (DakLak Government Platform)**  
*Tài liệu kỹ thuật định chuẩn giao diện cho `apps/admin_khcn` và `apps/portal-goverment`*

---

## 1. MÔ TẢ KÍCH CỠ HIỂN THỊ TRÊN TỪNG MÀN HÌNH (RESPONSIVE VIEWPORT BREAKPOINTS)

Hệ thống tuân thủ nghiêm ngặt nguyên tắc **Mobile-First & Fluid Adaptive Layout**, hỗ trợ đầy đủ từ các thiết bị di động nhỏ nhất của cán bộ đi cơ sở đến màn hình trung tâm điều hành 4K.

### Bảng Phân Cấp Điểm Ngắt (Breakpoints) & Hành Vi Giao Diện

| Breakpoint | Dải độ rộng (Width) | Thiết bị mục tiêu thực tế | Quy chuẩn bố cục (Layout Behavior) | Container Max-Width & Padding |
| :--- | :--- | :--- | :--- | :--- |
| **`default` (Mobile XS / Compact)** | **`< 375px`** (320px - 360px) | Màn hình điện thoại nhỏ (iPhone SE 1st, Android cỡ nhỏ, Galaxy A01...) | • Toàn bộ bố cục xếp 1 cột dọc (`grid-cols-1`, `flex-col`).<br>• Drawer/Modal co giãn theo bề rộng màn hình (`w-[95vw]`).<br>• TabsList chuyển sang thanh trượt ngang có cuộn (`overflow-x-auto`).<br>• Bảng dữ liệu chuyển sang thẻ dọc (Card View) hoặc có thanh cuộn ngang độc lập. | `px-2 py-3` / `p-3`<br>`max-w-full` |
| **`mobile` (Mobile Standard)** | **`375px - 639px`** | iPhone 12/13/14/15, Samsung Galaxy S22/S23/S24, Xiaomi... | • Lưới form 1 cột; nút bấm full-width hoặc chia 2 nút đều nhau.<br>• Header phân hệ tinh gọn; tiêu đề tự động co rút (`truncate`).<br>• Menu điều hướng ẩn vào Mobile Drawer / Hamburger Menu. | `px-3 py-4` / `p-4`<br>`max-w-full` |
| **`sm` (Phablet / Tablet Portrait)** | **`640px - 767px`** | iPad Mini (dọc), Galaxy Tab (dọc), điện thoại màn hình gập mở rộng | • Form nhập liệu bắt đầu chia 2 cột cho các trường ngắn (Mức ưu tiên, Ngày tháng).<br>• Dialog hiển thị kích thước chuẩn `sm:max-w-[500px]` hoặc `sm:max-w-[550px]`.<br>• Các thẻ chỉ số (KPI cards) chia 2 cột (`sm:grid-cols-2`). | `px-4 py-6` / `p-5`<br>`sm:max-w-screen-sm` |
| **`md` (Tablet Landscape / Small Laptop)** | **`768px - 1023px`** | iPad 10.2"/Pro (dọc/ngang), Microsoft Surface, Laptop 11.6" | • Sidebar quản trị thu gọn (Collapsed / Icon-only) hoặc Drawer nổi.<br>• Lưới dữ liệu chia 2 đến 3 cột (`md:grid-cols-2`, `md:grid-cols-3`).<br>• Bảng dữ liệu hiển thị dạng bảng đầy đủ (Full Desktop Table) kèm thanh cuộn ngang mượt mà. | `px-6 py-6` / `p-6`<br>`md:max-w-screen-md` |
| **`lg` (Laptop Văn phòng Tiêu chuẩn)** | **`1024px - 1279px`** | Laptop 13.3" - 14" (Độ phân giải 1366x768 hoặc 1440x900 phổ biến tại các Sở/Ban/Ngành) | • Sidebar mở rộng đầy đủ (Fixed Sidebar 240px - 260px).<br>• Form chia 3 hoặc 4 cột linh hoạt.<br>• Thanh điều hướng TabsList chuyển sang dạng lưới tab cố định cân đối (`lg:grid`). | `px-6 py-8` / `p-6`<br>`lg:max-w-screen-lg` |
| **`xl` (Desktop Làm Việc Tiêu Chuẩn)** | **`1280px - 1535px`** | Màn hình Desktop văn phòng 21.5" - 24" (Full HD 1920x1080 scaling 125%/150%) | • Bố cục đa cột hoàn chỉnh; khu vực làm việc rộng rãi (`max-w-7xl mx-auto`).<br>• Khu vực Định biên VTVL chia 2 khối: Danh sách Slot và Bảng Định biên song song (`xl:flex-row`).<br>• Bộ lọc nâng cao trải rộng 4 cột (`xl:grid-cols-4`). | `px-8 py-8` / `p-8`<br>`xl:max-w-7xl` |
| **`2xl` (Màn hình Lớn / Dashboard)** | **`≥ 1536px`** | Màn hình 27" - 32" 2K/4K, Màn hình Trung tâm Điều hành IOC Tỉnh | • Lưới thẻ chia 4 đến 5 cột (`2xl:grid-cols-4`, `2xl:grid-cols-5`).<br>• Inspector/Drawer cấu hình hiển thị cố định ở cột bên phải mà không che khuất nội dung chính.<br>• Giới hạn bề rộng tối đa bằng container để tránh dàn trang quá dài khó đọc. | `px-10 py-10` / `p-8`<br>`2xl:max-w-[1600px]` |

### Quy Chuẩn Kích Thước Khung Chứa Modal / Dialog / Sheet Theo Viewport

| Loại Hộp Thoại | Kích thước trên Mobile (`< 640px`) | Kích thước trên Desktop (`≥ 640px`) | Ràng buộc bắt buộc |
| :--- | :--- | :--- | :--- |
| **Confirm Dialog (Xác nhận)** | `w-[92vw] max-w-[360px]` | `sm:max-w-[425px]` | Cấm ép chiều cao cố định; nội dung căn giữa súc tích. |
| **Form Dialog Nhỏ (Tạo nhanh, Cấu hình)** | `w-[95vw] max-w-full max-h-[90vh]` | `sm:max-w-[500px]` - `sm:max-w-[600px]` | Bắt buộc `overflow-y-auto` trên DialogContent; footer dính đáy hoặc cuộn cùng form. |
| **Form Dialog Lớn (Vào sổ văn bản, Chi tiết)** | `w-[95vw] max-h-[90vh]` | `sm:max-w-4xl` hoặc `sm:max-w-[850px]` | Đệm thích ứng: `p-4 sm:p-6 md:p-8`; các trường form tự co dãn 1 cột trên mobile. |
| **Side Sheet / Drawer (Thuộc tính, Chi tiết)** | `w-full max-w-[95vw]` | `sm:max-w-[540px]` - `lg:max-w-[650px]` | Tuyệt đối cấm dùng `w-[420px]` cứng không có `max-w-[95vw]`. Bắt buộc có nút đóng rõ ràng. |

---

## 2. QUY CHUẨN KIỂU CHỮ (TYPOGRAPHY SYSTEM & GUIDELINES)

Hệ thống sử dụng phông chữ không chân hiện đại (`font-sans`: Inter / Roboto / System UI), tối ưu hóa hiển thị bảng mã Unicode Tiếng Việt, độ tương phản đáp ứng chuẩn **WCAG 2.1 AA** cho môi trường hành chính công vụ.

### Thang Cỡ Chữ & Ánh Xạ Thành Phần (Font Scale & Component Mapping)

| Class Tailwind | Kích thước / Line-Height | Trọng số (Font Weight) | Ánh xạ thành phần áp dụng (Component Role) |
| :--- | :--- | :--- | :--- |
| **`text-[10px]`** / **`text-[11px]`** | 10px / 14px – 11px / 15px | `font-normal` hoặc `font-semibold` | • Micro text: Badge số đếm, nhãn trạng thái nhỏ (Chờ duyệt, Khẩn, Mật).<br>• Helper text dưới form control, footnote bảng biểu, timestamp dạng gọn (`10 phút trước`). |
| **`text-xs`** | 12px / 16px (`leading-relaxed` khi nhiều dòng) | `font-medium` (500) hoặc `font-semibold` (600) | • **Nhãn Form (Form Label):** `text-xs font-semibold text-slate-700 dark:text-slate-300`.<br>• **Tiêu đề Bảng (Table Header Th):** `text-xs font-semibold uppercase tracking-wider text-slate-500`.<br>• Nút bấm phụ (Button `size="sm"`), thẻ Badge thông dụng, Breadcrumb items. |
| **`text-sm`** | 14px / 20px | `font-normal` (400) hoặc `font-medium` (500) | • **CỠ CHỮ CỐT LÕI CỦA TOÀN BỘ HỆ THỐNG:** Dùng cho toàn bộ Body Text, Input Text, Select value, Dropdown menu item, Nội dung ô bảng (Table Cell Td).<br>• Mang lại mật độ thông tin tối ưu, chuẩn xác cho các văn bản hành chính công vụ. |
| **`text-base`** | 16px / 24px | `font-semibold` (600) | • Tiêu đề Card con, tiêu đề khối chức năng trong trang chi tiết, đoạn văn trích yếu văn bản quan trọng. |
| **`text-lg`** | 18px / 28px | `font-bold` (700) | • Tiêu đề Modal/Dialog (`DialogTitle`), tiêu đề Drawer, Heading cấp mục (`h3`). |
| **`text-xl`** | 20px / 28px | `font-bold` (700) | • Tiêu đề khối lớn, Page Subheading, Thống kê số liệu lớn trong Card Dashboard. |
| **`text-2xl`** | 24px / 32px | `font-bold` (700) / `font-extrabold` (800) | • **Tiêu đề Trang chính (`h2` tại Service Header):** `text-xl md:text-2xl font-bold tracking-tight text-slate-900`. |
| **`text-3xl`** | 30px / 36px | `font-extrabold` (800) | • Banner Cổng Dân Cư, Chỉ số điều hành cấp tỉnh tại Dashboard IOC. |

### Màu Sắc Chữ & Độ Tương Phản (Text Colors)

- **Văn bản chính (Primary Text):** `text-slate-900` (Light mode) / `text-slate-100` hoặc `text-foreground` (Dark mode) – Độ tương phản > 7:1.
- **Văn bản thứ cấp / Chú thích (Secondary Text):** `text-slate-600` hoặc `text-slate-500` (Light) / `text-slate-400` hoặc `text-muted-foreground` (Dark) – Độ tương phản > 4.5:1.
- **Văn bản bị vô hiệu / Gợi ý (Disabled / Placeholder):** `text-slate-400` / `text-slate-500`.
- **Màu ngữ nghĩa hành chính (Semantic Status Colors):**
  - **Khẩn cấp / Hỏa tốc / Lỗi:** `text-rose-600 dark:text-rose-400`, nền `bg-rose-50 border-rose-200`.
  - **Cảnh báo / Chờ duyệt:** `text-amber-600 dark:text-amber-400`, nền `bg-amber-50 border-amber-200`.
  - **Thành công / Hoàn thành / Hợp lệ:** `text-emerald-700 dark:text-emerald-400`, nền `bg-emerald-50 border-emerald-200`.
  - **Thông tin / Đang xử lý / Chỉ đạo:** `text-blue-700 dark:text-blue-400`, nền `bg-blue-50 border-blue-200`.

### Quy Tắc Ngắt Dòng & Giới Hạn Ký Tự (Text Wrapping & Truncation)

1. **Chuỗi văn bản thông thường:** Sử dụng `break-words` hoặc `wrap-break-word` để ngắt dòng tự nhiên theo từ ngữ tiếng Việt.
2. **Chuỗi định danh kỹ thuật (UUID, gRPC Token, Mã văn bản dài không khoảng trắng):** Chỉ sử dụng `break-all` khi chuỗi không có dấu cách và có nguy cơ tràn khung ngang.
3. **Giới hạn số dòng hiển thị:**
   - Trích yếu văn bản trên danh sách: Sử dụng `line-clamp-2` kèm thuộc tính `title` để hiển thị đầy đủ khi hover chuột.
   - Tiêu đề công việc/nhiệm vụ: Sử dụng `line-clamp-1` hoặc `truncate`.
4. **Form Controls (Select, Input, Badges):**
   - **BẮT BUỘC 100%:** Mọi `<SelectTrigger>` phải có `w-full min-w-0 truncate [&>span]:truncate`. Thẻ cha chứa nó trong CSS Grid/Flexbox bắt buộc phải có `min-w-0`.

---

## 3. QUY CHUẨN DANH SÁCH (LISTS), BẢNG BIỂU (TABLES) & THẺ (CARDS)

### A. Quy Chuẩn Danh Sách (List Components)

Danh sách được áp dụng cho danh mục công việc, luồng xử lý văn bản, lịch sử kiểm toán (audit log) và các menu phân cấp.

```tsx
// Cấu trúc chuẩn của một Danh sách chuyên nghiệp
<div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden">
  {items.map((item) => (
    <div 
      key={item.id}
      className="flex items-center justify-between p-3.5 sm:p-4 gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors min-w-0"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="size-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <FileText className="size-4" />
        </div>
        <div className="space-y-0.5 min-w-0">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{item.title}</p>
          <p className="text-xs text-slate-500 truncate">{item.subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge variant="outline" className="text-xs">{item.status}</Badge>
      </div>
    </div>
  ))}
</div>
```

- **Khoảng đệm hàng (Padding):**
  - Danh sách dạng gọn (Compact / Drawer): `py-2.5 px-3` hoặc `p-3`.
  - Danh sách tiêu chuẩn (Standard Page): `py-3.5 px-4` hoặc `p-4`.
- **Hiệu ứng tương tác:** `hover:bg-slate-50/80 dark:hover:bg-slate-900/50 cursor-pointer transition-colors`.
- **Trạng thái rỗng (Empty State):** Bắt buộc gồm:
  1. Icon biểu tượng (36px - 44px, màu xám nhạt `text-slate-400`).
  2. Tiêu đề rỗng: `text-sm font-semibold text-slate-700 dark:text-slate-300`.
  3. Mô tả phụ: `text-xs text-slate-500 max-w-sm text-center`.
  4. Nút hành động kêu gọi (CTA Button nếu có quyền tạo mới): `Button size="sm"`.

---

### B. Quy Chuẩn Bảng Dữ Liệu (Data Tables & Responsive Tables)

Bảng dữ liệu là xương sống quản trị hành chính (Văn bản, Cán bộ, VTVL, Quyết định, Báo cáo tài chính).

#### 1. Quy tắc hiển thị theo thiết bị (Adaptive Dual-Mode)
- **Trên Desktop (`≥ 1024px`):** Hiển thị dạng bảng lưới đầy đủ (`<Table>`), cố định Header hoặc cuộn ngang với độ rộng tối thiểu cho từng cột.
- **Trên Mobile & Tablet nhỏ (`< 1024px`):**
  - **Tùy chọn A (Ưu tiên):** Chuyển sang dạng danh sách thẻ thu gọn (`MobileCardView`) hiển thị các trường cốt yếu (Mã, Trích yếu, Người ký, Trạng thái) kèm nút bấm mở Modal chi tiết.
  - **Tùy chọn B:** Giữ nguyên bảng nhưng bọc trong container `overflow-x-auto w-full` có bóng mờ cuộn (Scroll shadow).

#### 2. Quy tắc canh lề (Text Alignment) và Bề rộng cột
- **Canh trái (`text-left`):** Áp dụng cho các cột dữ liệu văn bản dài (Trích yếu, Họ tên cán bộ, Phòng ban, Tên quy trình).
- **Canh giữa (`text-center`):** Áp dụng cho Số thứ tự (STT), Mã văn bản, Mã cán bộ, Trạng thái Badge, Ngày ban hành / Deadline.
- **Canh phải (`text-right`):** Áp dụng cho Số tiền ngân sách, Điểm số KPI, Số lượng, Cột Nút bấm hành động (Actions).
- **Quy tắc độ rộng & Co rút:**
  - Cột STT: `w-12 text-center whitespace-nowrap shrink-0`.
  - Cột Trạng thái / Badge: `w-28 text-center whitespace-nowrap shrink-0`.
  - Cột Hành động (Thao tác): `w-24 text-right whitespace-nowrap shrink-0`.
  - Cột Nội dung / Trích yếu: `min-w-[200px] whitespace-normal break-words` (TUYỆT ĐỐI không dùng `whitespace-nowrap` làm kéo dãn bảng hàng nghìn pixel).

```tsx
// Cấu trúc Table chuẩn hoá
<div className="w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
  <Table className="w-full text-sm">
    <TableHeader className="bg-slate-50/80 dark:bg-slate-900/80">
      <TableRow className="border-b border-slate-200 dark:border-slate-800">
        <TableHead className="w-12 text-center text-xs font-semibold uppercase text-slate-500 py-3">STT</TableHead>
        <TableHead className="min-w-[140px] text-xs font-semibold uppercase text-slate-500 py-3">Mã văn bản</TableHead>
        <TableHead className="min-w-[280px] text-xs font-semibold uppercase text-slate-500 py-3">Trích yếu nội dung</TableHead>
        <TableHead className="w-32 text-center text-xs font-semibold uppercase text-slate-500 py-3">Trạng thái</TableHead>
        <TableHead className="w-24 text-right text-xs font-semibold uppercase text-slate-500 py-3">Thao tác</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
      {/* TableRow items */}
    </TableBody>
  </Table>
</div>
```

---

### C. Quy Chuẩn Lưới Thẻ Dữ Liệu (Card Grids & KPI Blocks)

Lưới thẻ dùng cho Dashboard, Danh sách phân hệ, Danh mục vị trí việc làm và Thẻ thống kê.

#### Bảng Quy Chuẩn Lưới Cột Theo Thiết Bị
- **Mobile (`< 640px`):** `grid-cols-1 gap-3`.
- **Tablet / Phablet (`640px - 1023px`):** `sm:grid-cols-2 gap-4`.
- **Desktop văn phòng (`1024px - 1535px`):** `lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6`.
- **Màn hình lớn / IOC (`≥ 1536px`):** `2xl:grid-cols-4` hoặc `2xl:grid-cols-5 gap-6`.

#### Cấu Trúc Thẻ Chuẩn (Standard Card Structure)
```tsx
<Card className="rounded-xl sm:rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xs hover:shadow-md transition-shadow p-4 sm:p-6 min-w-0">
  <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800 min-w-0">
    <div className="flex items-center gap-2 min-w-0">
      <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 shrink-0">
        <Target className="size-4.5" />
      </div>
      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">Vị trí Việc làm</h4>
    </div>
    <Badge variant="outline" className="text-xs shrink-0">Định biên</Badge>
  </div>
  <div className="pt-3 space-y-2 min-w-0">
    {/* Body content */}
  </div>
</Card>
```

---

## 4. QUY CHUẨN ĐIỀU HƯỚNG TABS & FORM CONTROLS

### A. Thanh Điều Hướng Tabs (TabsList)
- **Quy tắc Vàng:** TUYỆT ĐỐI không ép cứng `grid-cols-N` cho `<TabsList>` nếu các tab có nhãn tiếng Việt dài.
- **Giải pháp Chuẩn:**
  ```tsx
  <div className="w-full overflow-x-auto no-scrollbar pb-1">
    <TabsList className="flex w-max min-w-full sm:grid sm:grid-cols-4 bg-slate-100/80 dark:bg-slate-900/80 p-1 rounded-xl">
      <TabsTrigger value="tab1" className="whitespace-nowrap shrink-0 text-xs sm:text-sm">Tab 1</TabsTrigger>
      {/* Other tabs */}
    </TabsList>
  </div>
  ```

### B. Form Controls & Hộp Chọn (SelectTrigger)
- **Chiều cao tiêu chuẩn:**
  - Ô nhập liệu compact (trong bảng, drawer phụ): `h-8` hoặc `h-9` với `text-xs`.
  - Ô nhập liệu tiêu chuẩn (form chính): `h-10` với `text-sm`.
- **Ràng buộc chống vỡ giao diện (Blacklist #5):**
  - Mọi `<SelectTrigger>` bắt buộc có: `className="w-full min-w-0 truncate [&>span]:truncate"`.
  - Thẻ cha trực tiếp trong flexbox hoặc grid bắt buộc phải có class `min-w-0`.

---

## 5. BỘ CHECKLIST KIỂM THỬ TRỰC QUAN TRƯỚC KHI BÀN GIAO (VISUAL QA CHECKLIST)

Mọi Coder Agent (Code 1, Code 2, Code 3) trước khi đóng task bắt buộc phải kiểm chứng giao diện qua 5 câu hỏi:
1. [ ] **Mobile 360px:** Khi co màn hình về chiều rộng 360px, trang có sinh thanh cuộn ngang toàn trang (Horizontal Page Scroll Trap) không?
2. [ ] **Chữ dài tiếng Việt:** Khi nhập một tên đơn vị dài (ví dụ: *"Sở Khoa học và Công nghệ Tỉnh Đắk Lắk"*), chữ có được ngắt dòng mượt mà hoặc cắt gọn bằng `truncate` kèm tooltip không? Có đè vỡ nút bấm hay đâm xuyên viền card không?
3. [ ] **Modal & Drawer:** Mở tất cả Modal và Sheet trên mobile; nút đóng (`X`) và nút thao tác lưu (`Lưu / Hủy`) có luôn nằm trong tầm nhìn của người dùng không?
4. [ ] **Tabs:** Trên màn hình hẹp, tất cả các Tab có thể click/chạm vào được không? Chữ trong tab có bị bẻ gãy bung khỏi khung nền bo góc không?
5. [ ] **Bảng biểu:** Bảng dữ liệu có thể cuộn ngang mượt mà mà không làm xô lệch các thành phần khác trên trang không?


---

## 6. TỐI ƯU HÓA TẢI MÃ NGUỒN GIAO DIỆN & TÁCH RỜI BUNDLE (ROUTE CODE-SPLITTING & DYNAMIC IMPORTS)

Để đảm bảo hiệu năng tải trang nhanh, mượt mà trên cả thiết bị di động kết nối 4G ở vùng sâu vùng xa, hệ thống áp dụng nguyên tắc **"Màn hình nào chỉ tải phần code của màn hình đó"**.

### A. Tách Rời Thư Viện Nặng Bằng `next/dynamic`
Tuyệt đối không đóng gói (bundle) sẵn các thư viện nặng vào gói tải ban đầu nếu màn hình đó chỉ là danh sách tổng hợp. Bắt buộc dùng Dynamic Import có fallback Skeleton:

```tsx
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// 1. Trình soạn thảo văn bản Rich Text (Lexical / TipTap / TinyMCE)
const RichTextEditor = dynamic(() => import('@/components/shared/editor/RichTextEditor'), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full rounded-xl" />
});

// 2. Biểu đồ Dashboard & Thống kê (Recharts / ApexCharts)
const AnalyticsChart = dynamic(() => import('@/features/reports/components/AnalyticsChart'), {
  ssr: false,
  loading: () => <Skeleton className="h-72 w-full rounded-xl" />
});

// 3. Trình vẽ sơ đồ & Thiết kế quy trình (ReactFlow / Workflow Canvas)
const WorkflowCanvas = dynamic(() => import('@/features/workflow/components/WorkflowCanvas'), {
  ssr: false,
  loading: () => <Skeleton className="h-[500px] w-full rounded-xl" />
});
```

### B. Tải Hộp Thoại (Modal / Drawer / Sheet) Theo Tương Tác Người Dùng (Deferred Interaction Loading)
Không import tĩnh các Modal tạo mới / sửa đổi phức tạp vào đầu trang danh sách. Chỉ tải gói mã nguồn của Modal khi người dùng thực sự click vào nút mở:

```tsx
// Khai báo Lazy Modal ở ngoài component
const TaskCreateDialog = dynamic(
  () => import('@/features/hrm/components/tasks/create-task-dialog').then(mod => mod.CreateTaskDialog),
  { ssr: false }
);

// Trong Component Client:
const [isOpen, setIsOpen] = useState(false);

return (
  <>
    <Button onClick={() => setIsOpen(true)}>+ Giao việc mới</Button>
    {isOpen && (
      <TaskCreateDialog
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    )}
  </>
);
```
*Lợi ích:* Giảm ngay từ 200KB - 500KB JavaScript tải lần đầu của trang danh sách, chỉ khi người dùng click "+ Giao việc mới" thì trình duyệt mới tải file JS chunk của hộp thoại về thực thi.
