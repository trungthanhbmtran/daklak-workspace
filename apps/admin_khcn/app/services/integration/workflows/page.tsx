import { IntegrationClient } from '../Client';

export const metadata = {
  title: "Quy trình hệ thống | Cổng Ứng dụng Nội bộ",
};

export default function WorkflowsPage() {
  return <IntegrationClient initialView="definitions" />;
}
