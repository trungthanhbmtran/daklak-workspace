# Refactor Organization Feature — Senior Frontend Architect

## 1. Phân tích ngắn gọn (điểm đã refactor)

### Kiến trúc & Clean Code
- **Bỏ `useMemo`/`useCallback`** ở `index.tsx` và hooks: context value, flatUnits — React Compiler đảm nhiệm; code declarative hơn.
- **Tách rõ API vs UI state**: `useOrganizationApi` (tree, unitTypes, domains, create/update) và `useOrganizationView` (viewState, activeTab, select/addRoot/addChild/cancel) tách biệt.
- **Staffing**: Tách thành `OrganizationStaffing/` với `hooks/useStaffingReport`, `hooks/useStaffingMutations`, `SlotCard`, `JobTitleConfigDialog`, `StaffingTable`, `index.tsx` — file dưới ~250 dòng, dễ bảo trì.

### React 19 & Hiệu năng
- Không dùng `useMemo`/`useCallback`/`React.memo` thủ công.
- Form vẫn dùng React Hook Form + Zod (zodResolver); sẵn sàng dùng `useActionState`/`useFormStatus` nếu chuyển sang Server Actions sau.

### UX/UI
- **Loading**: Cây tổ chức dùng `<Skeleton>` thay cho text "Đang tải..."; bảng định biên dùng `<Skeleton>` khi `isLoadingReport`.
- **Empty**: Sidebar có empty state "Chưa có đơn vị" + "Không tìm thấy đơn vị" khi search; bảng định biên có empty "Chưa có định biên nào".
- **Error**: Staffing có `isError` và hiển thị thông báo lỗi thân thiện.
- **Scroll**: Sidebar dùng `ScrollArea`; nội dung tab dùng `overflow-y-auto` hợp lý.

### React Query
- **Query Key Factory**: `constants/queryKeys.ts` — `organizationQueryKeys.tree()`, `staffingReport(unitId)`, `jobTitles(unitId)`, `categoryQueryKeys.unitTypes()`, `domains()`, `geoAreas()`.
- **staleTime / gcTime**: Tree & danh mục 2 phút / 10 phút; báo cáo định biên & job titles 1 phút / 5 phút.
- **Mutation**: `invalidateQueries` theo key factory; cấu hình chức danh đóng dialog trong `onSuccess` của `mutate(..., { onSuccess })`.

### Form & Validation
- **Zod**: `organizationUnitSchema` bổ sung message tiếng Việt (max length, required_error cho typeId).
- **RHF**: `zodResolver(organizationUnitSchema)` dùng nhất quán cho Form thêm đơn vị và UnitEdit.

---

## 2. Cấu trúc thư mục (sau refactor)

```
organization/
  index.tsx                    # Client shell, Skeleton loading, compound export
  context/
    OrganizationContext.tsx    # Giữ nguyên
  constants/
    queryKeys.ts               # MỚI — Factory cho organization + category keys
  hooks/
    useOrganizationApi.ts      # Refactor: query keys, staleTime/gcTime, bỏ useMemo
    useOrganizationView.ts     # MỚI — viewState + activeTab + actions
  api.ts
  types.ts
  schemas.ts                   # Bổ sung message validation tiếng Việt
  REFACTOR.md                  # Tài liệu refactor này
  components/
    OrganizationSidebar.tsx    # ScrollArea, empty + search empty state
    OrganizationForm.tsx       # Bỏ useMemo defaultValues, reset bằng useEffect
    OrganizationUnitEdit.tsx   # Bỏ useMemo, domainsToOffer declarative
    OrganizationStaffing/      # TÁCH TỪ 1 FILE LỚN
      index.tsx                # Main: form thêm định biên, bảng, dialog, error/loading
      hooks/
        useStaffingReport.ts   # Query report, jobTitles, geoAreas
        useStaffingMutations.ts# setStaffing, setStaffingSlot, updateJobTitle
      SlotCard.tsx             # Form phân công từng vị trí (phó)
      JobTitleConfigDialog.tsx # Dialog cấu hình chức danh
      StaffingTable.tsx        # Bảng + Collapsible slots
```

---

## 3. Mã nguồn đã tối ưu

Toàn bộ file đã được viết lại/cập nhật trong workspace:
- `constants/queryKeys.ts` — mới
- `hooks/useOrganizationView.ts` — mới
- `hooks/useOrganizationApi.ts` — refactor
- `schemas.ts` — bổ sung validation
- `index.tsx` — bỏ useMemo, Skeleton, dùng useOrganizationView
- `components/OrganizationSidebar.tsx` — ScrollArea, empty state
- `components/OrganizationForm.tsx` — bỏ useMemo, reset bằng useEffect
- `components/OrganizationUnitEdit.tsx` — bỏ useMemo
- `components/OrganizationStaffing/` — thư mục mới với index, hooks, SlotCard, JobTitleConfigDialog, StaffingTable

File gốc `OrganizationStaffing.tsx` (1 file ~585 dòng) đã xóa; import `./components/OrganizationStaffing` trỏ tới `OrganizationStaffing/index.tsx`.
