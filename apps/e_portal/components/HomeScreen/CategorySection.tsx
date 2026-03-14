'use client';
import React from 'react';
import { Calendar, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useFetch } from '@/hooks/useFetch';

interface CategorySectionProps {
  title: string;
  categorySlug: string;
  limit?: number;
  isSidebar?: boolean; // Thêm prop này để nhận biết nếu nằm ở cột phụ
}

export default function CategorySection({ title, categorySlug, limit = 5, isSidebar = false }: CategorySectionProps) {
  const { data: response, isLoading }: any = useFetch(`/posts`, {
    params: { category : categorySlug, limit },
  });

  const posts = response?.data || [];
  if (isLoading || posts.length === 0) return null;

  const mainPost = posts[0];
  const subPosts = posts.slice(1);

  return (
    // BỎ container mx-auto ở đây để nó không bị tràn
    <section className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 mb-4 pb-2">
        <h2 className="text-lg font-bold text-gray-800 border-l-4 border-[#da251d] pl-3 uppercase">
          {title}
        </h2>
        <Link href={`/vi/articles/${categorySlug}`} className="text-xs text-[#005a8d] hover:underline">
          Xem thêm
        </Link>
      </div>

      {/* Grid: Nếu là Sidebar thì 1 cột, nếu là Main thì 2 cột */}
      <div className={`grid grid-cols-1 ${isSidebar ? '' : 'lg:grid-cols-2'} gap-6`}>
        
        {/* Bài chính: Chỉ hiện ảnh to nếu KHÔNG PHẢI sidebar hoặc sidebar nhưng muốn hiện 1 ảnh đầu */}
        <div className="group">
          <Link href={`/vi/articles/${categorySlug}/${mainPost.slug}`}>
            <div className="relative aspect-video overflow-hidden rounded mb-3">
              <img
                src={mainPost.thumbnail || 'https://placehold.co/400x250'}
                alt={mainPost.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <h3 className="font-bold text-sm md:text-base leading-snug group-hover:text-[#da251d]">
              {mainPost.title}
            </h3>
          </Link>
        </div>

        {/* Danh sách bài phụ */}
        <div className="space-y-3">
          {subPosts.map((post: any) => (
            <Link 
              key={post.id} 
              href={`/vi/articles/${categorySlug}/${post.slug}`}
              className="flex gap-3 border-b border-dotted border-gray-200 pb-2 last:border-0"
            >
              <div className="flex-1">
                <h4 className="text-sm font-medium line-clamp-2 hover:text-[#005a8d]">
                  {post.title}
                </h4>
                <span className="text-[10px] text-gray-400 flex items-center mt-1">
                  <Calendar className="w-3 h-3 mr-1" /> {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}