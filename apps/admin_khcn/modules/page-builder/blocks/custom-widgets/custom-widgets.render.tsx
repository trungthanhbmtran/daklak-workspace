/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Widget } from "../../core/types";
import {
  FileText,
  FileSearch,
  MessageSquare,
  ShieldCheck,
  Play,
  Images,
  Star,
  FolderOpen,
  Clock,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  CalendarDays,
  ArrowRight,
  Link2,
  Info,
  HelpCircle
} from "lucide-react";

// Lucide icon mapping dictionary for public services
const iconMap: Record<string, any> = {
  FileText: FileText,
  FileSearch: FileSearch,
  MessageSquare: MessageSquare,
  ShieldCheck: ShieldCheck,
};

// ----------------------------------------------------------------------
// 1. HERO SLIDER RENDERER
// ----------------------------------------------------------------------
export const HeroSliderRender: React.FC<{ widget: Widget; activeLang: string }> = ({ widget, activeLang }) => {
  const currentLang = activeLang;
  const mockBanners = [
    {
      id: "mock-1",
      name: currentLang === "en" ? "WELCOME TO DANG KANG COMMUNE PORTAL" : "CHÀO MỪNG ĐẾN VỚI CỔNG THÔNG TIN XÃ DANG KANG",
      description: currentLang === "en" ? "Solidarity - Innovation - Rapid & Sustainable Development" : "Đoàn kết - Đổi mới - Phát triển nhanh và bền vững",
      imageUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "mock-2",
      name: currentLang === "en" ? "NATIONAL DIGITAL TRANSFORMATION" : "ĐẨY MẠNH CHUYỂN ĐỔI SỐ QUỐC GIA",
      description: currentLang === "en" ? "Serving citizens and enterprises with integrity and professionalism" : "Phục vụ người dân và doanh nghiệp minh bạch, chuyên nghiệp",
      imageUrl: "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&w=1200&q=80",
    }
  ];

  const limit = widget.data?.limit || 5;
  const displayBanners = mockBanners.slice(0, limit);

  return (
    <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden shadow-md border border-slate-200/20 bg-slate-900 select-none">
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent z-10" />
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={displayBanners[0].imageUrl}
        alt={displayBanners[0].name}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 z-20 flex flex-col justify-center p-6 sm:p-10 max-w-2xl">
        <span className="text-amber-400 font-extrabold text-[10px] sm:text-xs tracking-widest uppercase mb-2 flex items-center gap-1.5 drop-shadow">
          <Star className="w-3.5 h-3.5 fill-amber-400 shrink-0" /> {currentLang === "en" ? "Featured Campaign" : "Chiến dịch trọng điểm"}
        </span>
        <h2 className="text-lg sm:text-2xl font-black text-white leading-tight uppercase drop-shadow-md">
          {displayBanners[0].name}
        </h2>
        <p className="text-slate-200 font-medium text-[10px] sm:text-xs mt-2 max-w-lg drop-shadow line-clamp-2">
          &quot;{displayBanners[0].description}&quot;
        </p>
        <div className="mt-4">
          <div className="inline-flex items-center gap-1.5 bg-red-600 text-white font-bold text-[10px] px-4 py-2 rounded-xl shadow-md cursor-pointer hover:bg-red-700 transition-colors">
            {currentLang === "en" ? "Explore Details" : "Xem chi tiết"}
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-1.5 bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm border border-white/10">
        {displayBanners.map((_, idx) => (
          <div
            key={idx}
            className={`w-2 h-2 rounded-full transition-all ${idx === 0 ? "bg-amber-400 w-4" : "bg-white/40"}`}
          />
        ))}
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 2. PUBLIC SERVICES RENDERER
// ----------------------------------------------------------------------
export const PublicServicesRender: React.FC<{ widget: Widget; activeLang: string }> = ({ widget, activeLang }) => {
  const currentLang = activeLang;

  // Read customizable items from widget data, fallback to beautiful defaults if empty
  const defaultServices = [
    {
      title: currentLang === "en" ? "Online Public Services" : "Dịch vụ công trực tuyến",
      desc: currentLang === "en" ? "Submit administrative procedural dossiers online 24/7." : "Nộp hồ sơ thủ tục hành chính trực tuyến 24/7.",
      url: "#",
      iconName: "FileText",
      color: "text-blue-600 bg-blue-50/50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/50"
    },
    {
      title: currentLang === "en" ? "Dossier Status Lookup" : "Tra cứu hồ sơ một cửa",
      desc: currentLang === "en" ? "Check the handling progress of submitted documents." : "Kiểm tra tiến độ giải quyết hồ sơ đã nộp.",
      url: "#",
      iconName: "FileSearch",
      color: "text-emerald-600 bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50"
    },
    {
      title: currentLang === "en" ? "Citizen Feedback" : "Phản ánh kiến nghị",
      desc: currentLang === "en" ? "Submit formal recommendations and service evaluations." : "Gửi ý kiến đóng góp và đánh giá thái độ phục vụ.",
      url: "#",
      iconName: "MessageSquare",
      color: "text-amber-600 bg-amber-50/50 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/50"
    },
    {
      title: currentLang === "en" ? "Legal Assistance" : "Hỏi đáp pháp luật",
      desc: currentLang === "en" ? "Get authoritative legal explanations regarding land and civil status." : "Giải đáp thắc mắc về đất đai, hộ tịch, quy hoạch.",
      url: "#",
      iconName: "ShieldCheck",
      color: "text-purple-600 bg-purple-50/50 border-purple-100 dark:bg-purple-950/20 dark:border-purple-900/50"
    }
  ];

  const customItems = widget.data?.items;
  const displayItems = Array.isArray(customItems) && customItems.length > 0 ? customItems : defaultServices;

  const colors = [
    "text-blue-600 bg-blue-50/50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/50",
    "text-emerald-600 bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50",
    "text-amber-600 bg-amber-50/50 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/50",
    "text-purple-600 bg-purple-50/50 border-purple-100 dark:bg-purple-950/20 dark:border-purple-900/50",
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {displayItems.map((svc, idx) => {
        const IconComponent = iconMap[svc.iconName] || FileText;
        const colorStyle = svc.color || colors[idx % colors.length];
        return (
          <div
            key={idx}
            className={`p-4 rounded-2xl border transition-all hover:-translate-y-0.5 shadow-sm flex flex-col justify-between gap-4 ${colorStyle}`}
          >
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center">
              <IconComponent className="w-4.5 h-4.5" />
            </div>
            <div>
              <h5 className="font-extrabold text-slate-800 dark:text-white uppercase text-[10px] tracking-wide truncate">
                {svc.title || (currentLang === "en" ? "Service Title" : "Tiêu đề dịch vụ")}
              </h5>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium leading-relaxed line-clamp-2">
                {svc.desc || (currentLang === "en" ? "Service Description goes here." : "Mô tả chi tiết dịch vụ công.")}
              </p>
            </div>
            <div className="flex items-center gap-1 font-black text-[9px] tracking-wider uppercase opacity-80">
              <span>{currentLang === "en" ? "Access Feature" : "Truy cập ngay"}</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ----------------------------------------------------------------------
// 3. LEGAL DOCUMENTS RENDERER
// ----------------------------------------------------------------------
export const LegalDocumentsRender: React.FC<{ widget: Widget; activeLang: string }> = ({ widget, activeLang }) => {
  const currentLang = activeLang;
  const mockDocs = [
    { id: "doc-1", title: currentLang === "en" ? "Resolution on communal economic targets for 2026" : "Nghị quyết về chỉ tiêu phát triển kinh tế - xã hội xã Dang Kang năm 2026", codeNum: "12/NQ-HĐND", dateStr: "10/01/2026" },
    { id: "doc-2", title: currentLang === "en" ? "Decision promulgating regulations on one-stop office workflow" : "Quyết định ban hành quy chế hoạt động của bộ phận một cửa cấp xã", codeNum: "45/QĐ-UBND", dateStr: "15/02/2026" },
    { id: "doc-3", title: currentLang === "en" ? "Plan for disease prevention in livestock and poultry" : "Kế hoạch phòng chống dịch bệnh gia súc, gia cầm trên địa bàn xã", codeNum: "08/KH-UBND", dateStr: "22/03/2026" }
  ];

  const limit = widget.data?.limit || 5;
  const displayDocs = mockDocs.slice(0, limit);

  return (
    <div className="space-y-2.5">
      {widget.title?.[currentLang] && (
        <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight mb-4 border-l-4 border-red-600 pl-3">
          {widget.title[currentLang]}
        </h4>
      )}
      {displayDocs.map((doc, idx) => (
        <div
          key={doc.id || idx}
          className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl flex items-center justify-between gap-3 hover:border-red-500/50 transition-colors"
        >
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded bg-red-50 dark:bg-red-950/20 text-red-600 flex items-center justify-center shrink-0">
              <FolderOpen className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[8px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-black tracking-wide">
                  {doc.codeNum}
                </span>
                <span className="text-[8px] text-slate-400 font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {doc.dateStr}
                </span>
              </div>
              <h5 className="text-[11px] font-bold text-slate-750 dark:text-white mt-1 leading-snug truncate">
                {doc.title}
              </h5>
            </div>
          </div>
          <div className="font-extrabold text-[8px] tracking-wider uppercase border border-red-200 hover:bg-red-50 text-red-600 dark:border-red-900 dark:hover:bg-red-950/30 dark:text-red-400 px-2.5 py-1.5 rounded-lg shrink-0 cursor-pointer transition-colors shadow-sm bg-white dark:bg-slate-950">
            {currentLang === "en" ? "View Doc" : "Xem văn bản"}
          </div>
        </div>
      ))}
    </div>
  );
};

// ----------------------------------------------------------------------
// 4. PHOTO & VIDEO GALLERY RENDERER
// ----------------------------------------------------------------------
export const MediaGalleryRender: React.FC<{ widget: Widget; activeLang: string }> = ({ widget, activeLang }) => {
  const currentLang = activeLang;
  const mockItems = [
    { title: currentLang === "en" ? "Summary conference on the movement of solidarity and local build" : "Hội nghị tổng kết phong trào thi đua toàn dân đoàn kết", img: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80", type: "photo" },
    { title: currentLang === "en" ? "Commencement of clean environment cleaning program" : "Ra quân dọn dẹp vệ sinh môi trường đường làng ngõ xóm", img: "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&w=600&q=80", type: "photo" },
    { title: currentLang === "en" ? "Report: Dang Kang farmers raising wealth with high coffee fields" : "Phóng sự: Nông dân Dang Kang vươn lên làm giàu từ cây tiêu", img: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80", type: "video" },
    { title: currentLang === "en" ? "Instructional guidelines for Level 4 Public services" : "Hướng dẫn thực hiện dịch vụ công trực tuyến mức độ 4", img: "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&w=600&q=80", type: "video" }
  ];

  const limit = widget.data?.limit || 4;
  const displayItems = mockItems.slice(0, limit);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {displayItems.map((item, idx) => (
        <div key={idx} className="group relative rounded-xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 aspect-video shadow-sm">
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.img}
            alt={item.title}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent p-2.5 flex flex-col justify-end">
            <div className="flex items-center gap-1 mb-1 text-[8px] font-black uppercase tracking-wider text-amber-400">
              {item.type === "video" ? <Play className="w-2.5 h-2.5 fill-amber-400" /> : <Images className="w-2.5 h-2.5" />}
              <span>{item.type === "video" ? "Video Clip" : "Album Ảnh"}</span>
            </div>
            <h5 className="text-white text-[10px] font-bold line-clamp-2 leading-snug">
              {item.title}
            </h5>
          </div>
        </div>
      ))}
    </div>
  );
};

// ----------------------------------------------------------------------
// 5. FAQ ACCORDION RENDERER
// ----------------------------------------------------------------------
export const FaqAccordionRender: React.FC<{ widget: Widget; activeLang: string }> = ({ widget, activeLang }) => {
  const currentLang = activeLang;
  const mockFaqs = [
    {
      q: currentLang === "en" ? "What administrative documents are needed to apply for agricultural land use certification?" : "Hồ sơ đề nghị cấp Giấy chứng nhận quyền sử dụng đất nông nghiệp gồm những gì?",
      a: currentLang === "en" ? "Standard certification files require registration applications, original receipts, map layouts, identity verification copies, and commune land use reports." : "Bao gồm Đơn đăng ký cấp GCN, bản gốc một trong các giấy tờ về QSDĐ quy định tại Điều 100 Luật Đất đai, báo cáo hiện trạng sử dụng đất của UBND xã và bản sao CCCD."
    },
    {
      q: currentLang === "en" ? "How long does the birth registration procedure take at Dang Kang commune?" : "Thời gian giải quyết đăng ký khai sinh tại UBND xã Dang Kang mất bao lâu?",
      a: currentLang === "en" ? "Usually, birth certificate requests are completed on the same business day if all identity, hospital reports, and marital documents are fully presented." : "Thông thường thủ tục đăng ký khai sinh được giải quyết ngay trong ngày làm việc sau khi tiếp nhận đầy đủ giấy tờ hợp lệ (Giấy chứng sinh, đăng ký kết hôn của cha mẹ)."
    }
  ];

  const limit = widget.data?.limit || 5;
  const displayFaqs = mockFaqs.slice(0, limit);

  return (
    <div className="space-y-3">
      {displayFaqs.map((faq, idx) => (
        <div
          key={idx}
          className="p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2"
        >
          <div className="flex items-start gap-2 text-slate-850 dark:text-white font-extrabold text-[11px] leading-snug">
            <HelpCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
            <span>{faq.q}</span>
          </div>
          <div className="pl-5.5 text-[10px] text-slate-450 dark:text-slate-400 font-semibold leading-relaxed border-t border-slate-100 dark:border-slate-850 pt-2">
            {faq.a}
          </div>
        </div>
      ))}
    </div>
  );
};

// ----------------------------------------------------------------------
// 6. EXTERNAL LINKS RENDERER
// ----------------------------------------------------------------------
export const ExternalLinksRender: React.FC<{ widget: Widget; activeLang: string }> = ({ widget, activeLang }) => {
  const currentLang = activeLang;

  const defaultLinks = [
    { title: currentLang === "en" ? "National Public Service" : "Cổng Dịch vụ công Quốc gia", url: "#" },
    { title: currentLang === "en" ? "Dak Lak Province Portal" : "Cổng TTĐT Tỉnh Đắk Lắk", url: "#" },
    { title: currentLang === "en" ? "District People Committee" : "UBND Huyện Krông Bông", url: "#" },
    { title: currentLang === "en" ? "Ministry of Science & Tech" : "Bộ Khoa học và Công nghệ", url: "#" }
  ];

  const customLinks = widget.data?.items;
  const displayLinks = Array.isArray(customLinks) && customLinks.length > 0 ? customLinks : defaultLinks;

  return (
    <div className="grid grid-cols-2 gap-3">
      {displayLinks.map((link, idx) => (
        <a
          key={idx}
          href={link.url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 rounded-xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between text-slate-700 dark:text-slate-350 hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors shadow-sm cursor-pointer"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Link2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-[10px] font-black uppercase truncate tracking-wide">{link.title || (currentLang === "en" ? "Link" : "Liên kết")}</span>
          </div>
          <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
        </a>
      ))}
    </div>
  );
};

// ----------------------------------------------------------------------
// 7. COMMUNE INTERACTIVE MAP RENDERER
// ----------------------------------------------------------------------
export const CommuneInteractiveMapRender: React.FC<{ widget: Widget; activeLang: string }> = ({ widget, activeLang }) => {
  const currentLang = activeLang;

  const zones = [
    { id: "T1", name: currentLang === "en" ? "Village 1 - Dang Kang" : "Thôn 1 - Xã Dang Kang", area: "312.4 Ha", pop: "845 người", path: "M10,20 L40,15 L45,35 L15,40 Z", center: { x: 26, y: 28 } },
    { id: "T2", name: currentLang === "en" ? "Village 2 - Dang Kang" : "Thôn 2 - Xã Dang Kang", area: "245.8 Ha", pop: "712 người", path: "M40,15 L70,10 L75,28 L45,35 Z", center: { x: 57, y: 22 } },
    { id: "T3", name: currentLang === "en" ? "Village 3 - Dang Kang" : "Thôn 3 - Xã Dang Kang", area: "415.2 Ha", pop: "1,105 người", path: "M70,10 L95,15 L90,45 L75,28 Z", center: { x: 83, y: 24 } },
    { id: "T4", name: currentLang === "en" ? "Village 4 - Dang Kang" : "Thôn 4 - Xã Dang Kang", area: "198.5 Ha", pop: "630 người", path: "M15,40 L45,35 L38,62 L8,55 Z", center: { x: 26, y: 48 } },
    { id: "T5", name: currentLang === "en" ? "Village 5 - Dang Kang" : "Thôn 5 - Xã Dang Kang", area: "288.0 Ha", pop: "952 người", path: "M45,35 L75,28 L70,55 L38,62 Z", center: { x: 57, y: 45 } },
    { id: "T6", name: currentLang === "en" ? "Village 6 - Dang Kang" : "Thôn 6 - Xã Dang Kang", area: "340.5 Ha", pop: "1,048 người", path: "M75,28 L90,45 L80,75 L70,55 Z", center: { x: 79, y: 50 } },
    { id: "T7", name: currentLang === "en" ? "Buon Kang" : "Buôn Kang - Trung tâm hành chính", area: "410.6 Ha", pop: "1,245 người", path: "M8,55 L38,62 L30,90 L2,80 Z", center: { x: 19, y: 72 } },
    { id: "T8", name: currentLang === "en" ? "Buon HNgô" : "Buôn H'Ngô", area: "241.8 Ha", pop: "580 người", path: "M38,62 L70,55 L65,88 L30,90 Z", center: { x: 51, y: 74 } }
  ];

  const defaultZoneId = widget.data?.defaultZoneId || "T3";
  const [activeZoneId, setActiveZoneId] = React.useState(defaultZoneId);

  const activeZone = zones.find(z => z.id === activeZoneId) || zones[0];

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[9px] text-slate-400 font-semibold leading-normal">
        {currentLang === "en"
          ? "Interactive vector map simulating 8 village subdivisions of Dang Kang Commune. Click on any zone to view stats:"
          : "Bản đồ tương tác 8 thôn, buôn của địa bàn xã Dang Kang. Click vào phân vùng để xem chi tiết:"}
      </p>

      <div className="w-full flex flex-col sm:flex-row gap-5 items-center bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
        <div className="flex-1 w-full max-w-[280px] relative select-none">
          <svg viewBox="0 0 100 100" className="w-full h-auto drop-shadow-sm">
            {zones.map((zone) => {
              const isActive = activeZoneId === zone.id;
              return (
                <path
                  key={zone.id}
                  d={zone.path}
                  className={`stroke-white dark:stroke-slate-900 stroke-[1.2] cursor-pointer transition-all ${
                    isActive
                      ? "fill-red-600 opacity-95 scale-[1.01] drop-shadow"
                      : "fill-red-700/20 hover:fill-red-700/40 opacity-80"
                  }`}
                  onClick={() => setActiveZoneId(zone.id)}
                />
              );
            })}

            {zones.map((zone) => (
              <text
                key={`tag-${zone.id}`}
                x={zone.center.x}
                y={zone.center.y}
                fontSize="4"
                fontWeight="bold"
                textAnchor="middle"
                className={`pointer-events-none transition-colors ${
                  activeZoneId === zone.id ? "fill-[#fef08a]" : "fill-slate-800 dark:fill-slate-200"
                }`}
              >
                {zone.id}
              </text>
            ))}
          </svg>
        </div>

        {activeZone && (
          <div className="flex-1 bg-white dark:bg-slate-950 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 flex flex-col gap-2.5 text-[10px] self-stretch justify-center">
            <div className="flex items-center gap-1.5 border-b pb-1.5">
              <Info className="w-3.5 h-3.5 text-red-600" />
              <span className="font-extrabold text-red-600 uppercase tracking-wide">
                {activeZone.name}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 font-semibold text-slate-400">
              <div className="flex flex-col">
                <span className="text-[7.5px] text-slate-400 uppercase tracking-widest">{currentLang === "en" ? "Area" : "Diện tích"}</span>
                <span className="text-slate-800 dark:text-slate-250 font-bold">{activeZone.area}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[7.5px] text-slate-400 uppercase tracking-widest">{currentLang === "en" ? "Population" : "Dân cư"}</span>
                <span className="text-slate-800 dark:text-slate-250 font-bold">{activeZone.pop}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 8. CONTACT INFO SIDEBAR RENDERER
// ----------------------------------------------------------------------
export const ContactInfoSidebarRender: React.FC<{ widget: Widget; activeLang: string }> = ({ widget, activeLang }) => {
  const currentLang = activeLang;

  const address = widget.data?.address ?? "Thôn 6, xã Dang Kang, huyện Krông Bông, tỉnh Đắk Lắk";
  const hotline = widget.data?.hotline ?? "0262.3683.123";
  const email = widget.data?.email ?? "ubnddangkang@krongbong.daklak.gov.vn";
  const workingHours = widget.data?.workingHours ?? (currentLang === "en" ? "Mon - Fri (7:30 AM - 11:30 AM | 1:30 PM - 5:00 PM)" : "Thứ 2 - Thứ 6 (Sáng 7:30 - 11:30 | Chiều 13:30 - 17:00)");

  return (
    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex flex-col gap-4 text-[10px] font-semibold text-slate-700 dark:text-slate-350">
      <div className="flex items-start gap-2.5">
        <MapPin className="w-4.5 h-4.5 text-red-600 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-0.5">
          <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest">{currentLang === "en" ? "Headquarters Address" : "Địa chỉ trụ sở"}</span>
          <span className="leading-relaxed">{address}</span>
        </div>
      </div>

      <div className="flex items-start gap-2.5">
        <Phone className="w-4.5 h-4.5 text-red-600 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-0.5">
          <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest">{currentLang === "en" ? "Hotline Support" : "Đường dây nóng"}</span>
          <span className="font-bold text-red-600 hover:text-red-700 cursor-pointer">{hotline}</span>
        </div>
      </div>

      <div className="flex items-start gap-2.5">
        <Mail className="w-4.5 h-4.5 text-red-600 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-0.5">
          <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest">{currentLang === "en" ? "Official E-mail" : "Hộp thư công vụ"}</span>
          <span className="hover:text-red-600 cursor-pointer">{email}</span>
        </div>
      </div>

      <div className="flex items-start gap-2.5 border-t border-slate-150 dark:border-slate-800/80 pt-3">
        <CalendarDays className="w-4.5 h-4.5 text-slate-400 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-0.5">
          <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest">{currentLang === "en" ? "Working Hours" : "Thời gian làm việc"}</span>
          <span className="leading-relaxed">{workingHours}</span>
        </div>
      </div>
    </div>
  );
};
