import OrganizationHomePage from "./OrganizationHomePage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cơ cấu tổ chức | Quản trị Hệ thống",
};

export default function OrganizationPage() {
  return <OrganizationHomePage />;
}
