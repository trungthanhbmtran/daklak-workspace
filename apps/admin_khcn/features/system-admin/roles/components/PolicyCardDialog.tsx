/* eslint-disable @typescript-eslint/no-explicit-any */
import { lazy, Suspense, useState } from "react";
import { CheckCircle2, Lock, Settings2 } from "lucide-react";
import { useWatch } from "react-hook-form";

import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormLabel } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Text } from "@/components/ui/typography";

import { Permission, Policy } from "../types";
import { usePolicyHandlers } from "../hooks/usePolicyHandlers";

// Lazy load panel gợi ý — chỉ tải khi policy được bật
const ConditionExpressionInput = lazy(
  () => import("./ConditionExpressionInput")
);

interface PolicyCardDialogProps {
  resourceName: string;
  perms: Permission[];
  form: any;
}

export default function PolicyCardDialog({ resourceName, perms, form }: PolicyCardDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  // useWatch đảm bảo luôn nhận giá trị policies mới nhất, tránh stale closure
  const policies: Policy[] = useWatch({ control: form.control, name: "policies" }) || [];

  const resourceCode = perms[0]?.code.split(":")[0] || "";
  const configuredPolicies = policies.filter((p) => p.resourceCode === resourceCode);
  const hasPolicies = configuredPolicies.length > 0;

  const { handleTogglePolicy, handleChangeEffect, handleChangeExpression } =
    usePolicyHandlers(form, resourceCode);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* ── TRIGGER CARD ── */}
      <DialogTrigger asChild>
        <div className="border rounded-xl bg-background shadow-sm hover:shadow-md transition-all cursor-pointer p-4 flex flex-col gap-3 hover:border-primary/50 relative group min-h-[100px]">
          <div className="flex items-start justify-between gap-2">
            <Text variant="small" weight="bold" className="flex items-center gap-2 leading-tight">
              <CheckCircle2
                className={`h-4 w-4 shrink-0 ${hasPolicies ? "text-primary" : "text-muted-foreground opacity-40"}`}
              />
              <span className="line-clamp-2">{resourceName}</span>
            </Text>
            <Text as="code" variant="code" className="text-[9px] text-muted-foreground uppercase opacity-60 shrink-0 px-1.5 py-0.5 bg-muted/50 rounded">
              {resourceCode}
            </Text>
          </div>

          <div className="flex flex-wrap gap-1.5 items-center pr-8 mt-auto">
            {hasPolicies ? (
              configuredPolicies.map((p, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className={`text-[9px] px-1.5 py-0 border-primary/20 shadow-none font-medium truncate max-w-[120px] ${
                    p.effect === "DENY"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {p.action} {p.conditions?.expression ? "*" : ""}
                </Badge>
              ))
            ) : (
              <Text variant="small" className="text-muted-foreground/60 italic">
                Chưa cấu hình chính sách...
              </Text>
            )}
          </div>

          <div className="absolute right-4 bottom-4 h-6 w-6 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            <Settings2 className="h-3.5 w-3.5" />
          </div>
        </div>
      </DialogTrigger>

      {/* ── DIALOG NỘI DUNG ── chỉ render khi mở */}
      {isOpen && (
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden bg-background">
          <DialogHeader className="p-6 pb-4 border-b shrink-0 bg-background z-10 shadow-sm">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <Lock className="h-5 w-5 text-primary" /> Cấu hình Chính sách: {resourceName}
            </DialogTitle>
            <DialogDescription className="text-xs mt-2">
              Bật các hành động mà vai trò này có thể thao tác, và tuỳ chọn nhập điều kiện phân quyền động (PBAC expression).
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 bg-muted/5 scrollbar-thin">
            <div className="space-y-4">
              {perms.map((perm) => {
                const actionCode = perm.code.split(":")[1] || perm.action;
                const currentPolicy =
                  policies.find(
                    (p) => p.resourceCode === resourceCode && p.action === actionCode
                  ) ?? null;
                const isEnabled = currentPolicy !== null;

                return (
                  <div
                    key={perm.id}
                    className="p-4 rounded-lg border bg-background flex flex-col gap-4 shadow-sm"
                  >
                    {/* Toggle hành động */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">{perm.action}</span>
                        <code className="text-[10px] text-muted-foreground mt-0.5">{perm.code}</code>
                      </div>
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={(checked) => handleTogglePolicy(actionCode, checked, perm.id)}
                      />
                    </div>

                    {/* Cấu hình chi tiết — chỉ hiện khi bật */}
                    {isEnabled && (
                      <div className="pl-4 border-l-2 border-primary/20 space-y-3 pt-2">
                        <div className="flex gap-4">
                          {/* Effect */}
                          <div className="space-y-1">
                            <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground">
                              Effect (Tác dụng)
                            </FormLabel>
                            <Select
                              value={currentPolicy?.effect || "ALLOW"}
                              onValueChange={(val) => handleChangeEffect(actionCode, val)}
                            >
                              <SelectTrigger className="h-8 text-xs w-[120px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ALLOW">ALLOW</SelectItem>
                                <SelectItem value="DENY">DENY</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Điều kiện động — lazy load */}
                          <Suspense
                            fallback={
                              <div className="flex-1 h-8 rounded-md bg-muted/40 animate-pulse" />
                            }
                          >
                            <ConditionExpressionInput
                              value={currentPolicy?.conditions?.expression || ""}
                              onChange={(expr) => handleChangeExpression(actionCode, expr)}
                            />
                          </Suspense>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
