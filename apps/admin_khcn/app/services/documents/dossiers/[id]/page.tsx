import { DossierDetailClient } from "@/features/document/components/dossiers/DossierDetailClient";

export const metadata = {
  title: "Chi tiết Hồ sơ - Documents",
};

import { use } from "react";

export default function DossierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return (
    <div className="flex-1 w-full p-4 md:p-8">
      <DossierDetailClient dossierId={resolvedParams.id} />
    </div>
  );
}
