import { DossierDetailClient } from "@/features/document/components/dossiers/DossierDetailClient";

export const metadata = {
  title: "Chi tiết Hồ sơ - Documents",
};

export default function DossierDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex-1 w-full p-4 md:p-8">
      <DossierDetailClient dossierId={params.id} />
    </div>
  );
}
