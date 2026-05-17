import React from "react";
import { Widget } from "../../core/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategoriesQuery } from "../../services/dataBinding";
import { Hash, ListFilter, Sliders, Map } from "lucide-react";

// ----------------------------------------------------------------------
// 1. HERO SLIDER EDITOR
// ----------------------------------------------------------------------
export const HeroSliderEditor: React.FC<{
  widget: Widget;
  onChangeData: (data: any) => void;
  activeLang: string;
}> = ({ widget, onChangeData }) => {
  const limit = widget.data?.limit || 5;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="space-y-1.5">
        <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
          <Sliders className="w-3.5 h-3.5 text-indigo-500" /> Số lượng Banner tối đa ({limit})
        </Label>
        <Input
          type="range"
          min="1"
          max="10"
          step="1"
          value={limit}
          onChange={(e) => onChangeData({ ...widget.data, limit: parseInt(e.target.value) })}
          className="w-full accent-indigo-650 cursor-pointer h-2"
        />
      </div>
      <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-[9px] text-slate-400 leading-normal">
        * Banners tự động trượt sau mỗi 6 giây, lấy từ danh sách ảnh nổi bật đang kích hoạt của cơ quan.
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 2. PUBLIC SERVICES EDITOR
// ----------------------------------------------------------------------
export const PublicServicesEditor: React.FC<{
  widget: Widget;
  onChangeData: (data: any) => void;
  activeLang: string;
}> = () => {
  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl text-center text-xs font-semibold text-slate-500 space-y-2">
      <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 flex items-center justify-center mx-auto font-bold">✓</div>
      <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Thiết lập tự động</p>
      <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed px-2">
        Widget liên kết tự động tới 4 dịch vụ hành chính công cấp thiết nhất của Xã theo tiêu chuẩn quốc gia.
      </p>
    </div>
  );
};

// ----------------------------------------------------------------------
// 3. LEGAL DOCUMENTS EDITOR
// ----------------------------------------------------------------------
export const LegalDocumentsEditor: React.FC<{
  widget: Widget;
  onChangeData: (data: any) => void;
  activeLang: string;
}> = ({ widget, onChangeData, activeLang }) => {
  const { data: categories = [], isLoading } = useCategoriesQuery();
  const limit = widget.data?.limit || 5;
  const selectedCategory = widget.data?.selectedCategory || "all";

  // Filter categories to only those containing documents/posts
  const docCategories = categories.filter((c: any) => 
    c.slug?.includes("van-ban") || 
    c.name?.toLowerCase().includes("văn bản") ||
    c.slug?.includes("nghi-quyet") ||
    c.slug?.includes("quy-et-dinh")
  );

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="space-y-1.5">
        <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
          <ListFilter className="w-3.5 h-3.5 text-indigo-500" /> Chọn danh mục văn bản
        </Label>
        {isLoading ? (
          <div className="h-10 flex items-center justify-center border border-dashed rounded-xl bg-slate-50 text-[10px] text-slate-400">
            Đang tải danh mục...
          </div>
        ) : (
          <Select
            value={selectedCategory}
            onValueChange={(val) => onChangeData({ ...widget.data, selectedCategory: val === "all" ? null : val })}
          >
            <SelectTrigger className="h-10 rounded-xl border-slate-150 dark:border-slate-800 text-xs font-bold bg-white dark:bg-slate-900">
              <SelectValue placeholder="Tất cả văn bản" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800">
              <SelectItem value="all">Tất cả văn bản</SelectItem>
              {docCategories.map((c: any) => (
                <SelectItem key={c.id} value={c.slug}>
                  {c.translations?.[activeLang]?.name || c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-1.5">
        <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
          <Hash className="w-3.5 h-3.5 text-indigo-500" /> Số văn bản hiển thị ({limit})
        </Label>
        <Input
          type="range"
          min="1"
          max="15"
          step="1"
          value={limit}
          onChange={(e) => onChangeData({ ...widget.data, limit: parseInt(e.target.value) })}
          className="w-full accent-indigo-650 cursor-pointer h-2"
        />
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 4. PHOTO & VIDEO GALLERY EDITOR
// ----------------------------------------------------------------------
export const MediaGalleryEditor: React.FC<{
  widget: Widget;
  onChangeData: (data: any) => void;
  activeLang: string;
}> = ({ widget, onChangeData }) => {
  const limit = widget.data?.limit || 4;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="space-y-1.5">
        <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
          <Sliders className="w-3.5 h-3.5 text-indigo-500" /> Số lượng hiển thị tối đa ({limit})
        </Label>
        <Input
          type="range"
          min="2"
          max="12"
          step="2"
          value={limit}
          onChange={(e) => onChangeData({ ...widget.data, limit: parseInt(e.target.value) })}
          className="w-full accent-indigo-650 cursor-pointer h-2"
        />
      </div>
      <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-[9px] text-slate-400 leading-normal">
        * Tự động lọc ra những album ảnh & video clip tuyên truyền, tin tức xã sự kiện mới nhất.
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 5. FAQ ACCORDION EDITOR
// ----------------------------------------------------------------------
export const FaqAccordionEditor: React.FC<{
  widget: Widget;
  onChangeData: (data: any) => void;
  activeLang: string;
}> = ({ widget, onChangeData }) => {
  const limit = widget.data?.limit || 5;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="space-y-1.5">
        <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
          <Sliders className="w-3.5 h-3.5 text-indigo-500" /> Số lượng câu hỏi tối đa ({limit})
        </Label>
        <Input
          type="range"
          min="1"
          max="10"
          step="1"
          value={limit}
          onChange={(e) => onChangeData({ ...widget.data, limit: parseInt(e.target.value) })}
          className="w-full accent-indigo-650 cursor-pointer h-2"
        />
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 6. EXTERNAL LINKS EDITOR
// ----------------------------------------------------------------------
export const ExternalLinksEditor: React.FC<{
  widget: Widget;
  onChangeData: (data: any) => void;
  activeLang: string;
}> = () => {
  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl text-center text-xs font-semibold text-slate-500 space-y-2">
      <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 flex items-center justify-center mx-auto font-bold">✓</div>
      <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Thiết lập tự động</p>
      <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed px-2">
        Tự động hiển thị các Cổng liên kết chỉ đạo, Cổng thông tin Chính phủ và các trang hữu ích được thiết lập ở Cấp tỉnh.
      </p>
    </div>
  );
};

// ----------------------------------------------------------------------
// 7. COMMUNE INTERACTIVE MAP EDITOR
// ----------------------------------------------------------------------
export const CommuneInteractiveMapEditor: React.FC<{
  widget: Widget;
  onChangeData: (data: any) => void;
  activeLang: string;
}> = ({ widget, onChangeData }) => {
  const defaultZoneId = widget.data?.defaultZoneId || "T3";

  const zonesList = [
    { id: "T1", label: "Thôn 1" },
    { id: "T2", label: "Thôn 2" },
    { id: "T3", label: "Thôn 3" },
    { id: "T4", label: "Thôn 4" },
    { id: "T5", label: "Thôn 5" },
    { id: "T6", label: "Thôn 6" },
    { id: "T7", label: "Buôn Kang (Trung tâm)" },
    { id: "T8", label: "Buôn H'Ngô" }
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="space-y-1.5">
        <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
          <Map className="w-3.5 h-3.5 text-indigo-500" /> Phân vùng mặc định khi tải trang
        </Label>
        <Select
          value={defaultZoneId}
          onValueChange={(val) => onChangeData({ ...widget.data, defaultZoneId: val })}
        >
          <SelectTrigger className="h-10 rounded-xl border-slate-150 dark:border-slate-800 text-xs font-bold bg-white dark:bg-slate-900">
            <SelectValue placeholder="Chọn phân vùng mặc định..." />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800">
            {zonesList.map((z) => (
              <SelectItem key={z.id} value={z.id}>
                {z.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 8. CONTACT INFO SIDEBAR EDITOR
// ----------------------------------------------------------------------
export const ContactInfoSidebarEditor: React.FC<{
  widget: Widget;
  onChangeData: (data: any) => void;
  activeLang: string;
}> = () => {
  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl text-center text-xs font-semibold text-slate-500 space-y-2">
      <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 flex items-center justify-center mx-auto font-bold">✓</div>
      <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Thiết lập tự động</p>
      <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed px-2">
        Các thông tin liên hệ được đồng bộ tự động từ trang cấu hình hệ thống chung (Địa chỉ, Hotline, Hộp thư điện tử công).
      </p>
    </div>
  );
};
