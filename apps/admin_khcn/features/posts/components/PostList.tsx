"use client";
import { PostListStats } from "./post-list/PostListStats";
import { PostListFilters } from "./post-list/PostListFilters";
import { PostListTable } from "./post-list/PostListTable";

export function PostList({
  onNavigateToCreate,
  onNavigateToEdit
}: {
  onNavigateToCreate: () => void,
  onNavigateToEdit: (id: string) => void
}) {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PostListStats />
      <PostListFilters onNavigateToCreate={onNavigateToCreate} />
      <PostListTable onNavigateToEdit={onNavigateToEdit} />
    </div>
  );
}
