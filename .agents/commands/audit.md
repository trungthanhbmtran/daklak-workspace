# Command: audit — rà soát diff và ranh giới an toàn

**Owner:** Codex reviewer. Thực hiện riêng từng lane trước khi tích hợp.

## Điều kiện kích hoạt

Dùng sau khi coder báo hoàn thành và trước quyết định AGENT_ACCEPTED. Đây là bước review của coordinator, không phụ thuộc vào subagent chuyên biệt.

## Nhiệm vụ

1. Đọc kế hoạch đã duyệt, decision record của lane, diff và execution log riêng.
2. Xác nhận blacklist, source-of-truth/architecture map, history liên quan và code hiện tại đã được đối chiếu.
3. So từng file với ownership được duyệt; kiểm tra contract, service boundary, PBAC/tenant scope, migrations, gRPC metadata, UI/state/dumb-client constraints và edge cases phù hợp.
4. Đối chiếu lệnh kiểm chứng với evidence thực tế; không coi lệnh chưa chạy là đạt.
5. Viết finding theo mức độ, đường dẫn/dòng và cách sửa cụ thể. Chỉ trả finding cho coder sở hữu lane đó; không tích hợp khi chưa chấp nhận.

## Kết quả

- AGENT_ACCEPTED: scope, tiêu chí và mọi kiểm tra bắt buộc đều đạt bằng chứng.
- AGENT_REVISION_REQUIRED: còn finding chặn hoặc required runtime/regression check là UNVERIFIED.

Ghi decision record theo .agents/templates/decision-record.md và mẫu tại .agents/checklists/agent-acceptance.md. Không dùng nhãn “10/10”; verdict phải dựa trên tiêu chí và bằng chứng.
