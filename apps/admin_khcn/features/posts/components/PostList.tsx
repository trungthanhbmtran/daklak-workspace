"use client";
import { PostListStats } from "./post-list/PostListStats";
import { PostListFilters } from "./post-list/PostListFilters";
import { PostListTable } from "./post-list/PostListTable";
import { DashboardReportContainer } from "@/features/reports";

export function PostList({
  onNavigateToCreate,
  onNavigateToEdit
}: {
  onNavigateToCreate: () => void,
  onNavigateToEdit: (id: string) => void
}) {
  return (
    <div className="flex flex-col gap-6 animate-fade-in p-4 md:p-6 h-full min-w-0">
      <PostListStats />

      {/* Trực quan hóa Báo cáo Tin bài từ Report Service */}
      <DashboardReportContainer
        dashboardKey="posts"
        defaultReportCode="REP_POST_STATS"
        defaultTitle="Trực quan hóa Hoạt động Tin bài & Cổng Thông tin"
        defaultDescription="Số liệu tổng hợp phân tích thực tế kế thừa từ Hệ thống Báo cáo & Thống kê (REP_POST_STATS)"
      />

      <PostListFilters onNavigateToCreate={onNavigateToCreate} />
      <PostListTable onNavigateToEdit={onNavigateToEdit} />
    </div>
  );
}
