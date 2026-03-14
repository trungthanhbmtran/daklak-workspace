// app/admin/services/documents/processing/[id]/page.tsx
import DocumentProcessingWorkspace from "@/features/document/components/DocumentProcessingWorkspace";

export default function DocumentProcessingPage({ params }: { params: { id: string } }) {
  // Thực tế: Nhận params.id (VD: '125-UBND') để gọi API lấy dữ liệu chi tiết của văn bản đó
  
  return (
    // Bọc component vào một thẻ div full chiều cao
    <div className="h-full w-full">
      {/* Trong tương lai, bạn sẽ truyền data vào đây, ví dụ: 
        <DocumentProcessingWorkspace documentData={data} /> 
      */}
      <DocumentProcessingWorkspace />
    </div>
  );
}