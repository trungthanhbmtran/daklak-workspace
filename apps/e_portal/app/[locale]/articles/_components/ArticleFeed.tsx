// components/ArticleFeed.tsx
"use client";

import { useState, useMemo } from "react";
import { Button } from "@heroui/button";
import { Image as HeroImage } from "@heroui/image";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Link } from "@heroui/link";
import { Spacer } from "@heroui/spacer";
import { useFetch } from "@/hooks/useFetch";
import { Pagination } from "@heroui/pagination";
// 1. Import Dropdown components
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem
} from "@heroui/dropdown";

// Icon Grid
const GridIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 3H3V10H10V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M21 3H14V10H21V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M21 14H14V21H21V14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M10 14H3V21H10V14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

// Icon List
const ListIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M8 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M8 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 6H3.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 12H3.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 18H3.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

// Icon Chevron Down cho Dropdown
const ChevronDownIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
);

export default function ArticleFeed({ category}: any) {
    
    // State
    const [page, setPage] = useState(1);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    // 2. State cho limit (số lượng hiển thị)
    const [currentLimit, setCurrentLimit] = useState(2);

    // 3. Cập nhật params: dùng currentLimit
    console.log("category",category)
    const { data, isLoading, error } : any = useFetch(`/posts`, { 
        params: { 
            category,
            page: page,
            limit: currentLimit // <-- Dùng state thay vì props
        } 
    });

    const articles = data?.data || [];
    const pagination = data?.meta?.pagination || {};

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        // window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 4. Hàm xử lý khi chọn limit mới
    const onLimitChange = (keys: any) => {
        // Lấy giá trị từ Set (HeroUI trả về Set)
        const selectedValue = Array.from(keys).join(""); 
        const newLimit = Number(selectedValue);
        
        if (newLimit !== currentLimit) {
            setCurrentLimit(newLimit);
            setPage(1); // Quan trọng: Reset về trang 1 khi đổi số lượng hiển thị
        }
    };

    return (
        <div className="w-full">
            {/* --- Toolbar --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold">Bài viết mới nhất</h2>

                <div className="flex gap-4 items-center">
                    {/* 5. Dropdown chọn Limit */}
                    <div className="flex items-center gap-2">
                        <span className="text-small text-default-500">Hiển thị:</span>
                        <Dropdown>
                            <DropdownTrigger>
                                <Button 
                                    variant="flat" 
                                    color="default" 
                                    size="sm"
                                    endContent={<ChevronDownIcon />}
                                >
                                    {currentLimit}
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu 
                                aria-label="Chọn số lượng hiển thị"
                                disallowEmptySelection
                                selectionMode="single"
                                selectedKeys={new Set([String(currentLimit)])}
                                onSelectionChange={onLimitChange}
                            >
                                <DropdownItem key="6">6 bài</DropdownItem>
                                <DropdownItem key="9">9 bài</DropdownItem>
                                <DropdownItem key="12">12 bài</DropdownItem>
                                <DropdownItem key="24">24 bài</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>

                    {/* View Mode Buttons */}
                    <div className="flex gap-2 border-l pl-4 border-default-200">
                        <Button
                            isIconOnly
                            size="sm"
                            variant={viewMode === "grid" ? "solid" : "flat"}
                            color={viewMode === "grid" ? "primary" : "default"}
                            onPress={() => setViewMode("grid")}
                        >
                            <GridIcon />
                        </Button>
                        <Button
                            isIconOnly
                            size="sm"
                            variant={viewMode === "list" ? "solid" : "flat"}
                            color={viewMode === "list" ? "primary" : "default"}
                            onPress={() => setViewMode("list")}
                        >
                            <ListIcon />
                        </Button>
                    </div>
                </div>
            </div>

            {/* --- Loading State --- */}
            {isLoading && <div className="text-center py-10 text-default-500">Đang tải dữ liệu...</div>}

            {/* --- Content Area --- */}
            {!isLoading && (
                <div className={
                    viewMode === "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                        : "flex flex-col gap-4"
                }>
                    {articles.length > 0 ? articles.map((item: any) => (
                        <Card
                            as={Link}
                            key={item.slug}
                            isPressable
                            shadow="sm"
                            href={`/vi/articles/${item.category?.slug}/${item.slug}`}
                            className={`w-full hover:scale-[1.02] transition-transform ${viewMode === 'list' ? 'flex-row h-auto sm:h-48' : ''}`}
                        >
                            {/* Ảnh Thumbnail */}
                            <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-1/3 min-w-[120px]' : 'w-full h-48'}`}>
                                <HeroImage
                                    removeWrapper
                                    alt={item.title}
                                    className="z-0 w-full h-full object-cover"
                                    src={
                                        item.thumbnail && item.thumbnail !== ""
                                            ? item.thumbnail
                                            : "/no-image.jpg"
                                    }
                                />
                            </div>

                            {/* Nội dung bài viết */}
                            <CardBody className={`flex flex-col justify-between ${viewMode === 'list' ? 'w-2/3 p-4' : 'p-4'}`}>
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <Chip size="sm" color="primary" variant="flat">{item.category?.name}</Chip>
                                        <span className="text-tiny text-default-500">{item.date}</span>
                                    </div>

                                    <h3 className="text-lg font-bold line-clamp-2 mb-2">{item.title}</h3>

                                    <p className="text-small text-default-500 line-clamp-2">
                                        {item.description}
                                    </p>
                                </div>

                                {viewMode === 'grid' && <Spacer y={2} />}

                                <div className="flex items-center gap-2 mt-auto pt-2">
                                    <div className="w-6 h-6 rounded-full bg-default-300">
                                        <img src={`https://i.pravatar.cc/150?u=${item.authorId}`} alt="avatar" className="rounded-full" />
                                    </div>
                                    <span className="text-tiny font-semibold text-default-600">{item.authorId}</span>
                                </div>
                            </CardBody>
                        </Card>
                    )) : (
                        <div className="col-span-full text-center py-10 text-default-500">
                            Không tìm thấy bài viết nào.
                        </div>
                    )}
                </div>
            )}

            {/* --- Pagination --- */}
            {!isLoading && pagination.totalPages > 1 && (
                <div className="flex justify-center mt-8">
                    <Pagination
                        page={page}
                        total={pagination.totalPages}
                        onChange={handlePageChange}
                        color="primary"
                        showControls
                    />
                </div>
            )}
        </div>
    );
}