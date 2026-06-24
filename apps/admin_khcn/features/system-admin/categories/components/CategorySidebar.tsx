import { Search, FolderGit2, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SidebarProps {
  isLoading: boolean;
  searchGroupTerm: string;
  setSearchGroupTerm: (val: string) => void;
  filteredGroups: { code: string; name: string }[];
  activeGroup: string;
  onSelectGroup: (group: string) => void;
  uniqueGroups: { code: string; name: string }[];
}

export function CategorySidebar({ isLoading, searchGroupTerm, setSearchGroupTerm, filteredGroups, activeGroup, onSelectGroup, uniqueGroups }: SidebarProps) {
  return (
    <>
      <Card className="hidden md:flex w-72 shrink-0 flex-col p-3 border-border/50 shadow-sm h-full min-h-0">
        <div className="flex flex-col gap-3 mb-3 shrink-0">
          <div className="px-1 text-xs font-bold text-muted-foreground uppercase tracking-wider">Nhóm danh mục</div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm nhóm danh mục..."
              className="pl-8 h-9 text-sm bg-muted/30 focus:bg-background transition-colors"
              value={searchGroupTerm}
              onChange={(e) => setSearchGroupTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto pr-1 space-y-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40">
          {isLoading ? (
            <div className="flex items-center justify-center py-4 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mr-2" /> Đang tải...</div>
          ) : filteredGroups.length > 0 ? (
            filteredGroups.map((group) => {
              const isActive = activeGroup === group.code;
              return (
                <Button
                  key={group.code}
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full justify-start font-normal transition-colors h-9 px-3 ${isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"}`}
                  onClick={() => onSelectGroup(group.code)}
                >
                  <FolderGit2 className={`mr-2 h-4 w-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="truncate">{group.name}</span>
                </Button>
              );
            })
          ) : (
            <div className="text-center text-sm text-muted-foreground py-4">Không tìm thấy nhóm</div>
          )}
        </div>
      </Card>

      <div className="w-full md:hidden mb-2">
        <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Chọn Nhóm danh mục:</label>
        <Select value={activeGroup} onValueChange={onSelectGroup}>
          <SelectTrigger className="w-full bg-background h-11"><SelectValue placeholder="Chọn nhóm danh mục" /></SelectTrigger>
          <SelectContent>
            {uniqueGroups.map((group) => (
              <SelectItem key={group.code} value={group.code}>{group.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
