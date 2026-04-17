import { Post } from './post.entity';
import { QueryPostDto } from '../dto/query-post.dto';

export abstract class IPostRepository {
  abstract create(post: Post): Promise<Post>;
  abstract update(id: string, post: Partial<Post>): Promise<Post>;
  abstract findById(id: string): Promise<Post | null>;
  abstract findBySlug(slug: string): Promise<Post | null>;
  abstract findAll(query: QueryPostDto): Promise<{ rows: Post[]; count: number }>;
  abstract delete(id: string): Promise<void>;
  abstract addTags(postId: string, tagIds: string[]): Promise<void>;
  abstract removeTag(postId: string, tagId: string): Promise<void>;
  abstract setCategory(postId: string, categoryId: string): Promise<void>;
  abstract findByCategorySlug(slug: string): Promise<Post[]>;
}
