import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-muted/5">
      <div className="flex flex-col items-center gap-4 text-primary">
        <Loader2 className="h-10 w-10 animate-spin" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Đang tải giao diện quản trị...
        </p>
      </div>
    </div>
  );
}
