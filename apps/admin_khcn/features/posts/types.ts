// features/posts/types.ts

export type PostStatus = 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED' | 'EDITING';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  status: boolean;
  orderIndex: number;
  lft: number;
  rgt: number;
  depth: number;
  thumbnail?: string;
  linkType?: string;
  customUrl?: string;
  target?: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt?: string;
  updatedAt?: string;
  children?: Category[];
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  categoryId: string;
  category?: Category;
  status: PostStatus;
  thumbnailId?: string;
  authorId: string;
  reviewerId?: string;
  moderationNote?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type BannerPosition = 'top' | 'middle' | 'bottom' | 'custom';
export type BannerLinkType = 'internal' | 'external';

export interface Banner {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl: string;
  linkType: BannerLinkType;
  customUrl?: string;
  target: string;
  position: BannerPosition;
  orderIndex: number;
  status: boolean;
  metaTitle?: string;
  metaDescription?: string;
  startAt?: string;
  endAt?: string;
  createdAt: string;
  updatedAt: string;
}
