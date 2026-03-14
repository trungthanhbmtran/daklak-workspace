'use client'
import React, { useState } from 'react'
import { Tabs, Tab } from "@heroui/tabs";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { ArrowLeft, Calendar, Download, FileText, Send } from "lucide-react";
import { useFetch } from '@/hooks/useFetch';

// --- 1. ĐỊNH NGHĨA DỮ LIỆU GIẢ LẬP (MOCK DATA) ---
type DraftStatus = 'in-time' | 'out-time';

interface Draft {
    id: number;
    title: string;
    description: string;
    content: string; // Nội dung chi tiết hoặc mô tả dài
    deadline: string;
    status: DraftStatus;
    fileUrl: string;
    signer: string;
}

const MOCK_DRAFTS: Draft[] = [
    {
        id: 1,
        title: "Dự thảo Nghị quyết quy định mức thu học phí năm học 2024-2025",
        description: "Quy định mức thu học phí đối với giáo dục mầm non, giáo dục phổ thông công lập trên địa bàn tỉnh.",
        content: "Dự thảo này đề xuất điều chỉnh mức học phí phù hợp với tình hình kinh tế xã hội hiện tại. Nội dung bao gồm 3 chương và 10 điều...",
        deadline: "2024-12-31",
        signer: "test",
        status: 'in-time',
        fileUrl: "#"
    },
    {
        id: 2,
        title: "Dự thảo Quyết định ban hành Bảng giá đất giai đoạn 2025-2029",
        description: "Lấy ý kiến nhân dân về việc điều chỉnh hệ số K và bảng giá các loại đất.",
        content: "Căn cứ Luật Đất đai 2024, Sở Tài chính phối hợp Sở Tài nguyên Môi trường xây dựng bảng giá đất mới...",
        deadline: "2024-11-30",
        status: 'in-time',
        signer: "test",
        fileUrl: "#"
    },
    {
        id: 3,
        title: "Dự thảo Kế hoạch phát triển chuyển đổi số ngành Tài chính",
        description: "Kế hoạch chi tiết về việc áp dụng công nghệ thông tin trong quản lý ngân sách.",
        content: "Nội dung chi tiết về lộ trình chuyển đổi số, bao gồm nâng cấp hạ tầng, đào tạo nhân lực...",
        deadline: "2023-10-15",
        status: 'out-time',
        signer: "test",
        fileUrl: "#"
    }
];

// --- 2. COMPONENT FORM GÓP Ý (Chỉ hiện khi còn hạn) ---
const FeedbackForm = ({ draftId }: { draftId: number }) => {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Xử lý logic gửi API ở đây
        setSubmitted(true);
    };



    if (submitted) {
        return (
            <Card className="bg-green-50 border border-green-200 mt-6">
                <CardBody className="text-center py-8">
                    <div className="text-green-600 font-semibold text-lg">Đã gửi góp ý thành công!</div>
                    <p className="text-gray-600">Cảm ơn bạn đã đóng góp ý kiến cho dự thảo này.</p>
                    <Button size="sm" variant="light" color="primary" onClick={() => setSubmitted(false)} className="mt-2">
                        Gửi ý kiến khác
                    </Button>
                </CardBody>
            </Card>
        );
    }

    return (
        <div className="mt-8 border-t pt-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Send size={20} className="text-primary" />
                Gửi ý kiến góp ý
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input isRequired label="Họ và tên" placeholder="Nhập họ tên của bạn" variant="bordered" />
                    <Input isRequired type="email" label="Email" placeholder="Nhập địa chỉ email" variant="bordered" />
                </div>
                <Input label="Đơn vị / Tổ chức (nếu có)" placeholder="Nhập tên đơn vị công tác" variant="bordered" />
                <Textarea
                    isRequired
                    label="Nội dung góp ý"
                    placeholder="Vui lòng nhập chi tiết các ý kiến đóng góp cho dự thảo..."
                    minRows={5}
                    variant="bordered"
                />
                <Button type="submit" color="primary" className="w-full md:w-auto self-end font-semibold">
                    Gửi góp ý
                </Button>
            </form>
        </div>
    );
};

// --- 3. COMPONENT CHI TIẾT DỰ THẢO ---
const DraftDetail = ({ draft, onBack }: { draft: Draft, onBack: () => void }) => {
    const isExpired = draft.status === 'out-time';

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Button
                variant="light"
                startContent={<ArrowLeft size={16} />}
                onClick={onBack}
                className="mb-4 pl-0 hover:pl-2 transition-all"
            >
                Quay lại danh sách
            </Button>

            <Card className="w-full">
                <CardHeader className="flex flex-col items-start gap-2 px-6 pt-6">
                    <div className="flex gap-2">
                        <Chip color={isExpired ? "default" : "success"} variant="flat" size="sm">
                            {isExpired ? "Đã kết thúc" : "Đang nhận ý kiến"}
                        </Chip>
                        <Chip variant="bordered" size="sm" startContent={<Calendar size={12} />}>
                            Hạn chót: {draft.deadline}
                        </Chip>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mt-2">{draft.title}</h1>
                </CardHeader>

                <CardBody className="px-6 py-4 text-gray-700">
                    <h4 className="font-semibold mb-2">Mô tả:</h4>
                    <p className="mb-4 italic text-gray-600">{draft.description}</p>

                    <h4 className="font-semibold mb-2">Nội dung chi tiết:</h4>
                    <p className="leading-relaxed mb-6">{draft.content}</p>

                    <Button
                        as="a"
                        href={draft.fileUrl}
                        color="primary"
                        variant="flat"
                        startContent={<Download size={18} />}
                        className="w-fit"
                    >
                        Tải về văn bản dự thảo
                    </Button>

                    {/* Logic hiển thị Form */}
                    {isExpired ? (
                        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-center border border-gray-200">
                            <p className="text-gray-500 font-medium">Thời gian tiếp nhận ý kiến cho dự thảo này đã kết thúc.</p>
                        </div>
                    ) : (
                        <FeedbackForm draftId={draft.id} />
                    )}
                </CardBody>
            </Card>
        </div>
    );
};

// --- 4. COMPONENT DANH SÁCH (Item trong Tab) ---
const DraftList = ({ drafts, onSelect }: { drafts: Draft[], onSelect: (draft: Draft) => void }) => {
    if (drafts.length === 0) {
        return <div className="text-center py-10 text-gray-500">Không có dữ liệu.</div>;
    }

    return (
        <div className="flex flex-col gap-4">
            {drafts.map((draft) => (
                <Card key={draft.id} isPressable onPress={() => onSelect(draft)} className="w-full hover:bg-gray-50 transition-colors border-none shadow-sm hover:shadow-md">
                    <CardBody className="flex flex-row items-start gap-4 p-4">
                        <div className="p-3 bg-primary/10 rounded-lg hidden sm:block">
                            <FileText size={24} className="text-primary" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-800 mb-1 line-clamp-2">
                                {draft.title}
                            </h3>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                                {draft.signer}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Calendar size={12} />
                                <span>Hạn góp ý: {draft.deadline}</span>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            ))}
        </div>
    );
};

// --- 5. COMPONENT CHÍNH ---
export default function DraftComments() {
    const { data, meta, isPending }: any = useFetch("/documents", {
        params: {}
    });

    console.log("data", data)
    const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);

    // Lọc dữ liệu theo trạng thái
    const activeDrafts = MOCK_DRAFTS.filter(d => d.status === 'in-time');
    const expiredDrafts = MOCK_DRAFTS.filter(d => d.status === 'out-time');

    // Nếu đang chọn một dự thảo, hiển thị trang chi tiết
    if (selectedDraft) {
        return (
            <div className="w-full max-w-4xl mx-auto p-4">
                <DraftDetail draft={selectedDraft} onBack={() => setSelectedDraft(null)} />
            </div>
        );
    }

    if (isPending) return <div> loading.....</div>

    // Mặc định hiển thị danh sách Tabs
    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-6 text-center uppercase text-primary">Lấy ý kiến nhân dân</h2>
            <Tabs aria-label="Draft Options" color="primary" variant="underlined" classNames={{
                tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                cursor: "w-full bg-primary",
                tab: "max-w-fit px-0 h-12",
                tabContent: "group-data-[selected=true]:text-primary font-semibold text-base"
            }}>
                <Tab key="in-time" title={
                    <div className="flex items-center gap-2">
                        <span>Đang lấy ý kiến</span>
                        <Chip size="sm" variant="flat" color="primary">{activeDrafts.length}</Chip>
                    </div>
                }>
                    <div className="mt-4">
                        <DraftList drafts={data?.data} onSelect={setSelectedDraft} />
                    </div>
                </Tab>
                <Tab key="out-time" title="Đã kết thúc">
                    <div className="mt-4">
                        <DraftList drafts={expiredDrafts} onSelect={setSelectedDraft} />
                    </div>
                </Tab>
            </Tabs>
        </div>
    )
}