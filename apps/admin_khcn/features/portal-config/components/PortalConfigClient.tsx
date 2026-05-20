"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useImageUpload } from "@/features/posts/hooks/useImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Settings,
  Phone,
  Calendar,
  Sparkles,
  Building,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  UploadCloud,
  X,
  FileText,
  Eye,
  Columns,
  Languages,
  Map as MapIcon,
  Workflow,
  UserSquare2,
  CalendarDays,
  Layout,
  Palette
} from "lucide-react";
import apiClient from "@/lib/axiosInstance";
import { PortalSubNav } from "./PortalSubNav";

// -------------------------------------------------------------
// DỮ LIỆU MẶC ĐỊNH CHO CÁC THÀNH PHẦN (FALLBACKS)
// -------------------------------------------------------------
const DEFAULT_ORG_SECTIONS_VI = [
  {
    title: "ĐẢNG ỦY XÃ",
    desc: "Cơ quan lãnh đạo toàn diện mọi hoạt động chính trị, kinh tế, xã hội, an ninh quốc phòng tại địa phương.",
    details: ["Bí thư Đảng ủy xã", "Phó Bí thư Thường trực Đảng ủy", "Ủy viên Ban Thường vụ Đảng ủy", "Các Chi bộ trực thuộc thôn, buôn, trường học"]
  },
  {
    title: "HỘI ĐỒNG NHÂN DÂN",
    desc: "Cơ quan quyền lực nhà nước ở địa phương, đại diện cho ý chí, nguyện vọng và quyền làm chủ của nhân dân.",
    details: ["Chủ tịch Hội đồng nhân dân", "Phó Chủ tịch HĐND xã", "Ban Pháp chế HĐND", "Ban Kinh tế - Xã hội HĐND"]
  },
  {
    title: "ỦY BAN NHÂN DÂN",
    desc: "Cơ quan chấp hành của Hội đồng nhân dân, cơ quan hành chính nhà nước ở địa phương, quản lý điều hành toàn diện.",
    details: ["Chủ tịch Ủy ban nhân dân", "Các Phó Chủ tịch UBND xã", "Bộ phận Tiếp nhận & Trả kết quả (Một cửa)", "Công chức Chuyên môn nghiệp vụ"]
  },
  {
    title: "ỦY BAN MTTQ & ĐOÀN THỂ",
    desc: "Tập hợp lực lượng đại đoàn kết toàn dân tộc, phối hợp cùng chính quyền tổ chức thực hiện các phong trào thi đua.",
    details: ["Ủy ban Mặt trận Tổ quốc xã", "Hội Liên hiệp Phụ nữ xã", "Đoàn Thanh niên Cộng sản Hồ Chí Minh", "Hội Nông dân & Hội Cựu chiến binh"]
  }
];

const DEFAULT_ORG_SECTIONS_EN = [
  {
    title: "COMMUNE PARTY COMMITTEE",
    desc: "The comprehensive leadership body for all political, economic, social, national security, and defense activities in the locality.",
    details: ["Party Committee Secretary", "Permanent Deputy Secretary", "Standing Committee Members", "Affiliated Party cells in villages and schools"]
  },
  {
    title: "PEOPLE'S COUNCIL",
    desc: "The local state power body representing the will, aspirations, and mastery rights of the citizens.",
    details: ["Chairman of People's Council", "Vice Chairman of People's Council", "Legal Affairs Committee", "Economic and Social Affairs Committee"]
  },
  {
    title: "PEOPLE'S COMMITTEE",
    desc: "The executive branch of the People's Council, acting as the local administrative state organ to manage comprehensive operations.",
    details: ["Chairman of People's Committee", "Vice Chairmen of People's Committee", "One-stop Reception & Result Return Department", "Specialized Professional Officials"]
  },
  {
    title: "FATHERLAND FRONT & ASSOCIATIONS",
    desc: "Rallying the great national unity block, collaborating with authorities to organize emulation movements.",
    details: ["Commune Fatherland Front Committee", "Women's Union", "Youth Union", "Farmers' Association & Veterans' Association"]
  }
];

const DEFAULT_LEADERS_VI = [
  {
    name: "Nguyễn Văn Hồng",
    role: "Bí thư Đảng ủy - Chủ tịch HĐND xã",
    responsibility: "Chịu trách nhiệm lãnh đạo toàn diện công tác Đảng, công tác chính trị tư tưởng; chỉ đạo toàn bộ hoạt động giám sát, ban hành nghị quyết phát triển của Hội đồng nhân dân xã.",
    phone: "0914.281.xxx",
    email: "nvhong@krongbong.daklak.gov.vn",
    room: "Phòng 201 - Tầng 2, Trụ sở UBND xã"
  },
  {
    name: "Trần Quốc Tuấn",
    role: "Phó Bí thư Đảng ủy - Chủ tịch UBND xã",
    responsibility: "Lãnh đạo, chỉ đạo toàn diện công tác quản lý điều hành hành chính nhà nước; trực tiếp chỉ đạo quy hoạch phát triển kinh tế, thu chi ngân sách, cải cách thủ tục hành chính.",
    phone: "0905.112.xxx",
    email: "tqtuan@krongbong.daklak.gov.vn",
    room: "Phòng 102 - Tầng 1, Trụ sở UBND xã"
  },
  {
    name: "H'Yen Knul",
    role: "Phó Chủ tịch UBND xã",
    responsibility: "Phụ trách khối Văn hóa - Xã hội, Y tế, Giáo dục; trực tiếp chỉ đạo thực hiện các chính sách an sinh xã hội, giảm nghèo bền vững và công tác dân tộc thiểu số địa bàn.",
    phone: "0983.475.xxx",
    email: "hyenknul@krongbong.daklak.gov.vn",
    room: "Phòng 104 - Tầng 1, Trụ sở UBND xã"
  }
];

const DEFAULT_LEADERS_EN = [
  {
    name: "Nguyen Van Hong",
    role: "Party Secretary - Chairman of People's Council",
    responsibility: "Responsible for the comprehensive leadership of Party affairs and political-ideological education; directs all inspection activities and issues development resolutions for the People's Council.",
    phone: "0914.281.xxx",
    email: "nvhong@krongbong.daklak.gov.vn",
    room: "Room 201 - 2nd Floor, Commune HQ"
  },
  {
    name: "Tran Quoc Tuan",
    role: "Deputy Party Secretary - Chairman of People's Committee",
    responsibility: "Leads and comprehensively directs the administrative management of local government; directly oversees economic development planning, budget revenues/expenditures, and administrative procedural reform.",
    phone: "0905.112.xxx",
    email: "tqtuan@krongbong.daklak.gov.vn",
    room: "Room 102 - 1st Floor, Commune HQ"
  },
  {
    name: "H'Yen Knul",
    role: "Vice Chairwoman of People's Committee",
    responsibility: "In charge of Culture - Social affairs, Healthcare, and Education; directly oversees social security policies, sustainable poverty reduction, and ethnic minority affairs in the area.",
    phone: "0983.475.xxx",
    email: "hyenknul@krongbong.daklak.gov.vn",
    room: "Room 104 - 1st Floor, Commune HQ"
  }
];

const DEFAULT_COMMUNE_ZONES_VI = [
  { id: "T1", name: "Thôn 1 (Khu vực phía Tây Bắc)", path: "M 10,10 L 45,10 L 40,40 L 10,35 Z", area: "125 ha", pop: "780 người", center: { x: 25, y: 22 } },
  { id: "T2", name: "Thôn 2 (Khu vực sông Krông Ana)", path: "M 45,10 L 85,15 L 75,45 L 40,40 Z", area: "240 ha", pop: "1,120 người", center: { x: 62, y: 26 } },
  { id: "T3", name: "Thôn 3 (Khu vực Trung tâm Hành chính)", path: "M 10,35 L 40,40 L 35,65 L 8,60 Z", area: "95 ha", pop: "950 người", center: { x: 23, y: 50 } },
  { id: "T4", name: "Thôn 4 (Khu quy hoạch cà phê)", path: "M 40,40 L 75,45 L 70,70 L 35,65 Z", area: "180 ha", pop: "840 người", center: { x: 55, y: 54 } },
  { id: "T5", name: "Thôn 5 (Khu vực lâm nghiệp)", path: "M 8,60 L 35,65 L 30,95 L 5,90 Z", area: "320 ha", pop: "650 người", center: { x: 19, y: 78 } },
  { id: "T6", name: "Thôn 6 (Khu vực Đền thờ - Núi Chư Yang Sin)", path: "M 35,65 L 70,70 L 65,95 L 30,95 Z", area: "450 ha", pop: "1,030 người", center: { x: 50, y: 80 } },
  { id: "BE", name: "Buôn Êga (Đồng bào Êđê sinh sống)", path: "M 75,15 L 98,18 L 92,55 L 75,45 Z", area: "580 ha", pop: "920 người", center: { x: 86, y: 32 } },
  { id: "BM", name: "Buôn Êđê (Khu bảo tồn văn hóa truyền thống)", path: "M 75,45 L 92,55 L 85,95 L 65,95 L 70,70 Z", area: "462 ha", pop: "572 người", center: { x: 78, y: 72 } }
];

const DEFAULT_COMMUNE_ZONES_EN = [
  { id: "T1", name: "Village 1 (Northwest area)", path: "M 10,10 L 45,10 L 40,40 L 10,35 Z", area: "125 ha", pop: "780 people", center: { x: 25, y: 22 } },
  { id: "T2", name: "Village 2 (Krong Ana river area)", path: "M 45,10 L 85,15 L 75,45 L 40,40 Z", area: "240 ha", pop: "1,120 people", center: { x: 62, y: 26 } },
  { id: "T3", name: "Village 3 (Administrative Center area)", path: "M 10,35 L 40,40 L 35,65 L 8,60 Z", area: "95 ha", pop: "950 people", center: { x: 23, y: 50 } },
  { id: "T4", name: "Village 4 (Coffee planning zone)", path: "M 40,40 L 75,45 L 70,70 L 35,65 Z", area: "180 ha", pop: "840 people", center: { x: 55, y: 54 } },
  { id: "T5", name: "Village 5 (Forestry zone)", path: "M 8,60 L 35,65 L 30,95 L 5,90 Z", area: "320 ha", pop: "650 people", center: { x: 19, y: 78 } },
  { id: "T6", name: "Village 6 (Temple - Chu Yang Sin mountain area)", path: "M 35,65 L 70,70 L 65,95 L 30,95 Z", area: "450 ha", pop: "1,030 people", center: { x: 50, y: 80 } },
  { id: "BE", name: "Buon Ega (Ede ethnic community)", path: "M 75,15 L 98,18 L 92,55 L 75,45 Z", area: "580 ha", pop: "920 people", center: { x: 86, y: 32 } },
  { id: "BM", name: "Buon Ede (Traditional cultural preservation zone)", path: "M 75,45 L 92,55 L 85,95 L 65,95 L 70,70 Z", area: "462 ha", pop: "572 people", center: { x: 78, y: 72 } }
];

export function PortalConfigClient() {
  const router = useRouter();
  const [logoUrl, setLogoUrl] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  const [themeLogo, setThemeLogo] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [languages, setLanguages] = useState<any[]>([]);
  const [activeLangTab, setActiveLangTab] = useState<string>("vi");
  const [activeConfigTab, setActiveConfigTab] = useState<string>("identity");
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);

  const [configTranslations, setConfigTranslations] = useState<Record<string, {
    unitName: string;
    unitTitle: string;
    unitIdentifier: string;
    responsiblePerson: string;
    citizenSchedule: string;
    licenseInfo: string;
    address: string;
    contactFormTitle: string;
    contactFormSuccessDesc: string;
    contactMapTitle: string;
    footerPortalTitle: string;
    footerPortalSubtitle: string;
    hotline: string;
    fax: string;
    email: string;
  }>>({});

  const [orgSections, setOrgSections] = useState<Record<string, any[]>>({
    vi: DEFAULT_ORG_SECTIONS_VI,
    en: DEFAULT_ORG_SECTIONS_EN
  });
  const [leaders, setLeaders] = useState<Record<string, any[]>>({
    vi: DEFAULT_LEADERS_VI,
    en: DEFAULT_LEADERS_EN
  });
  const [communeZones, setCommuneZones] = useState<Record<string, any[]>>({
    vi: DEFAULT_COMMUNE_ZONES_VI,
    en: DEFAULT_COMMUNE_ZONES_EN
  });

  const [useCustomAboutLayout, setUseCustomAboutLayout] = useState<boolean>(false);
  const [customAboutLayout, setCustomAboutLayout] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mapInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch registered active languages from Category module
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const res: any = await apiClient.get("/categories");
        const all = Array.isArray(res?.data) ? res.data : [];
        const langs = all.filter((c: any) => c.group === "LANGUAGE" && c.active === 1);
        setLanguages(langs.length > 0 ? langs : [{ code: "vi", name: "Tiếng Việt" }, { code: "en", name: "English" }]);
      } catch (error) {
        console.error("Error fetching languages", error);
        setLanguages([{ code: "vi", name: "Tiếng Việt" }, { code: "en", name: "English" }]);
      }
    };
    fetchLanguages();
  }, []);

  // 2. Fetch existing portal configurations
  const { data: dbCategories, isLoading, refetch } = useQuery({
    queryKey: ["portal-configs"],
    queryFn: async () => {
      try {
        const res: any = await apiClient.get("/portal-configs");
        return Array.isArray(res?.data) ? res.data : [];
      } catch (error) {
        console.error("Error fetching portal configs", error);
        return [];
      }
    }
  });

  // 3. Load existing configs and translation sets into state
  useEffect(() => {
    if (dbCategories && dbCategories.length > 0) {
      const nameCat: any = dbCategories.find((c: any) => c.code === "unit_name");
      const titleCat: any = dbCategories.find((c: any) => c.code === "unit_title");
      const identCat: any = dbCategories.find((c: any) => c.code === "unit_identifier");
      const hotlineCat: any = dbCategories.find((c: any) => c.code === "hotline");
      const respCat: any = dbCategories.find((c: any) => c.code === "responsible_person");
      const scheduleCat: any = dbCategories.find((c: any) => c.code === "citizen_schedule");
      const logoCat: any = dbCategories.find((c: any) => c.code === "logo_url");
      const mapCat: any = dbCategories.find((c: any) => c.code === "map_url");
      const licenseCat: any = dbCategories.find((c: any) => c.code === "license_info");
      const faxCat: any = dbCategories.find((c: any) => c.code === "fax");
      const emailCat: any = dbCategories.find((c: any) => c.code === "email");
      const addressCat: any = dbCategories.find((c: any) => c.code === "address");
      const contactFormTitleCat: any = dbCategories.find((c: any) => c.code === "contact_form_title");
      const contactFormSuccessDescCat: any = dbCategories.find((c: any) => c.code === "contact_form_success_desc");
      const contactMapTitleCat: any = dbCategories.find((c: any) => c.code === "contact_map_title");
      const footerPortalTitleCat: any = dbCategories.find((c: any) => c.code === "footer_portal_title");
      const footerPortalSubtitleCat: any = dbCategories.find((c: any) => c.code === "footer_portal_subtitle");

      // Extract logo from theme_appearance config if available
      const themeAppearanceCat: any = dbCategories.find((c: any) => c.code === "theme_appearance");
      if (themeAppearanceCat && themeAppearanceCat.description) {
        try {
          const parsed = JSON.parse(themeAppearanceCat.description);
          if (parsed?.branding?.logo) {
            setThemeLogo(parsed.branding.logo);
          }
        } catch (e) {
          console.error("Failed to parse theme appearance logo", e);
        }
      }

      // Set global fields
      if (logoCat) setLogoUrl(logoCat.name);
      if (mapCat) setMapUrl(mapCat.name);

      const activeLangs = languages.length > 0 ? languages.map(l => l.code) : ["vi", "en"];
      const newTranslations: typeof configTranslations = {};

      activeLangs.forEach(langCode => {
        newTranslations[langCode] = {
          unitName: "",
          unitTitle: "",
          unitIdentifier: "",
          responsiblePerson: "",
          citizenSchedule: "",
          licenseInfo: "",
          address: "",
          contactFormTitle: "",
          contactFormSuccessDesc: "",
          contactMapTitle: "",
          footerPortalTitle: "",
          footerPortalSubtitle: "",
          hotline: "",
          fax: "",
          email: "",
        };
      });

      const extractField = (cat: any, lang: string) => {
        if (!cat) return "";

        // Handle backwards compatibility for long plain text in citizen schedule
        if (cat.code === "citizen_schedule" && lang === "vi" && cat.description && !cat.description.trim().startsWith('{')) {
          return cat.description || cat.name || "";
        }

        // Check if there is valid JSON dictionary in description field
        if (cat.description && cat.description.trim().startsWith('{')) {
          try {
            const parsed = JSON.parse(cat.description);
            if (parsed && typeof parsed === 'object') {
              if (parsed[lang] !== undefined) {
                return parsed[lang];
              }
              if (parsed.translations && parsed.translations[lang] !== undefined) {
                return parsed.translations[lang];
              }
            }
          } catch (e) {
            console.error("Error parsing JSON description", e);
          }
        }

        // Return name field as primary language (vi) fallback
        if (lang === "vi") {
          return cat.name || "";
        }

        return "";
      };

      activeLangs.forEach(langCode => {
        newTranslations[langCode] = {
          unitName: extractField(nameCat, langCode),
          unitTitle: extractField(titleCat, langCode),
          unitIdentifier: extractField(identCat, langCode),
          responsiblePerson: extractField(respCat, langCode),
          citizenSchedule: extractField(scheduleCat, langCode),
          licenseInfo: extractField(licenseCat, langCode),
          address: extractField(addressCat, langCode),
          contactFormTitle: extractField(contactFormTitleCat, langCode),
          contactFormSuccessDesc: extractField(contactFormSuccessDescCat, langCode),
          contactMapTitle: extractField(contactMapTitleCat, langCode),
          footerPortalTitle: extractField(footerPortalTitleCat, langCode),
          footerPortalSubtitle: extractField(footerPortalSubtitleCat, langCode),
          hotline: extractField(hotlineCat, langCode),
          fax: extractField(faxCat, langCode),
          email: extractField(emailCat, langCode),
        };
      });

      setConfigTranslations(newTranslations);
    }
  }, [dbCategories, languages]);

  // helper to update active tab field translation state
  const updateTranslationField = (lang: string, field: string, value: string) => {
    setConfigTranslations((prev) => {
      const existingLang = prev[lang] || {
        unitName: "",
        unitTitle: "",
        unitIdentifier: "",
        responsiblePerson: "",
        citizenSchedule: "",
        licenseInfo: "",
        address: "",
        contactFormTitle: "",
        contactFormSuccessDesc: "",
        contactMapTitle: "",
        footerPortalTitle: "",
        footerPortalSubtitle: "",
        hotline: "",
        fax: "",
        email: "",
        aboutHistory: "",
        aboutArea: "",
        aboutPopulation: "",
        aboutSubdivisions: "",
        aboutStandard: "",
      };
      return {
        ...prev,
        [lang]: {
          ...existingLang,
          [field]: value
        }
      };
    });
  };

  // 4. Image Upload Hook integration
  const { isUploading, previewUrl, handleImageUpload, removeImage } = useImageUpload({
    onSuccess: (fileId) => {
      setLogoUrl(`/api/v1/admin/media/download/${fileId}`);
      toast.success("Tải logo thành công!");
    },
    onRemove: () => {
      setLogoUrl("");
    }
  });

  const {
    isUploading: isUploadingMap,
    previewUrl: previewMapUrl,
    handleImageUpload: handleMapUpload,
    removeImage: removeMapImage
  } = useImageUpload({
    onSuccess: (fileId) => {
      setMapUrl(`/api/v1/admin/media/download/${fileId}`);
      toast.success("Tải bản đồ hành chính thành công!");
    },
    onRemove: () => {
      setMapUrl("");
    }
  });

  // Dynamic active selection
  const activeLogo = previewUrl || themeLogo || logoUrl;
  const activeMap = previewMapUrl || mapUrl;

  const resolveLogoUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("/")) {
      return url;
    }
    return `/api/v1/admin/media/download/${url}`;
  };

  // 5. Save/Update Handler
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    try {
      const activeLangs = languages.length > 0 ? languages : [{ code: "vi", name: "Tiếng Việt" }, { code: "en", name: "English" }];

      const buildTranslationsJson = (fieldExtractor: (langCode: string) => string) => {
        const dict: Record<string, string> = {};
        activeLangs.forEach(l => {
          dict[l.code] = fieldExtractor(l.code) || "";
        });
        return JSON.stringify(dict);
      };

      const configItems = [
        {
          code: "unit_name",
          name: configTranslations["vi"]?.unitName || "UBND XÃ DANG KANG",
          description: buildTranslationsJson(lang => configTranslations[lang]?.unitName)
        },
        {
          code: "unit_title",
          name: configTranslations["vi"]?.unitTitle || "TRANG THÔNG TIN ĐIỆN TỬ",
          description: buildTranslationsJson(lang => configTranslations[lang]?.unitTitle)
        },
        {
          code: "unit_identifier",
          name: configTranslations["vi"]?.unitIdentifier || "TỈNH ĐẮK LẮK",
          description: buildTranslationsJson(lang => configTranslations[lang]?.unitIdentifier)
        },
        {
          code: "responsible_person",
          name: configTranslations["vi"]?.responsiblePerson || "Ông Trần Văn Minh - Chủ tịch UBND xã Dang Kang",
          description: buildTranslationsJson(lang => configTranslations[lang]?.responsiblePerson)
        },
        {
          code: "citizen_schedule",
          name: (configTranslations["vi"]?.citizenSchedule || "Thứ 5 hàng tuần • 08:00 - 11:30").slice(0, 255),
          description: buildTranslationsJson(lang => configTranslations[lang]?.citizenSchedule)
        },
        {
          code: "license_info",
          name: configTranslations["vi"]?.licenseInfo || "Giấy phép số: 45/GP-TTĐT do Sở Thông tin và Truyền thông tỉnh Đắk Lắk cấp",
          description: buildTranslationsJson(lang => configTranslations[lang]?.licenseInfo)
        },
        {
          code: "address",
          name: configTranslations["vi"]?.address || "Thôn 6, xã Dang Kang, huyện Krông Bông, tỉnh Đắk Lắk",
          description: buildTranslationsJson(lang => configTranslations[lang]?.address)
        },
        {
          code: "contact_form_title",
          name: configTranslations["vi"]?.contactFormTitle || "GỬI PHẢN ÁNH / GÓP Ý ĐẾN VĂN PHÒNG",
          description: buildTranslationsJson(lang => configTranslations[lang]?.contactFormTitle)
        },
        {
          code: "contact_form_success_desc",
          name: configTranslations["vi"]?.contactFormSuccessDesc || "Bộ phận văn thư xã Dang Kang đã nhận được thư góp ý của bạn và sẽ phản hồi sớm nhất có thể.",
          description: buildTranslationsJson(lang => configTranslations[lang]?.contactFormSuccessDesc)
        },
        {
          code: "contact_map_title",
          name: configTranslations["vi"]?.contactMapTitle || "BẢN ĐỒ PHÂN VÙNG HÀNH CHÍNH XÃ DANG KANG",
          description: buildTranslationsJson(lang => configTranslations[lang]?.contactMapTitle)
        },
        {
          code: "footer_portal_title",
          name: configTranslations["vi"]?.footerPortalTitle || "CỔNG DỊCH VỤ CÔNG TRỰC TUYẾN XÃ DANG KANG",
          description: buildTranslationsJson(lang => configTranslations[lang]?.footerPortalTitle)
        },
        {
          code: "footer_portal_subtitle",
          name: configTranslations["vi"]?.footerPortalSubtitle || "Tiếp nhận giải quyết thủ tục hành chính một cửa hiện đại, nhanh chóng",
          description: buildTranslationsJson(lang => configTranslations[lang]?.footerPortalSubtitle)
        },
        {
          code: "hotline",
          name: configTranslations["vi"]?.hotline || "0262.3812.345",
          description: buildTranslationsJson(lang => configTranslations[lang]?.hotline)
        },
        {
          code: "logo_url",
          name: logoUrl || "",
          description: "Đường dẫn ảnh logo cơ quan"
        },
        {
          code: "map_url",
          name: mapUrl || "",
          description: "Đường dẫn ảnh bản đồ hành chính đơn vị"
        },
        {
          code: "fax",
          name: configTranslations["vi"]?.fax || "0262.3812.346",
          description: buildTranslationsJson(lang => configTranslations[lang]?.fax)
        },
        {
          code: "email",
          name: configTranslations["vi"]?.email || "xadangkang@krongbong.daklak.gov.vn",
          description: buildTranslationsJson(lang => configTranslations[lang]?.email)
        }
      ];

      for (const item of configItems) {
        const existing = dbCategories?.find((c: any) => c.code === item.code);

        if (existing) {
          // UPDATE
          await apiClient.put(`/portal-configs/${existing.id}`, {
            code: item.code,
            name: item.name,
            description: item.description,
          });
        } else {
          // CREATE NEW
          await apiClient.post("/portal-configs", {
            code: item.code,
            name: item.name,
            description: item.description,
          });
        }
      }

      toast.success("Lưu cấu hình hệ thống thành công!");
      refetch();
    } catch (error) {
      console.error("Failed to save portal config", error);
      toast.error("Không thể lưu cấu hình hệ thống. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3 select-none">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-sm font-medium text-slate-500 animate-pulse">Đang tải dữ liệu cấu hình đơn vị...</p>
      </div>
    );
  }

  const activeLangs = languages.length > 0 ? languages : [{ code: "vi", name: "Tiếng Việt" }, { code: "en", name: "English" }];

  // -------------------------------------------------------------
  // REUSABLE CARD RENDERING FUNCTIONS (PREVENTS CODE DUPLICATION)
  // -------------------------------------------------------------
  const renderBrandingCard = (langCode: string, labelPrefix = "") => {
    const lang = activeLangs.find(l => l.code === langCode) || { code: langCode, name: langCode === 'vi' ? 'Tiếng Việt' : 'English' };
    const trans = configTranslations[langCode] || {
      unitName: "",
      unitTitle: "",
      unitIdentifier: "",
      responsiblePerson: ""
    };

    return (
      <Card className={`border border-slate-150 shadow-sm rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md ${langCode === 'vi' && isCompareMode ? 'bg-slate-50/50 border-r-2 border-r-indigo-500' : ''}`}>
        <CardHeader className="bg-slate-50/50 border-b py-4 px-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-600" />
              <CardTitle className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Nhận diện & Bản quyền Đơn vị (2 Cấp)
              </CardTitle>
            </div>
            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${langCode === 'vi' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
              {lang.name} {labelPrefix}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
              Tên đơn vị cấp Xã (Đơn vị trực tiếp)
            </Label>
            <Input
              placeholder={langCode === 'vi' ? "Ví dụ: UBND XÃ DANG KANG" : "Enter commune agency name..."}
              className="rounded-lg border-slate-250 focus:border-indigo-500 focus:ring-indigo-500/20 text-xs font-semibold"
              value={trans.unitName || ""}
              onChange={(e) => updateTranslationField(langCode, "unitName", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
              Đơn vị quản lý cấp Huyện (Quản lý cấp trên)
            </Label>
            <Input
              placeholder={langCode === 'vi' ? "Ví dụ: HUYỆN KRÔNG BÔNG - TỈNH ĐẮK LẮK" : "Enter supervising district..."}
              className="rounded-lg border-slate-250 focus:border-indigo-500 focus:ring-indigo-500/20 text-xs font-semibold"
              value={trans.unitIdentifier || ""}
              onChange={(e) => updateTranslationField(langCode, "unitIdentifier", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
              Tiêu đề phụ của Cổng (Hàng trên cùng banner)
            </Label>
            <Input
              placeholder={langCode === 'vi' ? "Ví dụ: TRANG THÔNG TIN ĐIỆN TỬ" : "Enter portal top subtitle..."}
              className="rounded-lg border-slate-250 focus:border-indigo-500 focus:ring-indigo-500/20 text-xs font-semibold"
              value={trans.unitTitle || ""}
              onChange={(e) => updateTranslationField(langCode, "unitTitle", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
              Người chịu trách nhiệm nội dung (Chân trang)
            </Label>
            <Input
              placeholder={langCode === 'vi' ? "Ví dụ: Ông Trần Văn Minh - Chủ tịch UBND xã Dang Kang" : "Enter editor-in-chief name..."}
              className="rounded-lg border-slate-250 focus:border-indigo-500 focus:ring-indigo-500/20 text-xs font-semibold"
              value={trans.responsiblePerson || ""}
              onChange={(e) => updateTranslationField(langCode, "responsiblePerson", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderScheduleCard = (langCode: string, labelPrefix = "") => {
    const lang = activeLangs.find(l => l.code === langCode) || { code: langCode, name: langCode === 'vi' ? 'Tiếng Việt' : 'English' };
    const trans = configTranslations[langCode] || { citizenSchedule: "" };

    return (
      <Card className={`border border-slate-150 shadow-sm rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md ${langCode === 'vi' && isCompareMode ? 'bg-slate-50/50 border-r-2 border-r-indigo-500' : ''}`}>
        <CardHeader className="bg-slate-50/50 border-b py-4 px-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <CardTitle className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Lịch tiếp công dân định kỳ
              </CardTitle>
            </div>
            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${langCode === 'vi' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
              {lang.name} {labelPrefix}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
              Nội dung chi tiết thời gian tiếp công dân
            </Label>
            <Textarea
              rows={4}
              placeholder={langCode === 'vi' ? "Ví dụ: Thứ 5 hàng tuần • 08:00 - 11:30" : "Enter reception hours description..."}
              className="rounded-lg border-slate-250 focus:border-indigo-500 focus:ring-indigo-500/20 text-xs font-semibold leading-relaxed"
              value={trans.citizenSchedule || ""}
              onChange={(e) => updateTranslationField(langCode, "citizenSchedule", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderAddressLicenseCard = (langCode: string, labelPrefix = "") => {
    const lang = activeLangs.find(l => l.code === langCode) || { code: langCode, name: langCode === 'vi' ? 'Tiếng Việt' : 'English' };
    const trans = configTranslations[langCode] || { address: "", licenseInfo: "" };

    return (
      <Card className={`border border-slate-150 shadow-sm rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md ${langCode === 'vi' && isCompareMode ? 'bg-slate-50/50 border-r-2 border-r-indigo-500' : ''}`}>
        <CardHeader className="bg-slate-50/50 border-b py-4 px-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <CardTitle className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Địa chỉ & Giấy phép hoạt động
              </CardTitle>
            </div>
            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${langCode === 'vi' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
              {lang.name} {labelPrefix}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
              Địa chỉ trụ sở chính cơ quan
            </Label>
            <Input
              placeholder={langCode === 'vi' ? "Ví dụ: Thôn 6, xã Dang Kang, huyện Krông Bông, tỉnh Đắk Lắk" : "Enter office address..."}
              className="rounded-lg border-slate-250 focus:border-indigo-500 focus:ring-indigo-500/20 text-xs font-semibold"
              value={trans.address || ""}
              onChange={(e) => updateTranslationField(langCode, "address", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
              Thông tin Giấy phép hoạt động
            </Label>
            <Textarea
              rows={3}
              placeholder={langCode === 'vi' ? "Ví dụ: Giấy phép số: 45/GP-TTĐT do Sở..." : "Enter operating license info..."}
              className="rounded-lg border-slate-250 focus:border-indigo-500 focus:ring-indigo-500/20 text-xs font-semibold leading-relaxed"
              value={trans.licenseInfo || ""}
              onChange={(e) => updateTranslationField(langCode, "licenseInfo", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderCustomLabelsCard = (langCode: string, labelPrefix = "") => {
    const lang = activeLangs.find(l => l.code === langCode) || { code: langCode, name: langCode === 'vi' ? 'Tiếng Việt' : 'English' };
    const trans = configTranslations[langCode] || {
      footerPortalTitle: "",
      footerPortalSubtitle: "",
      contactFormTitle: "",
      contactMapTitle: "",
      contactFormSuccessDesc: ""
    };

    return (
      <Card className={`border border-slate-150 shadow-sm rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md ${langCode === 'vi' && isCompareMode ? 'bg-slate-50/50 border-r-2 border-r-indigo-500' : ''}`}>
        <CardHeader className="bg-slate-50/50 border-b py-4 px-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <CardTitle className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Các tiêu đề và Nhãn hiển thị phụ
              </CardTitle>
            </div>
            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${langCode === 'vi' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
              {lang.name} {labelPrefix}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
                Tiêu đề Cổng Dịch vụ công (Footer)
              </Label>
              <Input
                placeholder={langCode === 'vi' ? "Ví dụ: CỔNG DỊCH VỤ CÔNG TRỰC TUYẾN" : "Enter DVC portal title..."}
                className="rounded-lg border-slate-250 focus:border-indigo-500 focus:ring-indigo-500/20 text-xs font-semibold"
                value={trans.footerPortalTitle || ""}
                onChange={(e) => updateTranslationField(langCode, "footerPortalTitle", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
                Mô tả phụ Cổng Dịch vụ công (Footer)
              </Label>
              <Input
                placeholder={langCode === 'vi' ? "Ví dụ: Tiếp nhận giải quyết TTHC..." : "Enter DVC subtitle..."}
                className="rounded-lg border-slate-250 focus:border-indigo-500 focus:ring-indigo-500/20 text-xs font-semibold"
                value={trans.footerPortalSubtitle || ""}
                onChange={(e) => updateTranslationField(langCode, "footerPortalSubtitle", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
                Tiêu đề Biểu mẫu (Trang liên hệ)
              </Label>
              <Input
                placeholder={langCode === 'vi' ? "Ví dụ: GỬI PHẢN ÁNH / GÓP Ý" : "Enter feedback form title..."}
                className="rounded-lg border-slate-250 focus:border-indigo-500 focus:ring-indigo-500/20 text-xs font-semibold"
                value={trans.contactFormTitle || ""}
                onChange={(e) => updateTranslationField(langCode, "contactFormTitle", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
                Tiêu đề Bản đồ (Trang liên hệ)
              </Label>
              <Input
                placeholder={langCode === 'vi' ? "Ví dụ: BẢN ĐỒ HÀNH CHÍNH" : "Enter map title..."}
                className="rounded-lg border-slate-250 focus:border-indigo-500 focus:ring-indigo-500/20 text-xs font-semibold"
                value={trans.contactMapTitle || ""}
                onChange={(e) => updateTranslationField(langCode, "contactMapTitle", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
              Thông điệp gửi thành công (Trang liên hệ)
            </Label>
            <Textarea
              rows={2}
              placeholder={langCode === 'vi' ? "Ví dụ: Cảm ơn bạn đã gửi đóng góp ý kiến..." : "Enter success message..."}
              className="rounded-lg border-slate-250 focus:border-indigo-500 focus:ring-indigo-500/20 text-xs font-semibold leading-relaxed"
              value={trans.contactFormSuccessDesc || ""}
              onChange={(e) => updateTranslationField(langCode, "contactFormSuccessDesc", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderContactDetailsCard = (langCode: string, labelPrefix = "") => {
    const lang = activeLangs.find(l => l.code === langCode) || { code: langCode, name: langCode === 'vi' ? 'Tiếng Việt' : 'English' };
    const trans = configTranslations[langCode] || {
      hotline: "",
      fax: "",
      email: ""
    };

    return (
      <Card className={`border border-slate-150 shadow-sm rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md ${langCode === 'vi' && isCompareMode ? 'bg-slate-50/50 border-r-2 border-r-indigo-500' : ''}`}>
        <CardHeader className="bg-slate-50/50 border-b py-4 px-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-indigo-600" />
              <CardTitle className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Thông tin Liên hệ (Đường dây nóng, Fax, Email)
              </CardTitle>
            </div>
            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${langCode === 'vi' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
              {lang.name} {labelPrefix}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
              Đường dây nóng (Hotline) - Nhập đầy đủ nội dung hiển thị
            </Label>
            <Input
              placeholder={langCode === 'vi' ? "Ví dụ: Điện thoại: 0262.3812.345" : "e.g., Hotline: 0262.3812.345"}
              className="rounded-lg border-slate-250 focus:border-indigo-500 focus:ring-indigo-500/20 text-xs font-semibold"
              value={trans.hotline || ""}
              onChange={(e) => updateTranslationField(langCode, "hotline", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
                Số Fax - Nhập đầy đủ nội dung hiển thị
              </Label>
              <Input
                placeholder={langCode === 'vi' ? "Ví dụ: Fax: 0262.3812.346" : "e.g., Fax: 0262.3812.346"}
                className="rounded-lg border-slate-250 focus:border-indigo-500 focus:ring-indigo-500/20 text-xs font-semibold"
                value={trans.fax || ""}
                onChange={(e) => updateTranslationField(langCode, "fax", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
                Địa chỉ Thư điện tử (Email) - Nhập đầy đủ nội dung hiển thị
              </Label>
              <Input
                placeholder={langCode === 'vi' ? "Ví dụ: Email: xadangkang@krongbong.daklak.gov.vn" : "e.g., Email: xadangkang@krongbong.daklak.gov.vn"}
                className="rounded-lg border-slate-250 focus:border-indigo-500 focus:ring-indigo-500/20 text-xs font-semibold"
                value={trans.email || ""}
                onChange={(e) => updateTranslationField(langCode, "email", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };











  // Simulator Localized values
  const simName = configTranslations[activeLangTab]?.unitName || "UBND XÃ DANG KANG";
  const simTitle = configTranslations[activeLangTab]?.unitTitle || "TRANG THÔNG TIN ĐIỆN TỬ";
  const simIdentifier = configTranslations[activeLangTab]?.unitIdentifier || "HUYỆN KRÔNG BÔNG - TỈNH ĐẮK LẮK";
  const simSchedule = configTranslations[activeLangTab]?.citizenSchedule || "Thứ 5 hàng tuần • 08:00 - 11:30";
  const simLicense = configTranslations[activeLangTab]?.licenseInfo || "Giấy phép số: 45/GP-TTĐT do Sở Thông tin và Truyền thông tỉnh Đắk Lắk cấp";
  const simResponsible = configTranslations[activeLangTab]?.responsiblePerson || "Ông Trần Văn Minh - Chủ tịch UBND xã Dang Kang";
  const simAddress = configTranslations[activeLangTab]?.address || "Địa chỉ: Thôn 6, xã Dang Kang, huyện Krông Bông, tỉnh Đắk Lắk";
  const simContactFormTitle = configTranslations[activeLangTab]?.contactFormTitle || "GỬI PHẢN ÁNH / GÓP Ý ĐẾN VĂN PHÒNG";
  const simContactFormSuccessDesc = configTranslations[activeLangTab]?.contactFormSuccessDesc || "Bộ phận văn thư xã Dang Kang đã nhận được thư góp ý của bạn và sẽ phản hồi sớm nhất có thể.";
  const simContactMapTitle = configTranslations[activeLangTab]?.contactMapTitle || "BẢN ĐỒ PHÂN VÙNG HÀNH CHÍNH XÃ DANG KANG";
  const simFooterPortalTitle = configTranslations[activeLangTab]?.footerPortalTitle || "CỔNG DỊCH VỤ CÔNG TRỰC TUYẾN XÃ DANG KANG";
  const simFooterPortalSubtitle = configTranslations[activeLangTab]?.footerPortalSubtitle || "Tiếp nhận giải quyết thủ tục hành chính một cửa hiện đại, nhanh chóng";
  const simHotline = configTranslations[activeLangTab]?.hotline || "Đường dây nóng: 0262.3812.345";
  const simFax = configTranslations[activeLangTab]?.fax || "Fax: 0262.3812.346";
  const simEmail = configTranslations[activeLangTab]?.email || "Email: xadangkang@krongbong.daklak.gov.vn";

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 select-none animate-fade-in">
      {/* GLOBAL SUB-NAVIGATION */}
      <PortalSubNav />
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-md shadow-indigo-500/20">
              <Settings className="w-5 h-5 animate-spin-slow" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-transparent">
              Cấu hình chung đơn vị & Portal
            </h1>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            Quản lý thông tin nhận diện cơ quan, bản quyền, đường dây nóng, trang giới thiệu, cơ cấu tổ chức và sơ đồ ranh giới rập khuôn đa ngôn ngữ.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => handleSave()}
          disabled={isSaving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Lưu cấu hình
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* LEFT COLUMN: EDITOR FORM */}
        <div className="lg:col-span-2 space-y-6">
          {/* EDITOR VIEW MODE CONTROLLER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 border border-slate-150 p-3 rounded-xl shadow-sm">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-indigo-600 animate-pulse" />
              <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Ngôn ngữ soạn thảo:
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Tabs
                value={activeLangTab}
                onValueChange={(val) => {
                  setActiveLangTab(val);
                }}
                className="w-auto"
              >
                <TabsList className="bg-slate-200/60 p-0.5 flex gap-0.5 rounded-lg border border-slate-200/50">
                  {activeLangs.map((lang) => (
                    <TabsTrigger
                      key={lang.code}
                      value={lang.code}
                      disabled={isCompareMode}
                      className="px-3 py-1.5 font-extrabold uppercase text-[10px] rounded-md transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm disabled:opacity-50"
                    >
                      {lang.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              <Button
                type="button"
                variant={isCompareMode ? "default" : "outline"}
                size="sm"
                onClick={() => setIsCompareMode(!isCompareMode)}
                className={`rounded-lg text-xs font-bold uppercase py-1.5 px-3 flex items-center gap-1.5 transition-all ${isCompareMode
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20"
                  : "border-slate-250 text-slate-600 hover:bg-slate-100"
                  }`}
              >
                <Columns className="w-3.5 h-3.5" />
                {isCompareMode ? "Tắt dịch song song" : "Dịch song song (VI / EN)"}
              </Button>
            </div>
          </div>

          {/* CONFIGURATION SECTIONS TABS */}
          <div className="flex border-b border-slate-200 gap-1.5 overflow-x-auto pb-px">
            {[
              { id: "identity", label: "Cấu hình đơn vị", icon: Building },
              { id: "contact", label: "Thông tin liên hệ", icon: Phone }
            ].map(tab => {
              const TabIcon = tab.icon;
              const isActive = activeConfigTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveConfigTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all shrink-0 select-none ${
                    isActive
                      ? "border-indigo-600 text-indigo-600 font-extrabold"
                      : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-350"
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: CẤU HÌNH ĐƠN VỊ & LỊCH TIẾP DÂN */}
          {activeConfigTab === "identity" && (
            <div className="space-y-6 animate-fade-in">
              {isCompareMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderBrandingCard("vi", "(Bản gốc)")}
                  {renderBrandingCard("en", "(Bản dịch)")}
                </div>
              ) : (
                renderBrandingCard(activeLangTab)
              )}

              {isCompareMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderScheduleCard("vi", "(Bản gốc)")}
                  {renderScheduleCard("en", "(Bản dịch)")}
                </div>
              ) : (
                renderScheduleCard(activeLangTab)
              )}
            </div>
          )}

          {/* TAB 2: THÔNG TIN LIÊN HỆ & MẠNG XÃ HỘI */}
          {activeConfigTab === "contact" && (
            <div className="space-y-6 animate-fade-in">
              {isCompareMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderAddressLicenseCard("vi", "(Bản gốc)")}
                  {renderAddressLicenseCard("en", "(Bản dịch)")}
                </div>
              ) : (
                renderAddressLicenseCard(activeLangTab)
              )}

              {isCompareMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderCustomLabelsCard("vi", "(Bản gốc)")}
                  {renderCustomLabelsCard("en", "(Bản dịch)")}
                </div>
              ) : (
                renderCustomLabelsCard(activeLangTab)
              )}

              {isCompareMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderContactDetailsCard("vi", "(Bản gốc)")}
                  {renderContactDetailsCard("en", "(Bản dịch)")}
                </div>
              ) : (
                renderContactDetailsCard(activeLangTab)
              )}

              {/* Standalone Map Upload Card */}
              <Card className="border border-slate-150 shadow-sm rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md">
                <CardHeader className="bg-slate-50/50 border-b py-4 px-5">
                  <div className="flex items-center gap-2">
                    <MapIcon className="w-4 h-4 text-indigo-650" />
                    <CardTitle className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Bản đồ Hành chính Đơn vị
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
                      Hình ảnh Bản đồ hành chính
                    </Label>
                    
                    <div className="flex items-start gap-4">
                      <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col items-center justify-center text-center shrink-0 w-44 h-28 relative overflow-hidden group">
                        {activeMap ? (
                          <>
                            <img
                              src={resolveLogoUrl(activeMap)}
                              alt="Administrative Map"
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => removeMapImage()}
                                className="p-1.5 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors"
                              >
                                <X className="w-4.5 h-4.5" />
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-1.5 text-slate-400">
                            {isUploadingMap ? (
                              <Loader2 className="w-6 h-6 animate-spin text-indigo-650" />
                            ) : (
                              <UploadCloud className="w-6 h-6 text-slate-400" />
                            )}
                            <span className="text-[9px] font-bold uppercase tracking-wider">Chưa có ảnh</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 flex-1 pt-1">
                        <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                          Tải lên hình ảnh ranh giới phân vùng hành chính hoặc bản đồ địa giới của đơn vị. Hình ảnh này sẽ hiển thị trực quan trên Trang Liên hệ ở Cổng Dân Cư.
                        </p>
                        <input
                          type="file"
                          ref={mapInputRef}
                          onChange={handleMapUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isUploadingMap}
                            onClick={() => mapInputRef.current?.click()}
                            className="text-[10px] font-black uppercase tracking-wider border-slate-250 rounded-lg hover:bg-slate-50 h-8"
                          >
                            Tải ảnh lên
                          </Button>
                          {activeMap && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeMapImage()}
                              className="text-[10px] font-black uppercase tracking-wider rounded-lg h-8"
                            >
                              Xóa ảnh
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: SHORTCUTS & LIVE PORTAL PREVIEW */}
        <div className="space-y-8">
          {/* STYLE & LAYOUT SHORTCUTS CARD */}
          <Card className="border border-indigo-150 shadow-sm rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md bg-gradient-to-br from-indigo-50/10 to-slate-50/30">
            <CardHeader className="bg-slate-50/50 border-b py-4 px-5">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                <CardTitle className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Phím tắt Thiết kế & Bố cục
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                Tài nguyên thương hiệu (Logo, Favicon), màu sắc, phông chữ và cách thiết kế trang giới thiệu đã được đồng bộ hóa quy hoạch sang các phân hệ chuyên dụng dưới đây:
              </p>

              {/* Shortcut 1: Giao diện */}
              <div className="group relative border border-slate-150 rounded-xl p-4 bg-white hover:border-indigo-300 hover:shadow-sm transition-all duration-300">
                <div className="flex gap-3">
                  <div className="p-2 bg-rose-500/10 rounded-lg text-rose-600 group-hover:scale-105 transition-transform duration-300 shrink-0 h-9 w-9 flex items-center justify-center">
                    <Palette className="w-4.5 h-4.5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wide">
                      Quản trị Giao diện (Appearance)
                    </h4>
                    <p className="text-[10px] text-slate-400 font-semibold leading-normal">
                      Cấu hình màu sắc, phông chữ, bo góc, tải lên Logo nhận diện và Favicon của đơn vị.
                    </p>
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => router.push("/services/posts/appearance")}
                      className="p-0 text-indigo-600 hover:text-indigo-800 font-extrabold text-[10px] h-auto mt-1 flex items-center gap-1"
                    >
                      Đi tới Quản lý Giao diện &rarr;
                    </Button>
                  </div>
                </div>
              </div>

              {/* Shortcut 2: Page Builder */}
              <div className="group relative border border-slate-150 rounded-xl p-4 bg-white hover:border-indigo-300 hover:shadow-sm transition-all duration-300">
                <div className="flex gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600 group-hover:scale-105 transition-transform duration-300 shrink-0 h-9 w-9 flex items-center justify-center">
                    <Layout className="w-4.5 h-4.5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wide">
                      Trình tạo Trang trực quan (Page Builder)
                    </h4>
                    <p className="text-[10px] text-slate-400 font-semibold leading-normal">
                      Thiết kế sinh động bố cục trang giới thiệu (/gioi-thieu), trang chủ và liên hệ hành chính.
                    </p>
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => router.push("/services/posts/portal-page-builder")}
                      className="p-0 text-indigo-600 hover:text-indigo-800 font-extrabold text-[10px] h-auto mt-1 flex items-center gap-1"
                    >
                      Mở Trình tạo Trang trực quan &rarr;
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* LIVE SIMULATOR PREVIEW */}
          <Card className="border border-emerald-150 bg-emerald-50/5 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-emerald-50/20 border-b border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-600" />
                <CardTitle className="text-xs font-black text-emerald-800 uppercase tracking-wider">
                  Mô phỏng hiển thị Portal
                </CardTitle>
              </div>
              <Tabs value={activeLangTab} onValueChange={setActiveLangTab} className="w-auto">
                <TabsList className="bg-emerald-100/50 p-0.5 flex gap-0.5 rounded-lg border border-emerald-100">
                  {activeLangs.map(lang => (
                    <TabsTrigger
                      key={lang.code}
                      value={lang.code}
                      className="px-2 py-1 font-extrabold uppercase text-[9px] rounded-md transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
                    >
                      {lang.code.toUpperCase()}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-left">
              {/* Header simulator */}
              <div className="bg-amber-50/30 border border-amber-100 rounded-lg p-3 shadow-inner space-y-2">
                <span className="text-[8px] font-black text-amber-800 uppercase tracking-widest leading-none block border-b pb-1 border-amber-100/50">Mô phỏng Đỉnh Trang (Header)</span>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-white border flex items-center justify-center p-1 shadow-sm flex-shrink-0">
                    {activeLogo ? (
                      <img src={activeLogo} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-[8px] font-black text-slate-400">LOGO</span>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[8px] font-serif font-black tracking-widest text-[#0056b3] uppercase leading-none">
                      {simTitle || "TRANG THÔNG TIN ĐIỆN TỬ"}
                    </span>
                    <h2 className="text-[11px] font-serif font-black text-[#cc0000] uppercase tracking-wide leading-tight mt-0.5 truncate">
                      {simName || "UBND XÃ DANG KANG"}
                    </h2>
                    <span className="text-blue-800 text-[6px] font-serif font-bold tracking-wider leading-none uppercase mt-0.5">
                      {simIdentifier || "HUYỆN KRÔNG BÔNG - TỈNH ĐẮK LẮK"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reception simulation */}
              <div className="bg-indigo-50/20 border border-indigo-100 rounded-lg p-3 shadow-inner space-y-2">
                <span className="text-[8px] font-black text-indigo-800 uppercase tracking-widest leading-none block border-b pb-1 border-indigo-150">Lịch Tiếp Công Dân (Widget)</span>
                <div className="flex items-center gap-2 text-[11px]">
                  <div className="w-6 h-6 rounded bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[8px] font-bold text-indigo-700 uppercase tracking-wider">LỊCH TIẾP CÔNG DÂN</span>
                    <span className="text-[10px] font-semibold text-slate-700 mt-0.5 whitespace-pre-wrap leading-relaxed">
                      {simSchedule || "Thứ 5 hàng tuần • 08:00 - 11:30"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Portal Service Title Simulation */}
              <div className="bg-emerald-50/30 border border-emerald-100 rounded-lg p-3 shadow-inner space-y-2">
                <span className="text-[8px] font-black text-emerald-800 uppercase tracking-widest leading-none block border-b pb-1 border-emerald-150">Dịch vụ công trực tuyến (Footer Portal Widget)</span>
                <div className="space-y-0.5">
                  <h4 className="text-[9px] font-extrabold text-emerald-800 uppercase tracking-wide leading-tight">
                    {simFooterPortalTitle}
                  </h4>
                  <p className="text-[8px] font-medium text-slate-600 leading-normal">
                    {simFooterPortalSubtitle}
                  </p>
                </div>
              </div>

              {/* Dynamic Contact Labels Simulation */}
              <div className="bg-sky-50/20 border border-sky-100 rounded-lg p-3 shadow-inner space-y-1.5">
                <span className="text-[8px] font-black text-sky-800 uppercase tracking-widest leading-none block border-b pb-1 border-sky-150">Góp ý & Bản đồ (Contact Page Labels)</span>
                <p className="text-[8px] font-bold text-sky-900 uppercase tracking-wide leading-tight">
                  Form: {simContactFormTitle}
                </p>
                <p className="text-[8px] font-medium text-slate-500 leading-tight">
                  Map: {simContactMapTitle}
                </p>
                <p className="text-[7.5px] italic text-slate-400 leading-normal border-t pt-1 border-slate-100">
                  Thành công: "{simContactFormSuccessDesc}"
                </p>
              </div>

              {/* License/Footer simulator */}
              <div className="bg-slate-900 text-slate-300 rounded-lg p-3 space-y-1.5 text-[8px] shadow-md">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none block border-b pb-1 border-slate-800">Mô phỏng Chân Trang (Footer)</span>
                <p className="font-extrabold text-white text-[9px] uppercase">{simName || "UBND XÃ DANG KANG"}</p>
                <p className="text-[#fef08a] font-bold text-[8px] uppercase tracking-wide">{simIdentifier || "HUYỆN KRÔNG BÔNG - TỈNH ĐẮK LẮK"}</p>
                <p className="text-slate-400 leading-normal">
                  {simLicense || "Giấy phép số: 45/GP-TTĐT do Sở Thông tin và Truyền thông tỉnh Đắk Lắk cấp"}. Chịu trách nhiệm nội dung: {simResponsible || "Ông Trần Văn Minh - Chủ tịch UBND xã Dang Kang"}.
                </p>
                <div className="text-slate-400 space-y-0.5 pt-1 border-t border-slate-800 font-medium">
                  <p>{simAddress}</p>
                  <p>
                    <span className="text-amber-300 font-mono font-bold">{simHotline}</span>
                    {simFax && ` | `}
                    <span className="font-mono">{simFax}</span>
                  </p>
                  <p className="text-sky-300">{simEmail}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
