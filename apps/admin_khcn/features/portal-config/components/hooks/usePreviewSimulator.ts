"use client";

import { useQuery } from "@tanstack/react-query";
import { portalConfigApi } from "../../api";
import { portalConfigDefaults } from "../portalConfig.defaults";

export function usePreviewSimulator(activeLangTab: string) {
  const { data: dbConfigs } = useQuery({
    queryKey: ["portal-configs"],
    queryFn: async () => {
      const res: any = await portalConfigApi.getAll();
      return Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
    },
    staleTime: 60_000,
  });

  const getVal = (key: string) => {
    if (!dbConfigs) return portalConfigDefaults[key]?.[activeLangTab as "vi" | "en"] || "";
    const configItem = dbConfigs.find((c: any) => c.code === key);
    if (!configItem) return portalConfigDefaults[key]?.[activeLangTab as "vi" | "en"] || "";

    const isMultiLang = portalConfigDefaults[key]?.multiLang;
    if (isMultiLang) {
      try {
        const parsed = JSON.parse(configItem.description);
        return parsed[activeLangTab] || "";
      } catch (e) {
        return activeLangTab === "vi" ? configItem.description : "";
      }
    }
    return configItem.description;
  };

  const getLogo = (key: string) => {
    if (!dbConfigs) return "";
    return dbConfigs.find((c: any) => c.code === key)?.description || "";
  };

  return {
    simName: getVal("unit_name") || "UBND XÃ DANG KANG",
    simTitle: getVal("unit_title") || "TRANG THÔNG TIN ĐIỆN TỬ",
    simIdentifier: getVal("unit_identifier") || "HUYỆN KRÔNG BÔNG - TỈNH ĐẮK LẮK",
    simSchedule: getVal("citizen_schedule") || "Thứ 5 hàng tuần • 08:00 - 11:30",
    simLicense: getVal("license_info") || "Giấy phép số: 45/GP-TTĐT do Sở Thông tin và Truyền thông tỉnh Đắk Lắk cấp",
    simResponsible: getVal("responsible_person") || "Ông Trần Văn Minh - Chủ tịch UBND xã Dang Kang",
    simAddress: getVal("address") || "Địa chỉ: Thôn 6, xã Dang Kang, huyện Krông Bông, tỉnh Đắk Lắk",
    simContactFormTitle: getVal("contact_form_title") || "GỬI PHẢN ÁNH / GÓP Ý ĐẾN VĂN PHÒNG",
    simContactFormSuccessDesc: getVal("contact_form_success_desc") || "Bộ phận văn thư xã Dang Kang đã nhận được thư góp ý của bạn và sẽ phản hồi sớm nhất có thể.",
    simContactMapTitle: getVal("contact_map_title") || "BẢN ĐỒ PHÂN VÙNG HÀNH CHÍNH XÃ DANG KANG",
    simFooterPortalTitle: getVal("footer_portal_title") || "CỔNG DỊCH VỤ CÔNG TRỰC TUYẾN XÃ DANG KANG",
    simFooterPortalSubtitle: getVal("footer_portal_subtitle") || "Tiếp nhận giải quyết thủ tục hành chính một cửa hiện đại, nhanh chóng",
    simHotline: getVal("hotline") || "Đường dây nóng: 0262.3812.345",
    simFax: getVal("fax") || "Fax: 0262.3812.346",
    simEmail: getVal("email") || "Email: xadangkang@krongbong.daklak.gov.vn",
    themeLogo: getLogo("theme_logo_url"),
    logoUrl: getLogo("unit_logo"),
  };
}
