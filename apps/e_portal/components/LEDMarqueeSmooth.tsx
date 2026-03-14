'use client';
import { Link } from "@heroui/link";
import { Card, CardHeader, CardBody } from '@heroui/card';
import { useState, useEffect, useRef, useMemo } from "react";
import { Bell, Calendar } from "lucide-react"; // Cần cài đặt lucide-react

interface Item {
  id: number;
  title: string;
  slug: string;
  createdAt: string; // Thêm trường ngày tháng (ISO string)
}

interface LEDMarqueeCardProps {
  data: Item[];
  className?: string;
  header?: string;
}

export default function LEDMarqueeCard({ data, className, header = "THÔNG BÁO MỚI" }: LEDMarqueeCardProps) {
  const [paused, setPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(20);

  // 1. Tính toán số thông báo trong tháng hiện tại
  const countThisMonth = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return data.filter(item => {
      const itemDate = new Date(item.createdAt);
      return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
    }).length;
  }, [data]);

  const loop = [...data, ...data]; // Nhân đôi để scroll vô tận

  // 2. Tính toán thời gian chạy dựa trên nội dung thực tế
  useEffect(() => {
    if (!containerRef.current) return;
    const totalHeight = containerRef.current.scrollHeight / 2; // Chỉ tính 1 nửa danh sách
    const speed = 30; // Tốc độ (pixels per second)
    const seconds = Math.max(10, totalHeight / speed);
    setDuration(seconds);
  }, [data]);

  return (
    <Card className={`w-full border-none shadow-md ${className ?? ""}`}>
      {/* Header với Icon và Thống kê tháng */}
      <CardHeader className="flex justify-between items-center bg-[#f8fafc] border-b border-blue-200 py-3 px-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-700 animate-bounce" />
          <span className="font-bold text-blue-800 text-base uppercase tracking-tight">
            {header}
          </span>
        </div>

        {/* Badge hiển thị tổng số trong tháng */}
        <div className="flex items-center gap-1.5 bg-blue-100 px-2 py-1 rounded-full border border-blue-200">
          <span className="text-[10px] font-medium text-blue-600 uppercase">Tháng này:</span>
          <span className="text-sm font-bold text-blue-700">{countThisMonth}</span>
        </div>
      </CardHeader>

      {/* Body: Marquee kết hợp Scroll */}
      <CardBody
        className="relative h-[400px] overflow-y-auto p-0 scrollbar-hide"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          ref={containerRef}
          className={`flex flex-col animate-vertical-marquee ${paused ? "pause-marquee" : ""}`}
          style={{
            "--marquee-duration": `${duration}s`,
            willChange: "transform"
          } as any}
        >
          <ul className="divide-y divide-gray-100">
            {loop.map((item, idx) => (
              <li key={idx} className="p-4 hover:bg-blue-50/50 transition-colors group border-b border-gray-50 last:border-none">
                <Link
                  href={`/vi/articles/thong-bao/${item.slug}`}
                  // items-start: Đưa tất cả các phần tử con về sát lề trái
                  className="flex flex-col items-start gap-1.5 w-full text-left"
                >
                  {/* Tiêu đề thông báo: text-left đảm bảo chữ bắt đầu từ trái */}
                  <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 line-clamp-2 leading-snug w-full text-left">
                    {item.title}
                  </span>

                  {/* Phần thời gian: justify-start để sát lề trái, items-center để icon và text thẳng hàng ngang */}
                  <div className="flex items-center justify-start gap-1.5 text-gray-500 w-full">
                    <Calendar className="w-3.5 h-3.5 shrink-0" /> {/* shrink-0: Tránh icon bị bóp méo */}
                    <span className="text-[11px] font-medium">
                      {new Date(item.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </CardBody>

      {/* CSS bổ sung để ẩn thanh cuộn và căn chỉnh */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .pause-marquee {
          animation-play-state: paused !important;
        }
      `}</style>
    </Card>
  );
}