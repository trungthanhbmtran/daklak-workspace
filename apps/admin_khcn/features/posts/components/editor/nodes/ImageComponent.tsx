"use client";

import React, { useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey, NodeKey } from 'lexical';
import { CloudDownload, Loader2, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ImageNode } from './ImageNode';

export default function ImageComponent({
  src,
  altText,
  nodeKey,
  width,
  height,
}: {
  src: string;
  altText: string;
  nodeKey: NodeKey;
  width: 'inherit' | number;
  height: 'inherit' | number;
}) {
  const [editor] = useLexicalComposerContext();
  const [isHovered, setIsHovered] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // 1. CHỐNG LỖI HIỂN THỊ KHI LINK ẢNH ĐANG TRỐNG
  if (!src) {
    return (
      <div 
        className="flex flex-col items-center justify-center bg-slate-50 rounded-sm border border-dashed border-slate-300 text-slate-400 my-4 animate-pulse"
        style={{ 
          width: width === 'inherit' ? '100%' : width, 
          height: height === 'inherit' ? '250px' : height 
        }}
      >
        <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
        <span className="text-xs font-medium uppercase tracking-wider">Đang xử lý hình ảnh...</span>
      </div>
    );
  }

  // 2. NHẬN DIỆN LINK TỪ BÁO KHÁC
  // Thay đổi tên miền khcn.daklak.gov.vn thành tên miền thực tế của bạn nếu cần
  const isExternalLink = src.startsWith('http') && !src.includes('khcn.daklak.gov.vn');

  // 3. XỬ LÝ GỌI API ĐỂ TẢI ẢNH VỀ SERVER
  const handleUploadToServer = async () => {
    setIsUploading(true);
    try {
      /* * NƠI BẠN GẮN API BACKEND CỦA MÌNH VÀO:
       * const response = await fetch('/api/upload-from-url', {
       * method: 'POST',
       * headers: { 'Content-Type': 'application/json' },
       * body: JSON.stringify({ url: src })
       * });
       * const data = await response.json();
       * const newLocalUrl = data.localUrl; // URL nội bộ do Server bạn trả về
       */

      // Giả lập hệ thống đang tải ảnh mất 1.5 giây
      await new Promise(resolve => setTimeout(resolve, 1500));
      const newLocalUrl = "/uploads/anh-da-luu-ve-server.jpg"; 

      // Cập nhật lại Link nội bộ vào Lexical State
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if (node instanceof ImageNode) {
          node.setSrc(newLocalUrl);
        }
      });

      setIsSuccess(true);
      setTimeout(() => setIsHovered(false), 2000);
    } catch (error) {
      alert("Đã xảy ra lỗi khi tải ảnh về máy chủ!");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div 
      className="relative inline-block my-2" 
      style={{ 
        width: width === 'inherit' ? '100%' : width, 
        height: height === 'inherit' ? 'auto' : height 
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ẢNH GỐC */}
      <img 
        src={src} 
        alt={altText || "Hình ảnh minh họa"} 
        className={cn(
          "w-full h-auto rounded-sm transition-all",
          isHovered && isExternalLink ? "brightness-[0.85]" : "" 
        )} 
      />

      {/* NÚT TẢI VỀ CHỈ HIỆN KHI LÀ LINK NGOÀI */}
      {isExternalLink && (isHovered || isUploading || isSuccess) && (
        <div className="absolute top-3 right-3 z-10">
          {isSuccess ? (
            <div className="flex items-center gap-1.5 bg-emerald-500 text-white px-3 py-1.5 rounded-md shadow-lg text-xs font-semibold animate-in fade-in zoom-in duration-300">
              <CheckCircle2 className="w-4 h-4" /> Đã lưu an toàn
            </div>
          ) : (
            <Button 
              size="sm" 
              onClick={(e) => { e.preventDefault(); handleUploadToServer(); }}
              disabled={isUploading}
              className={cn(
                "flex items-center gap-1.5 shadow-lg h-8 text-xs font-medium",
                isUploading ? "bg-slate-800 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
              )}
            >
              {isUploading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Đang tải về máy chủ...</>
              ) : (
                <><CloudDownload className="w-4 h-4" /> Lưu ảnh này về máy chủ</>
              )}
            </Button>
          )}
        </div>
      )}
      
      {/* NHÃN CẢNH BÁO */}
      {isExternalLink && !isSuccess && (
        <div className="absolute bottom-3 left-3 bg-amber-500/90 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-sm uppercase font-bold tracking-wider pointer-events-none shadow-sm">
          Ảnh nguồn ngoài
        </div>
      )}
    </div>
  );
}
