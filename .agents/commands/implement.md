# Command: implement — Code 1 / Code 2 / Code 3 execution

## Gate

Thực thi theo prompt của người dùng hoặc task được giao. Các lane có cùng năng lực; ownership Backend / Frontend được giao theo kế hoạch đã duyệt.

## Choose a lane

- **Code 1** (`.agents/commands/code1.md`): lane full-stack độc lập (`/code1 <prompt>`).
- **Code 2** (`.agents/commands/code2.md`): lane full-stack độc lập (`/code2 <prompt>`).
- **Code 3** (`.agents/commands/code3.md`): lane full-stack độc lập (`/code3 <prompt>`).
- Người dùng chọn lane cho tác vụ đơn; coordinator phân công lane theo ownership khi kế hoạch tách Backend / Frontend. Mỗi lane chỉ sửa file được giao, tuân thủ cùng charter và giữ execution log riêng.

## Quy trình thực hiện

1. Đọc yêu cầu, khảo sát kiến trúc và xác định danh sách file sở hữu chính xác.
2. Lập kế hoạch, kiểm tra blacklist/history và chờ `PLAN_APPROVED` theo quy trình repository.
3. Thực thi đúng phạm vi và tuân thủ 7 Bộ ràng buộc kỹ thuật.
4. Chạy kiểm chứng máy thực tế phù hợp, soi diff, dọn debug/file tạm và báo cáo kết quả.
5. Ghi execution log riêng của lane đã chạy.

## File and log ownership

- Code 1: `.agents/execution_logs/code1.md`; report `.agents/reports/<task-id>/code1.md`.
- Code 2: `.agents/execution_logs/code2.md`; report `.agents/reports/<task-id>/code2.md`.
- Code 3: `.agents/execution_logs/code3.md`; report `.agents/reports/<task-id>/code3.md`.
- Không lane nào ghi sang log lane khác hoặc shared coordinator archive.
