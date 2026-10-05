/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Button } from "@/components/ui/button";
import { Plus, X, Trash2 } from "lucide-react";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { PropertiesPanelComponentProps } from "../types";

export const AdvancedConfig = ({ 
  data, 
  handleChange, 
  onUpdate, 
  selectedNode, 
  taskRoles = [], 
  orgRoles = [],
  participantRoles = [
    { code: 'OWNER', name: 'Người giao việc (OWNER)' },
    { code: 'ASSIGNEE', name: 'Người xử lý chính (ASSIGNEE)' },
    { code: 'COORDINATOR', name: 'Người phối hợp (COORDINATOR)' },
    { code: 'APPROVER', name: 'Người chỉ đạo/Theo dõi (APPROVER)' },
    { code: 'ADMIN', name: 'Quản trị viên (ADMIN)' }
  ]
}: PropertiesPanelComponentProps) => {
  const [activeRoleGroups, setActiveRoleGroups] = useState<Record<string, string>>({});

  if (!selectedNode || !onUpdate) return null;

  return (
    <AccordionItem value="advanced">
      <AccordionTrigger className="text-sm font-semibold hover:no-underline px-4">
        Cấu hình nâng cao (Quyền, UI, Phân công)
      </AccordionTrigger>
      <AccordionContent className="space-y-6 pt-4 px-4">
        
        {/* Approval Evidence Configuration */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            Phê duyệt & Minh chứng
          </h4>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              Bắt buộc phê duyệt
            </label>
            <Switch
              checked={data.approvalRequired || false}
              onCheckedChange={(checked) => handleChange({ target: { name: 'approvalRequired', value: checked } } as any)}
            />
          </div>
          {data.approvalRequired && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Loại minh chứng yêu cầu
              </label>
              <NativeSelect
                name="evidenceType"
                value={data.evidenceType || "none"}
                onChange={handleChange}
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
          <h4 className="text-sm font-semibold text-foreground">Chuyển trạng thái & Phân công</h4>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Trạng thái mục tiêu</label>
            <Input name="targetStatus" value={data.targetStatus || ""} onChange={handleChange} placeholder="VD: IN_PROGRESS" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Giao trực tiếp cho nhân sự (Mã NV)</label>
            <Input name="employeeCode" value={data.employeeCode || ""} onChange={handleChange} placeholder="VD: NV001" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Chiến lược phân công tự động (PBAC)</label>
            <NativeSelect name="assignmentStrategy" value={data.assignmentStrategy || "ANY"} onChange={handleChange}>
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

        {/* Dynamic Assignments Configuration */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">Phạm vi phân công (Assignments)</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const currentAssignments = Array.isArray(data.assignments) ? data.assignments : [];
                onUpdate(selectedNode.id, {
                  ...data,
                  assignments: [...currentAssignments, { unitScope: 'SAME_UNIT', rankOperator: 'any' }]
                });
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> Thêm quy tắc
            </Button>
          </div>

          <div className="space-y-4">
            {(Array.isArray(data.assignments) ? data.assignments : []).map((assignment: any, idx: number) => (
              <div key={idx} className="flex flex-col gap-4 p-4 bg-muted/50 rounded-md border border-border">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Quy tắc {idx + 1}</span>
                  <Button variant="ghost" size="icon" onClick={() => {
                    const newAssignments = data.assignments.filter((_: any, i: number) => i !== idx);
                    onUpdate(selectedNode.id, { ...data, assignments: newAssignments });
                  }}>
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Phạm vi (Scope)</label>
                    <NativeSelect
                      value={assignment.unitScope || 'SAME_UNIT'}
                      onChange={(e) => {
                        const newAssignments = [...data.assignments];
                        newAssignments[idx] = { ...newAssignments[idx], unitScope: e.target.value };
                        onUpdate(selectedNode.id, { ...data, assignments: newAssignments });
                      }}
                    >
                      <NativeSelectOption value="SAME_UNIT">Cùng phòng ban</NativeSelectOption>
                      <NativeSelectOption value="CHILD_UNIT">Phòng cấp dưới</NativeSelectOption>
                      <NativeSelectOption value="PARENT_UNIT">Phòng cấp trên</NativeSelectOption>
                      <NativeSelectOption value="SELF">Chỉ bản thân</NativeSelectOption>
                      <NativeSelectOption value="ANY">Toàn hệ thống</NativeSelectOption>
                      <NativeSelectOption value="BY_DOMAIN">Lĩnh vực phụ trách</NativeSelectOption>
                      <NativeSelectOption value="BY_GEO_AREA">Địa bàn phụ trách</NativeSelectOption>
                    </NativeSelect>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Chức vụ (Rank)</label>
                    <NativeSelect
                      value={assignment.rankOperator || 'any'}
                      onChange={(e) => {
                        const newAssignments = [...data.assignments];
                        newAssignments[idx] = { ...newAssignments[idx], rankOperator: e.target.value };
                        onUpdate(selectedNode.id, { ...data, assignments: newAssignments });
                      }}
                    >
                      <NativeSelectOption value="any">Bất kỳ</NativeSelectOption>
                      <NativeSelectOption value="exact">Chính xác (=)</NativeSelectOption>
                      <NativeSelectOption value="gte">Từ cấp này trở lên</NativeSelectOption>
                      <NativeSelectOption value="lte">Từ cấp này trở xuống</NativeSelectOption>
                    </NativeSelect>
                  </div>
                </div>

                {assignment.rankOperator && assignment.rankOperator !== 'any' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Giá trị Rank / Mức độ</label>
                    <Input
                      value={assignment.rankValue || ''}
                      onChange={(e) => {
                        const newAssignments = [...data.assignments];
                        newAssignments[idx] = { ...newAssignments[idx], rankValue: e.target.value };
                        onUpdate(selectedNode.id, { ...data, assignments: newAssignments });
                      }}
                      placeholder="VD: minRank, maxRank, 1, 2..."
                    />
                  </div>
                )}
              </div>
            ))}
            {(!data.assignments || data.assignments.length === 0) && (
              <p className="text-sm text-center text-muted-foreground py-4 border border-dashed rounded-md">
                Chưa có quy tắc phân công. Sẽ dùng chiến lược mặc định.
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-border" />

        {/* Dynamic Permissions Configuration */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">Quyền thao tác tuỳ biến</h4>
            <Button
              variant="outline"
              size="sm"
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
              <Plus className="h-4 w-4 mr-2" /> Thêm quyền
            </Button>
          </div>

          <div className="space-y-4">
            {Object.entries(data.permissions || {}).map(([action, roles]) => (
              <div key={action} className="flex flex-col gap-4 p-4 bg-muted/50 rounded-md border border-border">
                <div className="flex items-start gap-4">
                  <div className="flex-1 space-y-4">
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
                      className="font-mono max-w-[200px]"
                      placeholder="ACTION"
                    />
                    
                    <div className="flex flex-wrap items-center gap-2">
                      {Array.isArray(roles) && roles.map((role: string) => (
                        <div key={role} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80">
                          {role}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 ml-1 hover:bg-transparent"
                            onClick={() => {
                              const newRoles = (roles as string[]).filter(r => r !== role);
                              onUpdate(selectedNode.id, {
                                ...data,
                                permissions: { ...data.permissions, [action]: newRoles }
                              });
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      
                      <div className="flex items-center gap-2">
                        <NativeSelect
                          value={activeRoleGroups[action] || ""}
                          onChange={(e) => setActiveRoleGroups({ ...activeRoleGroups, [action]: e.target.value })}
                          className="w-[140px]"
                        >
                          <NativeSelectOption value="" disabled>+ Chọn nhóm</NativeSelectOption>
                          <NativeSelectOption value="TASK">Vai trò trong Task</NativeSelectOption>
                          {orgRoles.length > 0 && <NativeSelectOption value="ORG">Vị trí tổ chức</NativeSelectOption>}
                          {taskRoles && taskRoles.length > 0 && <NativeSelectOption value="PBAC">Quyền hệ thống</NativeSelectOption>}
                        </NativeSelect>

                        {activeRoleGroups[action] && (
                          <NativeSelect
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
                            className="w-[180px]"
                          >
                            <NativeSelectOption value="" disabled>+ Chọn</NativeSelectOption>
                            {activeRoleGroups[action] === 'TASK' && participantRoles.map((r: any) => (
                              <NativeSelectOption key={r.code} value={r.code}>{r.name}</NativeSelectOption>
                            ))}
                            {activeRoleGroups[action] === 'ORG' && orgRoles.map((r: any) => (
                              <NativeSelectOption key={r.code} value={r.code}>{r.name}</NativeSelectOption>
                            ))}
                            {activeRoleGroups[action] === 'PBAC' && taskRoles.map((r: any) => (
                              <NativeSelectOption key={r.code} value={r.code}>{r.name || r.nameVi}</NativeSelectOption>
                            ))}
                          </NativeSelect>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
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
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
            {(!data.permissions || Object.keys(data.permissions).length === 0) && (
              <p className="text-sm text-center text-muted-foreground py-4 border border-dashed rounded-md">
                Sử dụng quyền hệ thống mặc định.
              </p>
            )}
          </div>
        </div>

      </AccordionContent>
    </AccordionItem>
  );
};
