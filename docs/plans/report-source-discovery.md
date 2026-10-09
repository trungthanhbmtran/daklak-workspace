# Kế hoạch sửa nguồn API và xem dữ liệu trong Report Designer

## Phạm vi

Trong cửa sổ thiết kế báo cáo, hiển thị danh mục endpoint GET từ API Manager và cho phép xem cấu trúc cùng dữ liệu mẫu thực tế trước khi chọn nguồn.

## Các bước

- [x] Xác nhận màn hình production đang báo danh sách nguồn rỗng.
- [x] Đối chiếu luồng catalog từ UI qua API Gateway tới report-service và API Manager.
- [x] Chuyển delegation token của người dùng qua luồng catalog để report-service gọi API Manager có xác thực.
- [x] Bổ sung thao tác xem mẫu endpoint, chọn đường dẫn danh sách và hiện trường cùng dữ liệu thực tế đã lọc thông tin nhạy cảm.
- [x] Cập nhật roadmap và execution log.
- [x] Chạy kiểm tra kiểu/build phù hợp cho các package bị ảnh hưởng.

## Rủi ro / kiểm soát

- API Manager yêu cầu delegation token; không bỏ guard và không dùng thông tin đăng nhập hệ thống thay cho người dùng.
- Dữ liệu xem trước phải đi qua `ReportSourceService.fetch`, giữ kiểm tra endpoint, quyền người dùng, giới hạn payload và che thông tin nhạy cảm.
- API Manager có thể không trả về endpoint cho người dùng thiếu quyền `INTEGRATION:VIEW`; giao diện cần báo rõ trạng thái thay vì giả định không có dữ liệu.
