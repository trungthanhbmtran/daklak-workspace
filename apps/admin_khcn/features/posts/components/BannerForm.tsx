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
import axios from "axios";
import imageCompression from "browser-image-compression";
import apiClient from "@/lib/axiosInstance";
import { categoryApi } from "@/features/system-admin/categories/api";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    },
  });

  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [languages, setLanguages] = useState<any[]>([]);
  const [activeLangTab, setActiveLangTab] = useState<string>("vi");

  const [customStyles, setCustomStyles] = useState<any>(DEFAULT_STYLES);
  const [designType, setDesignType] = useState<"image" | "slogan">("image");
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isUploadingBg, setIsUploadingBg] = useState(false);
  const [isUploadingWatermark, setIsUploadingWatermark] = useState(false);

  const uploadCustomFile = async (file: File): Promise<string> => {
    const compressed = await imageCompression(file, {
      maxSizeMB: 0.6,
      maxWidthOrHeight: 1200,
      fileType: 'image/webp'
    });

    const res: any = await apiClient.post("/media/request-upload", {
      originalName: file.name,
      mimeType: compressed.type,
      size: compressed.size,
    });

    const { uploadUrl, fileId } = res.data;

    await axios.put(uploadUrl, compressed, {
      headers: { "Content-Type": compressed.type }
    });

    const confirmRes: any = await apiClient.post("/media/confirm-upload", { fileId });
    return confirmRes.data.downloadUrl;
  };

  const handleBgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBg(true);
    try {
      const url = await uploadCustomFile(file);
      updateStyle("bgImage", url);
      toast.success("Tải hình nền biểu ngữ thành công!");
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải hình nền lên. Vui lòng thử lại.");
    } finally {
      setIsUploadingBg(false);
    }
  };

  const handleWatermarkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingWatermark(true);
    try {
      const url = await uploadCustomFile(file);
      updateStyle("watermarkUrl", url);
      toast.success("Tải biểu tượng cổ động thành công!");
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải biểu tượng lên. Vui lòng thử lại.");
    } finally {
      setIsUploadingWatermark(false);
    }
  };

  const watchedPosition = form.watch("position");

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const all = await categoryApi.fetchAll();
        const langs = all.filter((c: any) => c.group === 'LANGUAGE' && c.active === 1);
        setLanguages(langs);
      } catch (error) {
        console.error("Error fetching languages:", error);
      }
    };
    fetchLanguages();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1920,
        fileType: 'image/webp'
      });

      const res: any = await apiClient.post("/media/request-upload", {
        originalName: file.name,
        mimeType: compressed.type,
        size: compressed.size,
      });

      const { uploadUrl, fileId } = res.data;

      await axios.put(uploadUrl, compressed, {
        headers: { "Content-Type": compressed.type }
      });

      const confirmRes: any = await apiClient.post("/media/confirm-upload", { fileId });

      setPreviewUrl(confirmRes.data.downloadUrl);
      form.setValue("imageUrl", fileId, { shouldValidate: true, shouldDirty: true });

    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Không thể tải ảnh lên. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setPreviewUrl(null);
    form.setValue("imageUrl", "", { shouldValidate: true, shouldDirty: true });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
      return res?.data;
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
        startAt: bannerData.startAt ? new Date(bannerData.startAt).toISOString().split('T')[0] : "",
        endAt: bannerData.endAt ? new Date(bannerData.endAt).toISOString().split('T')[0] : "",
        translations: parsedTranslations,
        metaTitle: bannerData.metaTitle || "",
        metaDescription: bannerData.metaDescription || "",
      });
    }
  }, [bannerData, form]);

  const mutation = useMutation({
    mutationFn: (values: any) => {
      const payload = {
        ...values,
        translations: JSON.stringify(values.translations || {}),
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
            onClick={form.handleSubmit(onSubmit)}
          >
            {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isEdit ? "Cập nhật Banner" : "Lưu Banner"}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <BannerBasicInfo
                form={form}
                languages={languages}
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
                  isUploadingBg={isUploadingBg}
                  handleBgImageUpload={handleBgImageUpload}
                  isUploadingWatermark={isUploadingWatermark}
                  handleWatermarkUpload={handleWatermarkUpload}
                  watchedName={watchedName}
                  watchedDescription={watchedDescription}
                />
              )}
            </div>

            <div className="lg:col-span-4 space-y-6">
              {designType === "image" && (
                <BannerImageUpload
                  form={form}
                  fileInputRef={fileInputRef}
                  isUploading={isUploading}
                  previewUrl={previewUrl}
                  handleImageUpload={handleImageUpload}
                  removeImage={removeImage}
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
          form.handleSubmit(onSubmit)();
        }}
      />
    </div>
  );
}
