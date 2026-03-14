'use client'
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Search, Filter, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce"; // Nếu chưa có: npm i use-debounce
// Hoặc dùng hàm debounce thủ công bên dưới nếu không muốn cài thêm thư viện

const DOCUMENT_TYPES = ["Tất cả", "Quyết định", "Chỉ thị", "Công văn", "Kế hoạch", "Thông báo", "Báo cáo", "Nghị quyết"];

export default function DocumentFilter({ totalRecords }: { totalRecords: number }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    // Lấy giá trị hiện tại từ URL để fill vào ô input (giữ trạng thái khi F5)
    const currentSearch = searchParams.get('q')?.toString() || "";
    const currentType = searchParams.get('type')?.toString() || "Tất cả";

    // Hàm xử lý đẩy URL (Debounce 300ms để tránh giật)
    // Nếu bạn không cài 'use-debounce', xem phần Note bên dưới
    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        
        // Reset về trang 1 khi tìm kiếm mới
        params.set('page', '1');

        if (term) {
            params.set('q', term);
        } else {
            params.delete('q');
        }
        replace(`${pathname}?${params.toString()}`);
    }, 300);

    const handleTypeChange = (value: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', '1'); // Reset về trang 1
        
        if (value && value !== "Tất cả") {
            params.set('type', value);
        } else {
            params.delete('type');
        }
        replace(`${pathname}?${params.toString()}`);
    };

    const handleClearSearch = () => {
        const params = new URLSearchParams(searchParams);
        params.delete('q');
        replace(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex flex-col md:flex-row gap-4 justify-between items-end md:items-center bg-white p-4 rounded-xl border border-default-200 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1">
                {/* Ô tìm kiếm từ khóa */}
                <Input
                    className="w-full sm:max-w-[400px]"
                    placeholder="Tìm theo số hiệu, trích yếu..."
                    startContent={<Search className="text-default-400" size={18} />}
                    endContent={
                        currentSearch ? (
                            <button onClick={handleClearSearch}>
                                <X size={16} className="text-default-400 hover:text-default-600" />
                            </button>
                        ) : null
                    }
                    defaultValue={currentSearch}
                    onValueChange={handleSearch}
                    variant="bordered"
                    radius="md"
                />

                {/* Select loại văn bản */}
                <Select 
                    className="w-full sm:max-w-[200px]" 
                    placeholder="Loại văn bản"
                    selectedKeys={[currentType]}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    startContent={<Filter size={18} className="text-default-400" />}
                    variant="bordered"
                    radius="md"
                    disallowEmptySelection
                >
                    {DOCUMENT_TYPES.map((type) => (
                        <SelectItem key={type} textValue={type}>
                            {type}
                        </SelectItem>
                    ))}
                </Select>
            </div>

            {/* Hiển thị tổng số */}
            <div className="text-sm text-default-500 whitespace-nowrap flex items-center gap-1">
                Tìm thấy <span className="font-bold text-primary text-base">{totalRecords}</span> văn bản
            </div>
        </div>
    );
}