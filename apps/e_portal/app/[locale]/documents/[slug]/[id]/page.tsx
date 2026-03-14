// app/documents/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";
import { User } from "@heroui/user";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Chip } from '@heroui/chip';
import { ScrollShadow } from "@heroui/scroll-shadow";
import { Skeleton } from "@heroui/skeleton";
import { 
  FileText, Download, Printer, Share2, Calendar, 
  FileCheck, Building2, Eye, File 
} from 'lucide-react';

// --- TYPE DEFINITION ---
type DocumentData = {
  id: string;
  title: string;
  code: string;
  org: string;
  type: string;
  field: string;
  description: string; // Tóm tắt ngắn gọn thay vì full content
  fileUrl: string;     // Đường dẫn file PDF thực tế
  date_issued: string;
  date_effective: string;
  signer: string;
  signerRole: string;
  status: string;
};

// --- MOCK DATA SERVICE ---
const fetchDocumentById = async (idFromUrl: string): Promise<DocumentData | undefined> => {
  // 1. Giải mã URL (VD: %20 -> khoảng trắng)
  const decodedId = decodeURIComponent(idFromUrl); 
  
  console.log("--- DEBUG ---");
  console.log("ID gốc từ URL:", idFromUrl);
  console.log("ID sau khi decode:", decodedId);

  return new Promise((resolve) => {
    setTimeout(() => {
      const allDocs: DocumentData[] = [
        {
          // Đảm bảo ID trong Data khớp hoàn toàn
          id: '01653-QĐ-UBND', 
          title: 'Quyết định về việc ban hành quy chế làm việc nội bộ năm 2024',
          code: '15/2024/QĐ-UBND',
          org: 'Ủy ban nhân dân Thành phố',
          type: 'Quyết định',
          field: 'Hành chính',
          description: 'Quyết định này quy định về nguyên tắc, chế độ trách nhiệm, lề lối làm việc, trình tự giải quyết công việc và quan hệ công tác của cán bộ công nhân viên.',
          fileUrl: 'http://113.166.209.162/uploads/documents/11-Qd-2222222222-1766566230117.pdf', 
          date_issued: '10/05/2024',
          date_effective: '01/06/2024',
          signer: 'Tạ Anh Tuấn',
          signerRole: 'Chủ tịch UBND',
          status: 'Hiệu lực'
        },
      ];

      // 2. So sánh thông minh (Chuẩn hóa cả 2 về cùng định dạng Unicode NFC để so sánh tiếng Việt)
      const foundDoc = allDocs.find((d) => 
        d.id.normalize('NFC') === decodedId.normalize('NFC')
      );
      
      console.log("Kết quả tìm kiếm:", foundDoc ? "Tìm thấy" : "Không thấy");
      resolve(foundDoc);
    }, 1000);
  });
};

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  const [doc, setDoc] = useState<DocumentData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  // Lấy ID an toàn từ params
  const rawId = params?.id;
  // Xử lý trường hợp id là array hoặc string
  const docId = Array.isArray(rawId) ? rawId[0] : rawId;

  useEffect(() => {
    if (!docId) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        // Truyền docId vào hàm fetch
        const data = await fetchDocumentById(docId);
        if (data) {
          setDoc(data);
          setIsError(false); // Reset lỗi nếu tìm thấy
        } else {
          setIsError(true);
        }
      } catch (error) {
        console.error("Lỗi khi tải văn bản:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [docId]);
  // --- LOADING SKELETON ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 pb-10 max-w-7xl mx-auto px-4 py-6">
        <div className="space-y-4 mb-6"> <Skeleton className="rounded-lg w-1/3 h-6"/> </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           <div className="lg:col-span-8"> <Skeleton className="rounded-lg w-full h-[700px]"/> </div>
           <div className="lg:col-span-4 space-y-4"> <Skeleton className="rounded-lg w-full h-[400px]"/> </div>
        </div>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (isError || !doc) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <FileText size={64} className="text-gray-300" />
        <h2 className="text-xl font-bold text-gray-600">Không tìm thấy văn bản</h2>
        <Button color="primary" variant="flat" onPress={() => router.push('/documents')}>Quay lại</Button>
      </div>
    );
  }

  // --- MAIN CONTENT ---
  return (
    <div className="min-h-screen bg-gray-50/50 pb-10">
      
      {/* HEADER BREADCRUMBS & TOOLBAR */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
          <Breadcrumbs size="md">
            <BreadcrumbItem href="/">Trang chủ</BreadcrumbItem>
            <BreadcrumbItem href="/documents">Văn bản</BreadcrumbItem>
            <BreadcrumbItem className="font-semibold text-primary max-w-[200px] truncate">{doc.code}</BreadcrumbItem>
          </Breadcrumbs>

          <div className="flex gap-2">
            <Button size="sm" variant="light" startContent={<Printer size={18} />}>In</Button>
            <Button size="sm" variant="light" startContent={<Share2 size={18} />}>Chia sẻ</Button>
            <Button size="sm" color="primary" startContent={<Download size={18} />}>Tải về</Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* TITLE HEADER */}
        <div className="mb-6">
             <h1 className="text-2xl md:text-3xl font-bold text-gray-800 uppercase leading-snug mb-2">
                {doc.title}
             </h1>
             <p className="text-gray-500">{doc.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* CỘT TRÁI (8 phần): TRÌNH XEM VĂN BẢN (PDF VIEWER) */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="shadow-md border border-gray-100 h-[800px] flex flex-col">
              <CardHeader className="bg-gray-100/50 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Eye size={20} className="text-gray-600"/>
                    <span className="font-semibold text-gray-700">Xem trước văn bản</span>
                </div>
                <Chip size="sm" variant="flat" color="primary">PDF</Chip>
              </CardHeader>

              <CardBody className="p-0 overflow-hidden bg-gray-200 flex-1 relative">
                 {/* Iframe hiển thị PDF */}
                 <iframe 
                    src={`${doc.fileUrl}#toolbar=0`} 
                    className="w-full h-full"
                    title="PDF Viewer"
                 >
                 </iframe>
                 
                 {/* Fallback nếu trình duyệt không hỗ trợ PDF */}
                 <div className="absolute inset-0 -z-10 flex flex-col items-center justify-center text-gray-500">
                    <p>Đang tải trình xem văn bản...</p>
                 </div>
              </CardBody>
            </Card>
          </div>

          {/* CỘT PHẢI (4 phần): BẢNG MÔ TẢ CHI TIẾT (METADATA) */}
          <div className="lg:col-span-4 space-y-6">

            {/* Bảng thuộc tính */}
            <Card className="shadow-sm border border-gray-100">
              <CardHeader className="font-bold text-gray-700 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <FileText size={18} />
                Thông tin chi tiết
              </CardHeader>
              <CardBody className="p-0">
                <table className="w-full text-sm text-left">
                  <tbody>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 text-gray-500 bg-gray-50/40 w-1/3 align-top">Số hiệu</td>
                      <td className="p-3 font-bold text-primary">{doc.code}</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 text-gray-500 bg-gray-50/40 align-top">Trích yếu</td>
                      <td className="p-3 text-gray-700 line-clamp-3" title={doc.title}>{doc.title}</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 text-gray-500 bg-gray-50/40">Trạng thái</td>
                      <td className="p-3">
                        <Chip color={doc.status === 'Hiệu lực' ? 'success' : 'warning'} variant="dot" size="sm">
                          {doc.status}
                        </Chip>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 text-gray-500 bg-gray-50/40">Ban hành</td>
                      <td className="p-3 text-gray-700">{doc.date_issued}</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 text-gray-500 bg-gray-50/40">Hiệu lực</td>
                      <td className="p-3 text-gray-700">{doc.date_effective}</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 text-gray-500 bg-gray-50/40">Cơ quan</td>
                      <td className="p-3 text-gray-700">{doc.org}</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 text-gray-500 bg-gray-50/40">Lĩnh vực</td>
                      <td className="p-3 text-gray-700">{doc.field}</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="p-3 text-gray-500 bg-gray-50/40">Loại VB</td>
                      <td className="p-3 text-gray-700">{doc.type}</td>
                    </tr>
                  </tbody>
                </table>
              </CardBody>
            </Card>

            {/* Người ký */}
            <Card className="shadow-sm border border-gray-100">
              <CardBody className="p-4 flex items-center gap-4">
                <User
                  name={doc.signer}
                  description={doc.signerRole}
                  avatarProps={{
                    src: "https://i.pravatar.cc/150?u=" + doc.id,
                    isBordered: true,
                    color: "primary"
                  }}
                />
              </CardBody>
            </Card>

            {/* Danh sách file đính kèm & Tải về */}
            <Card className="shadow-sm border border-gray-100 bg-primary-50/20">
              <CardHeader className="font-bold text-gray-700 border-b border-gray-200/50">
                Tệp đính kèm
              </CardHeader>
              <CardBody className="p-2 space-y-2">
                  <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="bg-red-100 p-2 rounded-md">
                            <File className="text-red-500" size={20}/>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium truncate text-gray-700 group-hover:text-primary">Toan_van_ban.pdf</span>
                            <span className="text-xs text-gray-400">2.4 MB</span>
                        </div>
                    </div>
                    <Button isIconOnly size="sm" variant="light" color="primary">
                        <Download size={18}/>
                    </Button>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="bg-blue-100 p-2 rounded-md">
                            <FileText className="text-blue-500" size={20}/>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium truncate text-gray-700 group-hover:text-primary">Phu_luc.doc</span>
                            <span className="text-xs text-gray-400">500 KB</span>
                        </div>
                    </div>
                    <Button isIconOnly size="sm" variant="light" color="primary">
                        <Download size={18}/>
                    </Button>
                  </div>
              </CardBody>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}