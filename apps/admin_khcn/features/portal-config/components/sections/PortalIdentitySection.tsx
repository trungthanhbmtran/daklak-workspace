"use client";

import { useIdentityConfig } from "../hooks/useIdentityConfig";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";
import { BrandingCard, ScheduleCard } from "../sub-components/PortalConfigCards";

export const PortalIdentitySection = ({ activeLangTab, isCompareMode, languages }: any) => {
  const {
    isLoading,
    isSaving,
    configTranslations,
    updateField,
    handleSave
  } = useIdentityConfig();


  const activeLangs = languages.length > 0 ? languages : [{ code: "vi", name: "Tiếng Việt" }, { code: "en", name: "English" }];

  const cardProps = (langCode: string) => ({
    langCode,
    activeLangs,
    trans: configTranslations[langCode] || {},
    isCompareMode,
    onUpdate: updateField,
  });

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Đang tải dữ liệu nhận diện...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {isCompareMode ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BrandingCard {...cardProps("vi")} />
          <BrandingCard {...cardProps("en")} />
        </div>
      ) : (
        <BrandingCard {...cardProps(activeLangTab)} />
      )}

      {isCompareMode ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ScheduleCard {...cardProps("vi")} />
          <ScheduleCard {...cardProps("en")} />
        </div>
      ) : (
        <ScheduleCard {...cardProps(activeLangTab)} />
      )}

      <div className="flex justify-end pt-4">
        <Button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-md transition-all"
        >
          {isSaving ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang lưu...</>
          ) : (
            <><CheckCircle2 className="w-4 h-4 mr-2" /> Lưu thông tin nhận diện</>
          )}
        </Button>
      </div>
    </div>
  );
};
