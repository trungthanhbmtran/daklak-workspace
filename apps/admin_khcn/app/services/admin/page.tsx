import { AdminDashboardClient } from "./AdminDashboardClient";

export const metadata = {
  title: "Tổng quan Quản trị Hệ thống | DakLak Workspace",
  description: "Trung tâm điều hành tổ chức, định biên VTVL, người dùng và phân quyền PBAC",
};

export default function AdminPage() {
  return <AdminDashboardClient />;
}
