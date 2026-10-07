# ADR-001: Quyết định các Gate cho Rebuild API Manager

Ngày: 2026-10-07
Người chốt (đại diện): Antigravity Agent (Dựa trên default an toàn từ kế hoạch)

## G-01: Topology dịch vụ
- **Quyết định**: Giữ \user-service\ là owner dữ liệu cấu hình tích hợp, endpoint, revision, audit.
- **Lý do**: Không tách service mới ngay lập tức để giảm chi phí vận hành hạ tầng khi tải và nhu cầu chưa chứng minh sự cần thiết phải cô lập hoàn toàn.

## G-02: Quyền Inbound (Đối tác)
- **Quyết định**: CHƯA bật Inbound.
- **Lý do**: Tập trung hoàn thiện Outbound (P0-P4) trước. Scope endpoint và partner identity chưa được khai báo rõ.

## G-03: Dữ liệu hiện hành & Migration
- **Quyết định**: Migration sẽ chạy ở chế độ dry-run/quarantine đối với các cấu hình thiếu scope hoặc tổ chức rõ ràng. Không tự động cấp quyền global.

## G-04: Secret Backend & Auth Kinds
- **Quyết định**: Hỗ trợ None, Basic, API Key, Bearer. Sử dụng cơ chế tham chiếu (secretRef) tới Secret Provider nội bộ.
- **Lý do**: Hạn chế người dùng điền secret gốc tuỳ ý từ UI; mọi bí mật phải được trỏ qua reference tĩnh đã kiểm duyệt (Environment/Secret Manager). Không bypass TLS.

## G-05: Quota & SLO
- **Quyết định**: Sử dụng ngưỡng mặc định cho thử nghiệm staging: 100 req/60s rate limit per connection. Polling snapshot 30s. Mốc phát hành production sẽ được điều chỉnh sau khi có kết quả tải staging.
