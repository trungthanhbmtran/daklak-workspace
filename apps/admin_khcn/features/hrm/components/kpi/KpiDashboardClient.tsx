"use client";
import React, { useState, useMemo } from 'react';
import {
  ChevronRight, ChevronDown, History, Layers,
  TrendingUp, Target, ShieldCheck, AlertTriangle, RefreshCw
} from 'lucide-react';

// --- MOCK DATA TĨNH BAN ĐẦU ---
interface KpiNode {
  id: string;
  name: string;
  weight: number;
  target: number;
  actual: number;
  unit: string;
  deptName: string;
  parentId: string | null;
  childrenIds: string[];
}

const initialKpis: Record<string, KpiNode> = {
  'root-1': {
    id: 'root-1',
    name: 'Chuyển đổi số và liên thông dữ liệu hành chính toàn ngành',
    weight: 100, target: 100, actual: 94.9, unit: '%', deptName: 'Ban Giám Đốc Sở',
    parentId: null, childrenIds: ['child-1.1', 'child-1.2']
  },
  'child-1.1': {
    id: 'child-1.1',
    name: 'Trục liên thông dữ liệu LGSP hoạt động ổn định',
    weight: 60, target: 100, actual: 97.4, unit: '%', deptName: 'Trung tâm IOC',
    parentId: 'root-1', childrenIds: ['sub-1.1.1', 'sub-1.1.2']
  },
  'sub-1.1.1': {
    id: 'sub-1.1.1',
    name: 'Tích hợp phân hệ gRPC Gateway phục vụ kết nối camera',
    weight: 50, target: 10, actual: 9, unit: 'Gateway', deptName: 'Đội Kỹ thuật IOC',
    parentId: 'child-1.1', childrenIds: []
  },
  'sub-1.1.2': {
    id: 'sub-1.1.2',
    name: 'Tối ưu cụm Microservices chạy trên hạ tầng Kubernetes',
    weight: 50, target: 100, actual: 96, unit: '%', deptName: 'Đội Kỹ thuật IOC',
    parentId: 'child-1.1', childrenIds: []
  },
  'child-1.2': {
    id: 'child-1.2',
    name: 'Nâng cao tỷ lệ xử lý hồ sơ, văn bản đúng hạn trên iDesk',
    weight: 40, target: 100, actual: 91, unit: '%', deptName: 'Văn phòng Sở',
    parentId: 'root-1', childrenIds: []
  }
};

interface AuditLog {
  id: string;
  kpiName: string;
  changedBy: string;
  oldActual: number;
  newActual: number;
  timestamp: string;
}

export default function EnterpriseKpiPreview() {
  const [kpis, setKPIs] = useState<Record<string, KpiNode>>(initialKpis);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({
    'root-1': true,
    'child-1.1': true
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: '1', kpiName: 'Tích hợp phân hệ gRPC Gateway...', changedBy: 'Hệ thống (Cron)', oldActual: 8, newActual: 9, timestamp: '10:15 - 25/05/2026' }
  ]);

  // --- HÀM TỰ ĐỘNG TÍNH TOÁN LAN TRUYỀN (ROLL-UP LOGIC SIMULATION) ---
  const recalculateKpiTree = (currentKpis: Record<string, KpiNode>, updatedId: string, newActual: number): Record<string, KpiNode> => {
    const cloned = { ...currentKpis };
    cloned[updatedId] = { ...cloned[updatedId], actual: newActual };

    let currentParentId = cloned[updatedId].parentId;

    while (currentParentId) {
      const parent = cloned[currentParentId];
      let totalWeightedCompletion = 0;

      parent.childrenIds.forEach(childId => {
        const child = cloned[childId];
        const completion = child.target > 0 ? (child.actual / child.target) : 0;
        // Giới hạn hiệu suất tối đa 150% để tránh lệch phổ điểm
        const cappedCompletion = Math.min(completion, 1.5);
        totalWeightedCompletion += cappedCompletion * (child.weight / 100);
      });

      const newParentActual = Number((parent.target * totalWeightedCompletion).toFixed(1));
      cloned[currentParentId] = { ...parent, actual: newParentActual };

      currentParentId = parent.parentId; // Tiếp tục lặp ngược lên đỉnh cây
    }

    return cloned;
  };

  // Thay đổi giá trị Input trực tiếp trên bảng
  const handleActualChange = (id: string, value: string) => {
    const numValue = value === '' ? 0 : Number(value);
    const oldActual = kpis[id].actual;

    if (numValue === oldActual) return;

    const updatedTree = recalculateKpiTree(kpis, id, numValue);
    setKPIs(updatedTree);

    // Ghi nhận Audit Log giả lập
    const newLog: AuditLog = {
      id: crypto.randomUUID(),
      kpiName: kpis[id].name,
      changedBy: 'Trưởng phòng (Quản trị viên)',
      oldActual: oldActual,
      newActual: numValue,
      timestamp: new Date().toLocaleTimeString() + ' - Hôm nay'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const getStatus = (actual: number, target: number) => {
    const rate = target > 0 ? (actual / target) * 100 : 0;
    if (rate < 80) return { label: 'Cần cố gắng', color: 'bg-red-50 text-red-700 border-red-200' };
    if (rate < 95) return { label: 'Khá', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    if (rate < 110) return { label: 'Tốt', color: 'bg-green-50 text-green-700 border-green-200' };
    return { label: 'Xuất sắc', color: 'bg-purple-50 text-purple-700 border-purple-200' };
  };

  // Render cấu trúc cây đệ quy xuống HTML Table Rows
  const renderTreeRows = (nodeId: string, depth = 0): React.ReactNode[] => {
    const node = kpis[nodeId];
    if (!node) return [];

    const hasChildren = node.childrenIds.length > 0;
    const isExpanded = !!expandedRows[node.id];
    const statusInfo = getStatus(node.actual, node.target);
    const completionRate = node.target > 0 ? (node.actual / node.target) * 100 : 0;

    const row = (
      <tr key={node.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
        <td style={{ paddingLeft: `${depth * 24 + 16}px` }} className="py-3.5 pr-4 font-medium text-slate-900">
          <div className="flex items-center gap-2">
            {hasChildren ? (
              <button
                onClick={() => setExpandedRows(p => ({ ...p, [node.id]: !p[node.id] }))}
                className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors"
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            ) : (
              <span className="w-6" />
            )}
            <span className="text-sm line-clamp-2 md:line-clamp-none">{node.name}</span>
          </div>
        </td>
        <td className="py-3.5 px-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
            {node.deptName}
          </span>
        </td>
        <td className="py-3.5 px-4 text-center font-semibold text-slate-600 text-sm">{node.weight}%</td>
        <td className="py-3.5 px-4 text-right font-mono text-sm text-slate-500">
          {node.target} <span className="text-slate-300 mx-1">/</span>
          {hasChildren ? (
            <span className="font-bold text-slate-900 bg-slate-100/80 px-2 py-1 rounded">{node.actual}</span>
          ) : (
            <input
              type="number"
              className="w-16 px-1.5 py-0.5 font-bold text-right text-blue-600 bg-blue-50/50 border border-blue-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={node.actual}
              onChange={(e) => handleActualChange(node.id, e.target.value)}
            />
          )}
          <span className="text-xs text-slate-400 ml-1">{node.unit}</span>
        </td>
        <td className="py-3.5 px-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-slate-600 w-10 text-right">{completionRate.toFixed(1)}%</span>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(completionRate, 100)}%` }} />
            </div>
          </div>
        </td>
        <td className="py-3.5 px-4 text-center">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded border text-xs font-medium shadow-sm ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </td>
      </tr>
    );

    let result: any = [row];
    if (hasChildren && isExpanded) {
      node.childrenIds.forEach(childId => {
        result = [...result, ...renderTreeRows(childId, depth + 1)];
      });
    }
    return result;
  };

  return (
    <div className="p-6 bg-slate-900 text-slate-100 min-h-screen">
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* Top bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Enterprise Edition • Live Preview</span>
            <h1 className="text-2xl font-bold tracking-tight">Hệ thống Giám sát Hiệu suất Chỉ tiêu Toàn ngành</h1>
            <p className="text-sm text-slate-400">Dữ liệu giả lập mô hình phân rã mục tiêu (Cascading) và tính toán ngược (Roll-up) tự động.</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-xl border border-slate-700 text-xs text-slate-300">
            <RefreshCw className="h-4 w-4 text-green-400 animate-spin" />
            <span>Đang lắng nghe thay đổi số liệu</span>
          </div>
        </div>

        {/* Dashboard grid layout */}
        <div className="grid gap-6 lg:grid-cols-4">

          {/* Main Matrix Table */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
              <div className="p-5 border-b bg-slate-50 flex items-center gap-2">
                <Layers className="h-5 w-5 text-blue-600" />
                <div>
                  <h2 className="font-semibold text-slate-900">Ma trận Mục tiêu Đệ quy</h2>
                  <p className="text-xs text-slate-500">Thử thay đổi số liệu tại các ô <span className="text-blue-600 font-bold">màu xanh</span> để xem điểm số cấp trên tự động cập nhật.</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase border-b border-slate-200">
                      <th className="py-3 px-4 w-[45%]">Cấu trúc cây chỉ tiêu</th>
                      <th className="py-3 px-4">Đơn vị phụ trách</th>
                      <th className="py-3 px-4 text-center">Trọng số</th>
                      <th className="py-3 px-4 text-right">Chỉ tiêu / Thực tế</th>
                      <th className="py-3 px-4 w-[20%]">Hiệu suất</th>
                      <th className="py-3 px-4 text-center">Xếp loại</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {renderTreeRows('root-1')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Audit Logs Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-700 pb-3">
                <History className="h-5 w-5 text-amber-400" />
                <div>
                  <h3 className="font-semibold text-slate-100">Vết thay đổi dữ liệu</h3>
                  <p className="text-xs text-slate-400">Audit Trail thời gian thực</p>
                </div>
              </div>

              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-900/60 border border-slate-700 rounded-xl text-xs space-y-2">
                    <div className="flex justify-between text-slate-400">
                      <span className="font-medium text-slate-300">{log.changedBy}</span>
                      <span>{log.timestamp}</span>
                    </div>
                    <p className="text-slate-200 line-clamp-1 italic">"{log.kpiName}"</p>
                    <div className="flex items-center gap-2 font-mono text-slate-400 pt-1 border-t border-slate-800">
                      <span>Thay đổi: {log.oldActual}</span>
                      <span className="text-amber-400">→</span>
                      <span className="text-green-400 font-bold">{log.newActual}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Architecture Tip */}
            <div className="bg-gradient-to-br from-blue-900/40 to-slate-800 border border-blue-800/40 rounded-2xl p-5 text-xs text-slate-300 space-y-2">
              <h4 className="font-bold text-blue-400 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" /> Mô hình vận hành thực tế
              </h4>
              <p className="leading-relaxed text-slate-400">
                Khi tích hợp vào kiến trúc Microservices, sự kiện cập nhật giá trị (Inline Input) sẽ phát một lệnh <code className="text-slate-200 bg-slate-900 px-1 rounded">PATCH</code> qua API Gateway.
                Hệ thống backend sử dụng Database Transaction để ghi đồng thời nhật ký thay đổi và tính toán đệ quy đẩy ngược dữ liệu lên các node cha trước khi đồng bộ về Client thông qua Server-Sent Events (SSE).
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}