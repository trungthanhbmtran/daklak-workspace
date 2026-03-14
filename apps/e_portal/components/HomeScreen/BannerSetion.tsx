'use client'
import { useFetch } from '@/hooks/useFetch';
import Link from 'next/link';
import React from 'react';

// 1. CẤU HÌNH HOST (DOMAIN BACKEND)
// Bạn nên lấy từ biến môi trường (.env) ví dụ: NEXT_PUBLIC_API_URL=http://localhost:8080
const HOST = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

function BannerSection() {
    // Gọi API
    const { data, isLoading, error } : any = useFetch(`/posts/banner`, {
        params: { page: 1, limit: 5 },
    });

    if (isLoading) return (
        <div className="w-full h-48 md:h-96 bg-gray-100 animate-pulse flex items-center justify-center rounded-lg m-4">
            <span className="text-gray-400">Đang tải banner...</span>
        </div>
    );

    if (error) return null;

    // Lấy danh sách banner từ response (data.data)
    const banners = data?.data || [];

    if (banners.length === 0) return null;

    return (
        <section className="w-full my-6">
            <div className="container mx-auto px-4">
                {/* 
                  Sử dụng CSS Scroll Snap để làm slider đơn giản mà không cần thư viện 
                  snap-x: Trục ngang
                  snap-mandatory: Bắt buộc dừng ở 1 phần tử
                */}
                <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 no-scrollbar touch-pan-x">
                    {banners.map((banner: any) => {
                        // 2. XỬ LÝ URL ẢNH
                        // Ghép HOST vào trước đường dẫn từ API
                        const fullImageUrl = `${HOST}${banner.imageUrl}`;
                        
                        // Xử lý tiêu đề hiển thị (Ưu tiên MetaTitle nếu có)
                        const displayTitle = banner.metaTitle || banner.title;

                        return (
                            <Link 
                                key={banner.id}
                                href={banner.customUrl || '#'}
                                target={banner.target || '_self'} // Xử lý _blank nếu có
                                className="relative w-full flex-shrink-0 snap-center rounded-2xl overflow-hidden shadow-lg group block aspect-[16/9] md:aspect-[21/9]"
                            >
                                {/* Hình ảnh Banner */}
                                <img
                                    src={fullImageUrl}
                                    alt={displayTitle}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    onError={(e) => {
                                        // Fallback nếu ảnh lỗi
                                        e.currentTarget.style.display = 'none'; 
                                    }}
                                />

                                {/* Overlay Gradient (Để chữ dễ đọc hơn trên nền ảnh) */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />

                                {/* Nội dung Text */}
                                <div className="absolute bottom-0 left-0 w-full p-4 md:p-8 text-white">
                                    <h3 className="text-lg md:text-3xl font-bold mb-2 drop-shadow-md">
                                        {displayTitle}
                                    </h3>
                                    {/* Chỉ hiển thị description nếu không phải là slug hoặc chuỗi vô nghĩa */}
                                    {banner.description && !banner.description.includes('-') && (
                                        <p className="text-sm md:text-base text-gray-200 line-clamp-2 max-w-2xl">
                                            {banner.description}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default BannerSection;