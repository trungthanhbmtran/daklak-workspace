"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Layout
} from "lucide-react";
import apiClient from "@/lib/axiosInstance";
import { PageBuilder } from "./PageBuilder";

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

export default function PortalConfigPage() {
  const [logoUrl, setLogoUrl] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [languages, setLanguages] = useState<any[]>([]);
  const [activeLangTab, setActiveLangTab] = useState<string>("vi");
  const [activeConfigTab, setActiveConfigTab] = useState<string>("general");
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
    aboutHistory: string;
    aboutArea: string;
    aboutPopulation: string;
    aboutSubdivisions: string;
    aboutStandard: string;
  }>>({});

  // States cho các danh sách cấu hình động phức tạp
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

      // Các chỉ số giới thiệu mới
      const aboutHistoryCat: any = dbCategories.find((c: any) => c.code === "about_history");
      const aboutAreaCat: any = dbCategories.find((c: any) => c.code === "about_area");
      const aboutPopulationCat: any = dbCategories.find((c: any) => c.code === "about_population");
      const aboutSubdivisionsCat: any = dbCategories.find((c: any) => c.code === "about_subdivisions");
      const aboutStandardCat: any = dbCategories.find((c: any) => c.code === "about_standard");

      // Cấu hình danh sách mảng
      const orgSectionsCat: any = dbCategories.find((c: any) => c.code === "about_org_sections");
      const leadersCat: any = dbCategories.find((c: any) => c.code === "about_leaders");
      const communeZonesCat: any = dbCategories.find((c: any) => c.code === "commune_zones");
      const useCustomAboutLayoutCat: any = dbCategories.find((c: any) => c.code === "use_custom_about_layout");
      const customAboutLayoutCat: any = dbCategories.find((c: any) => c.code === "custom_about_layout");

      // Set global fields
      if (logoCat) setLogoUrl(logoCat.name);
      if (mapCat) setMapUrl(mapCat.name);

      if (useCustomAboutLayoutCat) {
        setUseCustomAboutLayout(useCustomAboutLayoutCat.name === "true");
      } else {
        setUseCustomAboutLayout(false);
      }

      if (customAboutLayoutCat && customAboutLayoutCat.description) {
        try {
          setCustomAboutLayout(JSON.parse(customAboutLayoutCat.description));
        } catch (e) {
          console.error("Failed to parse custom page layout", e);
          setCustomAboutLayout([]);
        }
      } else {
        setCustomAboutLayout([]);
      }

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
          aboutHistory: "",
          aboutArea: "",
          aboutPopulation: "",
          aboutSubdivisions: "",
          aboutStandard: "",
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
          // Chỉ số mới
          aboutHistory: extractField(aboutHistoryCat, langCode),
          aboutArea: extractField(aboutAreaCat, langCode),
          aboutPopulation: extractField(aboutPopulationCat, langCode),
          aboutSubdivisions: extractField(aboutSubdivisionsCat, langCode),
          aboutStandard: extractField(aboutStandardCat, langCode),
        };
      });

      setConfigTranslations(newTranslations);

      // Giải mã cấu hình danh sách dạng array
      const parseListField = (cat: any, fallback: Record<string, any[]>) => {
        if (!cat || !cat.description) return fallback;
        try {
          const parsed = JSON.parse(cat.description);
          const result: Record<string, any[]> = { ...fallback };
          activeLangs.forEach(langCode => {
            const val = parsed[langCode];
            if (val) {
              if (typeof val === 'string') {
                try {
                  result[langCode] = JSON.parse(val);
                } catch (e) {
                  console.error("Failed to parse inner JSON list", e);
                }
              } else if (Array.isArray(val)) {
                result[langCode] = val;
              }
            }
          });
          return result;
        } catch (e) {
          console.error("Failed to parse list config", e);
          return fallback;
        }
      };

      setOrgSections(parseListField(orgSectionsCat, { vi: DEFAULT_ORG_SECTIONS_VI, en: DEFAULT_ORG_SECTIONS_EN }));
      setLeaders(parseListField(leadersCat, { vi: DEFAULT_LEADERS_VI, en: DEFAULT_LEADERS_EN }));
      setCommuneZones(parseListField(communeZonesCat, { vi: DEFAULT_COMMUNE_ZONES_VI, en: DEFAULT_COMMUNE_ZONES_EN }));
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
  const activeLogo = previewUrl || logoUrl;
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
        },
        // Mới: Vị trí địa lý & Thống kê
        {
          code: "about_history",
          name: "Vị trí địa lý và Lịch sử xã",
          description: buildTranslationsJson(lang => configTranslations[lang]?.aboutHistory)
        },
        {
          code: "about_area",
          name: "Chỉ số: Diện tích tự nhiên",
          description: buildTranslationsJson(lang => configTranslations[lang]?.aboutArea)
        },
        {
          code: "about_population",
          name: "Chỉ số: Dân số hiện tại",
          description: buildTranslationsJson(lang => configTranslations[lang]?.aboutPopulation)
        },
        {
          code: "about_subdivisions",
          name: "Chỉ số: Đơn vị hành chính",
          description: buildTranslationsJson(lang => configTranslations[lang]?.aboutSubdivisions)
        },
        {
          code: "about_standard",
          name: "Chỉ số: Chuẩn nông thôn mới",
          description: buildTranslationsJson(lang => configTranslations[lang]?.aboutStandard)
        },
        // Mới: Mảng danh sách cấu trúc phức tạp
        {
          code: "about_org_sections",
          name: "Sơ đồ bộ máy hành chính xã",
          description: buildTranslationsJson(lang => JSON.stringify(orgSections[lang] || []))
        },
        {
          code: "about_leaders",
          name: "Thông tin Lãnh đạo chủ chốt xã",
          description: buildTranslationsJson(lang => JSON.stringify(leaders[lang] || []))
        },
        {
          code: "commune_zones",
          name: "Bản đồ phân vùng 8 thôn buôn xã Dang Kang",
          description: buildTranslationsJson(lang => JSON.stringify(communeZones[lang] || []))
        },
        {
          code: "use_custom_about_layout",
          name: useCustomAboutLayout ? "true" : "false",
          description: "Sử dụng thiết kế trang giới thiệu trực quan"
        },
        {
          code: "custom_about_layout",
          name: "Cấu trúc layout trang giới thiệu thiết kế trực quan",
          description: JSON.stringify(customAboutLayout)
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

  // -------------------------------------------------------------
  // THÀNH PHẦN QUẢN LÝ ĐỘNG CHO TRANG GIỚI THIỆU & PHÂN VÙNG BẢN ĐỒ
  // -------------------------------------------------------------
  const renderHistoryCard = (langCode: string, labelPrefix = "") => {
    const lang = activeLangs.find(l => l.code === langCode) || { code: langCode, name: langCode === 'vi' ? 'Tiếng Việt' : 'English' };
    const trans = configTranslations[langCode] || { aboutHistory: "" };

    return (
      <Card className={`border border-slate-150 shadow-sm rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md ${langCode === 'vi' && isCompareMode ? 'bg-slate-50/50 border-r-2 border-r-indigo-500' : ''}`}>
        <CardHeader className="bg-slate-50/50 border-b py-4 px-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <CardTitle className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Tổng quan Địa lý & Lịch sử
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
              Văn bản thuyết minh chi tiết
            </Label>
            <Textarea
              rows={8}
              placeholder={langCode === 'vi' ? "Nhập nội dung lịch sử địa lý tổng quan..." : "Enter geographical & historical overview..."}
              className="rounded-lg border-slate-250 focus:border-indigo-500 focus:ring-indigo-500/20 text-xs font-semibold leading-relaxed"
              value={trans.aboutHistory || ""}
              onChange={(e) => updateTranslationField(langCode, "aboutHistory", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderStatsCard = (langCode: string, labelPrefix = "") => {
    const lang = activeLangs.find(l => l.code === langCode) || { code: langCode, name: langCode === 'vi' ? 'Tiếng Việt' : 'English' };
    const trans = configTranslations[langCode] || {
      aboutArea: "",
      aboutPopulation: "",
      aboutSubdivisions: "",
      aboutStandard: ""
    };

    return (
      <Card className={`border border-slate-150 shadow-sm rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md ${langCode === 'vi' && isCompareMode ? 'bg-slate-50/50 border-r-2 border-r-indigo-500' : ''}`}>
        <CardHeader className="bg-slate-50/50 border-b py-4 px-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <CardTitle className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Chỉ số Thống kê Tổng quan (Trang giới thiệu)
              </CardTitle>
            </div>
            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${langCode === 'vi' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
              {lang.name} {labelPrefix}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
              Diện tích tự nhiên (e.g. 2,452.8 Ha)
            </Label>
            <Input
              placeholder={langCode === 'vi' ? "Ví dụ: 2,452.8 Ha" : "e.g., 2,452.8 Ha"}
              className="rounded-lg border-slate-250 focus:border-indigo-500 text-xs font-bold"
              value={trans.aboutArea || ""}
              onChange={(e) => updateTranslationField(langCode, "aboutArea", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
              Dân số hiện tại (e.g. 6,842 người)
            </Label>
            <Input
              placeholder={langCode === 'vi' ? "Ví dụ: 6,842 người" : "e.g., 6,842 people"}
              className="rounded-lg border-slate-250 focus:border-indigo-500 text-xs font-bold"
              value={trans.aboutPopulation || ""}
              onChange={(e) => updateTranslationField(langCode, "aboutPopulation", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
              Đơn vị hành chính (e.g. 8 Thôn, Buôn)
            </Label>
            <Input
              placeholder={langCode === 'vi' ? "Ví dụ: 8 Thôn, Buôn" : "e.g., 8 Villages / Hamlets"}
              className="rounded-lg border-slate-250 focus:border-indigo-500 text-xs font-bold"
              value={trans.aboutSubdivisions || ""}
              onChange={(e) => updateTranslationField(langCode, "aboutSubdivisions", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
              Chuẩn nông thôn mới (e.g. Đạt 19/19)
            </Label>
            <Input
              placeholder={langCode === 'vi' ? "Ví dụ: Đạt 19/19 Tiêu chí" : "e.g., Achieved 19/19"}
              className="rounded-lg border-slate-250 focus:border-indigo-500 text-xs font-bold"
              value={trans.aboutStandard || ""}
              onChange={(e) => updateTranslationField(langCode, "aboutStandard", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderOrgSectionsEditor = (langCode: string, labelPrefix = "") => {
    const list = orgSections[langCode] || [];

    const handleAddField = () => {
      const newList = [...list, { title: "CƠ QUAN MỚI", desc: "Mô tả...", details: ["Thành phần 1"] }];
      setOrgSections(prev => ({ ...prev, [langCode]: newList }));
    };

    const handleUpdateField = (index: number, key: string, value: any) => {
      const newList = list.map((item, idx) => {
        if (idx === index) {
          return { ...item, [key]: value };
        }
        return item;
      });
      setOrgSections(prev => ({ ...prev, [langCode]: newList }));
    };

    const handleRemoveField = (index: number) => {
      const newList = list.filter((_, idx) => idx !== index);
      setOrgSections(prev => ({ ...prev, [langCode]: newList }));
    };

    return (
      <Card className={`border border-slate-150 shadow-sm rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md ${langCode === 'vi' && isCompareMode ? 'bg-slate-50/50 border-r-2 border-r-indigo-500' : ''}`}>
        <CardHeader className="bg-slate-50/50 border-b py-4 px-5 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Workflow className="w-4 h-4 text-indigo-600" />
            <CardTitle className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Sơ đồ Bộ máy hành chính ({langCode.toUpperCase()})
            </CardTitle>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddField}
            className="rounded-lg text-[10px] font-black uppercase py-1 px-2.5 h-7 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
          >
            + Thêm nhóm/khối
          </Button>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          {list.length === 0 ? (
            <p className="text-xs font-semibold text-slate-400 italic text-center py-4">Chưa có dữ liệu sơ đồ bộ máy.</p>
          ) : (
            list.map((item, index) => (
              <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 relative group">
                <button
                  type="button"
                  onClick={() => handleRemoveField(index)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors p-1"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 gap-3 pr-6">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black text-slate-500 uppercase">Tên cơ quan / Nhóm bộ máy</Label>
                    <Input
                      value={item.title || ""}
                      onChange={(e) => handleUpdateField(index, "title", e.target.value)}
                      className="bg-white text-xs font-extrabold text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black text-slate-500 uppercase">Chức năng, vai trò tóm tắt</Label>
                    <Textarea
                      value={item.desc || ""}
                      onChange={(e) => handleUpdateField(index, "desc", e.target.value)}
                      className="bg-white text-xs font-semibold leading-relaxed"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black text-slate-500 uppercase">Các phòng ban / chức danh liên quan (Mỗi dòng một mục)</Label>
                    <Textarea
                      value={Array.isArray(item.details) ? item.details.join("\n") : ""}
                      onChange={(e) => handleUpdateField(index, "details", e.target.value.split("\n").filter((l: string) => l.trim() !== ""))}
                      className="bg-white text-xs font-semibold leading-relaxed font-mono"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    );
  };

  const renderLeadersEditor = (langCode: string, labelPrefix = "") => {
    const list = leaders[langCode] || [];

    const handleAddField = () => {
      const newList = [...list, { name: "Họ và tên", role: "Chức vụ", responsibility: "Nhiệm vụ phụ trách...", phone: "09xx.xxx.xxx", email: "...", room: "Phòng..." }];
      setLeaders(prev => ({ ...prev, [langCode]: newList }));
    };

    const handleUpdateField = (index: number, key: string, value: any) => {
      const newList = list.map((item, idx) => {
        if (idx === index) {
          return { ...item, [key]: value };
        }
        return item;
      });
      setLeaders(prev => ({ ...prev, [langCode]: newList }));
    };

    const handleRemoveField = (index: number) => {
      const newList = list.filter((_, idx) => idx !== index);
      setLeaders(prev => ({ ...prev, [langCode]: newList }));
    };

    return (
      <Card className={`border border-slate-150 shadow-sm rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md ${langCode === 'vi' && isCompareMode ? 'bg-slate-50/50 border-r-2 border-r-indigo-500' : ''}`}>
        <CardHeader className="bg-slate-50/50 border-b py-4 px-5 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <UserSquare2 className="w-4 h-4 text-indigo-600" />
            <CardTitle className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Danh sách Lãnh đạo chủ chốt ({langCode.toUpperCase()})
            </CardTitle>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddField}
            className="rounded-lg text-[10px] font-black uppercase py-1 px-2.5 h-7 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
          >
            + Thêm lãnh đạo
          </Button>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          {list.length === 0 ? (
            <p className="text-xs font-semibold text-slate-400 italic text-center py-4">Chưa có thông tin lãnh đạo.</p>
          ) : (
            list.map((item, index) => (
              <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 relative group">
                <button
                  type="button"
                  onClick={() => handleRemoveField(index)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors p-1"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-6">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black text-slate-500 uppercase">Họ và tên</Label>
                    <Input
                      value={item.name || ""}
                      onChange={(e) => handleUpdateField(index, "name", e.target.value)}
                      className="bg-white text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black text-slate-500 uppercase">Chức danh / Chức vụ</Label>
                    <Input
                      value={item.role || ""}
                      onChange={(e) => handleUpdateField(index, "role", e.target.value)}
                      className="bg-white text-xs font-bold text-[#b91c1c]"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-[10px] font-black text-slate-500 uppercase">Phạm vi trách nhiệm / Nhiệm vụ phụ trách</Label>
                    <Textarea
                      value={item.responsibility || ""}
                      onChange={(e) => handleUpdateField(index, "responsibility", e.target.value)}
                      className="bg-white text-xs font-semibold leading-relaxed"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black text-slate-500 uppercase">Nơi làm việc / Số phòng</Label>
                    <Input
                      value={item.room || ""}
                      onChange={(e) => handleUpdateField(index, "room", e.target.value)}
                      className="bg-white text-xs font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black text-slate-500 uppercase">Điện thoại liên hệ</Label>
                    <Input
                      value={item.phone || ""}
                      onChange={(e) => handleUpdateField(index, "phone", e.target.value)}
                      className="bg-white text-xs font-semibold font-mono"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-[10px] font-black text-slate-500 uppercase">Thư điện tử công vụ (Email)</Label>
                    <Input
                      value={item.email || ""}
                      onChange={(e) => handleUpdateField(index, "email", e.target.value)}
                      className="bg-white text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    );
  };

  const renderCommuneZonesEditor = (langCode: string, labelPrefix = "") => {
    const list = communeZones[langCode] || [];

    const handleUpdateField = (index: number, key: string, value: any) => {
      const newList = list.map((item, idx) => {
        if (idx === index) {
          return { ...item, [key]: value };
        }
        return item;
      });
      setCommuneZones(prev => ({ ...prev, [langCode]: newList }));
    };

    return (
      <Card className={`border border-slate-150 shadow-sm rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md ${langCode === 'vi' && isCompareMode ? 'bg-slate-50/50 border-r-2 border-r-indigo-500' : ''}`}>
        <CardHeader className="bg-slate-50/50 border-b py-4 px-5">
          <div className="flex items-center gap-2">
            <MapIcon className="w-4 h-4 text-indigo-600" />
            <CardTitle className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Cấu hình phân vùng Thôn Buôn ({langCode.toUpperCase()})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <p className="text-[11px] text-slate-400 font-semibold leading-normal pb-2 border-b">
            Chỉnh sửa các thông số mô phỏng hiển thị ranh giới địa lý hành chính (8 phân vùng vector SVG) trên cổng thông tin.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {list.map((item, index) => (
              <div key={item.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 relative">
                <span className="absolute top-2.5 right-3 text-[10px] font-mono font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  Phân vùng: {item.id}
                </span>
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black text-slate-500 uppercase">Tên khu vực / Thôn / Buôn</Label>
                  <Input
                    value={item.name || ""}
                    onChange={(e) => handleUpdateField(index, "name", e.target.value)}
                    className="bg-white text-xs font-bold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[9px] font-black text-slate-500 uppercase">Diện tích</Label>
                    <Input
                      value={item.area || ""}
                      onChange={(e) => handleUpdateField(index, "area", e.target.value)}
                      className="bg-white text-xs font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] font-black text-slate-500 uppercase">Quy mô dân cư</Label>
                    <Input
                      value={item.pop || ""}
                      onChange={(e) => handleUpdateField(index, "pop", e.target.value)}
                      className="bg-white text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>
            ))}
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
              { id: "general", label: "Cấu hình chung", icon: Settings },
              { id: "about", label: "Trang giới thiệu", icon: FileText },
              { id: "zones", label: "Bản đồ phân vùng", icon: MapIcon }
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

          {/* TAB 1: CẤU HÌNH CHUNG PORTAL */}
          {activeConfigTab === "general" && (
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
            </div>
          )}

          {/* TAB 2: CẤU HÌNH TRANG GIỚI THIỆU */}
          {activeConfigTab === "about" && (
            <div className="space-y-6 animate-fade-in">
              {isCompareMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderHistoryCard("vi", "(Bản gốc)")}
                  {renderHistoryCard("en", "(Bản dịch)")}
                </div>
              ) : (
                renderHistoryCard(activeLangTab)
              )}

              {isCompareMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderStatsCard("vi", "(Bản gốc)")}
                  {renderStatsCard("en", "(Bản dịch)")}
                </div>
              ) : (
                renderStatsCard(activeLangTab)
              )}

              {isCompareMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderOrgSectionsEditor("vi", "(Bản gốc)")}
                  {renderOrgSectionsEditor("en", "(Bản dịch)")}
                </div>
              ) : (
                renderOrgSectionsEditor(activeLangTab)
              )}

              {isCompareMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderLeadersEditor("vi", "(Bản gốc)")}
                  {renderLeadersEditor("en", "(Bản dịch)")}
                </div>
              ) : (
                renderLeadersEditor(activeLangTab)
              )}
            </div>
          )}

          {/* TAB 3: BẢN ĐỒ PHÂN VÙNG THÔN BUÔN */}
          {activeConfigTab === "zones" && (
            <div className="space-y-6 animate-fade-in">
              {isCompareMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderCommuneZonesEditor("vi", "(Bản gốc)")}
                  {renderCommuneZonesEditor("en", "(Bản dịch)")}
                </div>
              ) : (
                renderCommuneZonesEditor(activeLangTab)
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: LOGO UPLOADER & LIVE PORTAL PREVIEW */}
        <div className="space-y-8">
          {/* LOGO CONFIG */}
          <Card className="border border-slate-150 shadow-sm rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md">
            <CardHeader className="bg-slate-50/50 border-b">
              <div className="flex items-center gap-2.5">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                <CardTitle className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                  Logo nhận diện đơn vị
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 flex flex-col items-center gap-5">
              <div className="relative w-32 h-32 rounded-full border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shadow-inner group">
                {activeLogo ? (
                  <>
                    <img src={resolveLogoUrl(activeLogo)} alt="Logo preview" className="w-full h-full object-contain p-2" />
                    <button
                      type="button"
                      onClick={() => {
                        removeImage();
                        setLogoUrl("");
                      }}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white rounded-full text-xs font-bold gap-1"
                    >
                      <X className="w-4 h-4" /> Gỡ ảnh
                    </button>
                  </>
                ) : isUploading ? (
                  <div className="flex flex-col items-center justify-center gap-1.5 text-indigo-600">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-[10px] font-bold animate-pulse">Đang tải...</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors gap-1"
                  >
                    <UploadCloud className="w-8 h-8" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Tải lên Logo</span>
                  </button>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />

              <div className="text-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="rounded-lg text-xs font-bold uppercase text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                >
                  <UploadCloud className="w-3.5 h-3.5 mr-1.5" />
                  Chọn tệp ảnh logo
                </Button>
                <p className="text-[10px] text-slate-400 mt-2">Dạng tệp hỗ trợ: PNG, JPG, WEBP. Dung lượng tối đa: 2MB.</p>
              </div>
            </CardContent>
          </Card>

          {/* BẢN ĐỒ HÀNH CHÍNH CONFIG */}
          <Card className="border border-slate-150 shadow-sm rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md">
            <CardHeader className="bg-slate-50/50 border-b">
              <div className="flex items-center gap-2.5">
                <MapIcon className="w-4 h-4 text-indigo-600" />
                <CardTitle className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                  Bản đồ hành chính đơn vị
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 flex flex-col items-center gap-5">
              <div className="relative w-full aspect-video rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shadow-inner group">
                {activeMap ? (
                  <>
                    <img src={resolveLogoUrl(activeMap)} alt="Administrative map preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        removeMapImage();
                        setMapUrl("");
                      }}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1"
                    >
                      <X className="w-4 h-4" /> Gỡ bản đồ
                    </button>
                  </>
                ) : isUploadingMap ? (
                  <div className="flex flex-col items-center justify-center gap-1.5 text-indigo-600">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-[10px] font-bold animate-pulse">Đang tải...</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => mapInputRef.current?.click()}
                    className="flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors gap-1.5 p-4"
                  >
                    <UploadCloud className="w-8 h-8" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Tải lên Bản đồ</span>
                  </button>
                )}
              </div>

              <input
                type="file"
                ref={mapInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleMapUpload}
              />

              <div className="text-center w-full">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => mapInputRef.current?.click()}
                  disabled={isUploadingMap}
                  className="rounded-lg text-xs font-bold uppercase text-indigo-600 border-indigo-200 hover:bg-indigo-50 w-full"
                >
                  <UploadCloud className="w-3.5 h-3.5 mr-1.5" />
                  Chọn tệp ảnh bản đồ
                </Button>
                <p className="text-[10px] text-slate-400 mt-2">Dạng tệp hỗ trợ: PNG, JPG, WEBP. Dung lượng tối đa: 2MB.</p>
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
