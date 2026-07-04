"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { portalConfigApi } from "../../api";
import { portalConfigDefaults } from "../portalConfig.defaults";

export function useContactConfig() {
  const [isSaving, setIsSaving] = useState(false);
  const [configTranslations, setConfigTranslations] = useState<Record<string, Record<string, string>>>({});
  const [mapUrl, setMapUrl] = useState<string>("");

  
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

    Object.keys(portalConfigDefaults).forEach(key => {
      const configItem = dbConfigs.find((c: any) => c.code === key);
      const isMultiLang = portalConfigDefaults[key].multiLang;

      if (configItem) {
        if (key === "custom_map_iframe") setMapUrl(configItem.description);
        
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
      const contactKeys = [
        "address", "hotline", "fax", "email",
        "contact_form_title", "contact_form_success_desc", "contact_map_title",
        "footer_portal_title", "footer_portal_subtitle", "custom_map_iframe"
      ];

      contactKeys.forEach(key => {
        if (key === "custom_map_iframe") {
          itemsToSave.push({
            code: key,
            name: portalConfigDefaults[key]?.name || key,
            description: mapUrl
          });
          return;
        }

        const isMultiLang = portalConfigDefaults[key]?.multiLang;
        const viValue = configTranslations.vi?.[key] || "";
        const enValue = configTranslations.en?.[key] || "";

        itemsToSave.push({
          code: key,
          name: portalConfigDefaults[key]?.name || key,
          description: isMultiLang ? JSON.stringify({ vi: viValue, en: enValue }) : viValue
        });
      });

      await portalConfigApi.batchUpsert(itemsToSave);
      toast.success("Đã lưu thông tin liên hệ thành công!");
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
    updateField,
    handleSave,
    mapUrl,
    setMapUrl
  };
}
