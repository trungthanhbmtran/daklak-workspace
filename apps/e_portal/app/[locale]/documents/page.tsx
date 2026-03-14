'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardBody, CardFooter } from "@heroui/card";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Button } from '@heroui/button';
import { Skeleton } from "@heroui/skeleton";
import { Pagination } from "@heroui/pagination";
import { Select, SelectItem } from "@heroui/select";
import { useParams } from 'next/navigation';
import { useFetch } from '@/hooks/useFetch';

// --- DEFINITIONS ---
interface DocumentAPI {
    docNumber: string;
    title: string;
    content: string;
    categoryId: number;
    documentTypeId: number;
    issueDate: string;
    signer: string;
    fileName: string;
    fileUrl: string;
    status: boolean;
}

// Map màu sắc và icon cho từng loại văn bản
const getDocumentTypeInfo = (typeId: number) => {
    const types: Record<number, { name: string; color: "primary" | "secondary" | "warning" | "success" | "danger" | "default"; bgClass: string }> = {
        1: { name: 'Quyết định', color: 'primary', bgClass: 'bg-blue-50 text-blue-600' },
        2: { name: 'Thông tư', color: 'secondary', bgClass: 'bg-purple-50 text-purple-600' },
        3: { name: 'Báo cáo', color: 'warning', bgClass: 'bg-orange-50 text-orange-600' },
        4: { name: 'Chỉ thị', color: 'danger', bgClass: 'bg-red-50 text-red-600' },
    };
    return types[typeId] || { name: 'Văn bản', color: 'default', bgClass: 'bg-gray-50 text-gray-600' };
};

// --- FIX HYDRATION ERROR ---
// Thay vì dùng new Date() (phụ thuộc múi giờ), ta xử lý chuỗi string trực tiếp.
// Input giả định: "2025-10-13T00:00:00.000Z" hoặc "2025-10-13"
const formatDateSafe = (dateString: string) => {
    if (!dateString) return '---';
    try {
        // Lấy phần YYYY-MM-DD
        const isoDate = dateString.split('T')[0];
        const [year, month, day] = isoDate.split('-');
        if (!year || !month || !day) return dateString; // Fallback
        return `${day}/${month}/${year}`;
    } catch (e) {
        return dateString;
    }
};

// Icon SVG Components để làm đẹp giao diện
const FileTextIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
);

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);

export default function DocumentsPage() {
    const slug = useParams().slug as string;

    // State
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(9); // Để 9 chia hết cho 3 cột grid
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch Data
    const { data: fetchedData, meta, isPending }: any = useFetch("/documents", {
        params: { 
            category: slug,
            page: page,
            pageSize: limit,
            search: searchQuery 
        }
    });

    const documents: DocumentAPI[] = Array.isArray(fetchedData) ? fetchedData : (fetchedData?.data || []);
    const pagination = meta?.pagination || { total: 0, page: 1, pageSize: 9, totalPages: 1 };

    const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLimit(Number(e.target.value));
        setPage(1);
    };

    return (
        <div className="flex flex-col min-h-[85vh] max-w-7xl mx-auto w-full px-2">
            {/* --- HEADER SECTION --- */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
                        Thư viện <span className="text-primary">Văn bản</span>
                    </h1>
                    <p className="text-gray-500 font-medium">
                        Tra cứu, tìm kiếm và tải xuống các văn bản hành chính chính thức.
                    </p>
                </div>
                <div className="w-full md:w-96">
                    <Input
                        placeholder="Tìm kiếm theo số hiệu, trích yếu..."
                        radius="lg"
                        classNames={{
                            inputWrapper: "bg-white shadow-sm border border-gray-200 hover:border-primary focus-within:!border-primary transition-all",
                        }}
                        startContent={<SearchIcon />}
                        isClearable
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                    />
                </div>
            </div>

            <Divider className="mb-8 opacity-50" />

            {/* --- LOADING SKELETON --- */}
            {isPending && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, idx) => (
                        <Card key={idx} className="p-5 space-y-4 shadow-sm border border-gray-100" radius="lg">
                            <div className="flex justify-between">
                                <Skeleton className="rounded-lg w-20 h-6"/>
                                <Skeleton className="rounded-lg w-24 h-6"/>
                            </div>
                            <Skeleton className="rounded-lg w-full h-16"/>
                            <div className="flex gap-2 pt-2">
                                <Skeleton className="rounded-full w-8 h-8"/>
                                <div className="flex flex-col gap-1 w-full">
                                    <Skeleton className="rounded w-3/4 h-3"/>
                                    <Skeleton className="rounded w-1/2 h-3"/>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* --- EMPTY STATE --- */}
            {!isPending && documents.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="bg-gray-100 p-4 rounded-full mb-4">
                        <FileTextIcon />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Không tìm thấy dữ liệu</h3>
                    <p className="text-gray-500">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.</p>
                </div>
            )}

            {/* --- DOCUMENT GRID (NEW DESIGN) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {!isPending && documents.map((doc, index) => {
                    const typeInfo = getDocumentTypeInfo(doc.documentTypeId);
                    const detailId = encodeURIComponent(doc.docNumber.replace(/\//g, '-')); 

                    return (
                        <Card 
                            key={index} 
                            className="group relative border border-gray-100 bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full overflow-visible"
                            shadow="sm"
                            radius="lg"
                        >
                            {/* Decorative Top Border */}
                            <div className={`absolute top-0 left-0 right-0 h-1 ${typeInfo.color === 'primary' ? 'bg-blue-500' : typeInfo.color === 'secondary' ? 'bg-purple-500' : 'bg-orange-500'}`} />

                            <CardBody className="p-5 flex flex-col gap-3">
                                {/* Top Row: Type & Date */}
                                <div className="flex justify-between items-start">
                                    <Chip 
                                        className={`${typeInfo.bgClass} border-none font-semibold`} 
                                        size="sm" 
                                        radius="sm"
                                        variant="flat"
                                    >
                                        {typeInfo.name}
                                    </Chip>
                                    <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                        {formatDateSafe(doc.issueDate)}
                                    </span>
                                </div>

                                {/* Title Area */}
                                <div className="mt-1">
                                    <Link href={`/documents/${slug}/${detailId}`} className="block">
                                        <h3 className="text-base font-bold text-gray-800 leading-snug line-clamp-2 group-hover:text-primary transition-colors min-h-[3rem]" title={doc.title}>
                                            {doc.title}
                                        </h3>
                                    </Link>
                                    {/* Doc Number Badge */}
                                    <div className="mt-2 inline-flex items-center gap-2">
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Số hiệu:</span>
                                        <span className="text-xs font-bold text-gray-700 font-mono bg-gray-100 px-2 py-0.5 rounded">
                                            {doc.docNumber}
                                        </span>
                                    </div>
                                </div>

                                <Divider className="my-1 opacity-50"/>

                                {/* Abstract / Summary */}
                                <div className="flex-grow">
                                    <div className="flex items-start gap-2 mb-2">
                                        <div className="mt-0.5 min-w-[4px] h-[4px] rounded-full bg-gray-300" />
                                        <p className="text-xs text-gray-500 font-medium line-clamp-1">
                                            Ký bởi: <span className="text-gray-700">{doc.signer}</span>
                                        </p>
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 opacity-90">
                                        {doc.content}
                                    </p>
                                </div>
                            </CardBody>

                            <CardFooter className="px-5 pb-5 pt-0 mt-auto">
                                <Button
                                    as={Link}
                                    href={`/documents/${slug}/${detailId}`}
                                    className="w-full font-medium bg-gray-50 text-gray-600 hover:bg-primary hover:text-white border border-gray-200 hover:border-primary transition-colors shadow-sm"
                                    variant="flat"
                                    radius="lg"
                                    size="md"
                                >
                                    Xem chi tiết
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>

            {/* --- PAGINATION --- */}
            {!isPending && documents.length > 0 && (
                <div className="mt-auto pt-6 border-t border-gray-100 bg-white/50 backdrop-blur-sm sticky bottom-0 pb-4 z-10">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span>Hiển thị:</span>
                            <Select 
                                className="w-20" 
                                size="sm" 
                                selectedKeys={[String(limit)]}
                                onChange={handleLimitChange}
                                aria-label="Số dòng mỗi trang"
                                disallowEmptySelection
                                variant="bordered"
                            >
                                <SelectItem key="6">6</SelectItem>
                                <SelectItem key="9">9</SelectItem>
                                <SelectItem key="12">12</SelectItem>
                                <SelectItem key="24">24</SelectItem>
                            </Select>
                            <span className="hidden sm:inline text-gray-400">|</span>
                            <span className="hidden sm:inline">Tổng: <b>{pagination.total}</b></span>
                        </div>

                        <Pagination 
                            total={pagination.totalPages} 
                            page={page} 
                            onChange={setPage}
                            color="primary"
                            showControls
                            isCompact
                            radius="full"
                            classNames={{
                                wrapper: "gap-1",
                                cursor: "bg-primary shadow-lg shadow-primary/40 font-bold",
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}