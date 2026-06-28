# 📖 Hướng Dẫn Sử Dụng & Tài Liệu Nổi Bật: Hệ Thống Quản Lý Công Việc Daklak Workspace

Chào mừng bạn đến với tài liệu Hướng dẫn sử dụng và giới thiệu các tính năng cốt lõi của **Hệ thống Quản lý Công việc & Quy trình (Daklak Workspace)**. Tài liệu này được thiết kế để giúp Quản trị viên (Admin), Quản lý (Manager) và Nhân viên (Staff) dễ dàng nắm bắt và khai thác tối đa sức mạnh của hệ thống.

---

## 🌟 1. Điểm Nổi Trội & Kiến Trúc Đột Phá (Highlights)

Hệ thống không chỉ dừng lại ở mức giao việc cơ bản mà là một **Hạ tầng chuyển đổi số toàn diện** được xây dựng trên những công nghệ và kiến trúc tối tân:

- **Kiến Trúc Microservices Linh Hoạt**: Tách biệt rõ ràng các khối nghiệp vụ (API Gateway, Workflow Service, User/HRM Service, Notification Service, v.v.), giúp hệ thống dễ dàng chịu tải, mở rộng và bảo trì mà không ảnh hưởng lẫn nhau.
- **Động Cơ Quy Trình Động (Dynamic Workflow Engine)**: Trái tim của hệ thống. Quản trị viên có thể tự cấu hình sơ đồ quy trình (Node & Edge) cho mọi loại nghiệp vụ, thiết lập điều kiện rẽ nhánh, kích hoạt tự động (Triggers), và theo vết chi tiết mọi lịch sử thao tác (Execution Logs).
- **Liên Kết Đa Đối Tượng (Cross-Entity Integration)**: Luồng quy trình có thể đính kèm linh hoạt vào bất kỳ đối tượng nào (Công việc, Văn bản, Bài viết) thông qua `businessType` thay vì bị đóng cứng vào một module duy nhất.
- **Trung Tâm Thông Báo Thời Gian Thực (Notification Hub)**: Mọi sự kiện (nhận việc mới, trễ hạn, phê duyệt) đều được đồng bộ tức thì qua Message Broker (RabbitMQ) về một Hub duy nhất, triệt tiêu tình trạng trôi việc hoặc phải F5 liên tục để cập nhật.
- **Giao Diện Siêu Mượt (Next.js & React 19)**: Tích hợp công nghệ Lazy Loading (React.lazy + Suspense) và Dynamic Import (đặc biệt cho hàng ngàn Icons) kết hợp React Query, mang đến trải nghiệm tức thì (Zero-lag), tải trang siêu nhẹ và xóa sổ hiện tượng Re-render thừa thãi.
- **Phân Quyền Chi Tiết Đến Từng Chức Danh (PBAC/RBAC)**: Tự động hiểu cấu trúc phòng ban (Giám đốc, Phó Giám đốc, Trưởng phòng, Chuyên viên) để hiển thị danh sách người được phép nhận việc và phân rõ quyền thao tác (Xem/Cập nhật/Phê duyệt).

---

## 🚀 2. Chuẩn Bị & Triển Khai Hệ Thống (Dành Cho IT / Admin)

Để hệ thống hoạt động đầy đủ dữ liệu, bạn cần chạy Docker và nạp (seed) dữ liệu khởi tạo đúng cách.

### 2.1. Khởi chạy Services
```bash
# Cập nhật image mới nhất từ Docker Hub
docker compose -f docker-compose.prod.yml pull

# Khởi chạy hệ thống ở chế độ nền
docker compose -f docker-compose.prod.yml up -d
```

### 2.2. Nạp Dữ Liệu Khởi Tạo (Seed Data)
**⚠️ Quan trọng:** Phải chạy Seed theo đúng thứ tự để tạo Sơ đồ tổ chức trước, sau đó mới đến Nhân sự và Quy trình.
```bash
# 1. Khởi tạo Cơ cấu tổ chức và Menu (Làm trước tiên)
docker exec -it daklak-workspace-user-service-1 npx prisma db seed

# 2. Khởi tạo Hồ sơ nhân sự (Để trang Nhân sự có danh sách)
docker exec -it daklak-workspace-hrm-service-1 npx prisma db seed

# 3. Khởi tạo Dữ liệu quy trình mặc định
docker exec -it daklak-workspace-workflow-service-1 npx prisma db seed

# 4. Khởi động lại Gateway để xóa Cache tổ chức trống
docker restart daklak-workspace-api-gateway-1
```
*Truy cập hệ thống: `http://<IP-SERVER>:8080` (hoặc domain/cổng đã cấu hình trong Nginx).*

---

## 🔑 3. Hệ Thống Tài Khoản Thử Nghiệm

Hệ thống được thiết kế theo 3 cấp chức danh chính. Tất cả tài khoản bên dưới có mật khẩu mặc định là: `Admin@123`

### 🔹 Luồng Lãnh Đạo (LEADER)
*Quyền hạn: Toàn quyền sinh việc, giao việc xuyên phòng ban, đánh giá và phê duyệt cuối cùng.*
- `dohuuhuy` (Chủ tịch UBND Tỉnh)
- `buithanhtoan` (Giám đốc Sở KHCN)
- `phamgiaviet` (Phó Giám đốc Sở KHCN)
- `vonguyenhoangnam` (Giám đốc Trung tâm IOC)

### 🔹 Luồng Quản Lý Cấp Phòng (MANAGER)
*Quyền hạn: Giao việc trong nội bộ phòng ban quản lý, theo dõi và nhắc việc nhân viên.*
- `nguyenvana` (Chánh Văn phòng Sở KHCN)
- `leanhtuan` (Trưởng phòng Hành chính IOC)
- `truongphongcn_ioc` / `lequangthanh` (Trưởng phòng Hạ tầng Đô thị IOC)
- `letrongvu` (Trưởng phòng Khai thác dữ liệu IOC)

### 🔹 Luồng Chuyên Viên / Nhân Viên (STAFF)
*Quyền hạn: Nhận việc, cập nhật tiến độ, thảo luận, báo cáo hoàn thành và nộp minh chứng.*
- `trungthanh` / `trantrungthanh` (Chuyên viên KHCN)
- `nguyenkieutrang` / `chautrongphat` (Hành chính / Kế toán IOC)
- `phamtheanh` / `nguyenvuhuy` (Chuyên viên IOC)

*(Tài khoản Quản trị cấp cao - Super Admin: `superadmin@sys.com` / `Admin@123`)*

---

## 💻 4. Hướng Dẫn Sử Dụng Chi Tiết (Nghiệp Vụ Chính)

### 4.1. Truy cập Bảng Điều Khiển (Dashboard)
Sau khi đăng nhập thành công, bạn sẽ được đưa đến màn hình **Trung tâm Điều hành (Hub)**. Nơi đây hiển thị các nhóm tính năng (Menu Apps) mà chức danh của bạn được phép truy cập. Nhấn vào thẻ (Card) tương ứng để vào phân hệ dịch vụ:
- Chọn **Quản lý công việc** để vào phân hệ điều hành tác nghiệp.
- Chọn **Nhân sự & Tổ chức** để quản lý hồ sơ.

### 4.2. Quản Lý Nhân Sự & Tổ Chức (HRM)
*(Dành cho Quản trị viên & Trưởng bộ phận Nhân sự)*
- Truy cập menu **Nhân sự & Tổ chức**.
- Hệ thống liệt kê toàn bộ nhân sự cơ quan. Tại đây, nhờ phân quyền sâu (PBAC), bạn có thể gán chi tiết chức vụ Nhà nước (Ngạch công chức) và chức vụ Đảng cho nhân sự.
- Hệ thống **tự động phân luồng hiển thị**: Nhân viên phòng A sẽ không thấy thông tin công việc nội bộ của phòng B (nếu không được chỉ định).

### 4.3. Quản Lý & Định Nghĩa Quy Trình (Workflow Admin)
*(Dành cho Quản trị viên Hệ thống)*
- Truy cập menu **Quy trình & Liên thông** -> **Danh sách Quy trình**.
- **Cấu hình luồng**: Quản trị viên chỉnh sửa/tạo mới quy trình làm việc dựa trên bộ khung JSON của Engine.
- **Gắn Trigger tự động**: Đặt sự kiện kích hoạt (Ví dụ: `KHI_TAO_CONG_VIEC`). Khi nhân viên lập một task mới, Workflow Engine sẽ lập tức bắt tín hiệu và đẩy Task vào luồng kiểm duyệt mà không cần thao tác thêm.

### 4.4. Nghiệp Vụ Quản Lý Công Việc (Task Management)
Module Quản lý Công việc đóng vai trò then chốt trong việc điều hành tác nghiệp hàng ngày. Quy trình xử lý được chuẩn hóa qua 4 bước chính:

#### A. Đối với Lãnh đạo Cơ quan / Ban Giám đốc (LEADER)
*Đóng vai trò là người ra quyết định, định hướng chiến lược và theo dõi vĩ mô.*
- **Bước 1: Lên Kế hoạch & Xây dựng Khung (Project/Group Setup)**: 
  - Tại giao diện chính, vào **Danh sách Dự án/Nhóm công việc** -> Bấm **[+ Tạo mới]**.
  - Đặt tên Dự án (ví dụ: Kế hoạch Chuyển đổi số 2026), gán Mô tả và gài cắm các **Workflow Template** (Quy trình chuẩn) nếu có yêu cầu phê duyệt ngân sách/pháp lý đi kèm.
- **Bước 2: Giao việc vĩ mô (Macro-assignment)**:
  - Bấm **[+ Tạo Công việc]** bên trong Dự án.
  - Chọn **Người chủ trì (Assignee)**: Gán trực tiếp cho Giám đốc Trung tâm hoặc Trưởng phòng phụ trách.
  - Điền **Deadline tổng thể**. Hệ thống mặc định tự động gán tài khoản của Lãnh đạo vào danh sách **Người theo dõi (Watchers)** để Lãnh đạo nhận mọi thông báo tiến độ nhưng không bị vướng bận việc phải tương tác trực tiếp hàng ngày.
- **Bước 3: Đánh giá & Xem Thống kê (Analytics & KPI)**:
  - Truy cập mục **Thống kê (Dashboard Analytics)** ở thanh Menu trái.
  - Dùng **Bộ lọc nâng cao (Filters)** để xem biểu đồ Tròn/Cột về: Số việc trễ hạn, Số việc đang xử lý, Số việc hoàn thành.
  - Click thẳng vào biểu đồ để truy xuất danh sách các Phòng ban/Cá nhân đang tồn đọng việc, từ đó có căn cứ đánh giá KPI cuối năm.

#### B. Đối với Quản Lý / Trưởng Phòng (MANAGER)
*Đóng vai trò là người điều phối, phân bổ nguồn lực, đốc thúc và kiểm soát chất lượng cấp cơ sở.*
- **Bước 1: Tiếp nhận & Chẻ nhỏ công việc (Sub-tasking)**:
  - Khi nhận được Task từ Lãnh đạo, Trưởng phòng mở Task ra và cuộn xuống mục **Công việc con (Sub-tasks)**.
  - Nhấn **[+ Thêm việc con]** để chẻ nhỏ yêu cầu lớn thành các đầu việc nhỏ hơn.
  - Giao các Sub-task này cho từng **Chuyên viên (STAFF)** cụ thể trong phòng ban của mình. Đặt Deadline cho nhân viên phải **sớm hơn** Deadline tổng của Lãnh đạo giao để có thời gian nghiệm thu.
- **Bước 2: Kiểm soát tiến độ (Tracking)**:
  - Theo dõi thanh **% tiến độ** của các Sub-task.
  - Dùng tính năng **Bình luận (Comments)** kèm `@Tên_nhân_viên` để nhắc nhở trực tiếp ngay trên Task. Nhân viên sẽ nhận được thông báo đẩy (Push Notification) ngay lập tức.
- **Bước 3: Nghiệm thu (Review) cấp phòng**:
  - Khi nhân viên nhấn "Báo cáo hoàn thành", Trưởng phòng sẽ nhận được thông báo.
  - Tải về và xem các **File minh chứng** (Bản thảo, báo cáo).
  - Chọn **[Đạt (Approve)]**: Hệ thống tự đóng Sub-task. Khi mọi Sub-task đều hoàn thành, Trưởng phòng bấm "Hoàn thành" cho Task tổng để báo cáo lên Lãnh đạo.
  - Chọn **[Không đạt (Reject)]**: Điền lý do vào ô comment. Hệ thống tự động đẩy trạng thái Task về lại mức **Đang xử lý**, bắt buộc nhân viên phải làm lại và báo cáo lại.

#### C. Đối với Chuyên Viên / Nhân Viên (STAFF)
*Đóng vai trò là người thực thi trực tiếp, tuân thủ deadline và sản xuất tài liệu minh chứng.*
- **Bước 1: Tiếp nhận công việc**:
  - Mọi công việc mới sẽ nổ thông báo ở **Biểu tượng Chuông (Bell)** góc phải trên cùng.
  - Hoặc nhân viên có thể vào menu **Công việc của tôi**, lọc tab **Chờ tiếp nhận** để rà soát.
  - Bấm vào tên Task để đọc kỹ **Mô tả** và rà soát **Deadline** nhằm lên lịch làm việc.
- **Bước 2: Xử lý & Cập nhật thanh tiến độ**:
  - Ngay khi bắt tay vào làm, hãy chuyển trạng thái Task từ *Chờ tiếp nhận* sang *Đang xử lý*.
  - Trong quá trình làm (vài ngày/tuần), phải liên tục cập nhật thanh `% hoàn thành` (kéo từ 0% lên 30%, 70%) và bấm **Lưu**. Việc này giúp Sếp theo dõi được nhịp độ làm việc, tránh tình trạng bị nhắc nhở.
  - Nếu cần xin ý kiến Sếp hoặc đồng nghiệp phối hợp, gõ nội dung vào ô **Thảo luận** (Comments).
- **Bước 3: Nộp minh chứng & Báo cáo hoàn thành**:
  - Khi hoàn thiện 100%, kéo xuống mục **Tài liệu đính kèm** -> Bấm **[Tải lên]** các file kết quả (Bản scan PDF, file Word, Excel). Các file này được quản lý tập trung và an toàn tuyệt đối.
  - Sau khi upload xong, kéo thanh tiến độ lên **100%** và bấm nút **[Báo cáo hoàn thành]**. 
  - Hệ thống tự động khóa (Lock) không cho chỉnh sửa nội dung Task nữa, đồng thời bắn thông báo chờ nghiệm thu về cho Sếp. Nếu Sếp từ chối, Task sẽ mở lại kèm lý do.

### 4.5. Trung Tâm Thông Báo (Notification Hub)
- Hãy để ý biểu tượng **Chuông (Bell)** ở góc phải phía trên cùng. Số hiển thị màu đỏ báo hiệu có thông báo mới (Live).
- Bấm vào Chuông để xem nhanh, hoặc chọn **Xem tất cả** để đi tới màn hình Trung tâm thông báo.
- Dù bạn đang ở module Văn bản hay module Nhân sự, mọi nhắc nhở về Công việc (Task deadline) đều chạy xuyên suốt và đồng bộ ở thanh trạng thái chung này.

### 4.6. Nghiệp Vụ Nhập & Quản Lý Văn Bản (Document Management)
Module Văn bản (`document-service`) quản lý vòng đời của một văn bản đi/đến. Hệ thống ghi nhận chi tiết lịch sử luân chuyển (`VÀO SỔ`, `PHÂN XỬ LÝ`, `TIẾP NHẬN`, `KẾT THÚC`) theo từng cấp phân quyền:

#### A. Đối với Văn thư (Clerk)
- **Vào sổ văn bản (Nhập mới)**: Nhận văn bản giấy/điện tử từ bên ngoài, tiến hành **Thêm mới**.
- Cập nhật các trường: `Số văn bản` (Số đến/đi), `Trích yếu`, `Loại văn bản` (Quyết định, Công văn...), `Độ khẩn` (Bình thường, Khẩn, Hỏa tốc), `Độ mật`.
- **Đính kèm file**: Tải file PDF bản gốc (đã scan hoặc có chữ ký số).
- **Chuyển xử lý**: Bấm nút "Phân xử lý" để chuyển văn bản trình lên cho **Lãnh đạo** cơ quan.

#### B. Đối với Lãnh đạo Cơ quan (LEADER)
- **Tiếp nhận & Bút phê**: Văn bản từ Văn thư sẽ nằm trong hộp thư "Chờ xử lý" của Lãnh đạo. Lãnh đạo xem nội dung và ghi chú chỉ đạo (bút phê).
- **Phân xử lý**: Chuyển tiếp văn bản kèm bút phê xuống cho **Trưởng phòng** (MANAGER) phụ trách lĩnh vực tương ứng. (Hoặc có thể kết hợp kích hoạt tự động một Workflow Task).

#### C. Đối với Trưởng phòng (MANAGER)
- **Tiếp nhận chỉ đạo**: Xem văn bản và bút phê của Lãnh đạo.
- **Phân việc (Chuyển xử lý)**: Chuyển thẳng văn bản cho **Chuyên viên** (STAFF) trong phòng để thực hiện giải quyết, hoặc tự phân công thành một Công việc (Task) cụ thể để theo dõi deadline.

#### D. Đối với Chuyên viên (STAFF)
- **Thực thi**: Mở văn bản được giao, đọc yêu cầu xử lý.
- Có thể dùng tính năng "Liên kết tài liệu" (`linked_document_id`) để soạn thảo một *Văn bản đi* (Dự thảo) nhằm trả lời cho *Văn bản đến* này.
- **Báo cáo & Kết thúc**: Khi hoàn thành nghiệp vụ, cập nhật trạng thái "KẾT THÚC" để đóng vòng đời luân chuyển của văn bản. Mọi thao tác đều được lưu vết minh bạch tại **Document Logs**.

### 4.7. Cấu Hình & Đánh Giá Tiêu Chí KPI (KPI Criteria Configuration)
Hệ thống tích hợp sẵn mô-đun Đánh giá Hiệu suất (KPI) chuyên sâu. Không chỉ dành cho việc chấm điểm thủ công cảm tính, hệ thống tự động bám sát lịch sử thực hiện Công việc (Task) để đưa ra con số chính xác. Quá trình cấu hình được chia làm 3 giai đoạn:

#### A. Khởi tạo & Định nghĩa Tiêu chí (Criteria & Formula Setup)
Tại menu **Quản trị Nhân sự (HRM)** -> **Danh mục Tiêu chí KPI**, Quản trị viên khởi tạo ngân hàng tiêu chí với độ chi tiết cao:
- **Tên & Trọng số (Weight)**: Ví dụ tiêu chí "Chất lượng chuyên môn" chiếm 40% (Weight = 0.4), "Tiến độ công việc" chiếm 30% (Weight = 0.3).
- **Điểm chuẩn (Base Score)**: Thang điểm mặc định đạt được khi hoàn thành 100% công việc bình thường (VD: 10 điểm).
- **Phương thức chấm điểm (Scoring Method)**:
  - `MANUAL (Thủ công)`: Điểm do người quản lý tự định đoạt dựa trên quan sát.
  - `AUTOMATIC (Tự động)`: Điểm được máy chủ tự tính toán dựa trên số lượng Task hoàn thành và các chỉ số phạt/thưởng thời gian.
- **Cấu hình Độ khó (Difficulty Multiplier)**:
  - Cho phép người giao việc dán nhãn độ khó khi giao Task: `Dễ (x0.8)`, `Bình thường (x1.0)`, `Khó / Đột xuất (x1.5)`. 
  - Điểm thực tế của Task = Base Score * Hệ số Độ khó.
- **Thuật toán Thưởng/Phạt (Bonus & Penalty Rule)**:
  - `Bonus per day`: Cộng thêm điểm khuyến khích nếu hoàn thành trước hạn. VD: Giao deadline thứ 6, hoàn thành thứ 4 -> Hoàn thành sớm 2 ngày -> Tự động cộng `2 x Bonus_Point`.
  - `Penalty per day`: Trừ điểm kỷ luật do trễ hạn. VD: Trễ 3 ngày -> Tự động trừ `3 x Penalty_Point`. Điểm này tự động bị trừ thẳng vào số điểm của Task đó.
- **Định mức theo Ngạch (Rank Quotas & Templates)**:
  - Ở khối Nhà nước, cấu hình định mức cho từng ngạch. VD: "Chuyên viên chính" phải xử lý ít nhất 20 hồ sơ/tháng, trong khi "Chuyên viên" chỉ cần 10 hồ sơ. Hệ thống dùng bảng `RankQuota` để tính tỷ lệ % đạt chuẩn của nhân viên.

#### B. Thiết Lập Kỳ Đánh giá (Evaluation Period)
- Vào mỗi cuối tháng hoặc cuối quý, HR truy cập **Kỳ Đánh Giá KPI** -> Bấm **[+ Tạo Kỳ mới]**.
- Chọn tên kỳ (VD: *Đánh giá năng lực Quý 2/2026*).
- Thiết lập **Start Date** và **End Date** để mở cổng cho nhân sự bắt đầu vào điền phiếu. Hết ngày End Date, hệ thống khóa cổng tự đánh giá (Lock Self-Score).

#### C. Quy trình Chấm điểm kép (Double-Blind Evaluation Process)
Hệ thống sử dụng cơ chế chấm điểm hai chiều (Self-Score và Reviewer-Score) đảm bảo sự minh bạch tuyệt đối:

1. **Bước 1: Tự đánh giá (Self Score) - Phía Nhân viên**: 
   - Nhân viên nhận được thông báo mở cổng KPI. Truy cập vào **Phiếu đánh giá cá nhân**.
   - Đối với các tiêu chí `AUTOMATIC`, hệ thống đã tự động điền sẵn số điểm (VD: 85/100) được tính ra từ bảng **Thống kê hoàn thành Task** trong tháng (bao gồm cả điểm đã bị trừ do làm trễ). Nhân viên không thể sửa con số này.
   - Đối với các tiêu chí `MANUAL` (Thái độ, Sáng kiến...), nhân viên tự nhập điểm đề xuất của bản thân.
   - Bắt buộc điền vào ô **Ghi chú/Giải trình (Notes)** để dẫn chứng (Ví dụ: "Tháng này em có tham gia hỗ trợ phòng Ban B xây dựng quy trình mới"). Bấm **[Gửi (Submit)]**.

2. **Bước 2: Quản lý phê duyệt (Reviewer Score) - Phía Lãnh đạo**:
   - Trưởng phòng/Lãnh đạo mở **Danh sách chờ Duyệt KPI** của nhân sự cấp dưới.
   - Màn hình sẽ hiển thị song song: **[Điểm máy tính]**, **[Điểm nhân viên tự chấm]** và ô **[Điểm Lãnh đạo chấm]**.
   - Trưởng phòng đọc giải trình của nhân viên, đối chiếu với chất lượng công việc thực tế.
   - Nhập **Điểm chính thức (Reviewer Score)** vào cột của Lãnh đạo. Hệ thống sẽ lấy điểm của Lãnh đạo làm kết quả cuối cùng để tính Tổng điểm (Total Score).
   - Nhấn **[Chốt phiếu (Approve)]**. Trạng thái phiếu KPI chuyển sang Đã hoàn thành và đổ dữ liệu về bộ phận Nhân sự để tính lương/thưởng.

---
**Troubleshooting (Xử lý sự cố nhanh):**
*Nếu bạn gặp tình trạng màn hình báo "Không có nhân viên" hoặc không thấy danh sách tổ chức, vui lòng liên hệ Admin yêu cầu kiểm tra trạng thái Container và bắt buộc phải chạy lệnh `npx prisma db seed` cho các Service theo tài liệu ở **Mục 2.2**.*
