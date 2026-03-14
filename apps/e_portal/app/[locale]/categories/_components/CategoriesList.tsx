'use client';

import React, { use, useState, useMemo } from 'react';
import { useFetch } from '@/hooks/useFetch';
import {
  Pagination,
} from "@heroui/pagination";
import {
  Chip
} from "@heroui/chip";
import {
  Skeleton
} from "@heroui/skeleton";

import { LayoutGrid, List as ListIcon, CalendarDays, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Đảm bảo đã import cái này
import { Button } from '@heroui/button';
import { Card, CardBody, CardFooter } from '@heroui/card';
import { Image } from '@heroui/image';
import { Select, SelectItem } from '@heroui/select';


function ArticlesDetail({ params }: any) {
  // ... (Giữ nguyên phần logic fetch data của bạn ở trên không thay đổi) ...
  const { id }: any = use(params);
  // console.log("id",id)
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);

  const { data: responseData, isLoading } : any = useFetch(`/posts/category/${id}`, {
    params: {
      _page: page,
      _limit: limit
    }
  });

  // console.log("responseData", responseData)

  const posts = React.useMemo(() => {
    if (!responseData) return [];
    if (Array.isArray(responseData)) return responseData;
    return responseData.data || responseData.items || [];
  }, [responseData]);

  const totalPages = useMemo(() => {
    if (!responseData) return 1;
    return responseData?.pagination?.totalPages || 1;
  }, [responseData, limit]);

  const handleLimitChange = (e: any) => {
    if (e.target.value) {
      setLimit(Number(e.target.value));
      setPage(1);
    }
  };

  if (isLoading) return <LoadingSkeleton viewMode={viewMode} />;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* HEADER TOOLBAR (Giữ nguyên) */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold uppercase text-blue-800">Danh sách bài viết</h1>
          <p className="text-sm text-gray-500">Hiển thị {posts.length} kết quả</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 whitespace-nowrap hidden sm:block">Hiển thị:</span>
            <Select
              className="w-24 md:w-32"
              size="sm"
              aria-label="Chọn số lượng"
              selectedKeys={[String(limit)]}
              onChange={handleLimitChange}
              disallowEmptySelection
            >
              <SelectItem key="6" textValue="6">6 tin</SelectItem>
              <SelectItem key="9" textValue="9">9 tin</SelectItem>
              <SelectItem key="12" textValue="12">12 tin</SelectItem>
              <SelectItem key="24" textValue="24">24 tin</SelectItem>
            </Select>
          </div>

          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg h-10 items-center">
            <Button isIconOnly size="sm" variant={viewMode === 'grid' ? "solid" : "light"} color="primary" onPress={() => setViewMode('grid')}>
              <LayoutGrid size={18} />
            </Button>
            <Button isIconOnly size="sm" variant={viewMode === 'list' ? "solid" : "light"} color="primary" onPress={() => setViewMode('list')}>
              <ListIcon size={18} />
            </Button>
          </div>
        </div>
      </div>

      {/* LIST POSTS */}
      {(!posts || posts.length === 0) ? (
        <div className="text-center py-10 text-gray-500">Không có dữ liệu.</div>
      ) : (
        <div className={`
            w-full transition-all duration-300
            ${viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'flex flex-col gap-4'
          }
          `}>
          {posts.map((post: any) => (
            <ArticleCard key={post.id || Math.random()} post={post} viewMode={viewMode} />
          ))}
        </div>
      )}

      {/* PAGINATION */}
      <div className="flex justify-center mt-8">
        <Pagination
          showControls
          total={totalPages}
          page={page}
          onChange={(p) => {
            setPage(p);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          color="primary"
        />
      </div>
    </div>
  );
}

// ==========================================
// CẬP NHẬT COMPONENT ArticleCard TẠI ĐÂY
// ==========================================
const ArticleCard = ({ post, viewMode }: any) => {
  const router = useRouter(); // 1. Khởi tạo router

  // Giả lập data
  const title = post.title || "Tiêu đề bài viết mẫu";
  const desc = post.body || post.description || "Mô tả tóm tắt...";
  const image = post.image || "https://nextui.org/images/";
  const date = post.createdAt || "28/11/2025";

  // Lấy slug từ post, nếu không có fallback về id
  const slug = post.slug || post.id;

  // 2. Hàm xử lý chuyển trang
  const handlePress = () => {
    if (slug) {
      router.push(`/articles/details/${slug}`);
    }
  };

  // --- View Mode: LIST ---
  if (viewMode === 'list') {
    return (
      <Card
        isPressable
        onPress={handlePress} // 3. Thêm sự kiện bấm vào Card
        shadow="sm"
        className="w-full border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all"
      >
        <CardBody className="flex flex-col sm:flex-row gap-4 p-4 overflow-hidden">
          <div className="relative w-full sm:w-[220px] h-[140px] flex-shrink-0 rounded-lg overflow-hidden">
            <Image
              alt={title}
              className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-500"
              src={image}
              removeWrapper
            />
          </div>

          <div className="flex flex-col justify-between flex-1">
            <div>
              <h3 className="text-lg font-bold text-gray-800 line-clamp-2 mb-2 hover:text-blue-600">
                {title}
              </h3>
              <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                {desc}
              </p>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center text-xs text-gray-400 gap-1">
                <CalendarDays size={14} />
                <span>{date}</span>
              </div>
              {/* 4. Thêm onClick vào nút Xem chi tiết (đề phòng trường hợp click riêng text) */}
              <span
                onClick={(e) => {
                  e.stopPropagation(); // Ngăn sự kiện trùng lặp với Card onPress
                  handlePress();
                }}
                className="text-blue-600 text-sm font-medium flex items-center gap-1 group cursor-pointer hover:underline"
              >
                Xem chi tiết <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  // --- View Mode: GRID ---
  return (
    <Card
      shadow="sm"
      isPressable
      onPress={handlePress} // Thêm sự kiện bấm vào Card
      className="h-full border border-transparent hover:border-blue-200 hover:shadow-lg"
    >
      <CardBody className="p-0 overflow-visible">
        <Image
          radius="none"
          width="100%"
          alt={title}
          className="w-full object-cover h-[200px]"
          src={image}
        />
      </CardBody>
      <CardFooter className="flex flex-col items-start p-4 h-full">
        <div className="flex items-center gap-2 mb-2">
          <Chip size="sm" variant="flat" color="primary" className="text-xs h-6">Tin tức</Chip>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <CalendarDays size={12} /> {date}
          </span>
        </div>
        <h3 className="text-lg font-bold text-gray-800 line-clamp-2 mb-2 hover:text-blue-600">
          {title}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-3">
          {desc}
        </p>
      </CardFooter>
    </Card>
  );
};

const LoadingSkeleton = ({ viewMode }: any) => {
  const items = Array(6).fill(0);
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between mb-8">
        <Skeleton className="w-1/3 h-8 rounded-lg" />
        <Skeleton className="w-24 h-8 rounded-lg" />
      </div>
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-3 gap-6' : 'flex flex-col gap-4'}>
        {items.map((_, i) => (
          <Card key={i} className={`w-full ${viewMode === 'list' ? 'h-[160px]' : 'h-[350px]'} space-y-5 p-4`} radius="lg">
            <div className={`space-y-3 ${viewMode === 'list' ? 'flex gap-4' : ''}`}>
              <Skeleton className={`${viewMode === 'list' ? 'w-[200px] h-full' : 'w-full h-[180px]'} rounded-lg`} />
              <div className="w-full flex flex-col gap-2">
                <Skeleton className="h-3 w-3/5 rounded-lg" />
                <Skeleton className="h-3 w-4/5 rounded-lg" />
                <Skeleton className="h-3 w-2/5 rounded-lg" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default ArticlesDetail;