"use client";

import React from "react";

export function PayrollListClient() {
  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="text-lg font-bold mb-4">Quản lý Lương thưởng (Payroll)</h2>
      <p className="text-gray-600 mb-4">Mô-đun tính toán và quản lý bảng lương đang được phát triển.</p>
      <div className="border rounded p-8 flex items-center justify-center text-gray-400 bg-gray-50">
        Bảng lương nhân sự sẽ hiển thị ở đây
      </div>
    </div>
  );
}
