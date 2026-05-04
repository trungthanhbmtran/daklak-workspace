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
  authorId?: string;
  currentVersion: number;
  reviewerId?: string;
  isCommentAllowed?: boolean;
  moderationNote?: string;
  autoModerationStatus?: string;
  autoModerationNote?: string;
  isFeatured: boolean;
  isNotification: boolean;
  tags?: string[];
  language?: string;
  isTranslated?: boolean;
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

export interface PortalMenu {
  id: string;
  name: string;
  nameEn?: string;
  description?: string;
  descriptionEn?: string;
  icon?: string;
  link?: string;
  order: number;
  parentId?: string | null;
  isActive: boolean;
  target: string;
  type: 'URL' | 'CATEGORY' | 'POST' | 'STATIC_PAGE';
  referenceId?: string;
  position: 'HORIZONTAL' | 'VERTICAL' | 'FOOTER';
  createdAt: string;
  updatedAt: string;
  children?: PortalMenu[];
}

export interface Comment {
  id: string;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM';
  authorId?: string;
  authorName?: string;
  authorEmail?: string;
  authorIp?: string;
  postId: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
}

export interface CitizenQuestion {
  id: string;
  title: string;
  content: string;
  askedByName: string;
  askedByEmail?: string;
  askedByPhone?: string;
  address?: string;
  status: 'PENDING' | 'PROCESSING' | 'ANSWERED' | 'REJECTED';
  answerContent?: string;
  answeredAt?: string;
  answeredById?: string;
  isPublic: boolean;
  categoryId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CitizenFeedback {
  id: string;
  title: string;
  content: string;
  feedbackType: 'GENERAL' | 'DRAFT_DOC' | 'SERVICE';
  referenceId?: string;
  senderName: string;
  senderEmail?: string;
  status: 'NEW' | 'READ' | 'PROCESSED';
  createdAt: string;
  updatedAt: string;
}
