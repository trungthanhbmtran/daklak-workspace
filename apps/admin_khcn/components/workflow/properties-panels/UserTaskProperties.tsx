/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Plus, X, Trash2 } from "lucide-react";
import { PropertiesPanelComponentProps } from "./types";

const TASK_PARTICIPANT_ROLES = [
  { code: 'OWNER', name: 'Người giao việc (OWNER)' },
  { code: 'ASSIGNEE', name: 'Người xử lý chính (ASSIGNEE)' },
  { code: 'COORDINATOR', name: 'Người phối hợp (COORDINATOR)' },
  { code: 'APPROVER', name: 'Người chỉ đạo/Theo dõi (APPROVER)' },
  { code: 'ADMIN', name: 'Quản trị viên hệ thống (ADMIN)' },
];

export const UserTaskProperties = ({ data, handleChange, selectedNode, onUpdate, taskRoles = [], orgRoles = [] }: PropertiesPanelComponentProps) => {
  const [activeRoleGroups, setActiveRoleGroups] = useState<Record<string, string>>({});

  if (!selectedNode || !onUpdate) return null;

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
          Tên bước xử lý (Label)
        </label>
        <Input type="text"
          name="label"
          value={data.label || ""}
          onChange={handleChange}
          className="w-full bg-background border border-border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          placeholder="VD: Giao việc, Duyệt báo cáo..."
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
          Loại thao tác (Action Type)
        </label>
        <NativeSelect
          name="actionName"
          value={data.actionName || ""}
          onChange={handleChange}
          className="w-full bg-background border border-border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
        >
          <NativeSelectOption value="">(Tùy chọn) Chọn loại thao tác...</NativeSelectOption>
          <NativeSelectOption value="ASSIGN">Giao việc / Phân công</NativeSelectOption>
          <NativeSelectOption value="APPROVE">Phê duyệt / Ký duyệt</NativeSelectOption>
          <NativeSelectOption value="REJECT">Từ chối / Trả lại</NativeSelectOption>
          <NativeSelectOption value="SUBMIT">Hoàn thành / Báo cáo</NativeSelectOption>
        </NativeSelect>
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
          placeholder="Mô tả chi tiết công việc cần thực hiện ở bước này..."
        />
      </div>

      <Accordion type="multiple" className="w-full mt-4 space-y-2">
        <AccordionItem value="advanced" className="border-none">
          <AccordionTrigger className="flex items-center justify-between p-3 rounded-xl bg-muted border border-border hover:bg-muted py-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cấu hình nâng cao (Quyền, UI, Phân công)</span>
          </AccordionTrigger>
          <AccordionContent className="p-4 rounded-b-xl bg-muted/30 border border-t-0 space-y-6">

            {/* Approval Evidence Configuration */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Phê duyệt & Minh chứng
              </h4>
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground">
                  Bắt buộc phê duyệt
                </label>
                <Switch
                  checked={data.approvalRequired || false}
                  onCheckedChange={(checked) => handleChange({ target: { name: 'approvalRequired', value: checked } } as any)}
                />
              </div>
              {data.approvalRequired && (
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
                    <NativeSelectOption value="none">Không yêu cầu</NativeSelectOption>
                    <NativeSelectOption value="upload">Tệp đính kèm (Upload)</NativeSelectOption>
                    <NativeSelectOption value="api">Dữ liệu từ API</NativeSelectOption>
                    <NativeSelectOption value="both">Cả hai (Upload + API)</NativeSelectOption>
                  </NativeSelect>
                </div>
              )}
            </div>

            <div className="border-t border-border" />



            {/* Target Status & Assignment */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Chuyển trạng thái & Phân công</h4>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Trạng thái mục tiêu</label>
                <Input name="targetStatus" value={data.targetStatus || ""} onChange={handleChange} className="w-full text-sm bg-background" placeholder="VD: IN_PROGRESS" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Giao trực tiếp cho nhân sự (Mã NV)</label>
                <Input name="employeeCode" value={data.employeeCode || ""} onChange={handleChange} className="w-full text-sm bg-background" placeholder="VD: NV001" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Chiến lược phân công tự động (PBAC)</label>
                <NativeSelect name="assignmentStrategy" value={data.assignmentStrategy || "ANY"} onChange={handleChange} className="w-full text-sm bg-background">
                  <NativeSelectOption value="ANY">Không giới hạn (Toàn hệ thống)</NativeSelectOption>
                  <NativeSelectOption value="BY_DOMAIN">Theo Lĩnh vực phụ trách</NativeSelectOption>
                  <NativeSelectOption value="BY_DEPARTMENT">Theo Phòng ban theo dõi</NativeSelectOption>
                  <NativeSelectOption value="BY_GEO_AREA">Theo Địa bàn phụ trách</NativeSelectOption>
                  <NativeSelectOption value="DIRECT_MANAGER">Cấp trên/dưới trực tiếp</NativeSelectOption>
                  <NativeSelectOption value="ASSIGNER">Người giao việc</NativeSelectOption>
                </NativeSelect>
              </div>
            </div>

            <div className="border-t border-border" />

            {/* Dynamic Permissions Configuration */}
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Quyền thao tác tuỳ biến</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[10px] text-violet-600 hover:text-violet-700 hover:bg-violet-100"
                  onClick={() => {
                    const currentPerms = data.permissions || {};
                    let newActionName = 'NEW_ACTION';
                    let counter = 1;
                    while (currentPerms[newActionName]) {
                      newActionName = `NEW_ACTION_${counter}`;
                      counter++;
                    }
                    onUpdate(selectedNode.id, {
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
                  <div key={action} className="flex flex-col gap-1.5 p-2 bg-background rounded-lg border border-border">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 flex flex-col gap-2">
                        <Input
                          value={action}
                          onChange={(e) => {
                            const newAction = e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '');
                            const newPerms = { ...data.permissions };
                            const oldRoles = newPerms[action];
                            const updatedPerms: any = {};
                            for (const key of Object.keys(newPerms)) {
                              if (key === action) {
                                updatedPerms[newAction] = oldRoles;
                              } else {
                                updatedPerms[key] = newPerms[key];
                              }
                            }
                            onUpdate(selectedNode.id, { ...data, permissions: updatedPerms });
                          }}
                          className="h-7 text-xs font-bold font-mono w-[130px] bg-muted border-none px-2"
                          placeholder="ACTION"
                        />
                        <div className="flex flex-wrap items-center gap-1.5">
                          {Array.isArray(roles) && roles.map((role: string) => (
                            <span key={role} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                              {role}
                              <Button
                                type="button"
                                className="ml-1 text-violet-600 hover:text-violet-900 dark:text-violet-400 dark:hover:text-violet-200"
                                onClick={() => {
                                  const newRoles = roles.filter(r => r !== role);
                                  onUpdate(selectedNode.id, {
                                    ...data,
                                    permissions: { ...data.permissions, [action]: newRoles }
                                  });
                                }}
                              >
                                <X className="h-2.5 w-2.5" />
                              </Button>
                            </span>
                          ))}
                          <div className="flex items-center gap-1">
                            <select
                              className="h-6 text-[10px] bg-muted border border-border rounded px-1 cursor-pointer outline-none hover:border-violet-300 text-foreground"
                              value={activeRoleGroups[action] || ""}
                              onChange={(e) => setActiveRoleGroups({ ...activeRoleGroups, [action]: e.target.value })}
                            >
                              <option value="" disabled>+ Chọn nhóm</option>
                              <option value="TASK">Vai trò trong Task</option>
                              {orgRoles.length > 0 && <option value="ORG">Vị trí tổ chức</option>}
                              {taskRoles && taskRoles.length > 0 && <option value="PBAC">Quyền hệ thống</option>}
                            </select>

                            {activeRoleGroups[action] && (
                              <select
                                className="h-6 text-[10px] bg-muted border border-border rounded px-1 cursor-pointer outline-none hover:border-violet-300 text-foreground max-w-[120px]"
                                onChange={(e) => {
                                  const role = e.target.value;
                                  if (!role) return;
                                  const currentRoles = Array.isArray(roles) ? roles : [];
                                  const newRoles = [...currentRoles, role].filter((v, i, a) => a.indexOf(v) === i);
                                  onUpdate(selectedNode.id, {
                                    ...data,
                                    permissions: { ...data.permissions, [action]: newRoles }
                                  });
                                  e.target.value = '';
                                  setActiveRoleGroups({ ...activeRoleGroups, [action]: "" });
                                }}
                                defaultValue=""
                              >
                                <option value="" disabled>+ Chọn</option>
                                {activeRoleGroups[action] === 'TASK' && TASK_PARTICIPANT_ROLES.map(r => (
                                  <option key={r.code} value={r.code}>{r.name}</option>
                                ))}
                                {activeRoleGroups[action] === 'ORG' && orgRoles.map((r: any) => (
                                  <option key={r.code} value={r.code}>{r.name}</option>
                                ))}
                                {activeRoleGroups[action] === 'PBAC' && taskRoles.map((r: any) => (
                                  <option key={r.code} value={r.code}>{r.name || r.nameVi}</option>
                                ))}
                              </select>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded"
                        onClick={() => {
                          const newPerms = { ...data.permissions };
                          delete newPerms[action];
                          if (Object.keys(newPerms).length === 0) {
                            const newData = { ...data };
                            delete newData.permissions;
                            onUpdate(selectedNode.id, newData);
                          } else {
                            onUpdate(selectedNode.id, { ...data, permissions: newPerms });
                          }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
                {(!data.permissions || Object.keys(data.permissions).length === 0) && (
                  <p className="text-[10px] text-muted-foreground text-center py-2">
                    Sử dụng quyền hệ thống mặc định.
                  </p>
                )}
              </div>
            </div>

          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="dev-advanced" className="border-none">
          <AccordionTrigger className="flex items-center justify-between p-3 rounded-xl bg-muted border border-border hover:bg-muted py-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Lập trình mở rộng (IT Only)</span>
          </AccordionTrigger>
          <AccordionContent className="p-4 rounded-b-xl bg-muted/30 border border-t-0 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Bật Notification (Hệ thống cũ)</label>
              <Switch checked={data.sendNotification || false} onCheckedChange={(c) => handleChange({ target: { name: 'sendNotification', value: c } } as any)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Biểu mẫu động (Form Schema)</label>
              <Textarea name="formSchema" value={data.formSchema || ""} onChange={handleChange} className="w-full bg-background border border-border rounded-xl p-3 text-sm font-mono min-h-[100px]" placeholder='[{ "name": "lyDo", "label": "Lý do", "type": "textarea" }]' spellCheck={false} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Hành động phụ (Side Effects)</label>
              <Textarea name="sideEffects" value={data.sideEffects || ""} onChange={handleChange} className="w-full bg-background border border-border rounded-xl p-3 text-sm font-mono min-h-[80px]" placeholder='[{ "type": "WEBHOOK", "url": "..." }]' spellCheck={false} />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
