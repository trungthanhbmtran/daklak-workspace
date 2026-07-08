import React from "react";
import { Node, Edge } from "@xyflow/react";
import {
  Settings2,
  Trash2,
  Info,
  FileText,
  Activity
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
  onUpdate: (id: string, data: any) => void;
  onUpdateEdge?: (id: string, data: any) => void;
  onDelete: (id: string) => void;
  onDeleteEdge?: (id: string) => void;
  onClose: () => void;
  workflowDesc: string;
  setWorkflowDesc: (desc: string) => void;
  workflowTrigger: string;
  setWorkflowTrigger: (trigger: string) => void;
}

export const PropertiesPanel = ({
  isOpen,
  onOpenChange,
  selectedNode,
  selectedEdge,
  availableServices = [],
  availableTriggers = [],
  taskRoles = [],
  onUpdate,
  onUpdateEdge,
  onDelete,
  onDeleteEdge,
  onClose,
  workflowDesc,
  setWorkflowDesc,
  workflowTrigger,
  setWorkflowTrigger
}: PropertiesPanelProps) => {
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
    if (!selectedNode) {
      return (
        <div className="space-y-6">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase mb-2.5  flex items-center gap-2">
              <Activity className="h-3.5 w-3.5" /> Kích hoạt tự động (Trigger)
            </label>
            <NativeSelect
              value={workflowTrigger || ""}
              onChange={(e) => setWorkflowTrigger(e.target.value)}
              className="w-full bg-muted/30 border border-border/40 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            >
              <NativeSelectOption value="">Chọn sự kiện kích hoạt...</NativeSelectOption>
              {availableTriggers.length > 0 ? (
                availableTriggers.map((t: any) => (
                  <NativeSelectOption key={t.code} value={t.code}>{t.name}</NativeSelectOption>
                ))
              ) : (
                <>
                  <NativeSelectOption value="MANUAL">Kích hoạt thủ công</NativeSelectOption>
                  <NativeSelectOption value="POST_SUBMIT">Khi gửi duyệt bài viết (Posts)</NativeSelectOption>
                  <NativeSelectOption value="DOC_RECEIVED">Khi nhận văn bản mới (Documents)</NativeSelectOption>
                  <NativeSelectOption value="USER_CREATED">Khi tạo tài khoản mới (Users)</NativeSelectOption>
                </>
              )}
            </NativeSelect>
            <p className="text-[10px] text-muted-foreground mt-2 italic">
              Quy trình sẽ tự động bắt đầu khi sự kiện này xảy ra.
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
              Hành động của người dùng khớp với tên này sẽ đi theo đường nối này.
            </p>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
              Biểu thức rẽ nhánh (Expression)
            </label>
            <div className="relative group">
              <div className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-violet-500 transition-colors">
                <span className="font-mono text-xs font-bold bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">fx</span>
              </div>
              <Textarea
                name="expression"
                value={(edgeData.expression as string) || ""}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 pl-12 text-sm font-mono focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all min-h-[100px] resize-y leading-relaxed"
                placeholder={`// Viết biểu thức JavaScript (dành cho Gateway)\ne.g. amount > 1000000`}
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
                Vai trò xử lý (PBAC)
              </label>
              <NativeSelect
                name="role"
                value={data.role || ""}
                onChange={handleChange}
                className="w-full bg-background border border-border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                <NativeSelectOption value="">Chọn vai trò...</NativeSelectOption>
                {taskRoles && taskRoles.length > 0 ? (
                  taskRoles.map((role: any) => (
                    <NativeSelectOption key={role.code} value={role.code}>{role.name || role.code}</NativeSelectOption>
                  ))
                ) : (
                  <>
                    <NativeSelectOption value="ADMIN">Administrator</NativeSelectOption>
                    <NativeSelectOption value="MANAGER">Quản lý / Lãnh đạo</NativeSelectOption>
                    <NativeSelectOption value="STAFF">Nhân viên / Chuyên viên</NativeSelectOption>
                    <NativeSelectOption value="EXPERT">Chuyên gia phản biện</NativeSelectOption>
                  </>
                )}
              </NativeSelect>
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

            {/* Auxiliary Actions Configuration */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 mt-4">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Quyền thao tác phụ trợ</h4>
              <div className="space-y-2">
                {[
                  { name: 'allowAddSubtask', label: 'Cho phép phân rã công việc' },
                  { name: 'allowCoordinate', label: 'Cho phép xin phối hợp' },
                  { name: 'allowEdit', label: 'Cho phép chỉnh sửa nội dung' },
                  { name: 'allowDelete', label: 'Cho phép xóa công việc' },
                  { name: 'allowChat', label: 'Cho phép thảo luận (Chat)', defaultChecked: true },
                ].map((action) => (
                  <div key={action.name} className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {action.label}
                    </label>
                    <Switch
                      name={action.name}
                      checked={data[action.name] !== undefined ? data[action.name] : !!action.defaultChecked}
                      onCheckedChange={(checked) => handleChange({ target: { name: action.name, value: checked } } as any)}
                    />
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                Khi được cấp quyền, người xử lý tại bước này sẽ thấy các nút thao tác tương ứng (chỉ khả dụng nếu họ thỏa mãn biểu thức xác thực của Node).
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
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
                Biểu thức xác thực động (Validation fx)
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-violet-500 transition-colors">
                  <span className="font-mono text-xs font-bold bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">fx</span>
                </div>
                <Textarea
                  name="validationExpression"
                  value={data.validationExpression || ""}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 pl-12 text-sm font-mono focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all min-h-[100px] resize-y leading-relaxed"
                  placeholder={`// Viết biểu thức JavaScript (trả về true/false)\ne.g. userContext.allowedEmployeeCodes.includes('NV_001')`}
                  spellCheck={false}
                />
              </div>
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
