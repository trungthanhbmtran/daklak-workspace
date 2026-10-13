# Testing Rules

- Mọi logic nghiệp vụ mới hoặc bug fix phải có focused regression test cho acceptance behavior và edge cases phù hợp.
- Dùng test framework và scripts đã cấu hình trong package bị ảnh hưởng; kiểm tra `package.json` và config trước khi chạy. Không mặc định mọi package đều dùng Jest.
- Chạy focused tests trước, rồi chạy bộ test liên quan rộng hơn khi cần. Không bỏ qua test fail, tắt assertion hoặc mock phần logic đang cần kiểm chứng để ép pass.
- Với thay đổi API, kiểm tra contract request/response, lỗi và mapping giữa các service/client liên quan.
- Với UI có tương tác, dùng component/E2E test nếu package đã có công cụ; nếu chưa có, chạy runtime smoke an toàn trên route thật và ghi rõ phần chưa có regression test tự động.
- Với thay đổi Prisma/schema, chạy validate/generate phù hợp và kiểm tra migration trên database test cô lập; không dùng production data.
- Chỉ dùng dữ liệu/credential dành cho test. Không chạy destructive operation trên dữ liệu thật.
- Ghi chính xác lệnh và kết quả. Nếu không chạy được vì thiếu môi trường/dependency/credential, ghi `UNVERIFIED`, blocker và phạm vi chưa kiểm chứng; không báo pass.
- `UNVERIFIED` ở kiểm tra bắt buộc trong acceptance criteria là blocker nghiệm thu: không gắn `AGENT_ACCEPTED`/`PASSED` và không tích hợp lane đó cho đến khi có bằng chứng pass hoặc tiêu chí được coordinator sửa và phê duyệt trước khi tích hợp.
- Nếu package chưa có test framework/script cho regression test bắt buộc, đưa việc bổ sung test harness tối thiểu và test cho hành vi được sửa vào phạm vi; nếu không thể thực hiện an toàn, để trạng thái chưa nghiệm thu và nêu blocker cụ thể.
