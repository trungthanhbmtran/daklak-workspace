# Command: implement — Code 1 / Code 2 execution

## Gate

Thực thi bám sát các bước trong prompt của người dùng hoặc task được giao. Không phân chia cứng Backend / Frontend.

## Choose a lane

- **Code 1** (`.agents/commands/code1.md`): Coder Lane 1 thực thi độc lập theo prompt (`/code1 <prompt>`).
- **Code 2** (`.agents/commands/code2.md`): Coder Lane 2 thực thi độc lập theo prompt (`/code2 <prompt>`).
- Cả hai đều là code chung, tự chủ, thực thi bất kỳ tác vụ nào (Backend, Frontend, Fullstack, Scripts) theo prompt được giao.

## Quy trình thực hiện

1. Đọc yêu cầu và xác định chính xác danh sách file liên quan.
2. Thực thi mã nguồn tuân thủ nghiêm ngặt 7 Bộ ràng buộc kỹ thuật.
3. Chạy kiểm chứng máy thực tế (`rtk tsc --noEmit` hoặc test tương ứng) và rà soát `git diff`.
4. Dọn rác 100% debug logs và ghi log.

## File and log ownership

Mỗi lane ghi nhật ký riêng:
- Code 1: `.agents/execution_logs/code1.md`
- Code 2: `.agents/execution_logs/code2.md`
