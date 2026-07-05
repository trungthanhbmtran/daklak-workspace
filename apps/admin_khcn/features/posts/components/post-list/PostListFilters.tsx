"use client";
import { Search } from "@/components/ui/search";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { categoryApi } from "@/features/system-admin/categories/api";
import { postsApi } from "../../api";

interface PostListFiltersProps {
  onNavigateToCreate: () => void;
}

export function PostListFilters({ onNavigateToCreate }: PostListFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const statusFilter = searchParams.get('status') || "ALL";
  const categoryFilter = searchParams.get('categoryId') || "ALL";
  const sortBy = searchParams.get('sortBy') || "createdAt";
  const sortOrder = searchParams.get('sortOrder') || "desc";

  const { data: systemCategories = [] } = useQuery({
    queryKey: ["system-categories"],
    queryFn: async () => {
      const res = await categoryApi.fetchByGroup('POST_STATUS');
      return res.data || [];
    },
    staleTime: 5 * 60 * 1000
  });

  const { data: postCategories = [] } = useQuery({
    queryKey: ["post-categories"],
    queryFn: async () => {
      const res = await postsApi.getCategories();
      return res?.data || [];
    },
    staleTime: 5 * 60 * 1000
  });

  const postStatusCategories = systemCategories?.filter((c: any) => c.active === 1) || [];

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Khi đổi filter thì reset về page 1
    if (key !== 'page' && key !== 'limit') {
      params.set('page', '1');
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center rounded-2xl">
      <div className="flex flex-1 w-full flex-col sm:flex-row flex-wrap gap-3">
        <Search 
          placeholder="Tìm theo tiêu đề bài viết..." 
          className="w-full sm:w-80" 
        />

        <Select value={statusFilter} onValueChange={(val) => updateParams('status', val)}>
          <SelectTrigger className="w-full sm:w-[160px] h-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="ALL" className="text-xs font-semibold">Tất cả trạng thái</SelectItem>
            {postStatusCategories.map((cat: any) => (
              <SelectItem key={cat.code} value={cat.code} className="text-xs font-semibold">
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={(val) => updateParams('categoryId', val)}>
          <SelectTrigger className="w-full sm:w-[180px] h-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold">
            <SelectValue placeholder="Chuyên mục" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="ALL" className="text-xs font-semibold">Tất cả chuyên mục</SelectItem>
            {postCategories?.map((cat: any) => (
              <SelectItem key={cat.id} value={cat.id} className="text-xs font-semibold">{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={`${sortBy}-${sortOrder}`} onValueChange={(val) => {
          const [by, order] = val.split("-");
          const params = new URLSearchParams(searchParams.toString());
          params.set('sortBy', by);
          params.set('sortOrder', order);
          params.set('page', '1');
          router.replace(`?${params.toString()}`, { scroll: false });
        }}>
          <SelectTrigger className="w-full sm:w-[200px] h-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold">
            <SelectValue placeholder="Sắp xếp theo" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="createdAt-desc" className="text-xs font-semibold">Mới nhất trước</SelectItem>
            <SelectItem value="createdAt-asc" className="text-xs font-semibold">Cũ nhất trước</SelectItem>
            <SelectItem value="viewCount-desc" className="text-xs font-semibold">Lượt xem nhiều nhất</SelectItem>
            <SelectItem value="publishedAt-desc" className="text-xs font-semibold">Ngày xuất bản mới nhất</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={onNavigateToCreate}
        className="w-full lg:w-auto h-10 px-6 shadow-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold uppercase text-[11px] tracking-wide rounded-xl transition-all duration-300 hover:shadow-indigo-500/10 hover:shadow-lg"
      >
        <Plus className="h-4 w-4 mr-2 stroke-[3px]" /> Viết bài mới
      </Button>
    </Card>
  );
}
