const postService = require('../services/post.service');

class PostController {
  constructor() {
    this.serviceName = 'PostService'; 
  }
  // Tạo bài viết
  async CreatePost(call, callback) {
    try {
      // console.log("call.request",call.request)
      const post = await postService.createPost(call.request);
      callback(null, { success: true, data: post });
    } catch (error) {
      callback(error);
    }
  }


  // Lấy chi tiết bài viết
  async GetPost(call, callback) {
    try {
      const post = await postService.findById(call.request.id, {
        attributes: [
          'id',
          'contentJson',
          'description',
          'updatedAt',
          'authorId',
          'thumbnail',
          'title',
          'createdAt',
        ],
        include: [
          {
            association: 'category',
            attributes: ['name', 'slug'],
          },
          {
            association: 'tags',
            attributes: ['name', 'id'],
          },
        ],
      });

      if (!post) {
        return callback(null, null);
      }

      const data = post.get({ plain: true });

      callback(null, data);
    } catch (error) {
      callback(error);
    }
  }


  // Lấy danh sách bài viết (có phân trang, search, lọc theo category)
   async ListPosts(call, callback) {
    try {
      const { page, limit, search, category } = call.request;

      // Gọi Service để xử lý logic lấy dữ liệu
      const result = await postService.getList({
        page,
        limit,
        search,
        categorySlug: category // Truyền slug category xuống service
      });

      callback(null, result);

    } catch (error) {
      console.error("ListPosts Error:", error);
      callback({
        code: 13, // INTERNAL SERVER ERROR
        message: error.message || 'Internal server error',
      });
    }
  }

  // Cập nhật bài viết
  async UpdatePost(call, callback) {
    try {
      const post = await postService.update(call.request.id, call.request);
      callback(null, { success: true, data: post });
    } catch (error) {
      callback(error);
    }
  }

  // Xóa bài viết
  async DeletePost(call, callback) {
    try {
      await postService.delete(call.request.id);
      callback(null, { success: true });
    } catch (error) {
      callback(error);
    }
  }

  // Gắn nhiều tag
  async AddTagsToPost(call, callback) {
    try {
      const result = await postService.addTagsToPost(
        call.request.postId,
        call.request.tagIds
      );
      callback(null, { success: true, data: result });
    } catch (error) {
      callback(error);
    }
  }

  // Gỡ 1 tag
  async RemoveTagFromPost(call, callback) {
    try {
      const result = await postService.removeTagFromPost(
        call.request.postId,
        call.request.tagId
      );
      callback(null, { success: true, data: result });
    } catch (error) {
      callback(error);
    }
  }

  // Lấy danh sách tag theo post
  async GetTagsByPost(call, callback) {
    try {
      const tags = await postService.getTagsByPost(call.request.postId);
      callback(null, { success: true, data: tags });
    } catch (error) {
      callback(error);
    }
  }

  // Cập nhật category cho post
  async SetCategoryForPost(call, callback) {
    try {
      const result = await postService.setCategoryForPost(
        call.request.postId,
        call.request.categoryId
      );
      callback(null, { success: true, data: result });
    } catch (error) {
      callback(error);
    }
  }

  async GetPostBySlug(call, callback) {
    try {
      const post = await postService.findBySlug(call.request.slug);
      callback(null, post);
    } catch (error) {
      callback(error);
    }
  }

  // Lấy danh sách post theo slug category
  async GetPostsByCategorySlug(call, callback) {
    try {
      // console.log("call",call.request)
      const posts = await postService.getPostsByCategorySlug(call.request.slug);
      callback(null, posts);
    } catch (error) {
      callback(error);
    }
  }

  async ReviewPost(call, callback) {
    try {
      const { 
        id, 
        status, 
        note, 
        reviewer_id, 
        title, 
        description, 
        content_json 
      } = call.request;

      // 1. Gọi service xử lý logic thẩm định
      // Chúng ta map snake_case từ proto sang camelCase cho Service/Model
      const post = await postService.reviewPost(id, {
        status,
        note,
        reviewerId: reviewer_id,
        title,
        description,
        contentJson: content_json // Proto gửi string, Model nhận JSON (Sequelize tự parse nếu là JSON field)
      });

      // 2. Chuyển đổi Sequelize object sang Plain Object
      const data = post.get({ plain: true });

      // 3. Format dữ liệu trả về cho khớp với message Post trong proto
      // Các trường Date cần chuyển sang String ISO
      // Trường JSON cần chuyển sang String nếu trong proto định nghĩa là string
      const formattedData = {
        ...data,
        publishedAt: data.publishedAt ? data.publishedAt.toISOString() : '',
        createdAt: data.createdAt ? data.createdAt.toISOString() : '',
        updatedAt: data.updatedAt ? data.updatedAt.toISOString() : '',
        contentJson: typeof data.contentJson === 'object' ? JSON.stringify(data.contentJson) : data.contentJson,
        moderationNote: data.moderationNote || '',
        // Đảm bảo category và tags có cấu trúc đúng như proto yêu cầu
        category: data.category ? {
          id: data.category.id || '',
          name: data.category.name || '',
          slug: data.category.slug || ''
        } : null,
        tags: data.tags || []
      };

      callback(null, { 
        success: true, 
        data: formattedData 
      });

    } catch (error) {
      console.error("gRPC ReviewPost Error:", error);
      callback({
        code: 13, // INTERNAL
        message: error.message || 'Lỗi hệ thống trong quá trình phê duyệt',
      });
    }
  }
}

module.exports = new PostController();
