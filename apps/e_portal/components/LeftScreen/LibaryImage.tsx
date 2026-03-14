'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@heroui/card';
import { Divider } from '@heroui/divider';
import { Button } from '@heroui/button';

interface ImageItem {
  id: number;
  title: string;
  src: string;
  description?: string;
}

interface LibraryImageProps {
  images?: ImageItem[];
}

const LibraryImage: React.FC<LibraryImageProps> = ({ images }: any) => {
  const defaultImages: ImageItem[] = images ?? [
    {
      id: 1,
      title: 'Trụ sở Sở Tài Chính',
      src: '/images/so-tai-chinh-tru-so.jpg',
      description: 'Hình ảnh trụ sở làm việc của Sở Tài Chính.',
    },
    {
      id: 2,
      title: 'Hội nghị tài chính công',
      src: '/images/hoi-nghi-tai-chinh.jpg',
      description: 'Hội nghị triển khai các nhiệm vụ tài chính – ngân sách.',
    },
    {
      id: 3,
      title: 'Báo cáo thu – chi ngân sách',
      src: '/images/bao-cao-tai-chinh.jpg',
      description: 'Tổng hợp số liệu báo cáo thu – chi ngân sách hằng năm.',
    },
    {
      id: 4,
      title: 'Hướng dẫn kê khai ngân sách điện tử',
      src: '/images/ke-khai-ngan-sach.jpg',
      description: 'Quy trình thực hiện kê khai và quản lý ngân sách điện tử.',
    },
    {
      id: 5,
      title: 'Làm việc với doanh nghiệp',
      src: '/images/lam-viec-doanh-nghiep.jpg',
      description: 'Buổi làm việc giữa Sở Tài Chính và doanh nghiệp địa phương.',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentImage = defaultImages[currentIndex];

  const prevImage = () =>
    setCurrentIndex((prev) => (prev === 0 ? defaultImages.length - 1 : prev - 1));
  const nextImage = () =>
    setCurrentIndex((prev) => (prev === defaultImages.length - 1 ? 0 : prev + 1));

  return (
    <Card radius="none" className="w-full max-w-md">
      {/* Header: title + prev/next */}
      <CardHeader className="flex justify-between items-center gap-2">
        <Button size="sm" variant="flat" onPress={prevImage}>
          Trước
        </Button>
        <h2 className="text-base font-semibold text-center flex-1 text-current truncate px-1">
          Ảnh
        </h2>
        <Button size="sm" variant="flat" onPress={nextImage}>
          Tiếp
        </Button>
      </CardHeader>

      <Divider />

      {/* Body: image + description */}
      <CardBody className="flex flex-col items-center gap-2">
        <div className="w-full aspect-video">
          <img
            src={currentImage.src}
            alt={currentImage.title}
            className="w-full h-full object-cover rounded"
          />
        </div>
        {currentImage.description && (
          <p className="text-xs sm:text-sm text-center text-current line-clamp-2">
            {currentImage.description}
          </p>
        )}
      </CardBody>
    </Card>
  );
};

export default LibraryImage;
