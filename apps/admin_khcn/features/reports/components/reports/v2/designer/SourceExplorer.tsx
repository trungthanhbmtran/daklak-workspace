import React, { useState } from 'react';
import { ReportSourceDef } from '../../../../types/v2';
import { Button } from '../../../../../../components/ui/button';

interface SourceExplorerProps {
  onAddSource: (source: ReportSourceDef) => void;
}

// Giả lập danh sách catalog nguồn đã đăng ký
const MOCK_CATALOG = [
  {
    endpoint: 'HRM_TASK_STATS',
    name: 'Thống kê nhiệm vụ',
    fields: ['taskId', 'employeeId', 'status', 'hours'],
  },
  {
    endpoint: 'DOC_STATS',
    name: 'Thống kê văn bản',
    fields: ['docId', 'departmentId', 'type', 'issueDate'],
  },
];

export const SourceExplorer: React.FC<SourceExplorerProps> = ({ onAddSource }) => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="p-4 flex flex-col h-full">
      <h3 className="font-semibold mb-4 text-lg">Nguồn Dữ Liệu</h3>
      <input
        type="text"
        placeholder="Tìm kiếm API nguồn..."
        className="border rounded p-2 mb-4 w-full text-sm"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      
      <div className="flex-1 overflow-y-auto space-y-3">
        {MOCK_CATALOG.filter((c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase())
        ).map((catalog) => (
          <div key={catalog.endpoint} className="p-3 bg-white border rounded shadow-sm">
            <h4 className="font-medium text-sm">{catalog.name}</h4>
            <p className="text-xs text-gray-500 mb-2">{catalog.endpoint}</p>
            <Button
              variant="secondary"
              size="sm"
              className="w-full text-xs"
              onClick={() =>
                onAddSource({
                  id: catalog.endpoint, // Default alias as endpoint code
                  endpoint: catalog.endpoint,
                  fields: catalog.fields,
                })
              }
            >
              Thêm vào không gian
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
