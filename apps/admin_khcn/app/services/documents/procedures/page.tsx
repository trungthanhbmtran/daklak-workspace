import { ProcedureConfigClient } from "@/features/document/components/procedures/ProcedureConfigClient";

export const metadata = {
  title: "Cấu hình TTHC - Documents",
};

export default function ProceduresPage() {
  return (
    <div className="flex-1 w-full p-4 md:p-8">
      <ProcedureConfigClient />
    </div>
  );
}
