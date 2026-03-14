'use client'

import React, { useState } from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Avatar } from '@heroui/avatar';

const LEADERS = [
    {
        id: 1,
        name: "Ông Trần Văn Tân",
        position: "Giám đốc Sở",
        isDirector: true,
        responsibilities: [
            "Lãnh đạo, quản lý chung và điều hành toàn diện hoạt động của Sở.",
            "Phụ trách tổ chức cán bộ, bảo vệ chính trị nội bộ, thi đua khen thưởng.",
            "Chủ tài khoản cơ quan, người phát ngôn chính thức.",
            "Đầu mối quan hệ với Tỉnh ủy, HĐND, UBND và Bộ Tài chính."
        ],
        departments: ["Phòng Tổng hợp và Quản lý ngân sách", "Phòng Hợp tác và Quản lý đầu tư (trừ hợp tác quốc tế & FDI)"],
        areas: "Buôn Ma Thuột, Tân An, Tân Lập, Thành Nhất, Ea Kao, Tuy Hòa, Phú Yên, Bình Kiến, Đông Hòa, Hòa Hiệp."
    },
    {
        id: 2,
        name: "Ông Nguyễn Tấn Thành",
        position: "Phó Giám đốc Sở",
        responsibilities: [
            "Quản lý tài chính hành chính sự nghiệp.",
            "Chủ tài khoản thứ hai (được ủy quyền).",
            "Trưởng Ban chỉ đạo Chuyển đổi số, PCCC.",
            "Kiểm soát thủ tục hành chính, hành chính quản trị."
        ],
        departments: ["Phòng Tài chính - Hành chính sự nghiệp", "Văn phòng Sở (trừ nhân sự)"],
        areas: "Buôn Hồ, Cư Bao, Hòa Phú, Ea Drông, Ea Ly, Ea Bá, Đức Bình, Sông Hinh, Pơng Drang, Krông Búk, Cư Pơng, Krông Năng."
    },
    {
        id: 3,
        name: "Ông Nguyễn Hoàng Phúc",
        position: "Phó Giám đốc Sở",
        responsibilities: [
            "Đăng ký kinh doanh, hỗ trợ doanh nghiệp, kinh tế tập thể/tư nhân.",
            "Triển khai chỉ số PCI, cải thiện môi trường đầu tư.",
            "Chủ tài khoản thứ ba (được ủy quyền)."
        ],
        departments: ["Phòng Quản lý doanh nghiệp"],
        areas: "Phú Hòa 1, Phú Hòa 2, Sơn Hòa, Vân Hòa, Tây Sơn, Suối Trai, Ea Sup, Ea Rốc, Ea Bung, Ia Rvê, Ia Lốp."
    },
    {
        id: 4,
        name: "Ông Y Hương Niê",
        position: "Phó Giám đốc Sở",
        responsibilities: [
            "Quản lý ngân sách xã, phường.",
            "Chỉ huy trưởng Ban CHQS cơ quan."
        ],
        departments: ["Phòng Ngân sách xã, phường"],
        areas: "Hòa Xuân, DliêYa, Tam Giang, Phú Xuân, Ea Kar, Ea Ô, Ea Knốp, Cư Yang, Ea Păl, Ea Ninh, Dray Bhăng, Ea Ktur."
    },
    {
        id: 5,
        name: "Ông Hồ Quang Tuấn",
        position: "Phó Giám đốc Sở",
        responsibilities: [
            "Quyết toán vốn đầu tư, dự án hoàn thành.",
            "Chính trị viên Ban CHQS cơ quan.",
            "Trưởng Ban chất lượng ISO 9001:2015."
        ],
        departments: ["Phòng Quyết toán vốn đầu tư"],
        areas: "Krông Pắk, Ea Knuếc, Tân Tiến, Ea Phê, Ea Kly, Vụ Bổn, Liên Sơn Lắk, Tây Hòa, Hòa Thịnh, Hòa Mỹ, Sơn Thành."
    },
    {
        id: 6,
        name: "Ông Lê Danh Thắng",
        position: "Phó Giám đốc Sở",
        responsibilities: [
            "Quản lý giá và tài sản công.",
            "Chỉ đạo hoạt động tại cơ sở 2 (32A Lê Thị Hồng Gấm)."
        ],
        departments: ["Phòng Quản lý giá và Công sản"],
        areas: "Đắk Liêng, Nam Kar, Đắk Phơi, Krông Nô, Ea Wer, Ea Nuôl, Buôn Đôn, Ea Kiết, Xuân Lãnh, Phú Mỡ, Xuân Phước, Đồng Xuân."
    },
    {
        id: 7,
        name: "Ông Vũ Đình Vinh",
        position: "Phó Giám đốc Sở",
        responsibilities: [
            "Công tác thẩm định và đấu thầu."
        ],
        departments: ["Phòng Thẩm định và Quản lý đấu thầu"],
        areas: "Ea M’Droh, Quảng Phú, Cuôr Đăng, Cư M’gar, Ea Tul, Ea Khăl, Ea Đăng, Ea Wy, Xuân Đài, Sông Cầu, Xuân Thọ."
    },
    {
        id: 8,
        name: "Ông Trần Quang Sơn",
        position: "Phó Giám đốc Sở",
        responsibilities: [
            "Xúc tiến đầu tư, hợp tác trong nước/quốc tế.",
            "Quản lý vốn FDI."
        ],
        departments: ["Trung tâm xúc tiến đầu tư", "Mảng FDI thuộc Phòng Hợp tác & QLĐT"],
        areas: "Ea Hiao, Ea Hleo, Hòa Sơn, Dang Kang, Krông Bông, Yang Mao, Cư Pui, Krông Ana, Cư M’ta, Xuân Cảnh, Xuân Lộc, Tuy An Bắc."
    },
    {
        id: 9,
        name: "Ông Huỳnh Gia Hoàng",
        position: "Phó Giám đốc Sở",
        responsibilities: [
            "Quy hoạch phát triển KT-XH, kế hoạch đầu tư các ngành.",
            "Phụ trách mảng: Nông nghiệp, Xây dựng, Y tế, Giáo dục, Văn hóa..."
        ],
        departments: ["Phòng Kinh Tế Ngành"],
        areas: "Tuy An Đông, Ô Loan, Tuy An Nam, Tuy An Tây, M’Đắk, Ea Riêng, Krông Á, Cư Prao, Ea Trang, Dur Kmăl, Ea Na."
    }
];

const LeaderCard = ({ leader }: { leader: any }) => {
    const [expanded, setExpanded] = useState(false);

    // Style riêng cho Giám đốc
    const containerClass = leader.isDirector 
        ? "border-2 border-blue-500 shadow-xl bg-blue-50/30 w-full max-w-3xl mx-auto mb-10" 
        : "border border-gray-200 shadow-md hover:shadow-lg transition-all h-full";

    return (
        <Card className={`${containerClass} p-4`}>
            <CardHeader className="flex gap-4 items-center pb-2">
                <Avatar 
                    isBordered 
                    radius="lg"
                    size={leader.isDirector ? "lg" : "md"}
                    src="" // Ảnh đại diện giả lập
                    className="flex-shrink-0"
                />
                <div className="flex flex-col">
                    <p className={`font-bold text-gray-800 ${leader.isDirector ? 'text-xl uppercase' : 'text-lg'}`}>
                        {leader.name}
                    </p>
                    <Chip size="sm" color={leader.isDirector ? "primary" : "default"} variant="flat" className="mt-1 w-fit">
                        {leader.position}
                    </Chip>
                </div>
            </CardHeader>
            
            <div className="w-full h-px bg-gray-200 my-2"></div>

            <CardBody className="py-2 gap-3 text-sm text-gray-700">
                <div>
                    <h4 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                        📋 Nhiệm vụ trọng tâm:
                    </h4>
                    <ul className="list-disc pl-5 space-y-1">
                        {leader.responsibilities.map((res: string, idx: number) => (
                            <li key={idx}>{res}</li>
                        ))}
                    </ul>
                </div>

                <div className="bg-gray-100 p-2 rounded-lg">
                    <h4 className="font-semibold text-gray-900 text-xs uppercase tracking-wide mb-1">
                        Phòng ban trực thuộc
                    </h4>
                    <div className="flex flex-wrap gap-1">
                        {leader.departments.map((dept: string, idx: number) => (
                            <span key={idx} className="bg-white px-2 py-1 rounded border text-xs font-medium">
                                {dept}
                            </span>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                        📍 Địa bàn phụ trách:
                    </h4>
                    <p className={`text-gray-600 italic leading-relaxed ${!expanded && !leader.isDirector ? 'line-clamp-2' : ''}`}>
                        {leader.areas}
                    </p>
                    {!leader.isDirector && (
                        <button 
                            onClick={() => setExpanded(!expanded)} 
                            className="text-blue-600 text-xs font-medium mt-1 hover:underline focus:outline-none"
                        >
                            {expanded ? "Thu gọn" : "Xem tất cả"}
                        </button>
                    )}
                </div>
            </CardBody>
        </Card>
    );
};

// --- 3. Trang chính ---
export default function LeaderPage() {
    const director = LEADERS.find(l => l.isDirector);
    const deputies = LEADERS.filter(l => !l.isDirector);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Lãnh đạo Sở</h1>
                    <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
                        Cơ cấu tổ chức và phân công nhiệm vụ Ban Giám đốc
                    </p>
                </div>

                {director && (
                    <div className="animate-fade-in-up">
                        <LeaderCard leader={director} />
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-fr">
                    {deputies.map((leader) => (
                        <div key={leader.id} className="flex">
                            <LeaderCard leader={leader} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}