'use client';
import React from 'react';
import { Calendar, FileText, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useFetch } from '@/hooks/useFetch';

// Hàm helper để format ngày tháng
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export default function FeaturedNews() {
  // Fetch dữ liệu
  const { data: response, isLoading, error }: any = useFetch(`/posts`, {
    params: { isFeatured: true }, // Hoặc bỏ filter này nếu API trả về data mẫu như bạn cung cấp
  });

  if (isLoading) return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Lỗi khi tải tin tức.</div>;

  // Kiểm tra nếu không có dữ liệu
  if (!response || !response.data || response.data.length === 0) {
    return <div className="p-8 text-center text-gray-500">Không có tin nổi bật nào.</div>;
  }

  // Tách bài viết: Bài đầu tiên là tin chính, các bài còn lại là tin phụ
  const posts = response.data;
  const mainPost = posts[0];
  const sidePosts = posts.slice(1, 6); // Lấy tối đa 5 bài tin phụ

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 container mx-auto px-4">
      {/* --- Main Featured News (Left - 8 cols) --- */}
      <div className="lg:col-span-8 bg-white shadow-md rounded-lg overflow-hidden group cursor-pointer border border-gray-100">
        <Link href={`/vi/articles/thong-bao/${mainPost.slug}`}>
          <div className="relative h-64 md:h-96 overflow-hidden">
            {/* Ảnh thumbnail (Dùng ảnh placeholder nếu API trả về rỗng) */}
            <img
              src={mainPost.thumbnail || 'https://placehold.co/800x600?text=No+Image'}
              alt={mainPost.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Overlay Gradient & Title */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6 pt-24">
              <h2 className="text-xl md:text-3xl font-bold text-white mb-3 leading-tight line-clamp-2">
                {mainPost.title}
              </h2>
              <div className="flex items-center text-gray-300 text-sm gap-4">
                <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> {formatDate(mainPost.createdAt)}
                </span>
                {mainPost.category && (
                   <span className="bg-[#da251d] text-white text-xs px-2 py-0.5 rounded">
                     {mainPost.category.name}
                   </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Summary */}
          <div className="p-5 bg-white">
            <p className="text-gray-700 text-base md:text-lg leading-relaxed line-clamp-3">
              {mainPost.description || mainPost.title}
            </p>
          </div>
        </Link>
      </div>

      {/* --- Side News List (Right - 4 cols) --- */}
      <div className="lg:col-span-4 flex flex-col h-full">
        <div className="bg-white shadow-md rounded-lg p-5 h-full border border-gray-100 flex flex-col">
          <h3 className="text-[#da251d] font-bold text-lg uppercase border-b-2 border-[#da251d] pb-3 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" /> Tin nổi bật khác
          </h3>
          
          <ul className="space-y-4 flex-1 overflow-y-auto">
            {sidePosts.map((news: any) => (
              <li key={news.id} className="group cursor-pointer border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                <Link href={`/vi/articles/thong-bao/${news.slug}`} className="flex gap-3 items-start">
                  <span className="text-[#da251d] font-bold text-lg leading-none mt-1">•</span>
                  <div>
                    <p className="text-gray-800 font-medium group-hover:text-[#005a8d] transition-colors text-sm leading-snug line-clamp-2">
                      {news.title}
                    </p>
                    <span className="text-xs text-gray-400 mt-1 block">
                        {formatDate(news.createdAt)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-6 pt-2 border-t border-gray-100 text-right">
            <Link href="/tin-tuc" className="text-sm text-[#005a8d] hover:underline italic flex items-center justify-end font-medium">
              Xem tất cả <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}