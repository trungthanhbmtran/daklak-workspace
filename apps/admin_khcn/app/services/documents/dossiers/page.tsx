import { DossierListClient } from "@/features/document/components/dossiers/DossierListClient";

export const metadata = {
  title: "Quản lý Hồ sơ - Documents",
};

export default function DossiersPage() {
  return (
    <div className="flex-1 w-full p-4 md:p-8">
      <DossierListClient />
    </div>
  );
}
