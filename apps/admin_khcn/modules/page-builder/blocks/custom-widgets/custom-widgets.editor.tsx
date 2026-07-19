/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Widget } from "../../core/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategoriesQuery } from "../../services/dataBinding";
import { Hash, ListFilter, Sliders, Map, Globe, Phone, Mail, MapPin, Clock, Edit2 } from "lucide-react";

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
// 2. PUBLIC SERVICES EDITOR (FULLY INTERACTIVE WIDGET INSTANCE CONFIG)
// ----------------------------------------------------------------------
export const PublicServicesEditor: React.FC<{
  widget: Widget;
  onChangeData: (data: any) => void;
  activeLang: string;
}> = ({ widget, onChangeData, activeLang }) => {
  // eslint-disable-next-line unused-imports/no-unused-vars
  const currentLang = activeLang;

  const defaultServices = [
    { title: "Dịch vụ công trực tuyến", desc: "Nộp hồ sơ thủ tục hành chính trực tuyến 24/7.", url: "", iconName: "FileText" },
    { title: "Tra cứu hồ sơ một cửa", desc: "Kiểm tra tiến độ giải quyết hồ sơ đã nộp.", url: "", iconName: "FileSearch" },
    { title: "Phản ánh kiến nghị", desc: "Gửi ý kiến đóng góp và đánh giá thái độ phục vụ.", url: "", iconName: "MessageSquare" },
    { title: "Hỏi đáp pháp luật", desc: "Giải đáp thắc mắc về đất đai, hộ tịch, quy hoạch.", url: "", iconName: "ShieldCheck" }
  ];

  const items = Array.isArray(widget.data?.items) && widget.data.items.length > 0 ? widget.data.items : defaultServices;

  const updateItem = (index: number, key: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [key]: value };
    onChangeData({ ...widget.data, items: newItems });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="text-[10px] text-slate-400 border-b pb-2 flex items-center gap-1.5 font-bold uppercase tracking-wider">
        <Edit2 className="w-3.5 h-3.5 text-indigo-500" /> Cấu hình 4 thẻ dịch vụ công
      </div>

      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
        {items.slice(0, 4).map((item: any, idx: number) => (
          <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-3">
            <span className="text-[9px] font-black text-indigo-650 uppercase bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded">
              Dịch vụ {idx + 1}
            </span>

            <div className="space-y-1">
              <Label className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase">Tiêu đề</Label>
              <Input
                type="text"
                value={item.title}
                onChange={(e) => updateItem(idx, "title", e.target.value)}
                placeholder="Tiêu đề dịch vụ..."
                className="h-8 text-xs rounded-lg border-slate-200"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase">Mô tả ngắn</Label>
              <Textarea
                value={item.desc}
                onChange={(e) => updateItem(idx, "desc", e.target.value)}
                placeholder="Mô tả dịch vụ..."
                rows={2}
                className="text-xs rounded-lg border-slate-200 min-h-[48px] resize-none"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase">Đường dẫn liên kết (URL)</Label>
              <Input
                type="text"
                value={item.url}
                onChange={(e) => updateItem(idx, "url", e.target.value)}
                placeholder="https://dichvucong..."
                className="h-8 text-xs rounded-lg border-slate-200"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase">Biểu tượng thẻ</Label>
              <Select
                value={item.iconName || "FileText"}
                onValueChange={(val) => updateItem(idx, "iconName", val)}
              >
                <SelectTrigger className="h-8 text-xs rounded-lg bg-white dark:bg-slate-900 border-slate-200">
                  <SelectValue placeholder="Chọn biểu tượng" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 dark:border-slate-800 text-xs">
                  <SelectItem value="FileText">Tệp văn bản (FileText)</SelectItem>
                  <SelectItem value="FileSearch">Tra cứu hồ sơ (FileSearch)</SelectItem>
                  <SelectItem value="MessageSquare">Ý kiến phản ánh (MessageSquare)</SelectItem>
                  <SelectItem value="ShieldCheck">Bảo mật pháp lý (ShieldCheck)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>
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
// 6. EXTERNAL LINKS EDITOR (FULLY INTERACTIVE WIDGET INSTANCE CONFIG)
// ----------------------------------------------------------------------
export const ExternalLinksEditor: React.FC<{
  widget: Widget;
  onChangeData: (data: any) => void;
  activeLang: string;
}> = ({ widget, onChangeData, activeLang }) => {
  // eslint-disable-next-line unused-imports/no-unused-vars
  const currentLang = activeLang;

  const defaultLinks = [
    { title: "Cổng Dịch vụ công Quốc gia", url: "https://dichvucong.gov.vn" },
    { title: "Cổng TTĐT Tỉnh Đắk Lắk", url: "https://daklak.gov.vn" },
    { title: "UBND Huyện Krông Bông", url: "https://krongbong.daklak.gov.vn" },
    { title: "Bộ Khoa học và Công nghệ", url: "https://most.gov.vn" }
  ];

  const items = Array.isArray(widget.data?.items) && widget.data.items.length > 0 ? widget.data.items : defaultLinks;

  const updateLink = (index: number, key: string, value: string) => {
    const newLinks = [...items];
    newLinks[index] = { ...newLinks[index], [key]: value };
    onChangeData({ ...widget.data, items: newLinks });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="text-[10px] text-slate-400 border-b pb-2 flex items-center gap-1.5 font-bold uppercase tracking-wider">
        <Globe className="w-3.5 h-3.5 text-indigo-500" /> Cấu hình danh sách liên kết ngoài
      </div>

      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
        {items.slice(0, 4).map((link: any, idx: number) => (
          <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-3">
            <span className="text-[9px] font-black text-indigo-650 uppercase bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded">
              Liên kết {idx + 1}
            </span>

            <div className="space-y-1">
              <Label className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase">Tên hiển thị</Label>
              <Input
                type="text"
                value={link.title}
                onChange={(e) => updateLink(idx, "title", e.target.value)}
                placeholder="Ví dụ: Cổng dịch vụ công..."
                className="h-8 text-xs rounded-lg border-slate-200"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase">Địa chỉ trang web (URL)</Label>
              <Input
                type="text"
                value={link.url}
                onChange={(e) => updateLink(idx, "url", e.target.value)}
                placeholder="https://..."
                className="h-8 text-xs rounded-lg border-slate-200"
              />
            </div>
          </div>
        ))}
      </div>
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
// 8. CONTACT INFO SIDEBAR EDITOR (FULLY INTERACTIVE WIDGET INSTANCE CONFIG)
// ----------------------------------------------------------------------
export const ContactInfoSidebarEditor: React.FC<{
  widget: Widget;
  onChangeData: (data: any) => void;
  activeLang: string;
}> = ({ widget, onChangeData }) => {
  const address = widget.data?.address ?? "Thôn 6, xã Dang Kang, huyện Krông Bông, tỉnh Đắk Lắk";
  const hotline = widget.data?.hotline ?? "0262.3683.123";
  const email = widget.data?.email ?? "ubnddangkang@krongbong.daklak.gov.vn";
  const workingHours = widget.data?.workingHours ?? "Thứ 2 - Thứ 6 (Sáng 7:30 - 11:30 | Chiều 13:30 - 17:00)";

  const updateField = (key: string, value: string) => {
    onChangeData({ ...widget.data, [key]: value });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="text-[10px] text-slate-400 border-b pb-2 flex items-center gap-1.5 font-bold uppercase tracking-wider">
        <Phone className="w-3.5 h-3.5 text-indigo-500" /> Cấu hình thông tin liên hệ đơn vị
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <Label className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase flex items-center gap-1">
            <MapPin className="w-3 h-3 text-red-500" /> Địa chỉ trụ sở
          </Label>
          <Textarea
            value={address}
            onChange={(e) => updateField("address", e.target.value)}
            placeholder="Địa chỉ cơ quan..."
            rows={2}
            className="text-xs rounded-lg border-slate-200 min-h-[50px] resize-none"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase flex items-center gap-1">
            <Phone className="w-3 h-3 text-red-500" /> Đường dây nóng
          </Label>
          <Input
            type="text"
            value={hotline}
            onChange={(e) => updateField("hotline", e.target.value)}
            placeholder="Số hotline..."
            className="h-8 text-xs rounded-lg border-slate-200"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase flex items-center gap-1">
            <Mail className="w-3 h-3 text-red-500" /> Hộp thư công vụ (Email)
          </Label>
          <Input
            type="text"
            value={email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="Email liên hệ..."
            className="h-8 text-xs rounded-lg border-slate-200"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase flex items-center gap-1">
            <Clock className="w-3 h-3 text-red-500" /> Thời gian làm việc
          </Label>
          <Input
            type="text"
            value={workingHours}
            onChange={(e) => updateField("workingHours", e.target.value)}
            placeholder="Giờ làm việc..."
            className="h-8 text-xs rounded-lg border-slate-200"
          />
        </div>
      </div>
    </div>
  );
};
