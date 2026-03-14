'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '@heroui/card';
import { Divider } from '@heroui/divider';
import { Button } from '@heroui/button';


interface VideoItem {
  id: number;
  title: string;
  src: string;
  description?: string;
  thumbnail?: string;
}

const LibraryVideo: React.FC = () => {
  const videos: VideoItem[] = [
    {
      id: 1,
      title: "Giới thiệu Sở Tài Chính",
      src: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      description: "Tổng quan chức năng, nhiệm vụ và các mảng công tác chính của Sở Tài Chính."
    },
    {
      id: 2,
      title: "Hướng dẫn lập dự toán ngân sách",
      src: "https://www.youtube.com/embed/oHg5SJYRHA0",
      description: "Quy trình lập dự toán ngân sách nhà nước dành cho đơn vị sử dụng ngân sách."
    },
    {
      id: 3,
      title: "Báo cáo tài chính năm 2025",
      src: "https://www.youtube.com/embed/9bZkp7q19f0",
      description: "Tổng hợp số liệu tài chính, thu – chi ngân sách và hiệu quả sử dụng nguồn lực trong năm 2025."
    },
    {
      id: 4,
      title: "Hướng dẫn kê khai & tra cứu thuế điện tử",
      src: "https://www.youtube.com/embed/3JZ_D3ELwOQ",
      description: "Hướng dẫn người dân và doanh nghiệp thực hiện kê khai, nộp và tra cứu thuế online."
    },
    {
      id: 5,
      title: "Chính sách tài chính mới năm 2025",
      src: "https://www.youtube.com/embed/L_jWHffIx5E",
      description: "Các nghị định, thông tư và quy định mới liên quan đến quản lý ngân sách và tài chính công."
    }
  ];
  

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentVideo = videos[currentIndex];

  const prevVideo = () => setCurrentIndex((prev) => (prev === 0 ? videos.length - 1 : prev - 1));
  const nextVideo = () => setCurrentIndex((prev) => (prev === videos.length - 1 ? 0 : prev + 1));

  return (
    <Card radius="none" className="w-full">
      <CardHeader className="flex justify-between items-center gap-4">
        <Button size="sm" variant="flat" onPress={prevVideo}>
          Trước
        </Button>
        <h2 className="text-lg font-semibold text-center text-current flex-1 px-2">
          {/* video */}
          Video
          {/* {currentVideo.title} */}
        </h2>
        <Button size="sm" variant="flat" onPress={nextVideo}>
          Tiếp
        </Button>
      </CardHeader>

      <Divider />

      {/* Body */}
      <CardBody className="flex flex-col items-center gap-4">
        <div className="w-full max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl aspect-video">
          <iframe
            className="w-full h-full rounded"
            src={currentVideo.src}
            title={currentVideo.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
        {/* {currentVideo.description && (
            <p className="text-current text-sm sm:text-base text-center">
              {currentVideo.description}
            </p>
          )} */}
      </CardBody>

      <Divider />

      {/* Footer: video list */}
      <CardFooter className="h-64 overflow-y-auto py-2">
        <ul className="space-y-1">
          {videos.map((video, index) => (
            <li
              key={video.id}
              className={`cursor-pointer rounded px-2 py-1 text-xs sm:text-sm transition-colors duration-200
          ${index === currentIndex ? 'bg-primary/10 border-l-4 border-primary' : 'bg-transparent border-l-4 border-transparent'}
          hover:bg-primary/20`}
              onClick={() => setCurrentIndex(index)}
            >
              <span className="text-xs sm:text-sm text-current">{video.title}</span>
            </li>
          ))}
        </ul>
      </CardFooter>
    </Card>

  );
};

export default LibraryVideo;
