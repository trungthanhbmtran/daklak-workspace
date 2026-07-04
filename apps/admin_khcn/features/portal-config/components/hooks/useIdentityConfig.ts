"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { portalConfigApi } from "../../api";
import { portalConfigDefaults } from "../portalConfig.defaults";

export function useIdentityConfig() {
  const [isSaving, setIsSaving] = useState(false);
  const [configTranslations, setConfigTranslations] = useState<Record<string, Record<string, string>>>({});
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [themeLogo, setThemeLogo] = useState<string>(""); // Từ Appearance

  const { data: dbConfigs, isLoading } = useQuery({
    queryKey: ["portal-configs"],
    queryFn: async () => {
      const res: any = await portalConfigApi.getAll();
      return Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
    },
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!dbConfigs) return;
    const initialConfig: Record<string, Record<string, string>> = { vi: {}, en: {} };

    // Tìm theme_logo_url
    const logoConfig = dbConfigs.find((c: any) => c.code === "theme_logo_url");
    if (logoConfig) setThemeLogo(logoConfig.description);

    Object.keys(portalConfigDefaults).forEach(key => {
      const configItem = dbConfigs.find((c: any) => c.code === key);
      const isMultiLang = portalConfigDefaults[key].multiLang;

      if (configItem) {
        if (key === "unit_logo") setLogoUrl(configItem.description);

        if (isMultiLang) {
          try {
            const parsed = JSON.parse(configItem.description);
            initialConfig.vi[key] = parsed.vi || "";
            initialConfig.en[key] = parsed.en || "";
          } catch (e) {
            initialConfig.vi[key] = configItem.description;
            initialConfig.en[key] = "";
          }
        } else {
          initialConfig.vi[key] = configItem.description;
          initialConfig.en[key] = configItem.description;
        }
      } else {
        initialConfig.vi[key] = portalConfigDefaults[key].vi;
        initialConfig.en[key] = portalConfigDefaults[key].en || "";
      }
    });

    setConfigTranslations(initialConfig);
  }, [dbConfigs]);

  const updateField = (lang: string, field: string, value: string) => {
    setConfigTranslations(prev => ({
      ...prev,
      [lang]: {
        ...(prev[lang] || {}),
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const itemsToSave: any[] = [];
      const identityKeys = [
        "unit_name", "unit_title", "unit_identifier", "unit_logo",
        "citizen_schedule", "license_info", "responsible_person"
      ];

      identityKeys.forEach(key => {
        if (key === "unit_logo") {
          itemsToSave.push({ code: "unit_logo", name: "Logo đơn vị", description: logoUrl });
        } else {
          const isMultiLang = portalConfigDefaults[key]?.multiLang;
          const viValue = configTranslations.vi?.[key] || "";
          const enValue = configTranslations.en?.[key] || "";

          itemsToSave.push({
            code: key,
            name: portalConfigDefaults[key]?.name || key,
            description: isMultiLang ? JSON.stringify({ vi: viValue, en: enValue }) : viValue
          });
        }
      });

      await portalConfigApi.batchUpsert(itemsToSave);
      toast.success("Đã lưu thông tin nhận diện thành công!");
    } catch (error) {
      toast.error("Không thể lưu cấu hình, vui lòng thử lại");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isLoading,
    isSaving,
    configTranslations,
    logoUrl,
    setLogoUrl,
    themeLogo,
    updateField,
    handleSave
  };
}
