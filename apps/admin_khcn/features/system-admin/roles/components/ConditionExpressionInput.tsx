import { useRef, useState } from "react";
import { Sparkles, Copy, ChevronDown } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FormLabel } from "@/components/ui/form";

// ============================================================================
// DATA: EXPRESSION TEMPLATES & AVAILABLE VARS
// ============================================================================
const EXPRESSION_TEMPLATES: {
  group: string;
  items: { label: string; description: string; value: string }[];
}[] = [
  {
    group: "👤 Người dùng",
    items: [
      { label: "Chỉ chủ sở hữu", description: "Chỉ ai tạo mới được thao tác", value: "resource.createdById == currentUser.id" },
      { label: "Cùng phòng ban", description: "Chỉ trong cùng phòng/ban", value: "resource.departmentId == currentUser.departmentId" },
      { label: "Cùng đơn vị", description: "Chỉ trong cùng đơn vị", value: "resource.unitId == currentUser.unitId" },
      { label: "Chính mình", description: "Chỉ được thao tác trên hồ sơ của mình", value: "resource.userId == currentUser.id" },
    ],
  },
  {
    group: "🏷️ Vai trò & Chức vụ",
    items: [
      { label: "Là quản lý", description: "Người dùng có chức vụ quản lý", value: "currentUser.isManager == true" },
      { label: "Là trưởng đơn vị", description: "Người dùng là trưởng đơn vị", value: "currentUser.isUnitHead == true" },
      { label: "Có vai trò ADMIN", description: "Người dùng mang vai trò ADMIN", value: "currentUser.roles.includes('ADMIN')" },
    ],
  },
  {
    group: "📋 Trạng thái tài nguyên",
    items: [
      { label: "Trạng thái Draft", description: "Tài nguyên đang ở trạng thái nháp", value: "resource.status == 'DRAFT'" },
      { label: "Chưa phê duyệt", description: "Tài nguyên chưa được phê duyệt", value: "resource.status == 'PENDING'" },
      { label: "Đang hoạt động", description: "Tài nguyên đang hoạt động", value: "resource.isActive == true" },
    ],
  },
  {
    group: "🔗 Kết hợp (AND / OR)",
    items: [
      { label: "Chủ sở hữu HOẶC Quản lý", description: "Chủ sở hữu hoặc quản lý cùng phòng", value: "resource.createdById == currentUser.id || currentUser.isManager == true" },
      { label: "Cùng đơn vị VÀ là quản lý", description: "Quản lý trong cùng đơn vị", value: "resource.unitId == currentUser.unitId && currentUser.isManager == true" },
      { label: "Chính mình HOẶC ADMIN", description: "Bản thân hoặc quản trị viên", value: "resource.userId == currentUser.id || currentUser.roles.includes('ADMIN')" },
    ],
  },
];

const AVAILABLE_VARS = [
  { name: "currentUser.id", desc: "ID người dùng hiện tại" },
  { name: "currentUser.departmentId", desc: "ID phòng ban" },
  { name: "currentUser.unitId", desc: "ID đơn vị" },
  { name: "currentUser.isManager", desc: "Có phải quản lý" },
  { name: "currentUser.isUnitHead", desc: "Có phải trưởng đơn vị" },
  { name: "currentUser.roles", desc: "Danh sách vai trò" },
  { name: "resource.id", desc: "ID tài nguyên" },
  { name: "resource.createdById", desc: "ID người tạo" },
  { name: "resource.departmentId", desc: "ID phòng ban tài nguyên" },
  { name: "resource.unitId", desc: "ID đơn vị tài nguyên" },
  { name: "resource.userId", desc: "ID người sở hữu" },
  { name: "resource.status", desc: "Trạng thái tài nguyên" },
  { name: "resource.isActive", desc: "Tài nguyên đang hoạt động" },
];

// ============================================================================
// COMPONENT
// ============================================================================
interface ConditionExpressionInputProps {
  value: string;
  onChange: (v: string) => void;
}

export default function ConditionExpressionInput({ value, onChange }: ConditionExpressionInputProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"templates" | "vars">("templates");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelectTemplate = (expr: string) => {
    onChange(expr);
    setOpen(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleInsertVar = (varName: string) => {
    const input = inputRef.current;
    if (!input) { onChange(value + varName); return; }
    const start = input.selectionStart ?? value.length;
    const end = input.selectionEnd ?? value.length;
    const next = value.slice(0, start) + varName + value.slice(end);
    onChange(next);
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + varName.length, start + varName.length);
    }, 10);
  };

  return (
    <div className="flex-1 space-y-1">
      <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
        <Sparkles className="h-3 w-3 text-primary" /> Điều kiện động (Expression)
      </FormLabel>
      <div className="flex gap-1.5">
        <Input
          ref={inputRef}
          placeholder="Bỏ trống = Luôn cho phép"
          className="h-8 text-xs font-mono placeholder:font-sans flex-1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs gap-1.5 shrink-0 border-primary/40 text-primary hover:bg-primary/10"
            >
              <Sparkles className="h-3 w-3" />
              Gợi ý
              <ChevronDown className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[480px] p-0 shadow-xl" sideOffset={6}>
            {/* Tabs */}
            <div className="flex border-b bg-muted/30">
              {(["templates", "vars"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2.5 text-xs font-bold transition-colors ${
                    tab === t
                      ? "text-primary border-b-2 border-primary bg-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "templates" ? "📋 Mẫu biểu thức" : "🧩 Biến khả dụng"}
                </button>
              ))}
            </div>

            {tab === "templates" && (
              <div className="max-h-[360px] overflow-y-auto p-3 space-y-4">
                {EXPRESSION_TEMPLATES.map((group) => (
                  <div key={group.group}>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                      {group.group}
                    </p>
                    <div className="space-y-1.5">
                      {group.items.map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => handleSelectTemplate(item.value)}
                          className="w-full text-left px-3 py-2.5 rounded-lg border bg-background hover:border-primary/50 hover:bg-primary/5 transition-all group"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                              {item.label}
                            </span>
                            <Copy className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{item.description}</p>
                          <code className="text-[10px] font-mono text-primary/70 mt-1 block truncate">
                            {item.value}
                          </code>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "vars" && (
              <div className="max-h-[360px] overflow-y-auto p-3">
                <p className="text-[10px] text-muted-foreground mb-3">
                  Click vào biến để chèn vào vị trí con trỏ:
                </p>
                <div className="grid grid-cols-1 gap-1">
                  {AVAILABLE_VARS.map((v) => (
                    <button
                      key={v.name}
                      type="button"
                      onClick={() => handleInsertVar(v.name)}
                      className="flex items-center justify-between px-3 py-2 rounded-lg border bg-background hover:border-primary/50 hover:bg-primary/5 transition-all group text-left"
                    >
                      <code className="text-[11px] font-mono text-primary font-semibold">{v.name}</code>
                      <span className="text-[10px] text-muted-foreground">{v.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t p-2.5 bg-muted/20">
              <p className="text-[9px] text-muted-foreground text-center">
                Chọn mẫu để điền tự động • Click biến để chèn tại vị trí con trỏ
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      {value && (
        <p className="text-[10px] text-primary/80 italic flex items-center gap-1">
          <Sparkles className="h-2.5 w-2.5" /> Áp dụng điều kiện động
        </p>
      )}
    </div>
  );
}
