import { useState } from "react";
import { UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FormLabel } from "@/components/ui/form";

interface Props {
  attendees: string[];
  setAttendees: (attendees: string[]) => void;
}

export function AttendeesField({ attendees, setAttendees }: Props) {
  const [newAttendee, setNewAttendee] = useState("");

  const addAttendee = () => {
    if (newAttendee.trim()) {
      setAttendees([...attendees, newAttendee.trim()]);
      setNewAttendee("");
    }
  };

  const removeAttendee = (index: number) => {
    setAttendees(attendees.filter((_, i) => i !== index));
  };

  return (
    <div className="md:col-span-12 space-y-4">
      <div className="flex items-center justify-between">
        <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Thành phần tham dự</FormLabel>
        <Badge variant="outline" className="font-mono">{attendees.length} thành viên</Badge>
      </div>
      <div className="flex gap-2">
        <Input 
          placeholder="Nhập tên thành viên..." 
          value={newAttendee} 
          onChange={(e) => setNewAttendee(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAttendee())}
          className="bg-muted/5 border-dashed"
        />
        <Button type="button" size="icon" onClick={addAttendee} variant="secondary" iconStart={<UserPlus className="h-4 w-4" />}></Button>
      </div>
      <div className="flex flex-wrap gap-2 p-4 border rounded-xl bg-muted/5 min-h-[60px]">
        {attendees.map((name, i) => (
          <Badge key={i} className="pl-3 pr-1 py-1.5 bg-background text-foreground border shadow-sm group">
            {name}
            <Button type="button" onClick={() => removeAttendee(i)} className="ml-2 p-0.5 rounded-full hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
        {attendees.length === 0 && <span className="text-xs text-muted-foreground italic mt-2">Chưa có thành viên tham dự...</span>}
      </div>
    </div>
  );
}
