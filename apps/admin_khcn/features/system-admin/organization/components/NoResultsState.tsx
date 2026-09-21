import { Search as SearchIcon } from "lucide-react";

export function NoResultsState() {
    return (
        <div className="py-10 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
            <SearchIcon className="h-6 w-6 text-muted-foreground/30" />
            <p>Không tìm thấy kết quả phù hợp.</p>
        </div>
    );
}