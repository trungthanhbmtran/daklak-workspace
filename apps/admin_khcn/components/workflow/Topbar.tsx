import React from "react";
import { 
  ChevronLeft, 
  Save, 
  Send, 
  History, 
  Settings,
  MoreVertical,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface TopbarProps {
  onSave: () => void;
  onPublish: () => void;
}

export const Topbar = ({ onSave, onPublish }: TopbarProps) => {
  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 lg:px-6 shadow-sm z-50">
      <div className="flex items-center gap-4">
        <Link href="/hub">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted/80 transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner">
          <Layers className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight">Workflow Builder</h1>
            <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/20 text-[10px] uppercase font-bold px-1.5 py-0">
              v1.0.4-draft
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Same as draft • Last saved 2m ago
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          className="rounded-xl border-border/60 font-medium hover:bg-muted/60 transition-all px-4"
          onClick={onSave}
        >
          <Save className="h-4 w-4 mr-2 text-primary" />
          Save Draft
        </Button>
        <Button 
          size="sm" 
          className="rounded-xl font-bold px-4 shadow-md shadow-primary/10 hover:shadow-primary/20 transition-all border-none"
          onClick={onPublish}
        >
          <Send className="h-4 w-4 mr-2" />
          Publish
        </Button>
        <div className="h-6 w-[1px] bg-border/60 mx-1" />
        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-muted text-muted-foreground">
          <History className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-muted text-muted-foreground">
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-muted text-muted-foreground">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};

export default Topbar;
