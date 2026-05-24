import { DocumentCabinetClient } from "@/features/document/components/cabinet/DocumentCabinetClient";

export const metadata = {
  title: "Tủ văn bản - Documents",
};

export default function CabinetPage() {
  return (
    <div className="flex-1 w-full p-4 md:p-8">
      <DocumentCabinetClient />
    </div>
  );
}
