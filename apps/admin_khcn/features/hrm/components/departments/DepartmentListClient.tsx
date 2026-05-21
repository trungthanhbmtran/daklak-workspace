"use client";

import React from "react";

export function DepartmentListClient() {
  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="text-lg font-bold mb-4">Phòng ban & Cơ cấu tổ chức (Departments)</h2>
      <p className="text-gray-600 mb-4">Mô-đun quản lý sơ đồ tổ chức, phòng ban, chức vụ đang được phát triển.</p>
      <div className="border rounded p-8 flex items-center justify-center text-gray-400 bg-gray-50">
        Sơ đồ phòng ban sẽ hiển thị ở đây
      </div>
    </div>
  );
}
