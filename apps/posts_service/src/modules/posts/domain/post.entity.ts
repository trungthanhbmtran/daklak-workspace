export enum DomainPostStatus {
  draft = 'DRAFT',
  pending = 'PENDING',
  approved = 'APPROVED',
  rejected = 'REJECTED',
  published = 'PUBLISHED',
  editing = 'EDITING',
}

export interface PostProps {
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
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  tags?: any[];
  category?: any;
}

export class Post {
  private props: PostProps;

  constructor(props: PostProps) {
    this.props = props;
  }

  get id() { return this.props.id; }
  get title() { return this.props.title; }
  get authorId() { return this.props.authorId; }
  get status() { return this.props.status; }
  get props_copy() { return { ...this.props }; }

  public publish() {
    this.props.status = DomainPostStatus.published;
    this.props.publishedAt = new Date();
  }

  public unpublish() {
    this.props.status = DomainPostStatus.draft;
  }

  public isOwnedBy(userId: string): boolean {
    return this.props.authorId === userId;
  }

  public static create(props: Omit<PostProps, 'id' | 'createdAt' | 'updatedAt'>, id?: string): Post {
    return new Post({
      ...props,
      id: id || '', // Will be set by persistence if empty
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
