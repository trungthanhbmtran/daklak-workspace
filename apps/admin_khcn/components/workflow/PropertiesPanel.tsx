import React from "react";
import { Node, Edge } from "@xyflow/react";
import {
  Settings2,
  Trash2,
  Info,
  FileText,
  Activity,
  Plus,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface PropertiesPanelProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedNode: Node | null;
  selectedEdge?: Edge | null;
  availableServices?: any[];
  availableTriggers?: any[];
  taskRoles?: any[];
  /** Vị trí/chức danh tổ chức từ DB (JobTitle) — thay thế SYSTEM_ROLES hardcode */
  orgRoles?: { code: string; name: string; rank?: number; authorityLevel?: string; category?: string }[];
  onUpdate: (id: string, data: any) => void;
  onUpdateEdge?: (id: string, data: any) => void;
  onDelete: (id: string) => void;
  onDeleteEdge?: (id: string) => void;
  onClose: () => void;
  workflowDesc: string;
  setWorkflowDesc: (desc: string) => void;
  workflowCode: string;
  setWorkflowCode: (code: string) => void;
}

/** Vai trò cố định theo ngữ cảnh task (participant roles) — không liên quan đến tổ chức */
const TASK_PARTICIPANT_ROLES = [
  { code: 'OWNER', name: 'Người giao việc (OWNER)' },
  { code: 'ASSIGNEE', name: 'Người xử lý chính (ASSIGNEE)' },
  { code: 'COORDINATOR', name: 'Người phối hợp (COORDINATOR)' },
  { code: 'APPROVER', name: 'Người chỉ đạo/Theo dõi (APPROVER)' },
  { code: 'ADMIN', name: 'Quản trị viên hệ thống (ADMIN)' },
];

export const PropertiesPanel = ({
  isOpen,
  onOpenChange,
  selectedNode,
  selectedEdge,
  availableServices = [],
  availableTriggers = [],
  taskRoles = [],
  orgRoles = [],
  onUpdate,
  onUpdateEdge,
  onDelete,
  onDeleteEdge,
  onClose,
  workflowDesc,
  setWorkflowDesc,
  workflowCode,
  setWorkflowCode
}: PropertiesPanelProps) => {
  const [activeRoleGroups, setActiveRoleGroups] = React.useState<Record<string, string>>({});
  const data = selectedNode ? (selectedNode.data || {}) as any : (selectedEdge ? selectedEdge : {} as any);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (selectedNode) {
      onUpdate(selectedNode.id, { ...data, [name]: value });
    } else if (selectedEdge && onUpdateEdge) {
      if (name === "label") {
        onUpdateEdge(selectedEdge.id, { ...selectedEdge, label: value });
      } else {
        onUpdateEdge(selectedEdge.id, { ...selectedEdge, data: { ...(selectedEdge.data || {}), [name]: value } });
      }
    }
  };

  const renderFields = () => {
    if (!selectedNode && !selectedEdge) {
      return (
        <div className="space-y-6">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase mb-2.5 flex items-center gap-2">
              <Activity className="h-3.5 w-3.5" /> Mã quy trình (Code)
            </label>
            <Input
              value={workflowCode || ""}
              onChange={(e) => setWorkflowCode(e.target.value)}
              className="w-full bg-background border border-border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="Nhập mã quy trình (VD: TASK_PROCESSING)..."
            />
            <p className="text-[10px] text-muted-foreground mt-2 italic">
              Mã định danh duy nhất của quy trình.
            </p>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase mb-2.5  flex items-center gap-2">
              <FileText className="h-3.5 w-3.5" /> Mô tả quy trình
            </label>
            <Textarea
              value={workflowDesc}
              onChange={(e) => setWorkflowDesc(e.target.value)}
              placeholder="Nhập mô tả cho quy trình này..."
              className="min-h-[150px] rounded-xl bg-muted/30 border-border/40 focus-visible:ring-primary/20 resize-none text-sm"
            />
          </div>
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
            <h4 className="text-xs font-bold text-primary uppercase mb-2">Hướng dẫn nhanh</h4>
            <ul className="text-[11px] text-muted-foreground space-y-2 list-disc pl-4">
              <li>Kéo thả các node từ thanh công cụ bên trái.</li>
              <li>Kết nối các node để tạo luồng xử lý.</li>
              <li>Nhấp vào một node hoặc đường nối (edge) để cấu hình chi tiết.</li>
              <li>Đừng quên lưu bản nháp thường xuyên.</li>
            </ul>
          </div>
        </div>
      );
    }

    if (selectedEdge) {
      const edgeData = selectedEdge.data || {};
      return (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
              Tên thao tác (Label)
            </label>
            <Input type="text"
              name="label"
              value={(selectedEdge.label as string) || ""}
              onChange={handleChange}
              className="w-full bg-background border border-border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all uppercase"
              placeholder="VD: APPROVE, REJECT, KÝ DUYỆT"
            />
            <p className="text-[10px] text-muted-foreground mt-1.5">
              Tên hiển thị trên sơ đồ quy trình.
            </p>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
              Mã rẽ nhánh (Action Code)
            </label>
            <Input type="text"
              name="actionName"
              value={(edgeData.actionName as string) || ""}
              onChange={handleChange}
              className="w-full bg-background border border-border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all uppercase"
              placeholder="VD: APPROVE, REJECT, SUBMIT"
            />
            <p className="text-[10px] text-muted-foreground mt-1.5">
              Mã tiếng Anh dùng trong xử lý logic (VD: APPROVE). Nếu để trống, sẽ dùng Tên thao tác (Label).
            </p>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
              Biểu thức rẽ nhánh (Expression)
            </label>
            <div className="flex gap-2 mb-2">
              <Button
                variant="outline"
                size="sm"
                className="text-[10px] h-7 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                onClick={() => {
                  onUpdateEdge && onUpdateEdge(selectedEdge.id, { 
                    ...selectedEdge, 
                    label: "Phê duyệt",
                    data: { ...(selectedEdge.data || {}), actionName: "APPROVE", expression: "status === 'APPROVED'" } 
                  });
                }}
              >
                Phê duyệt (Approved)
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-[10px] h-7 bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                onClick={() => {
                  onUpdateEdge && onUpdateEdge(selectedEdge.id, { 
                    ...selectedEdge, 
                    label: "Từ chối",
                    data: { ...(selectedEdge.data || {}), actionName: "REJECT", expression: "status === 'REJECTED'", sideEffects: ['RETURN_TASK'] } 
                  });
                }}
              >
                Từ chối (Rejected)
              </Button>
            </div>
            <div className="relative group">
              <div className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-violet-500 transition-colors">
                <span className="font-mono text-xs font-bold bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">fx</span>
              </div>
              <Textarea
                name="expression"
                value={(edgeData.expression as string) || ""}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 pl-12 text-sm font-mono focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all min-h-[100px] resize-y leading-relaxed"
                placeholder={`// Viết biểu thức JavaScript (dành cho Gateway)\ne.g. status === 'APPROVED'`}
                spellCheck={false}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">
              Áp dụng nếu đường nối đi ra từ Exclusive Gateway. Trả về true để rẽ vào nhánh này.
            </p>
          </div>
        </div>
      );
    }

    if (!selectedNode) return null;
    
    const { type } = selectedNode;

    switch (type) {
      case "user_task":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
                Mã hành động nghiệp vụ (Action)
              </label>
              <Input type="text"
                name="actionName"
                value={data.actionName || ""}
                onChange={handleChange}
                className="w-full bg-background border border-border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all uppercase"
                placeholder="VD: ASSIGN, APPROVE, IN_PROGRESS"
              />
              <p className="text-[10px] text-muted-foreground mt-1.5">
                Mã này giúp backend nhận diện bước này đóng vai trò gì.
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
                Trạng thái mục tiêu (Target Status)
              </label>
              <Input type="text"
                name="targetStatus"
                value={data.targetStatus || ""}
                onChange={handleChange}
                className="w-full bg-background border border-border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all uppercase"
                placeholder="VD: PENDING_APPROVAL, IN_PROGRESS"
              />
              <p className="text-[10px] text-muted-foreground mt-1.5">
                Trạng thái của công việc sẽ đổi thành mã này khi đi vào bước này. Bỏ trống sẽ giữ nguyên trạng thái cũ.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
                Chiến lược phân công (Scope)
              </label>
              <NativeSelect
                name="assignmentStrategy"
                value={data.assignmentStrategy || "ANY"}
                onChange={handleChange}
                className="w-full bg-background border border-border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                <NativeSelectOption value="ANY">Không giới hạn (Toàn hệ thống)</NativeSelectOption>
                <NativeSelectOption value="BY_DOMAIN">Theo Lĩnh vực phụ trách</NativeSelectOption>
                <NativeSelectOption value="BY_DEPARTMENT">Theo Phòng ban theo dõi</NativeSelectOption>
                <NativeSelectOption value="BY_GEO_AREA">Theo Địa bàn phụ trách</NativeSelectOption>
                <NativeSelectOption value="DIRECT_MANAGER">Cấp trên/dưới trực tiếp</NativeSelectOption>
                <NativeSelectOption value="ASSIGNER">Người giao việc</NativeSelectOption>
              </NativeSelect>
              <p className="text-[10px] text-muted-foreground mt-1.5">
                Backend sẽ dựa vào chiến lược này để đối chiếu với cấu trúc PBAC.
              </p>
            </div>
            

            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/10 mt-2">
              <label className="text-sm font-semibold text-primary">
                Gửi thông báo hệ thống
              </label>
              <Switch
                name="sendNotification"
                checked={data.sendNotification || false}
                onCheckedChange={(checked) => handleChange({ target: { name: 'sendNotification', value: checked } } as any)}
              />
            </div>

            {/* Dynamic Permissions Configuration */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 mt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cấu hình Quyền (Permissions)</h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-[10px] text-violet-600 hover:text-violet-700 hover:bg-violet-100"
                  onClick={() => {
                    const currentPerms = data.permissions || {};
                    // Generate a unique action name if NEW_ACTION exists
                    let newActionName = 'NEW_ACTION';
                    let counter = 1;
                    while (currentPerms[newActionName]) {
                      newActionName = `NEW_ACTION_${counter}`;
                      counter++;
                    }
                    onUpdate(selectedNode!.id, { 
                      ...data, 
                      permissions: { ...currentPerms, [newActionName]: ['PARTICIPANT'] } 
                    });
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" /> Thêm quyền
                </Button>
              </div>
              <div className="space-y-3">
                {Object.entries(data.permissions || {}).map(([action, roles]) => (
                  <div key={action} className="flex flex-col gap-1.5 p-2 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 flex flex-col gap-2">
                        <Input 
                          value={action} 
                          onChange={(e) => {
                            const newAction = e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '');
                            const newPerms = { ...data.permissions };
                            const oldRoles = newPerms[action];
                            // Preserve the key order by recreating the object
                            const updatedPerms: any = {};
                            for (const key of Object.keys(newPerms)) {
                              if (key === action) {
                                updatedPerms[newAction] = oldRoles;
                              } else {
                                updatedPerms[key] = newPerms[key];
                              }
                            }
                            onUpdate(selectedNode!.id, { ...data, permissions: updatedPerms });
                          }}
                          className="h-7 text-xs font-bold font-mono w-[130px] bg-slate-100 dark:bg-slate-900 border-none px-2"
                          placeholder="ACTION"
                        />
                        <div className="flex flex-wrap items-center gap-1.5">
                          {Array.isArray(roles) && roles.map((role: string) => (
                            <span key={role} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                              {role}
                              <button
                                type="button"
                                className="ml-1 text-violet-600 hover:text-violet-900 dark:text-violet-400 dark:hover:text-violet-200"
                                onClick={() => {
                                  const newRoles = roles.filter(r => r !== role);
                                  onUpdate(selectedNode!.id, { 
                                    ...data, 
                                    permissions: { ...data.permissions, [action]: newRoles } 
                                  });
                                }}
                              >
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </span>
                          ))}
                          <div className="flex items-center gap-1">
                            <select
                              className="h-6 text-[10px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-1 cursor-pointer outline-none hover:border-violet-300 text-slate-600 dark:text-slate-300"
                              value={activeRoleGroups[action] || ""}
                              onChange={(e) => setActiveRoleGroups({ ...activeRoleGroups, [action]: e.target.value })}
                            >
                              <option value="" disabled>+ Chọn nhóm</option>
                              <option value="TASK">Vai trò trong Task (Owner/Assignee...)</option>
                              {orgRoles.length > 0 && <option value="ORG">Vị trí tổ chức (Chức danh từ DB)</option>}
                              {taskRoles && taskRoles.length > 0 && <option value="PBAC">Quyền PBAC hệ thống</option>}
                            </select>

                            {activeRoleGroups[action] && (
                              <select
                                className="h-6 text-[10px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-1 cursor-pointer outline-none hover:border-violet-300 text-slate-600 dark:text-slate-300"
                                onChange={(e) => {
                                  const role = e.target.value;
                                  if (!role) return;
                                  const currentRoles = Array.isArray(roles) ? roles : [];
                                  const newRoles = [...currentRoles, role].filter((v, i, a) => a.indexOf(v) === i);
                                  onUpdate(selectedNode!.id, { 
                                    ...data, 
                                    permissions: { ...data.permissions, [action]: newRoles } 
                                  });
                                  e.target.value = ''; // reset after selection
                                  setActiveRoleGroups({ ...activeRoleGroups, [action]: "" }); // Reset group selection
                                }}
                                defaultValue=""
                              >
                                <option value="" disabled>+ Chọn quyền</option>
                                {/* Vai trò trong task (participant role) */}
                                {activeRoleGroups[action] === 'TASK' && TASK_PARTICIPANT_ROLES.map(r => (
                                  <option key={r.code} value={r.code}>{r.name}</option>
                                ))}
                                {/* Vị trí tổ chức từ DB — sắp xếp theo cấp bậc */}
                                {activeRoleGroups[action] === 'ORG' && orgRoles.map(r => (
                                  <option key={r.code} value={r.code}>
                                    {r.name}{r.authorityLevel ? ` [${r.authorityLevel}]` : ''} ({r.code})
                                  </option>
                                ))}
                                {/* Quyền PBAC hệ thống */}
                                {activeRoleGroups[action] === 'PBAC' && taskRoles.map((r: any) => (
                                  <option key={r.code} value={r.code}>{r.name || r.nameVi} ({r.code})</option>
                                ))}
                              </select>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
                        onClick={() => {
                          const newPerms = { ...data.permissions };
                          delete newPerms[action];
                          // If empty, we might want to delete the permissions object entirely to fallback to default
                          if (Object.keys(newPerms).length === 0) {
                            const newData = { ...data };
                            delete newData.permissions;
                            onUpdate(selectedNode!.id, newData);
                          } else {
                            onUpdate(selectedNode!.id, { ...data, permissions: newPerms });
                          }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
                {(!data.permissions || Object.keys(data.permissions).length === 0) && (
                  <p className="text-[10px] text-slate-400 text-center py-2">
                    Chưa có cấu hình quyền. Nút này sẽ sử dụng quyền mặc định của hệ thống.
                  </p>
                )}
              </div>
              <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                Người xử lý tại bước này sẽ tự động sở hữu các vai trò được cấp trong hệ thống. Hệ thống hợp nhất quyền mặc định và phân quyền tự động để duyệt tính năng hiển thị cho từng cá nhân cụ thể.
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
                Hoặc chỉ định Mã nhân sự cụ thể
              </label>
              <Input type="text"
                name="employeeCode"
                value={data.employeeCode || ""}
                onChange={handleChange}
                className="w-full bg-background border border-border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="VD: NV001"
              />
              <p className="text-[10px] text-muted-foreground mt-1.5">
                Nếu điền mã nhân sự, hệ thống sẽ ưu tiên giao việc trực tiếp thay vì giao theo vai trò PBAC.
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
                Yêu cầu xử lý
              </label>
              <Textarea
                name="description"
                value={data.description || ""}
                onChange={handleChange}
                className="w-full bg-background border border-border rounded-lg p-3 text-sm min-h-[100px] focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                placeholder="Mô tả công việc cần thực hiện ở bước này..."
              />
            </div>

            {/* Advanced Customization: Dynamic Forms */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
                Biểu mẫu động (Form Schema)
              </label>
              <Textarea
                name="formSchema"
                value={data.formSchema || ""}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm font-mono focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[100px] resize-y"
                placeholder={`[\n  { "name": "lyDo", "label": "Lý do", "type": "textarea", "required": true }\n]`}
                spellCheck={false}
              />
              <p className="text-[10px] text-muted-foreground mt-1.5">
                Cấu hình mảng JSON các trường thông tin bắt buộc/tùy chọn xuất hiện ở bước này.
              </p>
            </div>

            {/* Approval Evidence Configuration (Q2) */}
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 space-y-4 mt-2">
              <h4 className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Cấu hình Phê duyệt & Minh chứng
              </h4>

              {/* approvalRequired toggle */}
              <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-amber-100 dark:border-amber-900/40">
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Bắt buộc phê duyệt
                  </label>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Khi bật: Task chỉ hoàn thành khi người phụ trách trực tiếp phê duyệt.
                  </p>
                </div>
                <Switch
                  checked={data.approvalRequired || false}
                  onCheckedChange={(checked) => handleChange({ target: { name: 'approvalRequired', value: checked } } as any)}
                />
              </div>

              {/* approverType — Quy tắc cố định: người giao việc = người phê duyệt */}
              {data.approvalRequired && (
                <>
                  <div className="flex items-start gap-2.5 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-800/30 rounded-lg">
                    <span className="mt-0.5 text-amber-600 dark:text-amber-400 text-base">ℹ</span>
                    <div>
                      <p className="text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                        Người giao việc = Người phê duyệt kết quả
                      </p>
                      <p className="text-[10px] text-amber-700/80 dark:text-amber-400/80 mt-0.5 leading-relaxed">
                        Hệ thống tự động lấy <strong>OWNER</strong> của task (người đã giao việc) làm người phê duyệt. Không cần cấu hình thêm.
                      </p>
                    </div>
                  </div>

                  {/* evidenceType */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
                      Loại minh chứng yêu cầu
                    </label>
                    <NativeSelect
                      name="evidenceType"
                      value={data.evidenceType || "none"}
                      onChange={handleChange}
                      className="w-full bg-background border border-border rounded-lg p-2 text-sm focus:ring-2 focus:ring-amber-300 outline-none transition-all"
                    >
                      <NativeSelectOption value="none">Không yêu cầu minh chứng</NativeSelectOption>
                      <NativeSelectOption value="upload">Tệp đính kèm (Upload)</NativeSelectOption>
                      <NativeSelectOption value="api">Dữ liệu từ API ngoài</NativeSelectOption>
                      <NativeSelectOption value="both">Cả hai (Upload + API)</NativeSelectOption>
                    </NativeSelect>
                    <p className="text-[10px] text-muted-foreground mt-1.5">
                      Người thực hiện cần cung cấp minh chứng hoàn thành theo dạng này.
                    </p>
                  </div>

                  {/* apiSource — chỉ hiện khi evidenceType là api hoặc both */}
                  {(data.evidenceType === 'api' || data.evidenceType === 'both') && (
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
                        Nguồn dữ liệu API
                      </label>
                      <Input
                        name="apiSource"
                        value={data.apiSource || ""}
                        onChange={handleChange}
                        className="w-full bg-background border border-border rounded-lg p-2 text-sm focus:ring-2 focus:ring-amber-300 outline-none transition-all font-mono"
                        placeholder="VD: /api/kpi/results?taskId={{taskId}}"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1.5">
                        URL endpoint trả về dữ liệu đánh giá. Dùng <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">{"{{taskId}}"}</code> để inject ID task hiện tại.
                      </p>
                    </div>
                  )}

                  {/* Notification template khi cần phê duyệt */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
                      Mẫu thông báo yêu cầu phê duyệt
                    </label>
                    <Textarea
                      name="approvalNotificationTemplate"
                      value={data.approvalNotificationTemplate || ""}
                      onChange={handleChange}
                      className="w-full bg-background border border-border rounded-lg p-2 text-sm min-h-[70px] focus:ring-2 focus:ring-amber-300 outline-none transition-all resize-none"
                      placeholder={`VD: "{{assigneeName}} đã hoàn thành \"{{taskTitle}}\". Vui lòng kiểm tra và phê duyệt."`}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Advanced Customization: Side Effects */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
                Hành động phụ (Side Effects / Webhooks)
              </label>
              <Textarea
                name="sideEffects"
                value={data.sideEffects || ""}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm font-mono focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[80px] resize-y"
                placeholder={`[\n  { "type": "WEBHOOK", "url": "https://..." }\n]`}
                spellCheck={false}
              />
              <p className="text-[10px] text-muted-foreground mt-1.5">
                Mảng JSON mô tả các hệ thống cần gọi (Trigger API, Gửi email ngoại,...) khi bước này xử lý.
              </p>
            </div>
          </div>
        );

      case "script_task":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
                Mã kịch bản (Script / Expression)
              </label>
              <Textarea
                name="expression"
                value={data.expression || ""}
                onChange={handleChange}
                className="w-full bg-background border border-border rounded-lg p-3 text-sm min-h-[150px] font-mono focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                placeholder="Math.random() > 0.5 ? 'approved' : 'rejected'"
              />
            </div>
          </div>
        );
      case "parallel_gateway":
      case "exclusive_gateway":
        return (
          <div className="space-y-4">
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex gap-2">
                <Info className="h-4 w-4 text-orange-600 shrink-0" />
                <p className="text-[11px] text-orange-800 leading-normal">
                  {type === "exclusive_gateway"
                    ? "Sử dụng Edit Edge (đường nối) để cấu hình biểu thức rẽ nhánh (expression)."
                    : "Tất cả các luồng đầu ra sẽ thực thi song song. Hệ thống tự động chờ (Join) ở các nút tiếp theo nếu có nhiều nhánh đi vào."}
                </p>
              </div>
            </div>
          </div>
        );

      case "service_task":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
                Dịch vụ mục tiêu
              </label>
              <NativeSelect
                name="service"
                value={data.service || ""}
                onChange={handleChange}
                className="w-full bg-background border border-border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                <NativeSelectOption value="">Chọn microservice...</NativeSelectOption>
                {availableServices.map((svc: any) => (
                  <NativeSelectOption key={svc.code || svc.id} value={svc.code || svc.id}>
                    {svc.name || svc.title}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
                Hành động
              </label>
              <NativeSelect
                name="action"
                value={data.action || ""}
                onChange={handleChange}
                className="w-full bg-background border border-border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                <NativeSelectOption value="">Chọn hành động...</NativeSelectOption>
                {(data.service === 'user-service' || data.service === 'USER_SERVICE') && (
                  <>
                    <NativeSelectOption value="findOne">Tìm kiếm người dùng</NativeSelectOption>
                    <NativeSelectOption value="setUserActive">Kích hoạt tài khoản</NativeSelectOption>
                  </>
                )}
                {(data.service === 'hrm-service' || data.service === 'HRM_SERVICE') && (
                  <>
                    <NativeSelectOption value="getEmployee">Lấy thông tin nhân sự</NativeSelectOption>
                    <NativeSelectOption value="updateContract">Cập nhật hợp đồng</NativeSelectOption>
                  </>
                )}
                {(data.service === 'posts-service' || data.service === 'POST_SERVICE') && (
                  <>
                    <NativeSelectOption value="submitPost">Gửi duyệt bài viết</NativeSelectOption>
                    <NativeSelectOption value="reviewPost">Đang duyệt bài viết</NativeSelectOption>
                    <NativeSelectOption value="approvePost">Phê duyệt bài viết</NativeSelectOption>
                    <NativeSelectOption value="rejectPost">Từ chối bài viết</NativeSelectOption>
                    <NativeSelectOption value="publishPost">Xuất bản bài viết</NativeSelectOption>
                  </>
                )}
                {(data.service === 'document-service' || data.service === 'DOCUMENT_SERVICE') && (
                  <>
                    <NativeSelectOption value="receiveDocument">Tiếp nhận văn bản</NativeSelectOption>
                    <NativeSelectOption value="processDocument">Xử lý văn bản</NativeSelectOption>
                    <NativeSelectOption value="finalizeDocument">Hoàn tất văn bản</NativeSelectOption>
                  </>
                )}
                <NativeSelectOption value="notify">Gửi thông báo hệ thống</NativeSelectOption>
              </NativeSelect>
            </div>
          </div>
        );
      case "nginx_proxy":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
                Server Name (Domain)
              </label>
              <Input name="domain" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
                Listen Port
              </label>
              <Input name="port" />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Bật WAF (Web Application Firewall)
              </label>
              <Switch
                name="wafEnabled"
                checked={data.wafEnabled || false}
                onCheckedChange={(checked) => handleChange({ target: { name: 'wafEnabled', value: checked } } as any)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
                Cấu hình NGINX Tuỳ chỉnh (Advanced)
              </label>
              <Textarea
                name="customConfig"
                value={data.customConfig || ""}
                onChange={handleChange}
                className="w-full bg-background border border-border rounded-lg p-3 text-sm min-h-[100px] font-mono focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                placeholder="location / { ... }"
              />
            </div>
          </div>
        );
      case "api_gateway":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
                Đường dẫn Endpoint (Path)
              </label>
              <Input name="endpoint" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
                HTTP Method
              </label>
              <NativeSelect
                name="method"
                value={data.method || "ALL"}
                onChange={handleChange}
                className="w-full bg-background border border-border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                <NativeSelectOption value="ALL">ALL</NativeSelectOption>
                <NativeSelectOption value="GET">GET</NativeSelectOption>
                <NativeSelectOption value="POST">POST</NativeSelectOption>
                <NativeSelectOption value="PUT">PUT</NativeSelectOption>
                <NativeSelectOption value="DELETE">DELETE</NativeSelectOption>
              </NativeSelect>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
                Map To Microservice
              </label>
              <NativeSelect
                name="targetService"
                value={data.targetService || ""}
                onChange={handleChange}
                className="w-full bg-background border border-border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                <NativeSelectOption value="">Chọn microservice đích...</NativeSelectOption>
                {availableServices.map((svc: any) => (
                  <NativeSelectOption key={svc.code || svc.id} value={svc.code || svc.id}>
                    {svc.name || svc.title}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Yêu cầu Xác thực (JWT Auth)
              </label>
              <Switch
                name="requiresAuth"
                checked={data.requiresAuth || false}
                onCheckedChange={(checked) => handleChange({ target: { name: 'requiresAuth', value: checked } } as any)}
              />
            </div>
          </div>
        );
      case "external_system":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
                Tên hệ thống đối tác
              </label>
              <Input name="systemName" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
                Mã liên thông (Code)
              </label>
              <Input name="integrationCode" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
                API URL (Outbound)
              </label>
              <Input name="apiUrl" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
                API Token / Secret
              </label>
              <Input type="password"
                name="apiToken"
                value={data.apiToken || ""}
                onChange={handleChange}
                className="w-full bg-background border border-border rounded-lg p-2 text-sm font-mono focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="****************"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
                Nhập JSON Postman (tuỳ chọn)
              </label>
              <Textarea
                name="postmanJson"
                value={data.postmanJson || ""}
                onChange={handleChange}
                className="w-full bg-background border border-border rounded-lg p-3 text-sm min-h-[100px] font-mono focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                placeholder="{ ... }"
              />
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Settings2 className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">Node này không có thuộc tính cấu hình.</p>
          </div>
        );
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-[320px] sm:w-[400px] border-l border-border bg-card p-0 flex flex-col shadow-2xl z-50">
        <div className="flex items-center justify-between p-4 border-b border-border/60 bg-muted/10">
          <div className="flex items-center gap-2">
            {(selectedNode || selectedEdge) ? <Settings2 className="h-4 w-4 text-primary" /> : <Activity className="h-4 w-4 text-primary" />}
            <h3 className="text-sm font-bold truncate max-w-[200px]">
              {selectedNode
                ? `${data.label || selectedNode.type}`
                : selectedEdge
                  ? `Đường nối (Edge)`
                  : "Cấu hình quy trình"}
            </h3>
          </div>
          {/* Note: SheetContent includes its own close button natively */}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {selectedNode && (
            <div className="mb-6 pb-6 border-b border-border/40">
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">
                Thông tin Node
              </label>
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/60">
                <div className="text-[10px] font-mono font-bold bg-background px-2 py-0.5 rounded border border-border/80 shadow-sm">
                  #{selectedNode.id.slice(-6)}
                </div>
                <div className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">
                  {selectedNode.type}
                </div>
              </div>
            </div>
          )}
          {selectedEdge && (
            <div className="mb-6 pb-6 border-b border-border/40">
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">
                Thông tin Đường nối
              </label>
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/60">
                <div className="text-[10px] font-mono font-bold bg-background px-2 py-0.5 rounded border border-border/80 shadow-sm">
                  #{selectedEdge.id.slice(-6)}
                </div>
                <div className="text-[10px] font-bold text-muted-foreground/60 tracking-wider">
                  {selectedEdge.source.slice(-6)} → {selectedEdge.target.slice(-6)}
                </div>
              </div>
            </div>
          )}

          {renderFields()}
        </div>

        {(selectedNode || selectedEdge) && (
          <div className="p-4 border-t border-border/60 bg-muted/5 flex items-center justify-between gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100 rounded-xl"
              onClick={() => {
                if (selectedNode) onDelete(selectedNode.id);
                else if (selectedEdge && onDeleteEdge) onDeleteEdge(selectedEdge.id);
              }}
            >
              <Trash2 className="h-3.5 w-3.5 mr-2" />
              Xóa {selectedNode ? 'bước này' : 'đường nối này'}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default PropertiesPanel;
