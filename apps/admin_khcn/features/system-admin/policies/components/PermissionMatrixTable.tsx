import { lazy, Suspense, useMemo } from "react";
import { useWatch } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Settings2, AlertCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormLabel } from "@/components/ui/form";
import { Permission, Policy } from "../types";
import { usePolicyHandlers } from "../hooks/usePolicyHandlers";

const ConditionExpressionInput = lazy(() => import("./ConditionExpressionInput"));

const STD_ACTIONS = ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'MANAGE'];

interface Props {
  groupedPermissions: Record<string, Permission[]>;
  form: any;
}

interface MatrixCellProps {
  action: string;
  perms: Permission[];
  form: any;
  resourceCode: string;
  resourceId: number;
  currentPolicy?: Policy;
}

function MatrixCell({ action, perms, form, resourceCode, resourceId, currentPolicy }: MatrixCellProps) {
  const perm = perms.find((p) => p.action === action);
  const { handleTogglePolicy, handleChangeEffect, handleChangeExpression } = usePolicyHandlers(form, resourceCode);

  if (!perm) return <div className="text-muted-foreground/30 select-none flex items-center justify-center h-full text-xs font-mono">-</div>;

  const isEnabled = !!currentPolicy;
  const hasCondition = !!currentPolicy?.conditions?.expression;
  const isDeny = currentPolicy?.effect === "DENY";
  const targetResourceId = perm.id || resourceId || 0;

  return (
    <div className="flex items-center justify-center gap-1.5 group relative h-7 w-full">
      <Checkbox
        checked={isEnabled}
        onCheckedChange={(checked) => handleTogglePolicy(action, !!checked, targetResourceId, resourceCode)}
        className={`h-4 w-4 rounded-sm border-muted-foreground/30 ${isDeny ? "data-[state=checked]:bg-destructive data-[state=checked]:border-destructive" : ""}`}
      />

      {isEnabled && (hasCondition || isDeny) && (
        <AlertCircle className={`h-3 w-3 absolute -top-1 -right-0.5 ${isDeny ? "text-destructive" : "text-primary"}`} />
      )}

      {isEnabled && (
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="absolute -right-3 h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
            >
              <Settings2 className="h-3 w-3" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[340px] p-4 space-y-4 shadow-xl border-muted/50" sideOffset={12}>
            <div className="space-y-1.5 border-b pb-3">
              <h4 className="font-bold leading-none text-sm text-primary uppercase tracking-wider">Cấu hình chi tiết ({action})</h4>
              <p className="text-[11px] text-muted-foreground">Tuỳ chỉnh PBAC Effect và Condition linh hoạt.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground">Effect (Tác dụng)</FormLabel>
                <Select value={currentPolicy?.effect || "ALLOW"} onValueChange={(val) => handleChangeEffect(action, val, targetResourceId, resourceCode)}>
                  <SelectTrigger className="h-8 text-xs font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALLOW">
                      <span className="text-primary font-bold">ALLOW</span> (Cho phép)
                    </SelectItem>
                    <SelectItem value="DENY">
                      <span className="text-destructive font-bold">DENY</span> (Từ chối)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Suspense fallback={<div className="h-8 rounded bg-muted/40 animate-pulse" />}>
                  <ConditionExpressionInput
                    value={currentPolicy?.conditions?.expression || ""}
                    onChange={(expr) => handleChangeExpression(action, expr, targetResourceId, resourceCode)}
                  />
                </Suspense>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

export function PermissionMatrixTable({ groupedPermissions, form }: Props) {
  const policies: Policy[] = useWatch({ control: form.control, name: "policies" }) || [];

  const policyMap = useMemo(() => {
    const map = new Map<string, Policy>();
    for (const p of policies) {
      if (p.action) {
        if (p.resourceCode) {
          map.set(`${p.resourceCode}:${p.action}`, p);
        }
        if (p.resourceId) {
          map.set(`${p.resourceId}:${p.action}`, p);
        }
      }
    }
    return map;
  }, [policies]);

  return (
    <div className="border rounded-xl overflow-hidden bg-background shadow-sm">
      <Table>
        <TableHeader className="bg-muted/40 border-b">
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-bold w-[300px] text-xs uppercase tracking-wider">Tài nguyên / Module</TableHead>
            {STD_ACTIONS.map((action) => (
              <TableHead key={action} className="text-center font-bold text-xs uppercase tracking-wider text-primary/80 w-[120px]">
                {action}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(groupedPermissions).map(([resourceName, perms], index) => {
            const rawCode = perms[0]?.code || "";
            const resourceCode = rawCode.includes(":")
              ? rawCode.slice(0, rawCode.lastIndexOf(":"))
              : rawCode;
            const resourceId = perms.find((p) => p.id)?.id ?? 0;

            return (
              <TableRow key={resourceName} className={`group transition-colors ${index % 2 === 0 ? "bg-background" : "bg-muted/10"}`}>
                <TableCell className="py-2.5 min-w-[200px]">
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-sm leading-tight text-foreground/90 truncate">{resourceName}</span>
                    <span className="text-[10px] text-muted-foreground font-mono mt-0.5 opacity-70 group-hover:opacity-100 transition-opacity truncate">
                      {resourceCode}
                    </span>
                  </div>
                </TableCell>
                {STD_ACTIONS.map((action) => {
                  const perm = perms.find((p) => p.action === action);
                  const currentPolicy =
                    (resourceCode ? policyMap.get(`${resourceCode}:${action}`) : undefined) ||
                    (perm?.id ? policyMap.get(`${perm.id}:${action}`) : undefined) ||
                    (resourceId ? policyMap.get(`${resourceId}:${action}`) : undefined);

                  return (
                    <TableCell key={action} className="py-2.5 px-0 align-middle">
                      <MatrixCell
                        action={action}
                        perms={perms}
                        form={form}
                        resourceCode={resourceCode}
                        resourceId={resourceId}
                        currentPolicy={currentPolicy}
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
