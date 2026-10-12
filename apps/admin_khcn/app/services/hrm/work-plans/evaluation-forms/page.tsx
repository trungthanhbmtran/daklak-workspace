import { EvaluationFormsClient } from '@/features/hrm/components/work-plans/evaluation-forms/EvaluationFormsClient';

export const metadata = {
  title: 'Nơi Chứa Mẫu Đánh Giá & Quản Lý File Mẫu XML | Ban Tổ chức Tỉnh ủy Đắk Lắk',
  description: 'Trung tâm lưu trữ, quản lý biểu mẫu đánh giá và chuẩn hóa file mẫu XML theo Hướng dẫn 05-HD/TU và Quy định 01-QĐ/BTCTU.',
};

export default function EvaluationFormsPage() {
  return <EvaluationFormsClient />;
}
