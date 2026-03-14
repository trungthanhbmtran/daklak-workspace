import React from 'react'
import { Search } from 'lucide-react';
import { ThemeSwitch } from '@/components/theme-switch';
import { Input } from '@heroui/input';
import { getFormattedVietnameseDate } from '@/lib/dateUtils';


function SlideBar() {
    const formattedDate = getFormattedVietnameseDate();

    return (
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 p-4  backdrop-blur-sm rounded-b-md">

            {/* Date */}
            <p className="text-sm sm:text-base text-red-500">{formattedDate}</p>

            {/* Running Text */}
            <div className="overflow-hidden w-full sm:w-auto">
                <div className="whitespace-nowrap text-sm sm:text-base animate-runningText">
                    CHÀO MỪNG ĐẾN VỚI CỔNG THÔNG TIN ĐIỆN TỬ SỞ TÀI CHÍNH
                </div>
            </div>

            {/* Search + Theme + Language */}
            <div className="flex items-center gap-3">
                <Input
                    color="primary"
                    className="hidden sm:block w-[180px] sm:w-[220px] md:w-[260px] lg:w-[300px]"
                    placeholder="Nhập từ khoá tìm kiếm"
                    endContent={<Search className="text-red-500" />}
                />

                {/* Toggle theme */}
                <ThemeSwitch />

                {/* Toggle language */}
                {/* <LanguageSwitcher /> */}
            </div>

        </div>
    )
}

export default SlideBar