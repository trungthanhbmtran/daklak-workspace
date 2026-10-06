# Đặc tả tái cấu trúc quản lý API

Ngày: 06/10/2026. Trạng thái: đề xuất cho triển khai; không có task thực thi hoàn thành.

## Mục tiêu và người dùng

Người quản trị được cấp policy quản lý kết nối, endpoint, xác thực, phạm vi đơn vị và cấu hình có hiệu lực. Người được cấp quyền sử dụng chỉ xem/gọi nguồn thuộc scope. Người kiểm tra vận hành/audit có quyền riêng. Hệ thống đối tác là service principal riêng nếu phạm vi inbound được xác nhận.

Yêu cầu của người dùng cho phép xây lại phần chưa đạt chuẩn ở cả backend và giao diện. Không yêu cầu triển khai ngay trong lượt lập kế hoạch.

## Các user story

### US-01 — Quản lý kết nối và endpoint (P1)

Người được cấp quyền tạo kết nối nháp, thêm endpoint có method/path/schema, kiểm tra cấu hình, xuất bản hoặc tắt; xem phiên bản hiệu lực và phụ thuộc.

- Mã kết nối ổn định khi đổi tên; type mạng và protocol tách nhau.
- Endpoint được lưu riêng; GET /a và POST /b không cấp POST /a.
- List có phân trang server và filter theo đơn vị/quyền.
- Update đồng thời phải có conflict rõ ràng, không ghi đè âm thầm.

### US-02 — Nhập tài liệu API (P1)

Người quản trị nhập file/text, xem operation chuẩn hóa và diff, chọn overwrite/skip rồi commit nháp.

- Hỗ trợ phiên bản OpenAPI/Swagger/Postman/cURL được công bố và có fixture.
- Không chạy script/cURL shell, không tự fetch remote reference.
- Preview đích cũ không được ghi đè phiên bản mới hơn; retry commit không tạo trùng.
- Lỗi parse/commit giữ dữ liệu form, trả lỗi đúng; success chỉ khi transaction thành công.

### US-03 — Cấu hình xác thực và thử gọi (P1)

Người có quyền test chọn endpoint đã đăng ký, nhập params/body hợp lệ, xem status, thời gian và response đã giới hạn/che dữ liệu.

- Secret không nạp về browser hoặc SSR cache; credential reference có scope.
- Test OAuth không nhận URL tùy ý và không trả token.
- Partner 401/403 không đổi trạng thái phiên Hub.
- Write test thể hiện tác động; timeout được mô tả là chưa xác định kết quả; không retry mù.
- Auth kind không hỗ trợ không được publish giả thành công.

### US-04 — Danh mục API nội bộ và PBAC (P1)

Người quản trị xem route manifest, resource/action, scope và public marker; tìm khai báo thiếu hoặc không thống nhất.

- Backend enforce REST/gRPC/proxy/report; frontend capabilities chỉ là UX.
- Không biến API thành public hay bỏ guard bằng sửa metadata.
- Không còn `/roles/endpoints` và ma trận quyền giả như nguồn authority của module.

### US-05 — Đồng bộ và vận hành (P1)

Người vận hành xem revision desired/active ở các gateway, lỗi đồng bộ/quota/breaker, lịch sử thay đổi và dependency.

- Publish thay đổi tăng revision bền vững; không bỏ sót update version thấp.
- Event mất có polling phục hồi; duplicate/out-of-order không đổi ngược trạng thái.
- Disable/revoke áp dụng theo SLA được chốt; snapshot stale không mở lại quyền.
- Audit cùng transaction với mutation, không lộ credential/token.

### US-06 — Khóa truy cập đối tác (P2, gate G-02)

Khi inbound được xác nhận, quản trị cấp/rotate/revoke key cho đối tác trên endpoint/scope/quota được duyệt.

- Key chỉ trả một lần khi cấp; lưu hash và metadata; không có GET secret.
- Hết hạn/thu hồi được enforce ở runtime; principal đối tác không giả làm user.
- Nếu chưa chốt, UI mô tả chưa khả dụng, không tiếp tục hứa chức năng CRUD chưa có.

## Ràng buộc

Không mở rộng quyền hoặc đoán owner trong migration; không xóa dữ liệu/schema trước inventory. Danh tính actor đến từ biên xác thực hiện có. Một service sở hữu DB cấu hình. Tương thích nguồn báo cáo và URL/menu cũ phải được kiểm chứng trước retire.

Các giới hạn tải/SLO/retention/disable SLA và quyết định inbound/secret backend nằm tại G-01..G-05 của kế hoạch chính. Chỉ gate phụ thuộc mới chặn bước tương ứng; không tự đặt production values.

## Nghiệm thu

Áp dụng FR-01..FR-11 và AC-01..AC-14 trong [kế hoạch chính](plan.md), cùng [quickstart.md](quickstart.md). Không dùng việc tồn tại component/schema làm bằng chứng nghiệm thu.
