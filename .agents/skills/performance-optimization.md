---
name: performance-optimization
description: Kỹ năng bắt buộc áp dụng các thuật toán tối ưu (Expert Level) trong quá trình viết code, đặc biệt tại Gateway và các vòng lặp xử lý dữ liệu lớn.
---

# Performance Optimization Skill (Expert Level)

## Role & Mindset
Khi kích hoạt skill này, AI Agent phải hành xử như một **Principal Performance Engineer**. Mục tiêu không chỉ là "code chạy được", mà là code phải chạy **nhanh nhất, tiêu thụ ít CPU và RAM nhất có thể**. Cần đặc biệt chú ý tới cách hoạt động của V8 Engine (Node.js), Garbage Collector (GC), Event Loop, và chi phí I/O (Database/Network).

---

## 1. Tối Ưu Hóa Bộ Nhớ & Garbage Collection (Memory & GC)

### 1.1. Bắt buộc sử dụng Structural Sharing
- Thay vì luôn tạo object/array mới khi map/reduce dữ liệu, hãy kiểm tra xem giá trị có thực sự thay đổi không. Nếu không, **trả về tham chiếu gốc** (`original reference`).
- **Lý do**: Tránh sinh ra hàng vạn object "rác", tiết kiệm chu kỳ quét của GC.

### 1.2. Hạn chế Functional Programming dư thừa
- **Anti-Pattern**: Dùng chuỗi `.map().filter().map()` cho mảng > 10,000 phần tử.
- **Optimized**: Kết hợp tất cả logic lọc và biến đổi vào MỘT vòng lặp duy nhất.
```typescript
// ❌ Anti-Pattern (Sinh ra 2 mảng trung gian)
const result = data.filter(x => x.active).map(x => x.id);

// ✅ Optimized (Chỉ sinh ra 1 mảng kết quả, O(N))
const result = [];
for (let i = 0, len = data.length; i < len; i++) {
  if (data[i].active) {
    result.push(data[i].id);
  }
}
```

### 1.3. Khởi tạo mảng có kích thước định trước (Pre-allocation)
Nếu đã biết trước kích thước của mảng kết quả (ví dụ khi map dữ liệu 1-1), hãy cấp phát trước bộ nhớ.
```typescript
// ✅ Optimized (V8 không cần phải re-allocate capacity liên tục)
const result = new Array(data.length);
for (let i = 0, len = data.length; i < len; i++) {
  result[i] = transform(data[i]);
}
```

### 1.4. Tôn trọng V8 Hidden Classes (Shapes)
- V8 Engine biên dịch JS sang mã máy rất nhanh nếu cấu trúc Object không thay đổi.
- **Anti-Pattern**: Thêm/xóa (`delete`) thuộc tính động (dynamic properties) trên object. Hành động này làm hỏng Hidden Class, khiến code chạy chậm gấp hàng chục lần (de-opt).
- **Optimized**: Nếu cần xóa, hãy gán giá trị bằng `null` hoặc `undefined` thay vì gọi toán tử `delete`. Luôn khởi tạo object với cùng một thứ tự các key.

---

## 2. Tối Ưu Hóa CPU & Thuật Toán (Time Complexity)

### 2.1. O(1) Lookups (Sử dụng Map/Set thay vì Array)
Khi cần tìm kiếm, kiểm tra sự tồn tại hoặc bóc tách dữ liệu chéo (cross-reference) giữa hai danh sách, TUYỆT ĐỐI KHÔNG dùng `.find()` hay `.includes()` lồng nhau.
```typescript
// ❌ Anti-Pattern (O(N^2) - Nổ CPU nếu N lớn)
const enriched = users.map(user => {
  const role = roles.find(r => r.id === user.roleId);
  return { ...user, roleName: role.name };
});

// ✅ Optimized (O(N) - Tốc độ ánh sáng)
const roleMap = new Map();
for (let i = 0; i < roles.length; i++) {
  roleMap.set(roles[i].id, roles[i].name);
}
const enriched = new Array(users.length);
for (let i = 0; i < users.length; i++) {
  enriched[i] = { ...users[i], roleName: roleMap.get(users[i].roleId) };
}
```

### 2.2. Object.keys vs hasOwnProperty
Trong vòng lặp xử lý object, thay vì gọi `Object.prototype.hasOwnProperty.call()` tại mỗi vòng lặp, hãy dùng `Object.keys()` rồi lặp qua mảng key (cách V8 tối ưu hóa reflection tốt nhất).

### 2.3. Tránh khai báo Closure trong vòng lặp
Không khai báo function bên trong vòng lặp `for` hay `while` vì nó bắt Node.js cấp phát vùng nhớ Function mới liên tục. Hãy đưa Function ra ngoài scope.

---

## 3. Tối Ưu Hóa Tầng Cơ Sở Dữ Liệu (Prisma / SQL)

### 3.1. Select Specific Fields (Giảm Network & Memory I/O)
```typescript
// ❌ Anti-Pattern (Kéo 50 columns từ DB dù chỉ cần ID và Tên)
const users = await prisma.user.findMany();

// ✅ Optimized
const users = await prisma.user.findMany({
  select: { id: true, name: true }
});
```

### 3.2. Chống lỗi N+1 Query triệt để
Ưu tiên include/select lồng hoặc batch query khi cần dữ liệu quan hệ. Tránh một query cho mỗi item: Promise.all chỉ chạy song song, không loại bỏ N+1. Nếu từng bản ghi cần thao tác riêng, dùng transaction/concurrency có giới hạn và ghi lý do.

### 3.3. Batching & Bulk Operations
Khi cần Cập nhật / Xóa nhiều bản ghi, DÙNG MỘT LỆNH DUY NHẤT.
```typescript
// ❌ Anti-Pattern (Sinh ra 1000 lệnh query độc lập)
await Promise.all(users.map(u => prisma.user.update({ where: { id: u.id }, data: {...} })));

// ✅ Optimized (Chỉ 1 lệnh query)
await prisma.user.updateMany({
  where: { id: { in: userIds } },
  data: { status: 'INACTIVE' }
});
```
*Lưu ý: Nếu cần update dữ liệu khác nhau cho từng record, hãy cân nhắc raw SQL bulk update hoặc transaction.*

### 3.4. Cẩn trọng với Pagination trên Bảng khổng lồ
- Offset-based (`skip` / `take`) sẽ cực kỳ chậm với số trang lớn (ví dụ: `skip: 500000`) vì DB phải quét qua các bản ghi trước đó.
- Thay vào đó: Nếu hệ thống báo cáo hoặc log cần load trang lớn, hãy đề xuất dùng **Cursor-based Pagination** (với `cursor` ID) thay cho Offset.

---

## 4. Tối Ưu Hóa Concurrency & Event Loop (Asynchronous I/O)

### 4.1. Song song hóa I/O an toàn
Thay vì chờ tuần tự các truy vấn độc lập, HÃY CHẠY SONG SONG:
```typescript
// ❌ Anti-Pattern (Thời gian = T1 + T2)
const users = await prisma.user.findMany();
const total = await prisma.user.count();

// ✅ Optimized (Thời gian = Max(T1, T2))
const [users, total] = await Promise.all([
  prisma.user.findMany(),
  prisma.user.count()
]);
```

### 4.2. Giới hạn Concurrency khi gọi External API/Microservice
Khi dùng `Promise.all` cho hàng ngàn items, bạn có thể tự đánh sập Gateway hoặc gRPC Server của chính mình.
- Bắt buộc phải **chunk (chia lô)** mảng gốc ra từng phần (ví dụ: lô 100 requests) và gọi `Promise.all` từng lô.

---

## 5. Check-List Phản Biện Hiệu Suất (Self-Critique Gate)

Bất cứ Developer Agent nào khi commit đoạn code xử lý dữ liệu, phải tự trả lời 4 câu hỏi tử thần:

1. **[ ] O(N^2) Trap:** Đoạn code có vòng lặp lồng nhau hoặc dùng `.find()` / `.includes()` bên trong `.map()` không? (Nếu có -> Refactor dùng Hash Map).
2. **[ ] GC Trap:** Đoạn code có sinh ra quá nhiều Object hoặc Array trung gian bỏ đi không? (Nếu có -> Refactor lại vòng lặp truyền thống / Pre-allocate array).
3. **[ ] I/O Trap:** Có I/O lặp theo từng item không dù có dùng Promise.all? Nếu có -> Batch khi khả thi; nếu thao tác riêng là bắt buộc, giới hạn concurrency và xác minh chi phí/transaction.
4. **[ ] Memory Bloat:** Có dòng query Prisma nào thiếu mệnh đề `select` mà lại load hàng ngàn rows không? (Nếu có -> Bổ sung thuộc tính `select` ngay lập tức).
