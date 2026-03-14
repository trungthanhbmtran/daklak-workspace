'use client';
import React from 'react';
import { FileText, ChevronRight, Loader2, Calendar, Download } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';
import Link from 'next/link';

function SteeingDocuments() {
  // Gọi API lấy văn bản mới nhất
  const { data: response, isLoading, error }: any = useFetch(`/documents`, {
    params: { limit: 6, sort: '-createdAt' },
  });

  const documents = response?.data || [];

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex justify-center items-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#005a8d] mx-auto mb-2" />
          <p className="text-gray-400 text-sm">Đang tải văn bản...</p>
        </div>
      </div>
    );
  }

  if (error) return null;

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
      {/* Header của khối Văn bản */}
      <div className="bg-[#005a8d] p-4 flex justify-between items-center">
        <h3 className="text-white font-bold uppercase text-sm md:text-base flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Văn bản chỉ đạo điều hành
        </h3>
        <Link 
          href="/van-ban" 
          className="text-white/80 hover:text-white text-xs flex items-center transition-colors"
        >
          Tất cả <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      {/* Nội dung danh sách văn bản */}
      <div className="p-2 flex-1">
        {documents.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {documents.map((doc: any) => (
              <div 
                key={doc.id} 
                className="p-3 hover:bg-blue-50/50 transition-all group rounded-lg"
              >
                <Link href={`/van-ban/${doc.id}`} className="block">
                  {/* Dòng 1: Số hiệu và Ngày */}
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-[#da251d] font-bold text-[13px] group-hover:underline">
                      {doc.number}
                    </span>
                    <span className="text-[11px] text-gray-400 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {doc.date}
                    </span>
                  </div>
                  
                  {/* Dòng 2: Trích yếu nội dung */}
                  <p className="text-gray-700 text-sm leading-snug line-clamp-2 group-hover:text-[#005a8d] transition-colors font-medium">
                    {doc.desc}
                  </p>

                  {/* Dòng 3: Nút tải về (Optional) */}
                  <div className="mt-2 flex justify-end">
                    <span className="text-[11px] text-[#005a8d] flex items-center opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                      <Download className="w-3 h-3 mr-1" /> Tải về văn bản
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-gray-400 text-sm">
            Hiện chưa có văn bản mới cập nhật.
          </div>
        )}
      </div>

      {/* Footer Footer link */}
      <div className="bg-gray-50 p-3 text-center border-t border-gray-100">
        <Link 
          href="/van-ban" 
          className="text-[13px] text-[#005a8d] font-semibold hover:underline flex items-center justify-center"
        >
          Tra cứu hệ thống văn bản quy phạm pháp luật <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </section>
  );
}

export default SteeingDocuments;