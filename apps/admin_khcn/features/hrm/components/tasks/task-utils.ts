export const translateTaskStatus = (status: string) => {
  if (!status) return "Chưa xác định";
  const map: Record<string, string> = {
    TODO: "Cần làm",
    IN_PROGRESS: "Đang thực hiện",
    PENDING_APPROVAL: "Chờ phê duyệt",
    COMPLETED: "Hoàn thành",
    RETURNED: "Bị trả lại",
    REJECTED: "Đã từ chối",
    CANCELLED: "Đã hủy",
    DRAFT: "Bản nháp",
    ASSIGNED: "Đã giao",
  };
  return map[status.toUpperCase()] || status;
};

export const getTaskStatusColor = (status: string) => {
  if (!status) return "bg-slate-100 text-slate-700 border-slate-200";
  const map: Record<string, string> = {
    TODO: "bg-slate-100 text-slate-700 border-slate-200",
    IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
    PENDING_APPROVAL: "bg-amber-50 text-amber-700 border-amber-200",
    COMPLETED: "bg-green-50 text-green-700 border-green-200",
    RETURNED: "bg-orange-50 text-orange-700 border-orange-200",
    REJECTED: "bg-red-50 text-red-700 border-red-200",
    CANCELLED: "bg-slate-100 text-slate-500 border-slate-200",
    DRAFT: "bg-slate-100 text-slate-500 border-slate-200",
    ASSIGNED: "bg-blue-50 text-blue-700 border-blue-200",
  };
  return map[status.toUpperCase()] || "bg-slate-100 text-slate-700 border-slate-200";
};
