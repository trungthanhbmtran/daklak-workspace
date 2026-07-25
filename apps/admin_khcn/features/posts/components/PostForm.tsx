/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { categoryApi } from "@/features/system-admin/categories/api";

import { postsApi } from "../api";
import { PostFormHeader } from "./post-form/PostFormHeader";
import { PostContentTabs } from "./post-form/PostContentTabs";
import { PostImageCard } from "./post-form/PostImageCard";
import { PostConfigCard } from "./post-form/PostConfigCard";
import { PostMenuLinkCard } from "./post-form/PostMenuLinkCard";
import { PostTagsCard } from "./post-form/PostTagsCard";

const postSchema = z.object({
  title: z.string().min(5, "Tiêu đề quá ngắn"),
  slug: z.string().min(1, "Slug không được để trống"),
  description: z.string().max(300, "Tóm tắt tối đa 300 ký tự").optional(),
  content: z.string().min(10, "Nội dung quá ngắn"),
  categoryId: z.string().min(1, "Chọn chuyên mục"),
  status: z.enum([
    "DRAFT", "SUBMITTED", "UNDER_REVIEW", "REJECTED",
    "APPROVED", "PUBLISHED", "UNPUBLISHED", "ARCHIVED"
  ]),
  thumbnail: z.string().optional(),
  tags: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  isNotification: z.boolean().default(false),
  translations: z.record(z.string(), z.object({
    title: z.string().optional(),
    slug: z.string().optional(),
    description: z.string().optional(),
    content: z.string().optional(),
  })).default({}),
});

type PostFormValues = z.infer<typeof postSchema>;

export function PostForm({ onBack, editId }: { onBack: () => void; editId?: string | null }) {
  const queryClient = useQueryClient();
  const isEdit = !!editId;

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema) as any,
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      content: "",
      categoryId: "",
      status: "DRAFT",
      thumbnail: "",
      tags: [],
      isFeatured: false,
      isNotification: false,
      translations: {},
    },
  });

  const { data: languages = [] } = useQuery({
    queryKey: ['portal-languages'],
    queryFn: async () => {
      const langs = await categoryApi.fetchByGroup('LANGUAGE');
      return langs.data;
    },
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (languages.length > 0) {
      const currentTranslations = form.getValues("translations") || {};
      const newTranslations = { ...currentTranslations };
      let hasNew = false;
      languages.forEach(l => {
        if (l.code !== 'vi' && !newTranslations[l.code]) {
          newTranslations[l.code] = { title: "", description: "", content: "" };
          hasNew = true;
        }
      });
      if (hasNew) {
        form.setValue("translations", newTranslations);
      }
    }
  }, [languages, form]);

  const { data: categories } = useQuery({
    queryKey: ["posts-categories"],
    queryFn: async () => {
      const res = await postsApi.getCategories();
      return res.data;
    },
  });

  const { data: postResponse, isLoading: isFetching } = useQuery({
    queryKey: ["post", editId],
    queryFn: async () => await postsApi.getPost(editId!),
    enabled: isEdit,
  });
  const postData = postResponse?.data;

  useEffect(() => {
    if (postData && languages.length > 0) {
      let parsedTranslations = postData.translations || {};
      if (typeof parsedTranslations === 'string') {
        try {
          parsedTranslations = JSON.parse(parsedTranslations);
        // eslint-disable-next-line unused-imports/no-unused-vars
        } catch (e) {
          parsedTranslations = {};
        }
      }

      const fullTranslations = { ...parsedTranslations };
      languages.forEach(lang => {
        if (lang.code !== 'vi' && !fullTranslations[lang.code]) {
          fullTranslations[lang.code] = { title: "", description: "", content: "" };
        }
      });

      form.reset({
        title: postData.title,
        slug: postData.slug,
        description: postData.description || "",
        content: postData.content,
        categoryId: postData.categoryId || "",
        status: postData.status as any,
        thumbnail: postData.thumbnail || "",
        tags: Array.isArray(postData.tags) ? postData.tags : [],
        isFeatured: postData.isFeatured || false,
        isNotification: postData.isNotification || false,
        translations: fullTranslations,
      });
    }
  }, [postData, languages, form]);

  const mutation = useMutation({
    onError: (error: any) => { toast.error(error?.response?.data?.message || "Đã có lỗi xảy ra"); },
    mutationFn: (v: PostFormValues) => {
      const payload = {
        ...v,
        translations: JSON.stringify(v.translations || {})
      };
      return isEdit && editId ? postsApi.updatePost(editId, payload) : postsApi.createPost(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      onBack();
    },
  });

  const onSubmit = (values: PostFormValues) => {
    mutation.mutate(values);
  };

  if (isFetching) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto h-8 w-8" /></div>;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-[1400px] mx-auto space-y-6 pb-20 p-4 md:p-6">
        <PostFormHeader 
          onBack={onBack} 
          isEdit={isEdit} 
          isPending={mutation.isPending} 
          onSubmitForm={form.handleSubmit(onSubmit)} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <PostContentTabs 
              languages={languages} 
              categories={categories || []} 
              postData={postData} 
            />
          </div>

          <div className="lg:col-span-4 space-y-6">
            <PostImageCard />
            <PostConfigCard />
            <PostMenuLinkCard isEdit={isEdit} editId={editId} />
            <PostTagsCard />
          </div>
        </div>
      </form>
    </Form>
  );
}
