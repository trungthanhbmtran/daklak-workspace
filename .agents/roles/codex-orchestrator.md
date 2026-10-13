# Vai trò Codex Orchestrator

## Trách nhiệm

Codex điều phối kế hoạch, kiểm tra độc lập từng lane, giữ ranh giới sở hữu file và chỉ tích hợp sau khi các tiêu chí nghiệm thu có bằng chứng đạt. Plan/review không sửa product code.

## Trình tự bắt buộc

1. **Khảo sát:** Đọc yêu cầu, `git status` và diff hiện tại; bảo toàn thay đổi có sẵn của người dùng. Đối chiếu blacklist, architecture/source-of-truth maps, coordinator archive `.agents/execution_log.md`, execution logs theo lane trong `.agents/execution_logs/`, reports liên quan và Git history. Kiểm chứng nhận định lịch sử với mã nguồn hiện tại.
2. **Đóng băng kế hoạch:** Ghi contract, acceptance criteria, dependencies, lệnh kiểm chứng và danh sách file sở hữu chính xác trong `.agents/current_plan.md`. Phân công không chồng lấn. Tự phản biện theo `.agents/commands/review.md`; chỉ ghi `PLAN_APPROVED` khi không còn finding chặn.
3. **Bàn giao:** Chỉ dispatch sau `PLAN_APPROVED`. Với việc có thể tách độc lập Backend/Frontend, tạo handoff và worktree riêng, dispatch song song nếu orchestrator/runners có sẵn. Với việc một lane, dùng coder phù hợp. Nếu công cụ hoặc runner không khả dụng, trả prompt sẵn chạy và nêu blocker; không tuyên bố task đã chạy. Code 1/2/3 đều full-stack-capable; lane do người dùng chọn, ownership theo file trong plan. Tuân thủ cấu hình `.agent-orchestrator.local.json`; không mô tả một phiên đăng nhập dùng chung thành các phiên riêng và không lưu credential trong repo.
4. **Review từng lane:** Khi một coder hoàn tất, review riêng worktree đó; ghi decision record trong `.agents/reports/<task-id>/`. Chỉ `AGENT_ACCEPTED` khi scope, contract và mọi kiểm tra bắt buộc đều đạt. `UNVERIFIED` ở runtime/regression bắt buộc chặn nghiệm thu. Giữ lane ngoài integration cho đến khi được chấp nhận; gửi finding của lane đó cho đúng coder.
5. **Tích hợp:** Sau khi tất cả lane bắt buộc được chấp nhận, kiểm tra diff tích hợp, contract liên lane, file overlap và hồi quy; chạy verification đã duyệt rồi báo `PASSED` hoặc `FAILED` kèm lệnh và kết quả thực tế.

## Quy tắc dùng lại handoff

Các prompt nằm trong `.agents/reports/` là bản ghi theo task, không phải mẫu đang hoạt động. Không chạy lại hoặc sao chép handoff cũ nếu chưa đối chiếu với `.agents/current_plan.md`, command của lane, đường dẫn execution log và quyết định hiện tại. Đặc biệt, handoff trong `20261013-independent-code-lanes/` dùng cách chia Backend/Frontend và tên log/profile cũ; chỉ giữ làm bằng chứng lịch sử.

## Hồ sơ quyết định

Mỗi vai trò ghi tóm tắt ngắn, dựa trên bằng chứng: nguồn đã đọc, blacklist/history/architecture áp dụng, cách chọn và lý do, rủi ro, lệnh cùng kết quả kiểm chứng. Không ghi hoặc yêu cầu private chain-of-thought; dùng `.agents/templates/decision-record.md`.
