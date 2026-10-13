# Command: test — kiểm chứng tiêu chí nghiệm thu

**Owner:** Codex reviewer theo lane; coder cung cấp bằng chứng chạy lệnh.

## Quy trình

1. Đọc acceptance criteria và verification commands trong .agents/current_plan.md; không tự đổi tiêu chí sau khi code xong.
2. Xác định package manager, scripts và cấu hình test từ manifest/lockfile thực tế của từng package bị ảnh hưởng. Không giả định repo có script hoặc framework test; không bắt buộc tiền tố rtk.
3. Chạy static checks phù hợp: typecheck, lint, build, schema/proto validation. Ghi warning mới trong phạm vi sửa như finding, kể cả khi exit code bằng 0.
4. Chạy regression/focused tests cho logic mới hoặc bug fix bằng framework đã cấu hình. Với behavior/API/UI, kiểm tra flow thực tế ở môi trường phù hợp và happy path cùng edge cases trong acceptance criteria. Không dùng production data.
5. Nếu môi trường/dependency/credential thiếu, ghi UNVERIFIED, exact command, blocker và flow chưa kiểm tra. Không suy diễn kết quả từ typecheck/build.
6. Đối chiếu kết quả với ownership và acceptance criteria; lưu lệnh, exit code và kết quả vào execution log riêng của lane cùng decision record/report.

## Kết quả

- PASSED: mọi kiểm tra bắt buộc đã chạy và đạt.
- FAILED: kiểm tra chạy được nhưng có lỗi hoặc acceptance criteria chưa đạt.
- UNVERIFIED: còn kiểm tra runtime/regression bắt buộc chưa chạy; lane chưa được AGENT_ACCEPTED.
