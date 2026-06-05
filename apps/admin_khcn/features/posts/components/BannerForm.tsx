// features/posts/components/BannerForm.tsx

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Save, Loader2, Eye } from "lucide-react";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";

import { bannerSchema } from "../schemas";
import { postsApi } from "../api";

import { DEFAULT_STYLES } from "./banner/banner-helpers";
import { BannerBasicInfo } from "./banner/BannerBasicInfo";
import { SloganCustomizer } from "./banner/SloganCustomizer";
import { BannerImageUpload } from "./banner/BannerImageUpload";
import { BannerConfig } from "./banner/BannerConfig";
import { BannerSchedule } from "./banner/BannerSchedule";
import { BannerClientPreviewModal } from "./banner/BannerClientPreviewModal";

type BannerFormValues = z.infer<typeof bannerSchema>;

interface BannerFormProps {
  onBack: () => void;
  editId?: string | null;
}

export function BannerForm({ onBack, editId }: BannerFormProps) {
  const queryClient = useQueryClient();
  const isEdit = !!editId;

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema) as any,
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      imageUrl: "",
      linkType: "internal",
      customUrl: "",
      target: "_self",
      position: "top",
      orderIndex: 0,
      status: true,
      startAt: "",
      endAt: "",
      translations: {},
      designType: "image",
    },
  });

  const [activeLangTab, setActiveLangTab] = useState<string>("vi");

  const [customStyles, setCustomStyles] = useState<any>(DEFAULT_STYLES);
  const [designType, _setDesignType] = useState<"image" | "slogan">("image");
  const setDesignType = (type: "image" | "slogan") => {
    _setDesignType(type);
    form.setValue("designType", type, { shouldValidate: true });
  };
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const watchedPosition = form.watch("position");

  const watchedName = form.watch("name");
  useEffect(() => {
    if (!isEdit && watchedName) {
      const slug = watchedName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .replace(/([^0-9a-z-\s])/g, "")
        .replace(/(\s+)/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
      form.setValue("slug", slug, { shouldValidate: true });
    }
  }, [watchedName, isEdit, form]);

  const { data: bannerData, isLoading: isFetching } = useQuery({
    queryKey: ["banner", editId],
    queryFn: async () => {
      const res: any = await postsApi.getBanner(editId!);
      return res;
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (bannerData) {
      let parsedTranslations = bannerData.translations || {};
      if (typeof parsedTranslations === 'string') {
        try {
          parsedTranslations = JSON.parse(parsedTranslations);
        } catch (e) {
          parsedTranslations = {};
        }
      }

      let loadedStyles = DEFAULT_STYLES;
      let isSlogan = false;
      if (bannerData.metaDescription) {
        try {
          const parsed = JSON.parse(bannerData.metaDescription);
          if (parsed && typeof parsed === 'object') {
            loadedStyles = { ...DEFAULT_STYLES, ...parsed };
            isSlogan = true;
          }
        } catch (e) {
          console.log("metaDescription is not a JSON styling config");
        }
      }
      setCustomStyles(loadedStyles);
      setDesignType(isSlogan ? "slogan" : "image");

      form.reset({
        ...bannerData,
        name: bannerData.name || "",
        slug: bannerData.slug || "",
        description: bannerData.description || "",
        imageUrl: bannerData.imageUrl || "",
        customUrl: bannerData.customUrl || "",
        startAt: (bannerData.startAt && !isNaN(Date.parse(bannerData.startAt))) ? new Date(bannerData.startAt).toISOString().split('T')[0] : "",
        endAt: (bannerData.endAt && !isNaN(Date.parse(bannerData.endAt))) ? new Date(bannerData.endAt).toISOString().split('T')[0] : "",
        translations: parsedTranslations,
        metaTitle: bannerData.metaTitle || "",
        metaDescription: bannerData.metaDescription || "",
        designType: isSlogan ? "slogan" : "image",
      });
    }
  }, [bannerData, form]);

  const mutation = useMutation({
    mutationFn: (values: any) => {
      const { designType, ...payloadValues } = values;
      const payload = {
        ...payloadValues,
        translations: JSON.stringify(payloadValues.translations || {}),
        metaDescription: designType === "slogan" ? JSON.stringify(customStyles) : ""
      };
      if (isEdit) return postsApi.updateBanner(editId!, payload);
      return postsApi.createBanner(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      onBack();
    },
  });

  const updateStyle = (key: string, value: any) => {
    setCustomStyles((prev: any) => ({ ...prev, [key]: value }));
  };

  const onSubmit = (values: BannerFormValues) => {
    mutation.mutate(values);
  };

  const onError = (errors: any) => {
    console.warn("Form validation errors:", errors);
    const firstErrorKey = Object.keys(errors)[0];
    if (firstErrorKey) {
      const msg = errors[firstErrorKey]?.message || "Vui lòng kiểm tra lại thông tin nhập liệu!";
      toast.error(msg);
    } else {
      toast.error("Vui lòng kiểm tra lại thông tin nhập liệu!");
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Đang tải dữ liệu banner...</span>
      </div>
    );
  }

  const watchedDescription = form.watch("description");

  return (
    <div className="w-full max-w-full px-4 md:px-8 space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-30 bg-background/80 backdrop-blur-md py-4 border-b">
        <div className="flex items-center gap-4">
          <Button type="button" variant="outline" size="icon" onClick={onBack} className="rounded-full shadow-sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-xl font-bold tracking-tight">{isEdit ? "Chỉnh sửa Banner" : "Thêm Banner mới"}</h2>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Cấu hình trình chiếu & liên kết</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {designType === "slogan" && (
            <Button
              type="button"
              variant="outline"
              className="bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800 font-extrabold flex items-center gap-2"
              onClick={() => setIsPreviewModalOpen(true)}
            >
              <Eye className="w-4 h-4 text-amber-600 animate-pulse" /> Xem trước ở Client
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            disabled={mutation.isPending}
            onClick={onBack}
          >
            Hủy bỏ
          </Button>
          <Button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px] shadow-lg shadow-blue-500/20"
            disabled={mutation.isPending}
            onClick={form.handleSubmit(onSubmit, onError)}
          >
            {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isEdit ? "Cập nhật Banner" : "Lưu Banner"}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <BannerBasicInfo
                form={form}
                activeLangTab={activeLangTab}
                setActiveLangTab={setActiveLangTab}
                watchedPosition={watchedPosition}
                designType={designType}
                setDesignType={setDesignType}
              />

              {designType === "slogan" && (
                <SloganCustomizer
                  customStyles={customStyles}
                  setCustomStyles={setCustomStyles}
                  updateStyle={updateStyle}
                  watchedName={watchedName}
                  watchedDescription={watchedDescription}
                />
              )}
            </div>

            <div className="lg:col-span-4 space-y-6">
              {designType === "image" && (
                <BannerImageUpload
                  form={form}
                />
              )}

              <BannerConfig form={form} customStyles={customStyles} updateStyle={updateStyle} />

              <BannerSchedule form={form} />
            </div>
          </div>
        </form>
      </Form>

      <BannerClientPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        customStyles={customStyles}
        watchedName={watchedName}
        watchedDescription={watchedDescription}
        onSaveAndSubmit={() => {
          setIsPreviewModalOpen(false);
          form.handleSubmit(onSubmit, onError)();
        }}
      />
    </div>
  );
}
