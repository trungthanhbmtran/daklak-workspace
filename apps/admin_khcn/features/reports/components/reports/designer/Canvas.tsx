"use client";
import React, { useState, useEffect, useMemo } from 'react';
import {
  ReportConfigAST,
  ColumnDef,
  JoinDef,
  JoinType,
  AggregateFunction,
  ColumnType,
  FilterDef,
  FilterOperator,
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
  Filter,
  Building2,
  SlidersHorizontal,
  X,
  Sliders,
  CheckCircle2,
  Calculator,
} from 'lucide-react';
import {
  getFriendlyFieldLabel,
  inferFieldType,
  AGGREGATE_OPTIONS,
  TYPE_OPTIONS,
  findSmartJoinMatches,
  SmartJoinRule,
  evaluateFormulaClient,
} from '@/features/reports/utils/fieldHelpers';
import { toast } from 'sonner';

export const DAKLAK_UNITS = [
  { code: 'A15.05', name: 'Ban Tổ chức Tỉnh ủy Đắk Lắk (BTCTU)', group: 'Khối Cơ quan Đảng' },
  { code: 'A15.01', name: 'Văn phòng Tỉnh ủy Đắk Lắk', group: 'Khối Cơ quan Đảng' },
  { code: 'A15.02', name: 'Ban Tuyên giáo Tỉnh ủy Đắk Lắk', group: 'Khối Cơ quan Đảng' },
  { code: 'A15.03', name: 'Ban Dân vận Tỉnh ủy Đắk Lắk', group: 'Khối Cơ quan Đảng' },
  { code: 'A15.04', name: 'Cơ quan Ủy ban Kiểm tra Tỉnh ủy', group: 'Khối Cơ quan Đảng' },
  { code: 'A15.06', name: 'Ban Nội chính Tỉnh ủy Đắk Lắk', group: 'Khối Cơ quan Đảng' },
  { code: 'H15.20', name: 'Sở Khoa học và Công nghệ Đắk Lắk', group: 'Khối Sở Ban Ngành' },
  { code: 'H15.25', name: 'Văn phòng UBND Tỉnh Đắk Lắk', group: 'Khối Sở Ban Ngành' },
  { code: 'H15.03', name: 'Sở Tài chính Đắk Lắk', group: 'Khối Sở Ban Ngành' },
  { code: 'H15.04', name: 'Sở Kế hoạch và Đầu tư Đắk Lắk', group: 'Khối Sở Ban Ngành' },
  { code: 'H15.01', name: 'UBND Huyện Krông Pắc', group: 'Khối Địa phương' },
  { code: 'H15.02', name: 'UBND Thị xã Buôn Hồ', group: 'Khối Địa phương' },
  { code: 'H15.05', name: 'UBND TP. Buôn Ma Thuột', group: 'Khối Địa phương' },
];

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

  // ───────────────────────── Gợi ý Smart-Join Tự Động ─────────────────────────
  const smartJoinSuggestions = useMemo(() => {
    const matches = findSmartJoinMatches(sources);
    return matches.filter((rule) => {
      return !joins.some(
        (j) =>
          ((j.leftSource.toUpperCase() === rule.source1.toUpperCase() &&
            j.rightSource.toUpperCase() === rule.source2.toUpperCase()) ||
           (j.leftSource.toUpperCase() === rule.source2.toUpperCase() &&
            j.rightSource.toUpperCase() === rule.source1.toUpperCase())) &&
          j.conditions?.some(
            (c) =>
              (c.leftField === rule.field1 && c.rightField === rule.field2) ||
              (c.leftField === rule.field2 && c.rightField === rule.field1),
          ),
      );
    });
  }, [sources, joins]);

  const handleApplySmartJoin = (rule: SmartJoinRule) => {
    const s1 = sources.find((s) => (s.endpoint || s.id).toUpperCase() === rule.source1.toUpperCase());
    const s2 = sources.find((s) => (s.endpoint || s.id).toUpperCase() === rule.source2.toUpperCase());
    if (!s1 || !s2) return;

    const newJoin: JoinDef = {
      leftSource: s1.id,
      rightSource: s2.id,
      type: rule.joinType,
      conditions: [{ leftField: rule.field1, rightField: rule.field2 }],
    };

    setConfig({
      ...config,
      joins: [...joins, newJoin],
    });
    toast.success(`Đã tự động áp dụng Smart-Join: ${rule.description}`);
  };

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

  // ───────────────────────── State: Quản lý Bộ Lọc Dữ Liệu (Filters) & Đơn vị ─────────────────────────
  const filters = useMemo(() => config.filters || [], [config.filters]);

  const [filterSource, setFilterSource] = useState<string>('');
  const [filterField, setFilterField] = useState<string>('');
  const [filterOperator, setFilterOperator] = useState<FilterOperator>('eq');
  const [filterValue, setFilterValue] = useState<string>('');
  const [selectedUnitScope, setSelectedUnitScope] = useState<string>('ALL');

  // Quản lý modal tham số API cho từng nguồn
  const [editingParamsSourceId, setEditingParamsSourceId] = useState<string | null>(null);
  const [sourceParamsForm, setSourceParamsForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (sources.length > 0) {
      if (!filterSource || !sources.some((s) => s.id === filterSource)) {
        setFilterSource(sources[0].id);
      }
    }
  }, [sources, filterSource]);

  const activeFilterSourceObj = useMemo(
    () => sources.find((s) => s.id === filterSource) || sources[0],
    [sources, filterSource],
  );

  const activeFilterFields = useMemo(() => {
    if (!activeFilterSourceObj || !Array.isArray(activeFilterSourceObj.fields)) return [];
    return activeFilterSourceObj.fields
      .map((f: any) =>
        typeof f === 'string' ? f : f?.name || f?.field || f?.key || f?.path || '',
      )
      .filter(Boolean);
  }, [activeFilterSourceObj]);

  useEffect(() => {
    if (activeFilterFields.length > 0 && (!filterField || !activeFilterFields.includes(filterField))) {
      const defaultField =
        activeFilterFields.find((f) =>
          ['from_organ_id', 'departmentId', 'dia_ban', 'organName', 'departmentName'].includes(f),
        ) || activeFilterFields[0];
      setFilterField(defaultField);
    }
  }, [activeFilterFields, filterField]);

  // Đồng bộ selectedUnitScope nếu đã có filter đơn vị lưu sẵn
  useEffect(() => {
    const existingUnitFilter = filters.find((f) =>
      ['from_organ_id', 'departmentId', 'dia_ban'].includes(f.field),
    );
    if (existingUnitFilter && existingUnitFilter.value) {
      setSelectedUnitScope(existingUnitFilter.value);
    }
  }, [filters]);

  // Áp dụng phạm vi đơn vị nhanh (Unit Scope)
  const handleApplyUnitScope = (unitCode: string, unitName: string) => {
    setSelectedUnitScope(unitCode);

    if (unitCode === 'ALL') {
      const remainingFilters = filters.filter(
        (f) => !['from_organ_id', 'departmentId', 'dia_ban', 'organName', 'departmentName'].includes(f.field),
      );
      const updatedSources = sources.map((s) => {
        if (!s.params) return s;
        const nextParams = { ...s.params };
        delete nextParams.from_organ_id;
        delete nextParams.organ_id;
        return { ...s, params: nextParams };
      });

      setConfig({
        ...config,
        sources: updatedSources,
        filters: remainingFilters,
      });
      toast.success('Đã chuyển sang phạm vi: Toàn tỉnh (Không lọc theo đơn vị).');
      return;
    }

    const targetSource = sources[0];
    if (!targetSource) {
      toast.error('Vui lòng thêm ít nhất một nguồn dữ liệu trước khi chọn đơn vị.');
      return;
    }

    const targetFields = (targetSource.fields || []).map((f: any) =>
      typeof f === 'string' ? f : f?.name || f?.field || f?.key || f?.path || '',
    );

    let unitField = 'from_organ_id';
    if (!targetFields.includes('from_organ_id')) {
      if (targetFields.includes('departmentId')) unitField = 'departmentId';
      else if (targetFields.includes('dia_ban')) unitField = 'dia_ban';
      else if (targetFields.includes('organName')) unitField = 'organName';
    }

    const otherFilters = filters.filter(
      (f) => !['from_organ_id', 'departmentId', 'dia_ban'].includes(f.field),
    );
    const newUnitFilter: FilterDef = {
      source: targetSource.id,
      field: unitField,
      operator: 'eq',
      value: unitCode,
    };

    const updatedSources = sources.map((s) => ({
      ...s,
      params: {
        ...(s.params || {}),
        from_organ_id: unitCode,
      },
    }));

    setConfig({
      ...config,
      sources: updatedSources,
      filters: [...otherFilters, newUnitFilter],
    });

    toast.success(`Đã áp dụng cấu hình báo cáo cho đơn vị: ${unitName} (${unitCode}).`);
  };

  // Thêm điều kiện lọc tùy biến
  const handleAddCustomFilter = () => {
    if (!filterField) {
      toast.error('Vui lòng chọn trường dữ liệu cần lọc.');
      return;
    }
    if (!filterValue.trim()) {
      toast.error('Vui lòng nhập giá trị lọc.');
      return;
    }

    const newFilter: FilterDef = {
      source: filterSource || sources[0]?.id || '',
      field: filterField,
      operator: filterOperator,
      value: filterValue.trim(),
    };

    setConfig({
      ...config,
      filters: [...filters, newFilter],
    });

    setFilterValue('');
    toast.success(`Đã thêm bộ lọc: ${getFriendlyFieldLabel(filterField)} (${filterField}) ${filterOperator} "${filterValue.trim()}".`);
  };

  // Xóa điều kiện lọc
  const handleRemoveFilter = (index: number) => {
    const updated = [...filters];
    const removed = updated.splice(index, 1)[0];
    if (['from_organ_id', 'departmentId', 'dia_ban'].includes(removed?.field)) {
      setSelectedUnitScope('ALL');
    }
    setConfig({
      ...config,
      filters: updated,
    });
    toast.success('Đã xóa điều kiện lọc.');
  };

  // Mở modal cấu hình tham số API cho từng nguồn
  const handleOpenSourceParams = (src: any) => {
    setEditingParamsSourceId(src.id);
    setSourceParamsForm(src.params || {});
  };

  // Lưu tham số API cho nguồn
  const handleSaveSourceParams = () => {
    if (!editingParamsSourceId) return;
    const updatedSources = sources.map((s) => {
      if (s.id === editingParamsSourceId) {
        return {
          ...s,
          params: sourceParamsForm,
        };
      }
      return s;
    });
    setConfig({
      ...config,
      sources: updatedSources,
    });
    setEditingParamsSourceId(null);
    toast.success('Đã lưu tham số kết nối API cho nguồn dữ liệu.');
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
    formula: string;
    isCalculated: boolean;
  }>({
    source: '',
    field: '',
    label: '',
    type: 'string',
    aggregate: 'none',
    formula: '',
    isCalculated: false,
  });

  // Mở Sheet thêm cột mới từ nguồn dữ liệu
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
      formula: '',
      isCalculated: false,
    });
    setIsColumnSheetOpen(true);
  };

  // Mở Sheet thêm cột tính toán tùy biến (Calculated Field / Formula fx)
  const handleOpenAddCalculatedColumn = () => {
    setEditingIndex(null);
    const idSuffix = Date.now().toString().slice(-4);
    setColForm({
      source: sources[0]?.id || 'CALCULATED',
      field: `calc_${idSuffix}`,
      label: 'Cột tính toán mới',
      type: 'number',
      aggregate: 'none',
      formula: '',
      isCalculated: true,
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
      formula: col.formula || '',
      isCalculated: Boolean(col.isCalculated || col.formula),
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
      formula: colForm.formula?.trim() || undefined,
      isCalculated: Boolean(colForm.isCalculated || colForm.formula?.trim()),
    };

    let updatedCols = [...columns];
    if (editingIndex === null) {
      // Thêm mới
      updatedCols.push(newColDef);
      toast.success(
        newColDef.isCalculated
          ? `Đã thêm cột tính toán "${trimmedLabel}".`
          : `Đã thêm cột "${trimmedLabel}" vào cấu hình báo cáo.`,
      );
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
    return srcObj.fields
      .map((f: any) =>
        typeof f === 'string' ? f : f?.name || f?.field || f?.key || f?.path || '',
      )
      .filter(Boolean);
  }, [sources, colForm.source]);

  // Danh sách các trường từ tất cả các nguồn phục vụ chèn token vào công thức tính toán [field]
  const allAvailableTokens = useMemo(() => {
    const tokens = new Map<string, string>();
    sources.forEach((s) => {
      const srcName = s.name || s.id;
      if (Array.isArray(s.fields)) {
        s.fields.forEach((f: any) => {
          const name = typeof f === 'string' ? f : f?.name || f?.field || f?.key || '';
          if (name && !tokens.has(name)) {
            tokens.set(name, `${name} (${getFriendlyFieldLabel(name)} - ${srcName})`);
          }
        });
      }
    });
    columns.forEach((c) => {
      const name = c.field || c.key;
      if (name && !tokens.has(name)) {
        tokens.set(name, `${name} (${c.label || getFriendlyFieldLabel(name)})`);
      }
    });
    return Array.from(tokens.entries()).map(([field, label]) => ({ field, label }));
  }, [sources, columns]);

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
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-6 w-6 p-0 rounded-lg shrink-0 transition-colors ${
                        src.params && Object.keys(src.params).length > 0
                          ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
                          : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'
                      }`}
                      onClick={() => handleOpenSourceParams(src)}
                      title="Cấu hình tham số gọi API / Tham số lọc theo đơn vị cho nguồn này"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                    </Button>
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
                </div>
                {src.params && Object.keys(src.params).length > 0 && (
                  <div className="mb-2 p-1.5 bg-indigo-50/70 rounded-lg border border-indigo-100 flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] text-indigo-700 font-semibold flex items-center gap-1">
                      <SlidersHorizontal className="w-2.5 h-2.5" /> Tham số:
                    </span>
                    {Object.entries(src.params).map(([k, v]) => (
                      <span
                        key={k}
                        className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-indigo-200 text-indigo-800 font-medium"
                      >
                        {k}={String(v)}
                      </span>
                    ))}
                  </div>
                )}
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

          {/* Gợi ý Smart-Join Tự Động */}
          {smartJoinSuggestions.length > 0 && (
            <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl mb-3 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
                Gợi ý nối bảng tự động (Smart-Join)
              </div>
              <p className="text-[11px] text-amber-700">
                Hệ thống phát hiện các mối quan hệ nghiệp vụ tương ứng giữa các nguồn dữ liệu bạn đã chọn. Bấm để tự động áp dụng:
              </p>
              <div className="flex flex-wrap gap-2 pt-0.5">
                {smartJoinSuggestions.map((rule, idx) => (
                  <Button
                    key={idx}
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleApplySmartJoin(rule)}
                    className="bg-white hover:bg-amber-100 border-amber-300 text-amber-900 text-xs h-7 px-2.5 font-medium flex items-center gap-1.5 shadow-2xs"
                  >
                    <Link2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>{rule.description}</span>
                    <Badge className="ml-1 bg-amber-200 text-amber-800 text-[10px] px-1 py-0 border-none font-bold">
                      Áp dụng 1-click
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>
          )}

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

      {/* ────────────────── KHỐI 2: CẤU HÌNH ĐỊNH HƯỚNG LĂNG KÍNH & BỘ LỌC DỮ LIỆU (SCOPE DIMENSIONS & FILTERS) ────────────────── */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 w-full min-w-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-600 shrink-0" />
            <h3 className="font-bold text-base text-slate-800">
              Cấu hình Định Hướng Lăng Kính & Bộ Lọc Dữ Liệu
            </h3>
            <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200 font-medium shrink-0 ml-1">
              {filters.length} điều kiện lọc
            </Badge>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Mẫu Báo Cáo Chuẩn Chung (Master Template)
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          Báo cáo được thiết kế theo cấu trúc biểu đồ chuẩn dùng chung cho toàn hệ thống. Khi hoàn thành và chia sẻ, người dùng sẽ tự động xem được số liệu tương ứng theo thẩm quyền: <strong>Toàn tỉnh</strong>, <strong>Theo Lĩnh vực phụ trách</strong> hoặc <strong>Theo Đơn vị cụ thể</strong>.
        </p>

        {/* 1. LỰA CHỌN LĂNG KÍNH DỮ LIỆU THỬ NGHIỆM KHI THIẾT KẾ */}
        <div className="mb-5 p-4 rounded-xl bg-gradient-to-r from-indigo-50/50 via-slate-50 to-white border border-indigo-100/80">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2.5">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-600" />
              Thử nghiệm lăng kính số liệu hiển thị trên Canvas:
            </span>
            <span className="text-[11px] text-slate-500">
              Đang thử nghiệm: <strong className="text-indigo-700">{selectedUnitScope === 'ALL' ? 'Toàn tỉnh (Tất cả đơn vị)' : `${DAKLAK_UNITS.find(u => u.code === selectedUnitScope)?.name || selectedUnitScope} (${selectedUnitScope})`}</strong>
            </span>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {/* Lăng kính Toàn Tỉnh */}
            <Button
              type="button"
              variant={selectedUnitScope === 'ALL' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleApplyUnitScope('ALL', 'Toàn tỉnh')}
              className={`text-xs h-8 rounded-lg font-medium transition-all ${
                selectedUnitScope === 'ALL'
                  ? 'bg-slate-800 hover:bg-slate-900 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              Toàn tỉnh (Tổng hợp cấp Tỉnh)
            </Button>

            {/* Lăng kính Ban Tổ Chức Tỉnh Ủy */}
            <Button
              type="button"
              variant={selectedUnitScope === 'A15.05' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleApplyUnitScope('A15.05', 'Ban Tổ chức Tỉnh ủy Đắk Lắk')}
              className={`text-xs h-8 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                selectedUnitScope === 'A15.05'
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md ring-2 ring-indigo-300 ring-offset-1'
                  : 'bg-indigo-50/80 hover:bg-indigo-100 text-indigo-800 border-indigo-300 font-semibold'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Ban Tổ chức Tỉnh ủy (A15.05)
              {selectedUnitScope === 'A15.05' && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
            </Button>

            {/* Các đơn vị phổ biến khác */}
            {DAKLAK_UNITS.filter((u) => u.code !== 'A15.05').slice(0, 4).map((unit) => (
              <Button
                key={unit.code}
                type="button"
                variant={selectedUnitScope === unit.code ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleApplyUnitScope(unit.code, unit.name)}
                className={`text-xs h-8 rounded-lg font-medium transition-all ${
                  selectedUnitScope === unit.code
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {unit.name.replace(' Đắk Lắk', '').replace(' (BTCTU)', '')} ({unit.code})
              </Button>
            ))}

            {/* Dropdown danh sách tất cả đơn vị */}
            <select
              value={selectedUnitScope}
              onChange={(e) => {
                const val = e.target.value;
                const unit = DAKLAK_UNITS.find((u) => u.code === val);
                handleApplyUnitScope(val, unit?.name || val);
              }}
              className="text-xs h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">-- Thử nghiệm đơn vị khác --</option>
              {DAKLAK_UNITS.map((unit) => (
                <option key={unit.code} value={unit.code}>
                  [{unit.group}] {unit.name} ({unit.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2. KHỐI THIẾT LẬP ĐIỀU KIỆN LỌC BÁM SÁT CÁC TRƯỜNG CỦA API / SQL */}
        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 mb-4">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <h4 className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-indigo-600" />
              Thêm Điều kiện Lọc Bám theo Các Trường của API / Bảng Dữ Liệu
            </h4>
            <span className="text-[11px] text-slate-400">
              Nguồn: <strong className="text-slate-700">{activeFilterSourceObj?.name || 'Chưa chọn'}</strong>
            </span>
          </div>

          {/* Quick Field Chips: Nút bấm chọn nhanh các trường thực tế của API */}
          {activeFilterFields.length > 0 && (
            <div className="mb-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-500 font-medium">Trường API trả về:</span>
              {activeFilterFields.map((field) => (
                <button
                  key={field}
                  type="button"
                  onClick={() => setFilterField(field)}
                  className={`text-[11px] px-2 py-0.5 rounded-md font-mono transition-colors flex items-center gap-1 border ${
                    filterField === field
                      ? 'bg-indigo-600 text-white border-indigo-600 font-semibold shadow-xs'
                      : 'bg-white hover:bg-indigo-50 text-slate-700 border-slate-200 hover:border-indigo-200'
                  }`}
                  title={`${getFriendlyFieldLabel(field)} (${field})`}
                >
                  <span>{getFriendlyFieldLabel(field)}</span>
                  <span className={`text-[9px] ${filterField === field ? 'text-indigo-200' : 'text-slate-400'}`}>
                    ({field})
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Form thêm filter */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
            {sources.length > 1 && (
              <div className="sm:col-span-3">
                <label className="text-[11px] font-medium text-slate-600 block mb-1">
                  Nguồn dữ liệu
                </label>
                <select
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value)}
                  className="w-full text-xs h-9 px-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {sources.map((src) => (
                    <option key={src.id} value={src.id}>
                      {src.name || src.id}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className={sources.length > 1 ? 'sm:col-span-3' : 'sm:col-span-4'}>
              <label className="text-[11px] font-medium text-slate-600 block mb-1">
                Trường dữ liệu lọc
              </label>
              <select
                value={filterField}
                onChange={(e) => setFilterField(e.target.value)}
                className="w-full text-xs h-9 px-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              >
                {activeFilterFields.map((f) => (
                  <option key={f} value={f}>
                    {getFriendlyFieldLabel(f)} ({f})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-medium text-slate-600 block mb-1">
                Toán tử so sánh
              </label>
              <select
                value={filterOperator}
                onChange={(e) => setFilterOperator(e.target.value as FilterOperator)}
                className="w-full text-xs h-9 px-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              >
                <option value="eq">= (Bằng)</option>
                <option value="neq">!= (Khác)</option>
                <option value="contains">Chứa (LIKE)</option>
                <option value="gt">&gt; (Lớn hơn)</option>
                <option value="gte">&gt;= (Lớn hơn hoặc bằng)</option>
                <option value="lt">&lt; (Nhỏ hơn)</option>
                <option value="lte">&lt;= (Nhỏ hơn hoặc bằng)</option>
                <option value="in">Thuộc tập hợp (IN)</option>
              </select>
            </div>

            <div className={sources.length > 1 ? 'sm:col-span-3' : 'sm:col-span-4'}>
              <label className="text-[11px] font-medium text-slate-600 block mb-1">
                Giá trị lọc
              </label>
              <input
                type="text"
                placeholder="VD: A15.05, Báo cáo..."
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomFilter();
                  }
                }}
                className="w-full text-xs h-9 px-3 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <Button
                type="button"
                onClick={handleAddCustomFilter}
                className="w-full h-9 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm bộ lọc
              </Button>
            </div>
          </div>
        </div>

        {/* 3. DANH SÁCH BỘ LỌC ĐANG ÁP DỤNG */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700">
              Các điều kiện lọc đang có hiệu lực trong báo cáo:
            </span>
            {filters.length > 0 && (
              <button
                type="button"
                onClick={() => handleApplyUnitScope('ALL', 'Toàn tỉnh')}
                className="text-[11px] text-red-600 hover:text-red-700 font-medium"
              >
                Xóa tất cả bộ lọc
              </button>
            )}
          </div>

          {filters.length === 0 ? (
            <div className="p-3 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-slate-400 text-xs flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                Chưa có điều kiện lọc nào. Báo cáo đang tổng hợp số liệu <strong>toàn tỉnh (tất cả các đơn vị)</strong>. Hãy nhấp chọn đơn vị ở thanh công cụ phía trên để thiết kế báo cáo cho từng đơn vị cụ thể.
              </span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {filters.map((flt, idx) => {
                const isUnitFilter = ['from_organ_id', 'departmentId', 'dia_ban'].includes(flt.field);
                const matchedUnit = isUnitFilter ? DAKLAK_UNITS.find((u) => u.code === flt.value) : null;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs shadow-xs transition-colors ${
                      isUnitFilter
                        ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900 font-medium'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    {isUnitFilter && <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                    <span className="font-semibold text-slate-800">
                      {getFriendlyFieldLabel(flt.field)}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">({flt.field})</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px] font-bold">
                      {flt.operator}
                    </span>
                    <span className="font-bold text-indigo-700 font-mono">
                      "{matchedUnit ? `${matchedUnit.name} (${flt.value})` : flt.value}"
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFilter(idx)}
                      className="ml-1 p-0.5 hover:bg-slate-200 rounded text-slate-400 hover:text-red-600 transition-colors"
                      title="Xóa điều kiện này"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ────────────────── KHỐI 3: CỘT KẾT QUẢ & BIẾN ĐỔI DỮ LIỆU ────────────────── */}
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
              variant="outline"
              onClick={handleOpenAddCalculatedColumn}
              className="text-amber-700 border-amber-300 bg-amber-50/60 hover:bg-amber-100 text-xs h-8 shadow-xs flex items-center gap-1.5"
              title="Thêm cột tính toán tùy biến bằng công thức (fx) tự động ghép nối số liệu"
            >
              <Calculator className="w-3.5 h-3.5 text-amber-600" />
              Thêm cột tính toán (fx)
            </Button>

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
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <span
                          className="text-xs font-bold text-slate-800 block truncate"
                          title={col.label || col.field || col.key}
                        >
                          {col.label || col.field || col.key}
                        </span>
                        {(col.isCalculated || col.formula) && (
                          <Badge
                            variant="secondary"
                            className="text-[9px] px-1 py-0 bg-amber-50 text-amber-700 border border-amber-200 shrink-0 font-mono"
                          >
                            fx
                          </Badge>
                        )}
                      </div>
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
                      {col.formula ? (
                        <span
                          className="truncate text-amber-700 bg-amber-50/70 px-1 rounded"
                          title={`Công thức: ${col.formula}`}
                        >
                          fx: {col.formula}
                        </span>
                      ) : (
                        <span className="truncate">Trường: {col.field || col.key}</span>
                      )}
                      {col.source && !col.isCalculated && (
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
            {/* Chế độ: Trường dữ liệu gốc hoặc Cột tính toán bằng công thức (fx) */}
            <div className="flex items-center justify-between p-3 bg-slate-50/90 rounded-xl border border-slate-200">
              <div className="min-w-0 pr-2">
                <span className="text-xs font-semibold text-slate-800 block">
                  Cột tính toán bằng công thức (fx)
                </span>
                <span className="text-[11px] text-slate-500">
                  Tự động ghép nối, tính tỷ lệ % hoặc biểu thức điều kiện từ các trường
                </span>
              </div>
              <input
                type="checkbox"
                checked={colForm.isCalculated}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setColForm((prev) => ({
                    ...prev,
                    isCalculated: checked,
                    type: checked ? 'number' : prev.type,
                    field:
                      checked && !prev.field.startsWith('calc_')
                        ? `calc_${Date.now().toString().slice(-4)}`
                        : prev.field,
                  }));
                }}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
              />
            </div>

            {colForm.isCalculated ? (
              <div className="space-y-3.5 bg-amber-50/40 p-3.5 rounded-xl border border-amber-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-amber-700" />
                    Biểu Thức Công Thức (Formula fx)
                  </label>
                  <span className="text-[10px] text-amber-700 font-mono">+, -, *, /, %</span>
                </div>

                <textarea
                  value={colForm.formula}
                  onChange={(e) =>
                    setColForm((prev) => ({ ...prev, formula: e.target.value }))
                  }
                  rows={3}
                  placeholder="Ví dụ: ([completedTasks] / ([totalTasks] || 1)) * 100"
                  className="w-full text-xs font-mono p-2.5 bg-white border border-amber-300 rounded-lg text-slate-800 outline-none focus:ring-1 focus:ring-amber-500 shadow-xs"
                />

                {/* Token pills to insert */}
                <div>
                  <span className="text-[11px] font-medium text-amber-800 block mb-1">
                    Nhấp vào trường để chèn vào công thức:
                  </span>
                  <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto p-1.5 bg-white/90 rounded-lg border border-amber-200/80">
                    {allAvailableTokens.length > 0 ? (
                      allAvailableTokens.map((t) => (
                        <button
                          key={t.field}
                          type="button"
                          onClick={() =>
                            setColForm((prev) => ({
                              ...prev,
                              formula: `${prev.formula ? prev.formula + ' ' : ''}[${t.field}]`,
                            }))
                          }
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100/70 hover:bg-amber-200 text-amber-900 border border-amber-200 transition-colors"
                          title={t.label}
                        >
                          + [{t.field}]
                        </button>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">
                        Chưa có trường nào từ nguồn dữ liệu
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Formula Templates */}
                <div className="pt-2 border-t border-amber-200/70">
                  <span className="text-[11px] font-medium text-amber-800 block mb-1">
                    Mẫu công thức phổ biến:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setColForm((prev) => ({
                          ...prev,
                          formula: '([completedTasks] / ([totalTasks] || 1)) * 100',
                          label: prev.label || 'Tỷ lệ hoàn thành nhiệm vụ (%)',
                        }))
                      }
                      className="text-[10px] px-2 py-0.5 rounded bg-white border border-amber-300 hover:bg-amber-100 text-slate-700 font-medium"
                    >
                      Tỷ lệ hoàn thành %
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setColForm((prev) => ({
                          ...prev,
                          formula:
                            '[totalScore] >= 90 ? "Xuất sắc" : [totalScore] >= 70 ? "Hoàn thành tốt" : "Chưa đạt"',
                          type: 'string',
                          label: prev.label || 'Xếp loại chất lượng',
                        }))
                      }
                      className="text-[10px] px-2 py-0.5 rounded bg-white border border-amber-300 hover:bg-amber-100 text-slate-700 font-medium"
                    >
                      Xếp loại đánh giá
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setColForm((prev) => ({
                          ...prev,
                          formula:
                            '([kpiScore] || 0) * 0.4 + ([qualityScore] || 0) * 0.6',
                          label: prev.label || 'Điểm tổng hợp trọng số',
                        }))
                      }
                      className="text-[10px] px-2 py-0.5 rounded bg-white border border-amber-300 hover:bg-amber-100 text-slate-700 font-medium"
                    >
                      Trọng số 40/60
                    </button>
                  </div>
                </div>

                {/* Mã định danh trường tính toán */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mã Định Danh Cột (Field Key)
                  </label>
                  <input
                    type="text"
                    value={colForm.field}
                    onChange={(e) =>
                      setColForm((prev) => ({ ...prev, field: e.target.value }))
                    }
                    placeholder="calc_kpi_ratio"
                    className="w-full border border-slate-200 text-xs p-2 rounded-xl font-mono text-slate-800 outline-none focus:border-indigo-500 bg-white"
                  />
                </div>
              </div>
            ) : (
              <>
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
              </>
            )}

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

      {/* ───────────────────────── SHEET: CẤU HÌNH THAM SỐ API NGUỒN ───────────────────────── */}
      <Sheet
        open={Boolean(editingParamsSourceId)}
        onOpenChange={(open) => {
          if (!open) setEditingParamsSourceId(null);
        }}
      >
        <SheetContent side="right" className="w-[420px] sm:w-[540px] overflow-y-auto">
          <SheetHeader className="mb-5 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
              <SheetTitle className="text-base font-bold text-slate-800">
                Tham Số Gọi API & Lọc Đơn Vị Nguồn
              </SheetTitle>
            </div>
            <SheetDescription className="text-xs text-slate-500">
              Cấu hình các tham số query parameters hoặc filter mặc định khi gọi API từ nguồn dữ liệu.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 py-2">
            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-indigo-900">
                  Phím tắt gán nhanh đơn vị vào tham số API:
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSourceParamsForm((prev) => ({
                      ...prev,
                      from_organ_id: 'A15.05',
                    }));
                    toast.success('Đã gán tham số from_organ_id = A15.05 (Ban Tổ chức Tỉnh ủy).');
                  }}
                  className="text-xs h-7 bg-white hover:bg-indigo-100 text-indigo-700 border-indigo-200"
                >
                  Gán Ban Tổ chức Tỉnh ủy (A15.05)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSourceParamsForm((prev) => {
                      const next = { ...prev };
                      delete next.from_organ_id;
                      delete next.organ_id;
                      return next;
                    });
                    toast.success('Đã xóa tham số đơn vị (Lấy toàn tỉnh).');
                  }}
                  className="text-xs h-7 bg-white hover:bg-slate-100 text-slate-600 border-slate-200"
                >
                  Xóa lọc đơn vị
                </Button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                from_organ_id (Mã định danh cơ quan/đơn vị)
              </label>
              <input
                type="text"
                value={sourceParamsForm.from_organ_id || ''}
                onChange={(e) =>
                  setSourceParamsForm({
                    ...sourceParamsForm,
                    from_organ_id: e.target.value,
                  })
                }
                placeholder="VD: A15.05, H15.20..."
                className="w-full text-xs h-9 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Tham số này sẽ được truyền thẳng vào query string của API để backend chỉ lấy dữ liệu của cơ quan đó.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                period (Kỳ báo cáo)
              </label>
              <input
                type="text"
                value={sourceParamsForm.period || ''}
                onChange={(e) =>
                  setSourceParamsForm({
                    ...sourceParamsForm,
                    period: e.target.value,
                  })
                }
                placeholder="VD: 2026-Q1, 2026-10..."
                className="w-full text-xs h-9 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Tham số tùy chỉnh khác (Dạng key=value)
              </label>
              <div className="space-y-2">
                {Object.entries(sourceParamsForm)
                  .filter(([k]) => !['from_organ_id', 'period'].includes(k))
                  .map(([k, v]) => (
                    <div key={k} className="flex items-center gap-2">
                      <span className="text-xs font-mono font-medium text-slate-700 w-28 truncate">
                        {k}:
                      </span>
                      <input
                        type="text"
                        value={String(v)}
                        onChange={(e) =>
                          setSourceParamsForm({
                            ...sourceParamsForm,
                            [k]: e.target.value,
                          })
                        }
                        className="flex-1 text-xs h-8 px-2.5 rounded-lg border border-slate-200 font-mono"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const next = { ...sourceParamsForm };
                          delete next[k];
                          setSourceParamsForm(next);
                        }}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <SheetFooter className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingParamsSourceId(null)}
              className="text-xs"
            >
              Hủy bỏ
            </Button>
            <Button
              size="sm"
              onClick={handleSaveSourceParams}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium"
            >
              Lưu tham số
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};
