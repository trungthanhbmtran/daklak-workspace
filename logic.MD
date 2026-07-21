# Báo cáo các chức năng tạm thời bị mất do chuyển đổi sang mô hình Dumb Client

Trong quá trình xóa bỏ logic trên Frontend để tuân thủ mô hình Dumb Client, một số tính năng lọc, xử lý dữ liệu phức tạp tại Frontend đã bị loại bỏ. Dưới đây là danh sách chi tiết các chức năng bị ảnh hưởng để đội ngũ Backend có thể bổ sung API tương ứng:

| Ngày | App | Tính năng / File | Logic đã bị xóa | Hành động cần thiết từ Backend |
|---|---|---|---|---|
| 21/07 | portal-goverment | Trang Chủ (`home-client.tsx`) | Lọc tin tức thông báo (`p.isNotification \\|\\| p.category === 'thong-bao'`), lọc tin có hình ảnh (`p.thumbnail`). | Cung cấp API GET `/posts?type=notification` và `/posts?hasThumbnail=true`. |
| 21/07 | portal-goverment | Header (`header.tsx`) | Lọc menu cha con (`m.parentId === root.id`) từ danh sách phẳng. | Trả về cấu trúc cây trực tiếp từ API `/menus/tree`. |
| 21/07 | portal-goverment | Dynamic Page (`DynamicPageRenderer.tsx`) | Lọc văn bản pháp quy (`category.slug === 'van-ban'`). Lọc danh sách Lãnh đạo theo ID. | Cung cấp API GET `/posts?category=van-ban` và `/employees?ids=...`. |
| 21/07 | portal-goverment | Văn bản (`documents-page.tsx`) | Client-side filter văn bản theo text, ngày tháng, cơ quan. | Backend phải xử lý search/filter query params (`?search=...&date=...`). |
| 21/07 | admin_khcn | Banners / Posts | Các hàm filter client-side cho categories và trạng thái. | Chuyển logic search/filter xuống Backend. |
