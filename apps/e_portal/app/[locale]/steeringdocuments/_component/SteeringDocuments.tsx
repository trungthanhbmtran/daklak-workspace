'use client'
import React, { useState, useMemo } from 'react';
import { 
    Table, 
    TableHeader, 
    TableColumn, 
    TableBody, 
    TableRow, 
    TableCell, 
    getKeyValue 
} from "@heroui/table";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Pagination } from "@heroui/pagination";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import { Search, Download, Eye, FileText, Filter, CalendarDays } from "lucide-react";
import DocumentFilter from '@/components/DocumentFilter';
import { useSearchParams } from 'next/navigation';

// --- 1. MOCK DATA: Dữ liệu văn bản giả lập ---
const DOCUMENTS = [
    {
        id: 1,
        number: "125/UBND-TH",
        date: "27/11/2025",
        type: "Công văn",
        signer: "Trần Văn Tân",
        excerpt: "Về việc đẩy mạnh giải ngân vốn đầu tư công những tháng cuối năm 2025 và xây dựng kế hoạch năm 2026.",
        fileUrl: "#"
    },
    {
        id: 2,
        number: "05/2025/QĐ-UBND",
        date: "25/11/2025",
        type: "Quyết định",
        signer: "Nguyễn Tấn Thành",
        excerpt: "Ban hành Quy định về phân cấp quản lý tài sản công tại các cơ quan, tổ chức, đơn vị thuộc phạm vi quản lý của tỉnh.",
        fileUrl: "#"
    },
    {
        id: 3,
        number: "18/CT-STC",
        date: "20/11/2025",
        type: "Chỉ thị",
        signer: "Trần Văn Tân",
        excerpt: "Tăng cường công tác quản lý, điều hành và bình ổn giá cả thị trường dịp Tết Nguyên đán.",
        fileUrl: "#"
    },
    {
        id: 4,
        number: "202/TB-VP",
        date: "18/11/2025",
        type: "Thông báo",
        signer: "Lê Danh Thắng",
        excerpt: "Kết luận của Giám đốc Sở tại cuộc họp giao ban thường kỳ tháng 11 năm 2025.",
        fileUrl: "#"
    },
    {
        id: 5,
        number: "99/KH-STC",
        date: "15/11/2025",
        type: "Kế hoạch",
        signer: "Nguyễn Hoàng Phúc",
        excerpt: "Kế hoạch Chuyển đổi số ngành Tài chính tỉnh Đắk Lắk giai đoạn 2025 - 2030.",
        fileUrl: "#"
    },
    {
        id: 6,
        number: "112/BC-STC",
        date: "10/11/2025",
        type: "Báo cáo",
        signer: "Vũ Đình Vinh",
        excerpt: "Báo cáo tình hình thu chi ngân sách nhà nước 10 tháng đầu năm 2025.",
        fileUrl: "#"
    },
    {
        id: 7,
        number: "88/UBND-KT",
        date: "05/11/2025",
        type: "Công văn",
        signer: "Trần Văn Tân",
        excerpt: "Hướng dẫn thực hiện quy chế chi tiêu nội bộ cho các đơn vị sự nghiệp công lập.",
        fileUrl: "#"
    },
    {
        id: 8,
        number: "02/2025/NQ-HDND",
        date: "01/11/2025",
        type: "Nghị quyết",
        signer: "HĐND Tỉnh",
        excerpt: "Nghị quyết về phân bổ dự toán ngân sách địa phương năm 2025.",
        fileUrl: "#"
    }
];

const DOCUMENT_TYPES = ["Tất cả", "Quyết định", "Chỉ thị", "Công văn", "Kế hoạch", "Thông báo", "Báo cáo", "Nghị quyết"];

// Cấu hình màu sắc cho Chip loại văn bản
const getTypeColor = (type: string) => {
    switch (type) {
        case "Quyết định": return "danger";
        case "Chỉ thị": return "warning";
        case "Kế hoạch": return "success";
        case "Công văn": return "primary";
        case "Nghị quyết": return "secondary";
        default: return "default";
    }
};

export default function SteeringDocuments() {
    const searchParams = useSearchParams();
    
    // 1. Lấy tham số từ URL
    const query = searchParams.get('q')?.toLowerCase() || "";
    const typeFilter = searchParams.get('type') || "Tất cả";
    const currentPage = Number(searchParams.get('page')) || 1;
    const rowsPerPage = 5;

    // 2. Logic Lọc dữ liệu (Mô phỏng API Backend)
    // Sau này thay đoạn này bằng: const { data } = useFetch(`/api/docs?q=${query}&type=${typeFilter}...`)
    const filteredItems = useMemo(() => {
        return DOCUMENTS.filter((item) => {
            const matchesSearch = item.number.toLowerCase().includes(query) || 
                                  item.excerpt.toLowerCase().includes(query);
            const matchesType = typeFilter === "Tất cả" || item.type === typeFilter;
            
            return matchesSearch && matchesType;
        });
    }, [query, typeFilter]);

    // 3. Logic Phân trang
    const totalPages = Math.ceil(filteredItems.length / rowsPerPage);
    const itemsOnPage = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return filteredItems.slice(start, start + rowsPerPage);
    }, [currentPage, filteredItems]);

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl md:text-3xl font-bold text-primary uppercase">
                    Văn bản chỉ đạo điều hành
                </h1>
                <p className="text-default-500 text-sm">
                    Hệ thống văn bản pháp quy, công văn, chỉ thị của Sở Tài chính.
                </p>
            </div>

            {/* --- NHÚNG COMPONENT TÌM KIẾM --- */}
            {/* Component này tự xử lý URL, trang cha chỉ việc re-render khi URL đổi */}
            <DocumentFilter totalRecords={filteredItems.length} />

            {/* Bảng dữ liệu */}
            <Table 
                aria-label="Bảng văn bản"
                bottomContent={
                    totalPages > 0 ? (
                        <div className="flex w-full justify-center mt-4">
                            <Pagination
                                isCompact showControls showShadow
                                color="primary"
                                page={currentPage}
                                total={totalPages}
                                // Khi đổi trang -> Đẩy lên URL
                                onChange={(page) => {
                                    const params = new URLSearchParams(searchParams);
                                    params.set('page', page.toString());
                                    // Dùng window.history hoặc router.push để update
                                    // Ở đây dùng thẻ Link của NextUI pagination hoặc wrap router
                                    window.history.pushState(null, '', `?${params.toString()}`);
                                }}
                            />
                        </div>
                    ) : null
                }
                classNames={{
                    wrapper: "min-h-[400px] shadow-sm border border-default-200",
                    th: "bg-default-100 text-default-700 font-bold h-12",
                }}
            >
                <TableHeader>
                    <TableColumn width={160}>SỐ HIỆU / NGÀY</TableColumn>
                    <TableColumn width={120} className="hidden sm:table-cell">LOẠI</TableColumn>
                    <TableColumn>TRÍCH YẾU NỘI DUNG</TableColumn>
                    <TableColumn width={150} className="hidden md:table-cell">NGƯỜI KÝ</TableColumn>
                    <TableColumn width={100} align="center">THAO TÁC</TableColumn>
                </TableHeader>
                <TableBody emptyContent="Không tìm thấy văn bản nào." items={itemsOnPage}>
                    {(item) => (
                        <TableRow key={item.id} className="border-b border-default-100 last:border-0 hover:bg-default-50">
                            <TableCell className="align-top py-4">
                                <div className="flex flex-col gap-1">
                                    <span className="font-bold text-foreground text-sm whitespace-nowrap">{item.number}</span>
                                    <div className="flex items-center gap-1 text-xs text-default-400">
                                        <CalendarDays size={12} />
                                        {item.date}
                                    </div>
                                    <div className="sm:hidden mt-1">
                                         <Chip size="sm" variant="flat" color={getTypeColor(item.type) as any}>{item.type}</Chip>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell align-top py-4">
                                <Chip size="sm" variant="flat" color={getTypeColor(item.type) as any}>{item.type}</Chip>
                            </TableCell>
                            <TableCell className="align-top py-4">
                                <p className="text-sm text-default-700 line-clamp-2 hover:line-clamp-none transition-all">
                                    {item.excerpt}
                                </p>
                            </TableCell>
                            <TableCell className="hidden md:table-cell align-top py-4">
                                <span className="text-sm font-medium text-default-600">{item.signer}</span>
                            </TableCell>
                            <TableCell className="align-top py-4">
                                <div className="flex items-center justify-center gap-2">
                                    <Tooltip content="Xem">
                                        <Button isIconOnly size="sm" variant="light" color="primary"><Eye size={18} /></Button>
                                    </Tooltip>
                                    <Tooltip content="Tải về">
                                        <Button isIconOnly size="sm" variant="flat" color="primary"><Download size={18} /></Button>
                                    </Tooltip>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}