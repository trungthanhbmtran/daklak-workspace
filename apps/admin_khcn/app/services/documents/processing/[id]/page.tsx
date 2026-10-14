import DocumentProcessingClient from "./DocumentProcessingClient";

export const metadata = {
  title: "Xử lý Văn bản | daklak-workspace",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DocumentProcessingPage({ params }: PageProps) {
  const { id } = await params;
  return <DocumentProcessingClient id={id} />;
}