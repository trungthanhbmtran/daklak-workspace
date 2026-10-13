# RTK Usage Rules - Optional Command Output Filter

RTK có thể rút gọn output lệnh khi công cụ đã cài trong môi trường chạy. Kiểm tra hook hiện tại trước khi dựa vào tự động rewrite: file .agents/plugins/rtk/hooks.json tồn tại nhưng rtk-rewrite đang disabled. Vì vậy không giả định command đã được tự đổi qua RTK.

## Cách dùng an toàn

- Dùng RTK tùy chọn cho git, typecheck, lint, test, Prisma hoặc build nếu command có sẵn và output vẫn giữ warnings, errors, exit status cùng test summary cần cho quyết định.
- Nếu output tóm tắt không cho biết warning mới, test totals hoặc mã thoát, chạy lại command gốc để lấy bằng chứng đầy đủ.
- Không dùng bộ lọc khiến lint warning bị ẩn hoặc chỉ cho biết test fail mà mất thông tin tổng số/exit code.
- Nếu terminal báo không tìm thấy rtk, chạy command gốc khi môi trường và kế hoạch cho phép; ghi đúng command thực tế đã chạy.
- Không bật hoặc thay đổi hook trong task thông thường. Hook/account/runtime configuration là cấu hình riêng; chỉ báo trạng thái nếu nó ảnh hưởng verification.

