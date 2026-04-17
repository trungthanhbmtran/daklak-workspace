import { DomainPostStatus } from '../domain/post.entity';

export class PostResponseDto {
  id: string;
  title: string;
  content?: string;
  contentJson?: any;
  description?: string;
  slug: string;
  authorId: string;
  categoryId?: string;
  status: DomainPostStatus;
  thumbnail?: string;
  isFeatured: boolean;
  isNotification: boolean;
  language?: string;
  autoModerationStatus?: string;
  autoModerationNote?: string;
  moderationNote?: string;
  reviewerId?: string;
  publishedAt?: string; // ISO string for gRPC
  createdAt: string;
  updatedAt: string;
  tags?: any[];
  category?: any;
}
