# Cấu trúc Menu Quản lý Văn bản (Document Management)

Tài liệu này mô tả cấu trúc menu và các route tương ứng trong phân hệ Quản lý Văn bản của hệ thống Admin KHCN.

## 1. Cấu trúc Menu chính

Phân hệ Quản lý Văn bản (`DOCUMENT_SERVICE`) bao gồm các chức năng chính sau:

| Tên Menu | Route | Resource Code | Mô tả |
|----------|-------|---------------|-------|
| **Bảng điều khiển** | `/` | `DOC_INCOMING` | Thống kê tổng quan tình hình văn bản |
| **Văn bản đến** | `incoming` | `DOC_INCOMING` | Quản lý sổ văn bản đến, quét OCR |
| **Văn bản đi** | `outgoing` | `DOC_OUTGOING` | Quản lý sổ văn bản đi, dự thảo |
| **Xử lý văn bản** | `processing` | `DOC_PROCESSING` | Không gian xử lý, trình ký văn bản |
| **Phát hành** | `publish` | `DOC_PUBLISH` | Cấp số, đóng dấu và phát hành văn bản |
| **Công khai** | `transparency` | `DOC_TRANSPARENCY` | Công khai văn bản lên cổng thông tin |
| **Xin ý kiến** | `consultations` | `DOC_CONSULTATION` | Lấy ý kiến góp ý cho dự thảo văn bản |
| **Biên bản cuộc họp** | `minutes` | `DOC_MINUTES` | Quản lý biên bản, nội dung họp điện tử |
| **Danh mục dùng chung** | `categories` | `DOC_CATEGORIES` | Cấu hình loại văn bản, lĩnh vực, cơ quan... |

## 2. Phân quyền (RBAC)

Các menu trên được kiểm soát bởi hệ thống Role-Based Access Control thông qua `user-service`. 
Mỗi menu yêu cầu quyền `READ` trên Resource tương ứng để hiển thị trong Sidebar.

## 3. Quy ước Route

Tất cả các route trong phân hệ này nằm dưới prefix `/services/documents/`.
Ví dụ: `https://admin.daklak.gov.vn/services/documents/incoming`
