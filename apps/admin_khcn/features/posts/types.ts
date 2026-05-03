// features/posts/types.ts

export type PostStatus = 
  | 'DRAFT' 
  | 'SUBMITTED' 
  | 'UNDER_REVIEW' 
  | 'REJECTED' 
  | 'APPROVED' 
  | 'PUBLISHED' 
  | 'UNPUBLISHED' 
  | 'ARCHIVED';


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
  attachmentId?: string;
  linkType?: string;
  customUrl?: string;
  target?: string;
  metaTitle?: string;
  metaDescription?: string;
  position?: 'HEADER' | 'SIDEBAR' | 'BOTH' | 'FOOTER';
  isGovStandard?: boolean;
  createdAt?: string;
  updatedAt?: string;
  children?: Category[];
  _count?: {
    posts: number;
  };
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  contentJson?: any;
  description?: string;
  categoryId?: string;
  category?: Category;
  status: PostStatus;
  thumbnail?: string;
  authorId: string;
  currentVersion: number;
  reviewerId?: string;
  moderationNote?: string;
  autoModerationStatus?: string;
  autoModerationNote?: string;
  isFeatured: boolean;
  isNotification: boolean;
  tags?: string[];
  language?: string;
  isTranslated?: boolean;
  
  // Decree 42 Fields
  authorName?: string;
  source?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  allowComment?: boolean;
  expiredAt?: string;

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
