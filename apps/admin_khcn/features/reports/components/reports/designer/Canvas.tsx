"use client";
import React, { useState, useEffect, useMemo } from 'react';
import {
  ReportConfigAST,
  ColumnDef,
  JoinDef,
  JoinType,
  AggregateFunction,
  ColumnType,
} from '../../../types';
import { Button } from '../../../../../components/ui/button';
import { Badge } from '../../../../../components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '../../../../../components/ui/sheet';
import {
  Database,
  Table,
  Layers,
  Trash2,
  Plus,
  Pencil,
  Zap,
  ArrowRightLeft,
  Link2,
  Sparkles,
  AlertCircle,
  Check,
  HelpCircle,
} from 'lucide-react';
import {
  getFriendlyFieldLabel,
  inferFieldType,
  AGGREGATE_OPTIONS,
  TYPE_OPTIONS,
} from '@/features/reports/utils/fieldHelpers';
import { toast } from 'sonner';

interface CanvasProps {
  config: ReportConfigAST;
  setConfig: React.Dispatch<React.SetStateAction<ReportConfigAST>>;
}

export const Canvas: React.FC<CanvasProps> = ({ config, setConfig }) => {
  const sources = useMemo(() => config.sources || [], [config.sources]);
  const columns = useMemo(() => config.columns || [], [config.columns]);
  const joins = useMemo(() => config.joins || [], [config.joins]);

  // ───────────────────────── State: Quản lý JOIN ─────────────────────────
  const [leftSource, setLeftSource] = useState<string>('');
  const [leftField, setLeftField] = useState<string>('');
  const [joinType, setJoinType] = useState<JoinType>('INNER');
  const [rightSource, setRightSource] = useState<string>('');
  const [rightField, setRightField] = useState<string>('');

  // Tự động khởi tạo giá trị cho bộ ghép nối JOIN khi danh sách nguồn thay đổi
  useEffect(() => {
    if (sources.length >= 2) {
      if (!leftSource || !sources.some((s) => s.id === leftSource)) {
        setLeftSource(sources[0].id);
      }
      if (
        !rightSource ||
        !sources.some((s) => s.id === rightSource) ||
        rightSource === sources[0]?.id
      ) {
        setRightSource(sources[1].id);
      }
    }
  }, [sources, leftSource, rightSource]);

  // Danh sách trường của nguồn trái
  const leftSourceObj = useMemo(
    () => sources.find((s) => s.id === leftSource),
    [sources, leftSource],
  );
  const leftFields = useMemo(() => {
    if (!leftSourceObj || !Array.isArray(leftSourceObj.fields)) return [];
    return leftSourceObj.fields.map((f: any) =>
      typeof f === 'string' ? f : f?.name || f?.field || f?.key || f?.path || '',
    ).filter(Boolean);
  }, [leftSourceObj]);

  // Danh sách trường của nguồn phải
  const rightSourceObj = useMemo(
    () => sources.find((s) => s.id === rightSource),
    [sources, rightSource],
  );
  const rightFields = useMemo(() => {
    if (!rightSourceObj || !Array.isArray(rightSourceObj.fields)) return [];
    return rightSourceObj.fields.map((f: any) =>
      typeof f === 'string' ? f : f?.name || f?.field || f?.key || f?.path || '',
    ).filter(Boolean);
  }, [rightSourceObj]);

  // Cập nhật trường mặc định khi nguồn đổi
  useEffect(() => {
    if (leftFields.length > 0 && (!leftField || !leftFields.includes(leftField))) {
      setLeftField(leftFields[0]);
    }
  }, [leftFields, leftField]);

  useEffect(() => {
    if (rightFields.length > 0 && (!rightField || !rightFields.includes(rightField))) {
      setRightField(rightFields[0]);
    }
  }, [rightFields, rightField]);

  // Thêm phép ghép nối mới
  const handleAddJoin = () => {
    if (!leftSource || !rightSource) {
      toast.error('Vui lòng chọn 2 nguồn dữ liệu cần liên kết.');
      return;
    }
    if (leftSource === rightSource) {
      toast.error('Không thể ghép nối một nguồn dữ liệu với chính nó.');
      return;
    }
    if (!leftField || !rightField) {
      toast.error('Vui lòng chọn đầy đủ trường khóa liên kết giữa 2 nguồn.');
      return;
    }

    // Kiểm tra xem phép nối đã tồn tại chưa
    const alreadyExists = joins.some(
      (j) =>
        j.leftSource === leftSource &&
        j.rightSource === rightSource &&
        j.conditions?.some(
          (c) => c.leftField === leftField && c.rightField === rightField,
        ),
    );

    if (alreadyExists) {
      toast.warning('Phép nối với các trường này đã được cấu hình trước đó.');
      return;
    }

    const newJoin: JoinDef = {
      leftSource,
      rightSource,
      type: joinType,
      conditions: [{ leftField, rightField }],
    };

    setConfig({
      ...config,
      joins: [...joins, newJoin],
    });

    toast.success(
      `Đã thêm phép nối ${joinType} giữa "${leftSourceObj?.name || leftSource}" và "${rightSourceObj?.name || rightSource}".`,
    );
  };

  const handleRemoveJoin = (idx: number) => {
    const updated = [...joins];
    updated.splice(idx, 1);
    setConfig({ ...config, joins: updated });
    toast.success('Đã xóa phép nối dữ liệu.');
  };

  // ───────────────────────── State: Quản lý Cột Kết Quả (Sheet) ─────────────────────────
  const [isColumnSheetOpen, setIsColumnSheetOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [colForm, setColForm] = useState<{
    source: string;
    field: string;
    label: string;
    type: ColumnType;
    aggregate: AggregateFunction;
  }>({
    source: '',
    field: '',
    label: '',
    type: 'string',
    aggregate: 'none',
  });

  // Mở Sheet thêm cột mới
  const handleOpenAddColumn = () => {
    const defaultSource = sources[0]?.id || '';
    const srcObj = sources.find((s) => s.id === defaultSource);
    const rawFirst = (srcObj?.fields?.[0] || '') as any;
    const firstField =
      typeof rawFirst === 'string'
        ? rawFirst
        : rawFirst?.name || rawFirst?.field || rawFirst?.key || '';

    setEditingIndex(null);
    setColForm({
      source: defaultSource,
      field: firstField,
      label: firstField ? getFriendlyFieldLabel(firstField) : 'Cột mới',
      type: firstField ? inferFieldType(firstField) : 'string',
      aggregate: 'none',
    });
    setIsColumnSheetOpen(true);
  };

  // Mở Sheet chỉnh sửa cột hiện có
  const handleOpenEditColumn = (col: ColumnDef, index: number) => {
    setEditingIndex(index);
    setColForm({
      source: col.source || sources[0]?.id || '',
      field: col.field || col.key,
      label: col.label || col.field || col.key,
      type: col.type || 'string',
      aggregate: col.aggregate || 'none',
    });
    setIsColumnSheetOpen(true);
  };

  // Khi người dùng chọn field trong Sheet, tự động gợi ý nhãn và kiểu dữ liệu nếu phù hợp
  const handleSelectFieldInForm = (fieldVal: string) => {
    setColForm((prev) => ({
      ...prev,
      field: fieldVal,
      label: getFriendlyFieldLabel(fieldVal),
      type: inferFieldType(fieldVal),
    }));
  };

  // Lưu cấu hình cột từ Sheet
  const handleSaveColumn = () => {
    const trimmedField = colForm.field.trim();
    const trimmedLabel = colForm.label.trim();

    if (!trimmedField) {
      toast.error('Vui lòng nhập hoặc chọn trường dữ liệu nguồn.');
      return;
    }
    if (!trimmedLabel) {
      toast.error('Vui lòng nhập nhãn tiếng Việt hiển thị cho cột.');
      return;
    }

    const newColDef: ColumnDef = {
      key: trimmedField,
      source: colForm.source,
      field: trimmedField,
      label: trimmedLabel,
      type: colForm.type,
      aggregate: colForm.aggregate,
    };

    let updatedCols = [...columns];
    if (editingIndex === null) {
      // Thêm mới
      updatedCols.push(newColDef);
      toast.success(`Đã thêm cột "${trimmedLabel}" vào cấu hình báo cáo.`);
    } else {
      // Cập nhật
      updatedCols[editingIndex] = newColDef;
      toast.success(`Đã cập nhật cấu hình cột "${trimmedLabel}".`);
    }

    setConfig({ ...config, columns: updatedCols });
    setIsColumnSheetOpen(false);
  };

  const handleDeleteColumn = (index: number) => {
    const colName = columns[index]?.label || columns[index]?.field || 'cột';
    const updated = [...columns];
    updated.splice(index, 1);
    setConfig({ ...config, columns: updated });
    toast.success(`Đã xóa "${colName}".`);
  };

  const handleQuickChangeAggregate = (
    index: number,
    aggregate: AggregateFunction,
  ) => {
    const updated = [...columns];
    updated[index] = { ...updated[index], aggregate };
    setConfig({ ...config, columns: updated });
  };

  const handleQuickChangeType = (index: number, type: ColumnType) => {
    const updated = [...columns];
    updated[index] = { ...updated[index], type };
    setConfig({ ...config, columns: updated });
  };

  // Tự động đồng bộ toàn bộ cột từ các nguồn đã chọn
  const handleSyncAllColumnsFromSources = () => {
    if (sources.length === 0) {
      toast.warning('Chưa có nguồn dữ liệu nào được chọn.');
      return;
    }

    const existingKeys = new Set<string>();
    const newColumns: ColumnDef[] = [];

    // Duyệt qua tất cả các nguồn và trích xuất fields
    sources.forEach((src) => {
      if (Array.isArray(src.fields)) {
        src.fields.forEach((f: any) => {
          const fieldName =
            typeof f === 'string'
              ? f
              : f?.name || f?.field || f?.key || f?.path || '';
          if (fieldName && !existingKeys.has(fieldName)) {
            existingKeys.add(fieldName);
            newColumns.push({
              key: fieldName,
              source: src.id,
              field: fieldName,
              label: getFriendlyFieldLabel(fieldName),
              type: inferFieldType(fieldName),
              aggregate: 'none',
            });
          }
        });
      }
    });

    if (newColumns.length === 0) {
      toast.info('Các nguồn dữ liệu chưa khai báo danh sách trường cụ thể.');
      return;
    }

    setConfig({ ...config, columns: newColumns });
    toast.success(
      `Đã đồng bộ thành công ${newColumns.length} cột dữ liệu với nhãn tiếng Việt chuẩn!`,
    );
  };

  const handleClearAllColumns = () => {
    if (columns.length === 0) return;
    setConfig({ ...config, columns: [] });
    toast.success('Đã xóa tất cả các cột dữ liệu đầu ra.');
  };

  const handleRemoveSource = (id: string) => {
    const srcName = sources.find((s) => s.id === id)?.name || id;
    setConfig({
      ...config,
      sources: sources.filter((s) => s.id !== id),
      joins: joins.filter((j) => j.leftSource !== id && j.rightSource !== id),
      columns: columns.filter((c) => c.source !== id),
    });
    toast.success(`Đã gỡ bỏ nguồn "${srcName}" và các trường liên kết.`);
  };

  // Trường khả dụng trong Sheet thêm/sửa dựa trên nguồn đang chọn
  const availableFieldsInForm = useMemo(() => {
    const srcObj = sources.find((s) => s.id === colForm.source);
    if (!srcObj || !Array.isArray(srcObj.fields)) return [];
    return srcObj.fields.map((f: any) =>
      typeof f === 'string' ? f : f?.name || f?.field || f?.key || f?.path || '',
    ).filter(Boolean);
  }, [sources, colForm.source]);

  return (
    <div className="flex flex-col h-full gap-5 w-full min-w-0">
      {/* ────────────────── KHỐI 1: NGUỒN DỮ LIỆU ĐÃ CHỌN & PHÉP NỐI JOIN ────────────────── */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 w-full min-w-0">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Database className="w-5 h-5 text-indigo-600 shrink-0" />
            <h3 className="font-bold text-base text-slate-800 truncate">
              Nguồn Dữ Liệu Đã Chọn
            </h3>
          </div>
          <Badge variant="outline" className="text-xs bg-slate-50 font-medium shrink-0">
            {sources.length} nguồn
          </Badge>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Các API và bảng cơ sở dữ liệu được tích hợp vào mô hình báo cáo. Chọn thêm nguồn từ danh mục bên trái.
        </p>

        {sources.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-slate-400 p-4 w-full min-w-0">
            <Database className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-xs font-medium">Chưa có nguồn dữ liệu nào được gán vào báo cáo</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Nhấp "Thêm vào không gian" ở danh mục nguồn API bên trái để bắt đầu
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4 w-full min-w-0">
            {sources.map((src: any) => (
              <div
                key={src.id}
                className="border border-slate-200 rounded-xl p-3.5 min-w-[240px] max-w-sm flex-1 bg-white shadow-xs hover:border-indigo-300 transition-colors"
              >
                <div className="flex justify-between items-center mb-2.5 pb-2 border-b border-slate-100 min-w-0">
                  <div className="min-w-0 pr-2 flex-1">
                    <strong className="text-xs font-bold text-slate-800 block truncate">
                      {src.name || src.id}
                    </strong>
                    <span className="text-[10px] text-slate-400 font-mono block truncate mt-0.5">
                      {src.endpoint || src.id}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg shrink-0"
                    onClick={() => handleRemoveSource(src.id)}
                    title="Xóa nguồn này khỏi báo cáo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1 bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                  {Array.isArray(src.fields) && src.fields.length > 0 ? (
                    src.fields.map((field: any, fIdx: number) => {
                      const fieldLabel =
                        typeof field === 'string'
                          ? field
                          : field?.label || field?.name || field?.key || String(fIdx);
                      return (
                        <div
                          key={fIdx}
                          className="text-[11px] text-slate-600 flex items-center justify-between gap-1.5 truncate font-mono"
                        >
                          <div className="flex items-center gap-1.5 truncate min-w-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                            <span className="truncate">{fieldLabel}</span>
                          </div>
                          <span className="text-[9px] text-slate-400 font-sans shrink-0">
                            {getFriendlyFieldLabel(fieldLabel)}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">
                      Không có danh sách trường cụ thể
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ────────── KHỐI GHÉP NỐI DỮ LIỆU (JOIN BUILDER) ────────── */}
        <div className="mt-5 pt-4 border-t border-slate-100 w-full min-w-0">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <h4 className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              Cấu hình Ghép nối Dữ liệu giữa các Nguồn (Table JOINs)
            </h4>
            <span className="text-[11px] text-slate-400">
              {joins.length} phép nối đang áp dụng
            </span>
          </div>

          {sources.length < 2 ? (
            <div className="p-3 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-slate-500 text-xs flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                Thêm từ <strong>2 nguồn dữ liệu trở lên</strong> để kích hoạt tính năng ghép nối tự động (INNER JOIN / LEFT JOIN) theo khóa chính & ngoại.
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Thanh điều khiển cấu hình JOIN trực quan */}
              <div className="p-3 bg-indigo-50/40 border border-indigo-100 rounded-xl flex flex-wrap items-center gap-2.5 w-full min-w-0">
                {/* Nguồn trái */}
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-slate-500 font-semibold mb-0.5">
                    Bảng chính (Left)
                  </span>
                  <select
                    value={leftSource}
                    onChange={(e) => setLeftSource(e.target.value)}
                    className="border border-slate-200 text-xs p-1.5 rounded-lg bg-white shadow-xs font-medium text-slate-700 outline-none focus:border-indigo-500 min-w-[130px]"
                  >
                    {sources.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.name || s.id}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Trường khóa trái */}
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-slate-500 font-semibold mb-0.5">
                    Trường khóa
                  </span>
                  <select
                    value={leftField}
                    onChange={(e) => setLeftField(e.target.value)}
                    className="border border-slate-200 text-xs p-1.5 rounded-lg bg-white shadow-xs font-mono text-slate-700 outline-none focus:border-indigo-500 min-w-[120px]"
                  >
                    {leftFields.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Phép nối Type */}
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-slate-500 font-semibold mb-0.5">
                    Phép nối
                  </span>
                  <select
                    value={joinType}
                    onChange={(e) => setJoinType(e.target.value as JoinType)}
                    className="border border-indigo-200 text-xs p-1.5 rounded-lg bg-indigo-50/80 font-bold text-indigo-700 outline-none focus:border-indigo-500 min-w-[110px]"
                  >
                    <option value="INNER">INNER JOIN (Khớp cả 2)</option>
                    <option value="LEFT">LEFT JOIN (Giữ bảng chính)</option>
                  </select>
                </div>

                {/* Nguồn phải */}
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-slate-500 font-semibold mb-0.5">
                    Bảng kết nối (Right)
                  </span>
                  <select
                    value={rightSource}
                    onChange={(e) => setRightSource(e.target.value)}
                    className="border border-slate-200 text-xs p-1.5 rounded-lg bg-white shadow-xs font-medium text-slate-700 outline-none focus:border-indigo-500 min-w-[130px]"
                  >
                    {sources
                      .filter((s: any) => s.id !== leftSource)
                      .map((s: any) => (
                        <option key={s.id} value={s.id}>
                          {s.name || s.id}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Trường khóa phải */}
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-slate-500 font-semibold mb-0.5">
                    Trường liên kết
                  </span>
                  <select
                    value={rightField}
                    onChange={(e) => setRightField(e.target.value)}
                    className="border border-slate-200 text-xs p-1.5 rounded-lg bg-white shadow-xs font-mono text-slate-700 outline-none focus:border-indigo-500 min-w-[120px]"
                  >
                    {rightFields.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nút Thêm phép nối */}
                <div className="flex flex-col justify-end">
                  <Button
                    size="sm"
                    onClick={handleAddJoin}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 px-3 shadow-xs font-medium mt-auto"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Thêm phép nối
                  </Button>
                </div>
              </div>

              {/* Danh sách các phép nối hiện có */}
              {joins.length > 0 && (
                <div className="flex flex-wrap gap-2.5 pt-1">
                  {joins.map((j: any, idx: number) => {
                    const lName =
                      sources.find((s) => s.id === j.leftSource)?.name ||
                      j.leftSource;
                    const rName =
                      sources.find((s) => s.id === j.rightSource)?.name ||
                      j.rightSource;
                    const condition = j.conditions?.[0];

                    return (
                      <div
                        key={idx}
                        className="bg-white border border-indigo-200/80 rounded-xl px-3 py-2 shadow-xs flex items-center gap-3 text-xs"
                      >
                        <Badge
                          variant="secondary"
                          className={`text-[10px] font-bold ${
                            j.type === 'LEFT'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}
                        >
                          {j.type || 'INNER'} JOIN
                        </Badge>
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <span className="font-bold text-slate-800">{lName}</span>
                          <span className="font-mono text-indigo-600 text-[11px]">
                            ({condition?.leftField || 'id'})
                          </span>
                          <ArrowRightLeft className="w-3 h-3 text-slate-400 mx-0.5" />
                          <span className="font-bold text-slate-800">{rName}</span>
                          <span className="font-mono text-indigo-600 text-[11px]">
                            ({condition?.rightField || 'id'})
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg ml-1"
                          onClick={() => handleRemoveJoin(idx)}
                          title="Xóa phép nối này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ────────────────── KHỐI 2: CỘT KẾT QUẢ & BIẾN ĐỔI DỮ LIỆU ────────────────── */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex-1 w-full min-w-0 flex flex-col">
        {/* Header toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2 w-full min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <Table className="w-5 h-5 text-indigo-600 shrink-0" />
            <h3 className="font-bold text-base text-slate-800 truncate">
              Cột Kết Quả & Biến Đổi Dữ Liệu
            </h3>
            <Badge variant="outline" className="text-xs bg-slate-50 font-medium shrink-0 ml-1">
              {columns.length} cột
            </Badge>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {sources.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncAllColumnsFromSources}
                className="text-xs text-indigo-700 border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 flex items-center gap-1.5 h-8 shadow-xs"
                title="Tự động nạp tất cả các trường từ các nguồn dữ liệu đã chọn với nhãn tiếng Việt chuẩn"
              >
                <Zap className="w-3.5 h-3.5 text-indigo-600" />
                Tự động đồng bộ từ nguồn
              </Button>
            )}

            <Button
              size="sm"
              onClick={handleOpenAddColumn}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm cột mới
            </Button>

            {columns.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAllColumns}
                className="text-slate-400 hover:text-red-600 hover:bg-red-50 text-xs h-8 px-2"
                title="Xóa toàn bộ cột kết quả"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-500 mb-4">
          Cấu hình trường dữ liệu hiển thị, nhãn tiếng Việt và định dạng tính toán trong báo cáo.
        </p>

        {/* Danh sách cột kết quả */}
        {columns.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 w-full min-w-0">
            {columns.map((col: any, cIdx: number) => {
              const srcName =
                sources.find((s) => s.id === col.source)?.name ||
                col.source ||
                'Nguồn';

              return (
                <div
                  key={cIdx}
                  className="p-3.5 bg-slate-50/90 hover:bg-white rounded-xl border border-slate-200/80 hover:border-indigo-300 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between group min-w-0"
                >
                  {/* Top: Nhãn & Nút sửa/xóa */}
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-1.5 mb-1 min-w-0">
                      <span
                        className="text-xs font-bold text-slate-800 block truncate flex-1 min-w-0"
                        title={col.label || col.field || col.key}
                      >
                        {col.label || col.field || col.key}
                      </span>
                      <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"
                          onClick={() => handleOpenEditColumn(col, cIdx)}
                          title="Chỉnh sửa nhãn và công thức"
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                          onClick={() => handleDeleteColumn(cIdx)}
                          title="Xóa cột này"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono truncate">
                      <span className="truncate">Trường: {col.field || col.key}</span>
                      {col.source && (
                        <span className="bg-slate-200/70 text-slate-600 px-1 rounded text-[9px] truncate max-w-[80px]">
                          {srcName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom: Kiểu dữ liệu & Phép tính toán Aggregate */}
                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between gap-2 text-[10px] min-w-0">
                    {/* Quick Select Type */}
                    <select
                      value={col.type || 'string'}
                      onChange={(e) =>
                        handleQuickChangeType(cIdx, e.target.value as ColumnType)
                      }
                      className="border border-slate-200/80 bg-white rounded-md text-[10px] font-mono px-1.5 py-0.5 text-slate-600 outline-none hover:border-slate-300"
                      title="Kiểu dữ liệu"
                    >
                      <option value="string">string</option>
                      <option value="number">number</option>
                      <option value="boolean">boolean</option>
                      <option value="mixed">mixed</option>
                    </select>

                    {/* Quick Select Aggregate */}
                    <select
                      value={col.aggregate || 'none'}
                      onChange={(e) =>
                        handleQuickChangeAggregate(
                          cIdx,
                          e.target.value as AggregateFunction,
                        )
                      }
                      className={`border rounded-md text-[10px] font-semibold uppercase px-1.5 py-0.5 outline-none transition-colors ${
                        col.aggregate && col.aggregate !== 'none'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold'
                          : 'bg-white text-slate-400 border-slate-200/80'
                      }`}
                      title="Phép tính tổng hợp trong báo cáo"
                    >
                      <option value="none">GỐC (NONE)</option>
                      <option value="count">COUNT (ĐẾM)</option>
                      <option value="sum">SUM (TỔNG)</option>
                      <option value="avg">AVG (TRUNG BÌNH)</option>
                      <option value="min">MIN (NHỎ NHẤT)</option>
                      <option value="max">MAX (LỚN NHẤT)</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 min-h-[160px] border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-slate-400 p-6 text-center w-full min-w-0">
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-slate-700">
              Chưa có trường dữ liệu kết quả nào được cấu hình
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              Báo cáo cần cấu hình các cột kết quả với nhãn tiếng Việt và định dạng tính toán để kết xuất bảng và trực quan hóa biểu đồ.
            </p>
            <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
              {sources.length > 0 ? (
                <Button
                  size="sm"
                  onClick={handleSyncAllColumnsFromSources}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs shadow-xs"
                >
                  <Zap className="w-3.5 h-3.5 mr-1.5" />
                  Tự động đồng bộ toàn bộ cột từ nguồn ({sources.length} nguồn)
                </Button>
              ) : (
                <p className="text-xs text-amber-600 font-medium">
                  Hãy thêm ít nhất một nguồn dữ liệu từ bảng bên trái trước.
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenAddColumn}
                className="text-xs text-slate-700 border-slate-200 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Thêm cột thủ công
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ────────────────── SHEET BIÊN TẬP / THÊM MỚI CỘT BÁO CÁO ────────────────── */}
      <Sheet open={isColumnSheetOpen} onOpenChange={setIsColumnSheetOpen}>
        <SheetContent side="right" className="sm:max-w-md w-full flex flex-col p-6 overflow-y-auto">
          <SheetHeader className="pb-4 border-b border-slate-100">
            <SheetTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Table className="w-4 h-4 text-indigo-600" />
              {editingIndex === null
                ? 'Thêm Cột Báo Cáo Mới'
                : `Chỉnh Sửa Cột: ${colForm.label || colForm.field}`}
            </SheetTitle>
            <SheetDescription className="text-xs text-slate-500">
              Cấu hình nhãn tiếng Việt hiển thị, kiểu dữ liệu và định dạng tính toán tổng hợp cho trường dữ liệu này.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 py-4 flex-1">
            {/* 1. Nguồn dữ liệu */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nguồn Dữ Liệu
              </label>
              <select
                value={colForm.source}
                onChange={(e) =>
                  setColForm((prev) => ({ ...prev, source: e.target.value }))
                }
                className="w-full border border-slate-200 text-xs p-2 rounded-xl bg-white text-slate-800 outline-none focus:border-indigo-500 font-medium"
              >
                {sources.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.name || s.id} ({s.endpoint || s.id})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Trường dữ liệu (Field) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên Trường Dữ Liệu (Field / Key)
              </label>
              {availableFieldsInForm.length > 0 ? (
                <div className="space-y-1.5">
                  <select
                    value={colForm.field}
                    onChange={(e) => handleSelectFieldInForm(e.target.value)}
                    className="w-full border border-slate-200 text-xs p-2 rounded-xl bg-white text-slate-800 font-mono outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Chọn trường từ nguồn --</option>
                    {availableFieldsInForm.map((f) => (
                      <option key={f} value={f}>
                        {f} ({getFriendlyFieldLabel(f)})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400">
                    Hoặc nhập mã trường tùy biến bên dưới:
                  </p>
                  <input
                    type="text"
                    value={colForm.field}
                    onChange={(e) =>
                      setColForm((prev) => ({ ...prev, field: e.target.value }))
                    }
                    placeholder="Ví dụ: employeeName, qualityScore..."
                    className="w-full border border-slate-200 text-xs p-2 rounded-xl font-mono text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>
              ) : (
                <input
                  type="text"
                  value={colForm.field}
                  onChange={(e) =>
                    setColForm((prev) => ({ ...prev, field: e.target.value }))
                  }
                  placeholder="Ví dụ: taskCount, ranking..."
                  className="w-full border border-slate-200 text-xs p-2 rounded-xl font-mono text-slate-800 outline-none focus:border-indigo-500"
                />
              )}
            </div>

            {/* 3. Nhãn tiếng Việt */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nhãn Hiển Thị Tiếng Việt (Label)
              </label>
              <input
                type="text"
                value={colForm.label}
                onChange={(e) =>
                  setColForm((prev) => ({ ...prev, label: e.target.value }))
                }
                placeholder="Ví dụ: Họ và tên, Tổng số nhiệm vụ..."
                className="w-full border border-slate-200 text-xs p-2 rounded-xl text-slate-800 outline-none focus:border-indigo-500 font-medium"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Nhãn sẽ xuất hiện trên tiêu đề cột bảng dữ liệu và tiêu đề biểu đồ.
              </p>
            </div>

            {/* 4. Kiểu dữ liệu */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kiểu Dữ Liệu (Column Type)
              </label>
              <select
                value={colForm.type}
                onChange={(e) =>
                  setColForm((prev) => ({
                    ...prev,
                    type: e.target.value as ColumnType,
                  }))
                }
                className="w-full border border-slate-200 text-xs p-2 rounded-xl bg-white text-slate-800 outline-none focus:border-indigo-500"
              >
                {TYPE_OPTIONS.map((opt: any) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Định dạng tính toán / Tổng hợp */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Định Dạng Tính Toán / Tổng Hợp (Aggregate)
              </label>
              <select
                value={colForm.aggregate}
                onChange={(e) =>
                  setColForm((prev) => ({
                    ...prev,
                    aggregate: e.target.value as AggregateFunction,
                  }))
                }
                className="w-full border border-slate-200 text-xs p-2 rounded-xl bg-white text-slate-800 outline-none focus:border-indigo-500 font-medium"
              >
                {AGGREGATE_OPTIONS.map((opt: any) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Áp dụng khi gom nhóm (GROUP BY) hoặc tính toán tổng hợp trên báo cáo.
              </p>
            </div>
          </div>

          <SheetFooter className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsColumnSheetOpen(false)}
              className="text-xs"
            >
              Hủy bỏ
            </Button>
            <Button
              size="sm"
              onClick={handleSaveColumn}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium"
            >
              {editingIndex === null ? 'Thêm cột vào báo cáo' : 'Lưu thay đổi'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};
