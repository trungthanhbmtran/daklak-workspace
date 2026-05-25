"use client";
import { useThemeConfig, LayoutSettings } from "./ThemeProvider";

export function LayoutConfig() {
    // Lấy dữ liệu layout và hàm setter từ Context toàn cục
    const { layout, setLayout } = useThemeConfig();

    const radiusOptions: LayoutSettings["radius"][] = ['Sharp', 'Subtle', 'Medium', 'Full'];

    return (
        <div className="space-y-5">
            {/* 1. Độ bo góc hệ thống (Border Radius) */}
            <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                    Độ bo góc thành phần (Border Radius)
                </label>
                <div className="grid grid-cols-4 gap-2">
                    {radiusOptions.map((r) => {
                        const isSelected = layout.radius === r;
                        return (
                            <button
                                key={r}
                                type="button"
                                onClick={() => setLayout({ radius: r })}
                                className={`py-2 text-xs font-medium border rounded-lg transition-all ${isSelected
                                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500'
                                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                                    }`}
                            >
                                {r}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 2. Độ rộng tối đa trang (Max Content Width) */}
            <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                    Độ rộng khung nội dung (Max Content Width)
                </label>
                <select
                    value={layout.width}
                    onChange={(e) => setLayout({ width: e.target.value as LayoutSettings["width"] })}
                    className="w-full text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                >
                    <option value="1024">Đóng khung nhỏ (1024px)</option>
                    <option value="1280">Tiêu chuẩn CMS (1280px)</option>
                    <option value="1536">Màn hình rộng (1536px)</option>
                    <option value="full">Toàn màn hình (100%)</option>
                </select>
            </div>

            {/* 3. Mật độ hiển thị (Compact Mode) */}
            <div className="flex items-center justify-between pt-2">
                <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Giao diện cô đọng (Compact Mode)
                    </label>
                    <p className="text-[11px] text-slate-400">
                        Giảm padding của các bảng và danh sách để hiển thị nhiều data hơn.
                    </p>
                </div>
                <input
                    type="checkbox"
                    checked={layout.isCompact}
                    onChange={(e) => setLayout({ isCompact: e.target.checked })}
                    className="w-9 h-5 bg-slate-300 dark:bg-slate-700 rounded-full appearance-none checked:bg-blue-600 cursor-pointer relative before:content-[''] before:absolute before:h-4 before:w-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-transform transition-colors"
                />
            </div>
        </div>
    );
}