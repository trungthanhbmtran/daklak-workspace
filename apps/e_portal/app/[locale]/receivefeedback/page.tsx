// app/feedback/page.tsx (hoặc component ReceiveFeedback.tsx)
'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Input, Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { Checkbox } from "@heroui/checkbox";
import { Divider } from "@heroui/divider";
import { Snippet } from "@heroui/snippet";

// Danh sách lĩnh vực phản ánh giả lập
const categories = [
    { key: "dat-dai", label: "Quản lý đất đai" },
    { key: "xay-dung", label: "Trật tự xây dựng" },
    { key: "moi-truong", label: "Vệ sinh môi trường" },
    { key: "hanh-chinh", label: "Thủ tục hành chính" },
    { key: "an-ninh", label: "An ninh trật tự" },
    { key: "khac", label: "Lĩnh vực khác" },
];

export default function ReceiveFeedback() {
    const [isLoading, setIsLoading] = useState(false);
    const [agreed, setAgreed] = useState(false);
    
    // State lưu dữ liệu form
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        phone: '',
        category: '',
        title: '',
        content: '',
        file: null as File | null
    });

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({ ...prev, file: e.target.files![0] }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agreed) return;

        setIsLoading(true);
        // Giả lập gọi API
        setTimeout(() => {
            console.log("Form Data Submitted:", formData);
            alert("Gửi phản ánh thành công! Chúng tôi sẽ liên hệ lại sớm.");
            setIsLoading(false);
            // Reset form nếu cần
        }, 1500);
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 flex flex-col gap-6">
            
            {/* --- Header --- */}
            <div className="text-center space-y-2 mb-4">
                <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                    Tiếp nhận Phản ánh & Kiến nghị
                </h1>
                <p className="text-gray-500 max-w-2xl mx-auto">
                    Hãy gửi ý kiến đóng góp hoặc phản ánh vấn đề của bạn. Thông tin của bạn sẽ được bảo mật và xử lý theo quy định.
                </p>
            </div>

            <Card className="p-2 md:p-4 shadow-medium" radius="lg">
                <form onSubmit={handleSubmit}>
                    <CardHeader className="flex flex-col items-start gap-1 pb-4">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-600 p-1.5 rounded-md">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                            </span>
                            Thông tin phản ánh
                        </h3>
                        <p className="text-sm text-gray-500">Vui lòng điền đầy đủ thông tin vào các trường có dấu (*)</p>
                    </CardHeader>
                    
                    <Divider/>

                    <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
                        
                        {/* --- Cột 1: Thông tin cá nhân --- */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">1. Thông tin người gửi</h4>
                            
                            <Input
                                isRequired
                                label="Họ và tên"
                                placeholder="Nhập họ tên đầy đủ"
                                variant="bordered"
                                radius="md"
                                value={formData.fullname}
                                onValueChange={(v) => handleChange('fullname', v)}
                                startContent={
                                    <svg className="text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                }
                            />

                            <div className="flex gap-4">
                                <Input
                                    isRequired
                                    type="email"
                                    label="Email"
                                    placeholder="example@mail.com"
                                    variant="bordered"
                                    radius="md"
                                    className="flex-1"
                                    value={formData.email}
                                    onValueChange={(v) => handleChange('email', v)}
                                />
                                <Input
                                    label="Số điện thoại"
                                    placeholder="0912..."
                                    variant="bordered"
                                    radius="md"
                                    className="flex-1"
                                    value={formData.phone}
                                    onValueChange={(v) => handleChange('phone', v)}
                                />
                            </div>
                            
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-2">
                                <p className="text-xs text-blue-600">
                                    <span className="font-bold">Lưu ý:</span> Kết quả xử lý sẽ được gửi về Email hoặc Số điện thoại bạn cung cấp.
                                </p>
                            </div>
                        </div>

                        {/* --- Cột 2: Nội dung phản ánh --- */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">2. Nội dung chi tiết</h4>

                            <Select
                                isRequired
                                label="Lĩnh vực phản ánh"
                                placeholder="Chọn lĩnh vực"
                                variant="bordered"
                                radius="md"
                                selectedKeys={formData.category ? [formData.category] : []}
                                onChange={(e) => handleChange('category', e.target.value)}
                            >
                                {categories.map((item) => (
                                    <SelectItem key={item.key} textValue={item.key}>
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </Select>

                            <Input
                                isRequired
                                label="Tiêu đề"
                                placeholder="Tóm tắt vấn đề (VD: Lấn chiếm lòng lề đường...)"
                                variant="bordered"
                                radius="md"
                                value={formData.title}
                                onValueChange={(v) => handleChange('title', v)}
                            />

                            <Textarea
                                isRequired
                                label="Nội dung"
                                placeholder="Mô tả chi tiết sự việc, thời gian, địa điểm..."
                                variant="bordered"
                                radius="md"
                                minRows={4}
                                value={formData.content}
                                onValueChange={(v) => handleChange('content', v)}
                            />

                            {/* Custom File Upload UI */}
                            <div className="relative">
                                <label className="text-sm text-gray-600 font-medium mb-1 block">Đính kèm tệp (Ảnh/Video/Tài liệu)</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors flex flex-col items-center justify-center cursor-pointer relative">
                                    <input 
                                        type="file" 
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={handleFileChange}
                                    />
                                    {!formData.file ? (
                                        <>
                                            <svg className="text-gray-400 mb-2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                            <span className="text-xs text-gray-500">Kéo thả hoặc nhấn để chọn tệp</span>
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-2 text-primary">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                                            <span className="text-sm font-medium">{formData.file.name}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </CardBody>
                    
                    <Divider className="my-2" />

                    <CardFooter className="flex flex-col gap-4 items-center pt-4">
                        <Checkbox 
                            isSelected={agreed} 
                            onValueChange={setAgreed}
                            classNames={{ label: "text-sm text-gray-600" }}
                        >
                            Tôi cam kết thông tin phản ánh là trung thực và chịu trách nhiệm về nội dung này.
                        </Checkbox>

                        <div className="flex w-full md:w-auto gap-4">
                            <Button 
                                type="button" 
                                variant="flat" 
                                color="default" 
                                className="w-1/2 md:w-32"
                                onPress={() => window.history.back()}
                            >
                                Hủy bỏ
                            </Button>
                            <Button 
                                type="submit" 
                                color="primary" 
                                className="w-1/2 md:w-48 font-semibold shadow-lg shadow-blue-500/30"
                                isLoading={isLoading}
                                isDisabled={!agreed}
                            >
                                {isLoading ? "Đang gửi..." : "Gửi phản ánh"}
                            </Button>
                        </div>
                    </CardFooter>
                </form>
            </Card>

            {/* --- Footer Note --- */}
            <div className="text-center mt-4">
                 <Snippet hideSymbol variant="flat" color="warning" className="text-xs">
                    Hotline hỗ trợ khẩn cấp: 02623 856 630
                </Snippet>
            </div>
        </div>
    );
}