import { Search, Plus, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Role } from "../types";

interface RoleSidebarProps {
  roles: Role[];
  searchTerm: string; setSearchTerm: (v: string) => void;
  selectedRoleId?: number;
  onSelect: (role: Role) => void;
  onAdd: () => void;
}

export function RoleSidebar({ roles, searchTerm, setSearchTerm, selectedRoleId, onSelect, onAdd }: RoleSidebarProps) {
  return (
    <Card className="w-full lg:w-[320px] flex flex-col h-full shadow-none border-border overflow-hidden shrink-0">
      <div className="p-4 space-y-4 border-b bg-muted/10 shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Danh sách Vai trò</h3>
          <Button variant="outline" size="sm" className="h-7 px-2 font-bold text-[10px]" onClick={onAdd}>
            <Plus className="mr-1 h-3 w-3" /> Thêm mới
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Tìm kiếm vai trò..." className="pl-8 h-9 bg-background" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
        {roles.map((role) => {
          const isSelected = selectedRoleId === role.id;
          return (
            <div 
              key={role.id} onClick={() => onSelect(role)}
              className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors ${
                isSelected ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-muted text-foreground border border-transparent"
              }`}
            >
              <ShieldCheck className={`h-5 w-5 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${isSelected ? "text-primary" : ""}`}>{role.name}</p>
                <p className="text-[11px] font-mono text-muted-foreground truncate">{role.code}</p>
              </div>
              {role.active === 0 && <span className="h-2 w-2 rounded-full bg-destructive shrink-0" title="Đang khóa" />}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
