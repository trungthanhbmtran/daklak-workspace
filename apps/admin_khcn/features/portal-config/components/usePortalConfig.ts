/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { portalConfigApi, portalLanguagesApi } from "../api";
import { EMPTY_TRANSLATION } from "./portalConfig.defaults";

export type LangCode = string;
export type TranslationMap = Record<LangCode, typeof EMPTY_TRANSLATION>;

const QUERY_KEY        = ["portal-configs"] as const;
const LANG_QUERY_KEY   = ["portal-languages"] as const;

/**
 * Hook tập trung toàn bộ:
 *  - fetch languages (via portalLanguagesApi)
 *  - fetch portal configs (via portalConfigApi)
 *  - populate translation state
 *  - handleSave: 1 request batch-upsert thay vì 17 requests riêng lẻ
 */
export function usePortalConfig() {
  const qc = useQueryClient();
  const [logoUrl, setLogoUrl]   = useState("");
  const [mapUrl, setMapUrl]     = useState("");
  const [themeLogo, setThemeLogo] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [languages, setLanguages] = useState<any[]>([]);
  const [configTranslations, setConfigTranslations] = useState<TranslationMap>({});

  // ── Fetch languages ────────────────────────────────────────────────────────
  const { data: languagesData } = useQuery({
    queryKey: LANG_QUERY_KEY,
    queryFn: async () => {
      const res = await portalLanguagesApi.getActive() as any;
      const all = res.data;
      const langs = all.filter((c: any) => c.active === 1);
      return langs.length > 0 ? langs : [{ code: "vi", name: "Tiếng Việt" }, { code: "en", name: "English" }];
    },
    staleTime: 5 * 60_000, // ngôn ngữ ít thay đổi → cache 5 phút
  });

  useEffect(() => {
    if (languagesData) setLanguages(languagesData);
  }, [languagesData]);

  // ── Fetch portal configs ───────────────────────────────────────────────────
  const { data: dbCategories, isLoading, refetch } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const res = await portalConfigApi.getAll() as any;
      return res.data;
    },
    staleTime: 60_000,       // config ít thay đổi → cache 1 phút
    gcTime:    10 * 60_000,
  });

  // ── Populate state from DB ─────────────────────────────────────────────────
  useEffect(() => {
    if (!dbCategories?.length || !languages.length) return;

    const find = (code: string) => dbCategories.find((c: any) => c.code === code);

    const logoCat = find("logo_url");
    const mapCat  = find("map_url");
    if (logoCat) setLogoUrl(logoCat.name);
    if (mapCat)  setMapUrl(mapCat.name);

    // Extract theme logo from theme_appearance JSON
    const themeApp = find("theme_appearance");
    if (themeApp?.description) {
      try {
        const parsed = JSON.parse(themeApp.description);
        if (parsed?.branding?.logo) setThemeLogo(parsed.branding.logo);
      } catch {}
    }

    const extractField = (cat: any, lang: string): string => {
      if (!cat) return "";
      if (cat.code === "citizen_schedule" && lang === "vi" && cat.description && !cat.description.trim().startsWith("{")) {
        return cat.description || cat.name || "";
      }
      if (cat.description?.trim().startsWith("{")) {
        try {
          const parsed = JSON.parse(cat.description);
          if (parsed[lang] !== undefined) return parsed[lang];
          if (parsed.translations?.[lang] !== undefined) return parsed.translations[lang];
        } catch {}
      }
      return lang === "vi" ? (cat.name || "") : "";
    };

    const newTranslations: TranslationMap = {};
    languages.forEach((l) => {
      newTranslations[l.code] = {
        ...EMPTY_TRANSLATION,
        unitName:               extractField(find("unit_name"), l.code),
        unitTitle:              extractField(find("unit_title"), l.code),
        unitIdentifier:         extractField(find("unit_identifier"), l.code),
        responsiblePerson:      extractField(find("responsible_person"), l.code),
        citizenSchedule:        extractField(find("citizen_schedule"), l.code),
        licenseInfo:            extractField(find("license_info"), l.code),
        address:                extractField(find("address"), l.code),
        contactFormTitle:       extractField(find("contact_form_title"), l.code),
        contactFormSuccessDesc: extractField(find("contact_form_success_desc"), l.code),
        contactMapTitle:        extractField(find("contact_map_title"), l.code),
        footerPortalTitle:      extractField(find("footer_portal_title"), l.code),
        footerPortalSubtitle:   extractField(find("footer_portal_subtitle"), l.code),
        hotline:                extractField(find("hotline"), l.code),
        fax:                    extractField(find("fax"), l.code),
        email:                  extractField(find("email"), l.code),
      };
    });
    setConfigTranslations(newTranslations);
  }, [dbCategories, languages]);

  // ── Update single translation field ───────────────────────────────────────
  const updateTranslationField = (lang: string, field: string, value: string) => {
    setConfigTranslations((prev) => ({
      ...prev,
      [lang]: { ...(prev[lang] || EMPTY_TRANSLATION), [field]: value },
    }));
  };

  // ── Save handler — 1 request batch-upsert ─────────────────────────────────
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const activeLangs = languages.length > 0 ? languages : [{ code: "vi" }, { code: "en" }];

      const buildJson = (fn: (code: string) => string) =>
        JSON.stringify(Object.fromEntries(activeLangs.map((l) => [l.code, fn(l.code) || ""])));

      // Tập hợp tất cả config items thành 1 mảng
      const items = [
        { code: "unit_name",               name: configTranslations["vi"]?.unitName || "",               description: buildJson((l) => configTranslations[l]?.unitName) },
        { code: "unit_title",              name: configTranslations["vi"]?.unitTitle || "",               description: buildJson((l) => configTranslations[l]?.unitTitle) },
        { code: "unit_identifier",         name: configTranslations["vi"]?.unitIdentifier || "",          description: buildJson((l) => configTranslations[l]?.unitIdentifier) },
        { code: "responsible_person",      name: configTranslations["vi"]?.responsiblePerson || "",       description: buildJson((l) => configTranslations[l]?.responsiblePerson) },
        { code: "citizen_schedule",        name: (configTranslations["vi"]?.citizenSchedule || "").slice(0, 255), description: buildJson((l) => configTranslations[l]?.citizenSchedule) },
        { code: "license_info",            name: configTranslations["vi"]?.licenseInfo || "",             description: buildJson((l) => configTranslations[l]?.licenseInfo) },
        { code: "address",                 name: configTranslations["vi"]?.address || "",                 description: buildJson((l) => configTranslations[l]?.address) },
        { code: "contact_form_title",      name: configTranslations["vi"]?.contactFormTitle || "",        description: buildJson((l) => configTranslations[l]?.contactFormTitle) },
        { code: "contact_form_success_desc", name: (configTranslations["vi"]?.contactFormSuccessDesc || "").slice(0, 255), description: buildJson((l) => configTranslations[l]?.contactFormSuccessDesc) },
        { code: "contact_map_title",       name: configTranslations["vi"]?.contactMapTitle || "",         description: buildJson((l) => configTranslations[l]?.contactMapTitle) },
        { code: "footer_portal_title",     name: configTranslations["vi"]?.footerPortalTitle || "",       description: buildJson((l) => configTranslations[l]?.footerPortalTitle) },
        { code: "footer_portal_subtitle",  name: (configTranslations["vi"]?.footerPortalSubtitle || "").slice(0, 255), description: buildJson((l) => configTranslations[l]?.footerPortalSubtitle) },
        { code: "hotline",                 name: configTranslations["vi"]?.hotline || "",                 description: buildJson((l) => configTranslations[l]?.hotline) },
        { code: "fax",                     name: configTranslations["vi"]?.fax || "",                     description: buildJson((l) => configTranslations[l]?.fax) },
        { code: "email",                   name: configTranslations["vi"]?.email || "",                   description: buildJson((l) => configTranslations[l]?.email) },
        { code: "logo_url",                name: logoUrl || "",                                           description: "Logo URL" },
        { code: "map_url",                 name: mapUrl || "",                                            description: "Map URL" },
      ];

      // 1 request duy nhất thay vì 17 requests
      await portalConfigApi.batchUpsert(items);

      toast.success("Lưu cấu hình thành công!");
      qc.invalidateQueries({ queryKey: QUERY_KEY });
    } catch {
      toast.error("Không thể lưu cấu hình. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    logoUrl, setLogoUrl,
    mapUrl, setMapUrl,
    themeLogo,
    isSaving,
    languages,
    configTranslations,
    updateTranslationField,
    isLoading,
    dbCategories,
    refetch,
    handleSave,
  };
}
