'use client'
import React, { useState, useRef } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { Card } from '@heroui/card';
import { Button } from '@heroui/button';

// --- Component TreeNode: Giữ nguyên logic vẽ nhưng tối ưu CSS ---
const TreeNode = ({ node }: { node: any }) => {
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div className="flex flex-col items-center">
            {/* Node Content */}
            <Card className="px-3 py-2 text-center min-w-[90px] max-w-[200px] z-10 border border-gray-200 shadow-md bg-white hover:shadow-lg transition-shadow cursor-default">
                <p className="font-bold text-sm text-gray-800">{node.name}</p>
                {node.title && <p className="text-xs text-gray-500 mt-1">{node.title}</p>}
            </Card>

            {/* Render Children */}
            {hasChildren && (
                <>
                    {/* 1. Đường kẻ dọc từ Parent xuống */}
                    <div className="w-px h-6 bg-gray-400"></div>

                    <div className="flex justify-center">
                        {node.children.map((child: any, index: number) => {
                            const isFirst = index === 0;
                            const isLast = index === node.children.length - 1;
                            const isOnly = node.children.length === 1;

                            return (
                                <div key={child.id} className="flex flex-col items-center relative px-3">
                                    {!isOnly && (
                                        <>
                                            {/* Kẻ sang trái */}
                                            <div className={`absolute top-0 left-0 w-[51%] h-px bg-gray-400 ${isFirst ? 'hidden' : 'block'}`}></div>
                                            {/* Kẻ sang phải */}
                                            <div className={`absolute top-0 right-0 w-[51%] h-px bg-gray-400 ${isLast ? 'hidden' : 'block'}`}></div>
                                        </>
                                    )}

                                    <div className="w-px h-6 bg-gray-400"></div>

                                    <TreeNode node={child} />
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

// --- Main Component ---
export default function Structure({ params: { lang } }: any) {
    const { data }: any = useFetch("/departments", {
        params: { parentId: 3 }
      });

    console.log("Cây tổ chức:", data);

    // State quản lý Zoom
    const [scale, setScale] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);


    if (!data) return <div className="p-10 text-center text-gray-500">Đang tải dữ liệu...</div>;

    // Xử lý an toàn dữ liệu đầu vào (API thường trả về object hoặc array)
    const roots = data?.data;

    // Hàm điều khiển Zoom
    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 2));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.3));
    const handleReset = () => setScale(1);

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex justify-between items-center mb-4 px-2">
                <h1 className="text-xl font-bold  ">Sơ đồ tổ chức</h1>

                {/* Toolbar điều khiển */}
                <div className="flex gap-2  p-1 rounded-lg">
                    <Button onClick={handleZoomOut} >-</Button>
                    <Button onClick={handleReset} >{Math.round(scale * 100)}%</Button>
                    <Button onClick={handleZoomIn} >+</Button>
                </div>
            </div>


            <div
                ref={containerRef}
                className="flex-1 border border-gray-300 rounded-xl bg-slate-50 overflow-auto relative shadow-inner custom-scrollbar"
                style={{ height: '600px', maxHeight: '80vh' }} // Giới hạn chiều cao
            >
                {/* Wrapper cho nội dung cây, áp dụng transform scale */}
                <div
                    className="min-w-fit min-h-fit p-10 flex justify-center origin-top transition-transform duration-200 ease-out"
                    style={{ transform: `scale(${scale})` }}
                >
                    <div className="flex gap-16">
                        {roots.map((root: any) => (
                            <TreeNode key={root.id} node={root} />
                        ))}
                    </div>
                </div>
            </div>

            <p className="text-xs text-gray-400 mt-2 text-center">
                Giữ Shift + Cuộn chuột để cuộn ngang. Sử dụng nút zoom để điều chỉnh kích thước.
            </p>
        </div>
    );
}