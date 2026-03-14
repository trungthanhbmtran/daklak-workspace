import DocumentPublishingPage from "@/features/document/components/DocumentPublishingPage";

export default function PublishDocumentPage({ params }: { params: { id: string } }) {
  // Lấy dữ liệu metadata của văn bản có id = params.id để tự động điền vào form đăng tải
  
  return (
    <div className="h-full w-full bg-muted/5">
      <DocumentPublishingPage />
    </div>
  );
}