import { useFormContext } from "react-hook-form";
import { ShieldCheck, Info, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";

interface Props {
  roles: any[];
  rolesLoading: boolean;
}

export function PbacRolesSection({ roles, rolesLoading }: Props) {
  const { control } = useFormContext();

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 border-b pb-2">
        <ShieldCheck className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">3. Cấu hình vai trò & Chính sách (PBAC)</h3>
      </div>

      <div className="bg-primary/5 text-primary-foreground border border-primary/20 rounded-md p-3 flex items-start gap-3">
        <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Trong hệ thống PBAC, quyền hạn được quyết định bởi <strong>Chính sách (Policies)</strong>.
          Việc gán Vai trò (Role) dưới đây sẽ tự động kế thừa các tập chính sách đã được liên kết với Vai trò đó.
        </p>
      </div>

      <FormField
        control={control}
        name="roleIds"
        render={({ field }) => (
          <FormItem>
            {rolesLoading ? (
              <div className="flex items-center justify-center p-6 border rounded-md border-dashed">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
                <span className="text-sm text-muted-foreground">Đang tải cấu hình Roles...</span>
              </div>
            ) : roles.length === 0 ? (
              <div className="p-4 text-center border rounded-md text-sm text-muted-foreground bg-muted/20">
                Chưa có vai trò nào trong hệ thống. Vui lòng thiết lập Roles trước.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[240px] overflow-y-auto p-1">
                {roles.map((role) => {
                  const isSelected = field.value?.includes(role.id);
                  return (
                    <label
                      key={role.id}
                      className={cn(
                        "relative flex items-start gap-3 cursor-pointer p-3 rounded-lg border-2 transition-all duration-200",
                        isSelected
                          ? "bg-primary/5 border-primary shadow-sm"
                          : "bg-card border-border hover:border-primary/40 hover:bg-muted/50"
                      )}
                    >
                      <FormControl className="mt-0.5">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...field.value, role.id]);
                            } else {
                              field.onChange(field.value?.filter((id: number) => id !== role.id));
                            }
                          }}
                        />
                      </FormControl>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className={cn("font-medium text-sm block truncate", isSelected && "text-primary")}>
                            {role.name}
                          </span>
                        </div>
                        {role.code && (
                          <Badge variant="outline" className="font-mono text-[10px] px-1.5 bg-background">
                            {role.code}
                          </Badge>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </section>
  );
}
