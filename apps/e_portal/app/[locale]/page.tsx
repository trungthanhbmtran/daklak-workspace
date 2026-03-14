'use client';
import React from 'react';
import CategorySection from '@/components/HomeScreen/CategorySection';
import IsFturesNew from '@/components/HomeScreen/isFturesNew';
import SteeingDocuments from '@/components/HomeScreen/SteeingDocuments';
import { ShieldCheck, ArrowRight, Globe, Activity, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-white pb-20">
      {/* --- MÀN HÌNH 1: TIN TIÊU ĐIỂM --- */}
      <section className="w-full">
        <IsFturesNew />
      </section>

      <div className="container mx-auto px-4">
        
        {/* --- MÀN HÌNH 2: NHÓM CHỈ ĐẠO ĐIỀU HÀNH & ĐỀ ÁN 06 --- */}
        <section className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* KHỐI ĐỀ ÁN 06 - SỬA LỖI CHE CHỮ */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#00416a] to-[#0a84d0] rounded-3xl p-1 shadow-xl">
             <div className="bg-white/95 rounded-[22px] p-6 md:p-8 h-full flex flex-col">
                <div className="flex items-start gap-4 mb-8">
                  <div className="flex-shrink-0 p-3 bg-red-600 rounded-2xl text-white shadow-lg shadow-red-100">
                    <ShieldCheck className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  {/* Tiêu đề linh hoạt: Tự động chỉnh size chữ để không bị che */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-black text-[#00416a] uppercase leading-tight">
                       <span className="text-red-600">Đề án 06</span>
                    </h2>
                    <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                      Chuyển đổi số
                    </p>
                  </div>
                </div>
                
                <div className="flex-1">
                   <CategorySection
                    title=""
                    categorySlug="chuyen-doi-so-dean06"
                    limit={4}
                    isSidebar={true}
                  />
                </div>

                <Link href="/vi/articles/chuyen-doi-so-de-an-06" className="mt-8 flex items-center justify-center gap-2 py-4 bg-[#00416a] text-white rounded-xl font-bold hover:bg-[#da251d] transition-all group">
                  TRUY CẬP HỆ THỐNG ĐỀ ÁN 06 <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </Link>
             </div>
          </div>

          {/* KHỐI VĂN BẢN CHỈ ĐẠO */}
          <div className="h-full">
             <SteeingDocuments />
          </div>
        </section>

        {/* --- MÀN HÌNH 3: NHÓM TIN TỨC TỔNG HỢP --- */}
        <section className="mt-16 bg-gray-50 rounded-[40px] p-6 md:p-10 border border-gray-100">
          <div className="flex items-center gap-3 mb-10 border-l-8 border-[#da251d] pl-6">
            <h2 className="text-2xl md:text-3xl font-black text-gray-800 uppercase tracking-tight">Tin tức & Hoạt động tiêu điểm</h2>
          </div>
          <CategorySection
            title=""
            categorySlug="tin-tuc"
            limit={6}
          />
        </section>

        {/* --- MÀN HÌNH 4: NHÓM CHUYÊN MÔN TÀI CHÍNH & GIÁ CẢ --- */}
        <section className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-white p-8 rounded-3xl shadow-sm border-t-8 border-[#005a8d]">
            <div className="flex items-center gap-2 mb-6 text-[#005a8d]">
                <Activity size={24} />
                <h3 className="text-xl font-bold uppercase">Tin Tài chính - Ngân sách</h3>
            </div>
            <CategorySection
              title=""
              categorySlug="tin-tai-chinh"
              limit={4}
              isSidebar={true}
            />
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border-t-8 border-[#da251d]">
            <div className="flex items-center gap-2 mb-6 text-[#da251d]">
                <Globe size={24} />
                <h3 className="text-xl font-bold uppercase">Giá cả - Thị trường</h3>
            </div>
            <CategorySection
              title=""
              categorySlug="tin-tuc-gia-ca-thi-truong"
              limit={4}
              isSidebar={true}
            />
          </div>
        </section>

        {/* --- MÀN HÌNH 5: KINH TẾ XÃ HỘI & ĐẦU TƯ --- */}
        <section className="mt-16 space-y-12">
          {/* Kinh tế xã hội */}
          <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-gray-100">
            <CategorySection
              title="Kinh tế - Xã hội Đắk Lắk"
              categorySlug="kinh-te-xa-hoi"
              limit={4}
            />
          </div>

          {/* Xúc tiến đầu tư - Giao diện Xanh Băng (Ice Blue) cực kỳ tương phản và sạch sẽ */}
          <div className="relative overflow-hidden bg-gradient-to-r from-[#eff6ff] to-[#dbeafe] rounded-[40px] shadow-sm border border-blue-100 group">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/50 rounded-full blur-3xl" />
            
            <div className="relative p-8 md:p-12">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-[#005a8d] rounded-2xl text-white shadow-lg">
                      <TrendingUp size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-[#005a8d] uppercase tracking-tight">
                            Thu hút & Xúc tiến đầu tư
                        </h2>
                        <div className="h-1.5 w-32 bg-[#da251d] mt-2 rounded-full" />
                    </div>
                </div>
                <Zap className="hidden md:block text-blue-300 animate-pulse" size={48} />
              </div>
              
              {/* Nội dung tin tức hiện rõ trên nền sáng */}
              {/* <div className="bg-white/60 p-6 rounded-3xl border border-white">
                <CategorySection
                  title=""
                  categorySlug="thu-hut-dau-tu"
                  limit={4}
                />
              </div> */}
              
              <div className="mt-8 flex justify-center md:justify-end">
                <Link href="/vi/articles/thu-hut-dau-tu" className="flex items-center gap-2 px-6 py-3 bg-white text-[#005a8d] rounded-full font-bold shadow-sm hover:bg-[#005a8d] hover:text-white transition-all border border-blue-100 group">
                  Khám phá tiềm năng đầu tư <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}