import { useState } from "react";
import { Network, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useApiPermissions, useUpdateApiPermissions } from "@/features/integration/api";

const AVAILABLE_METHODS = ["ALL", "GET", "POST", "PUT", "DELETE", "PATCH"];

export function ApiEndpointsConfig({ permissionCode }: { permissionCode: string }) {
  const { data: apiRules = [], isLoading } = useApiPermissions();
  const { mutate: updatePermissions, isPending } = useUpdateApiPermissions();

  const [isOpen, setIsOpen] = useState(false);
  const [localRules, setLocalRules] = useState<any[]>([]);

  // When opening, filter rules that contain this permissionCode
  const handleOpenChange = (open: boolean) => {
    if (open) {
      const related = apiRules.filter((r: any) => r.permissions?.includes(permissionCode));
      setLocalRules(JSON.parse(JSON.stringify(related))); // deep clone
    }
    setIsOpen(open);
  };

  const handleAddRule = () => {
    setLocalRules([...localRules, { path: "/api/v1/...", method: "ALL", permissions: [permissionCode] }]);
  };

  const handleRemoveRule = (index: number) => {
    const newRules = [...localRules];
    newRules.splice(index, 1);
    setLocalRules(newRules);
  };

  const handleUpdateRule = (index: number, field: string, value: string) => {
    const newRules = [...localRules];
    newRules[index][field] = value;
    setLocalRules(newRules);
  };

  const handleSave = () => {
    // We need to merge localRules back into the global apiRules
    // First, remove all existing rules that contain this permissionCode
    let updatedGlobalRules = apiRules.map((r: any) => {
      if (r.permissions?.includes(permissionCode)) {
        // remove this permission from the rule
        return { ...r, permissions: r.permissions.filter((p: string) => p !== permissionCode) };
      }
      return r;
    });

    // Clean up empty rules
    updatedGlobalRules = updatedGlobalRules.filter((r: any) => r.permissions && r.permissions.length > 0);

    // Append the localRules
    localRules.forEach(rule => {
      // Check if there is an exact match for path and method
      const existing = updatedGlobalRules.find((r: any) => r.path === rule.path && r.method === rule.method);
      if (existing) {
        if (!existing.permissions.includes(permissionCode)) {
          existing.permissions.push(permissionCode);
        }
      } else {
        updatedGlobalRules.push({
          path: rule.path,
          method: rule.method,
          permissions: [permissionCode]
        });
      }
    });

    updatePermissions(updatedGlobalRules, {
      onSuccess: () => {
        setIsOpen(false);
      }
    });
  };

  // Count how many routes this permission has
  const routeCount = apiRules.filter((r: any) => r.permissions?.includes(permissionCode)).length;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-blue-600 hover:bg-blue-50 mt-2 h-7 px-2">
          <Network className="w-3 h-3 mr-1" />
          {isLoading ? "Đang tải..." : routeCount > 0 ? `${routeCount} API Endpoints` : "Gắn API Endpoint"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gắn API Endpoint cho quyền {permissionCode}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 my-4">
          <div className="bg-blue-50 text-blue-800 text-sm p-3 rounded border border-blue-100">
            Khai báo các đường dẫn API tương ứng với quyền thao tác này. Gateway sẽ tự động kiểm tra xem user có quyền này không trước khi cho phép gọi API. (Hỗ trợ wildcard * ở cuối đường dẫn).
          </div>

          {localRules.map((rule, index) => (
            <div key={index} className="flex items-center gap-3 bg-muted/30 p-3 rounded border">
              <div className="flex-1 space-y-1">
                <Label className="text-xs text-muted-foreground">Path</Label>
                <Input value={rule.path} onChange={(e) => handleUpdateRule(index, "path", e.target.value)} />
              </div>
              <div className="w-24 space-y-1">
                <Label className="text-xs text-muted-foreground">Method</Label>
                <Select value={rule.method} onValueChange={(val) => handleUpdateRule(index, "method", val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_METHODS.map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="ghost" size="icon" className="mt-5 text-destructive hover:bg-destructive/10" onClick={() => handleRemoveRule(index)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          {localRules.length === 0 && (
            <div className="text-center p-4 border border-dashed rounded text-muted-foreground text-sm">
              Chưa có API Endpoint nào được cấu hình cho quyền này.
            </div>
          )}

          <Button variant="outline" size="sm" onClick={handleAddRule} className="w-full border-dashed">
            <Plus className="w-4 h-4 mr-1" /> Thêm Endpoint
          </Button>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="ghost" onClick={() => setIsOpen(false)}>Hủy</Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Lưu cấu hình
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
