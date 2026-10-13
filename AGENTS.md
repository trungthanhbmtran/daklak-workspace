# Repository Agent Entry Point

Tất cả quy tắc, ràng buộc kỹ thuật và quy trình thực thi của dự án được quy định tập trung tại:
👉 [.agents/AGENTS.md](.agents/AGENTS.md)

## Nguyên tắc vận hành

1. **Hiến chương kỹ thuật duy nhất:** Đọc và tuân thủ tuyệt đối [`.agents/AGENTS.md`](.agents/AGENTS.md) cùng 7 Bộ ràng buộc kỹ thuật bất biến trước và trong khi sửa mã nguồn.
2. **Hiểu rõ cấu trúc hệ thống & Chống trùng lặp chức năng:** BẮT BUỘC tra cứu bản đồ kiến trúc (`.agents/architecture/`) và Source of Truth (`.agents/rules/source-of-truth.md`) TRƯỚC KHI code. Tuyệt đối không tự ý dựng lại thực thể, model hoặc chức năng đã tồn tại ở service khác.
3. **Triệt tiêu ảo giác AI (Anti-AI Hallucination):** Không giả định (Zero Assumptions). Mọi cấu trúc dữ liệu, bảng CSDL, API endpoint, gRPC method phải được kiểm chứng bằng việc đọc file mã nguồn thực tế trong repo (`schema.prisma`, `.proto`, controllers, types). Cấm tự bịa ra code hoặc implementation giả định.
4. **Tuân thủ quy trình phát triển phần mềm nghiêm ngặt:** Triển khai qua các cửa ải kiểm soát chặt chẽ: Khảo sát thực tế -> Hoạch định bám sát 7 Bộ ràng buộc -> Thực thi chuẩn xác -> Kiểm chứng máy thực tế (`rtk tsc --noEmit` / build) -> Soi diff dòng-theo-dòng -> Dọn rác 100%.
5. **Dọn rác:** Quét sạch 100% debug logs (`console.log`, `debugger`), imports dư thừa và file tạm trước khi báo cáo hoàn thành.
