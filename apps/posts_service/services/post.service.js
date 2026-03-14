const BaseService = require('./Base.service');
const { Post, Category, Tag } = require('../models');
const { Op } = require('sequelize');
// const { publishToQueue } = require('../helpers/mq'); // Import helper

class PostService extends BaseService {
  constructor() {
    super(Post);
  }

  buildFilters(query) {
    const where = {};

    if (query.keyword) {
      where.title = { [Op.like]: `%${query.keyword}%` };
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    return where;
  }


  // Tạo bài viết mới, có thể gắn tags ngay
  async createPost(postData) {
    // Kiểm tra categoryId hợp lệ
    if (postData.categoryId) {
      const category = await Category.findByPk(postData.categoryId);
      if (!category) throw new Error('Category not found');
    }

    const post = await this.create(postData);

    // Gắn tag nếu có
    if (postData.tagIds?.length) {
      await post.setTags(postData.tagIds);
    }

    return post;
  }

  // Cập nhật category cho post
  async setCategoryForPost(postId, categoryId) {
    const post = await this.findById(postId);
    const category = await Category.findByPk(categoryId);
    if (!category) throw new Error('Category not found');

    post.categoryId = categoryId;
    await post.save();

    return { success: true };
  }

  // Gắn nhiều tag cho post
  async addTagsToPost(postId, tagIds) {
    const post = await this.findById(postId);
    await post.setTags(tagIds);
    return { success: true };
  }

  // Gỡ 1 tag khỏi post
  async removeTagFromPost(postId, tagId) {
    const post = await this.findById(postId);
    await post.removeTag(tagId);
    return { success: true };
  }

  // Lấy danh sách tag theo post
  async getTagsByPost(postId) {
    const post = await this.findById(postId);
    return await post.getTags();
  }

  // Lấy tất cả category con (dùng đệ quy, tối ưu nếu dùng NestedSet)
  async getAllDescendantCategoryIds(categoryId) {
    const root = await Category.findByPk(categoryId);
    if (!root) throw new Error('Category not found');

    // Nếu dùng Nested Set, lấy bằng lft/rgt
    const descendants = await Category.findAll({
      where: {
        lft: { [Op.gte]: root.lft },
        rgt: { [Op.lte]: root.rgt },
      },
      attributes: ['id'],
    });

    return descendants.map((c) => c.id);
  }

  // Lấy post theo category và tất cả category con
  async getPostsByCategory(categoryId) {
    const categoryIds = await this.getAllDescendantCategoryIds(categoryId);

    const posts = await Post.findAll({
      where: { categoryId: categoryIds },
      order: [['createdAt', 'DESC']],
    });

    return posts;
  }

  async findBySlug(slug) {
    const post = await this.model.findOne({
      where: { slug },
      // include: [{ all: true, nested: true }],
    });
    // console.log("post",post)
    if (!post) throw new Error("Post not found");
    return post;
  }

  async getPostsByCategorySlug(slug, query = {}) {
    const category = await Category.findOne({ where: { slug } });
    if (!category) throw new Error("Category not found");

    const categoryIds = await this.getAllDescendantCategoryIds(category.id);

    return await this.findAll({
      page: Number(query.page) || 1,
      pageSize: Number(query.limit) || 10,
      where: { categoryId: categoryIds },
      include: [
        { model: Category, as: "category" },
        { model: Tag, as: "tags" },
      ],
      order: [["createdAt", "DESC"]],
    });
  }

  async getList({ page, limit, search, categorySlug }) {
    const whereCondition = {};

    if (search) {
      whereCondition[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        // { content: { [Op.like]: `%${search}%` } }
      ];
    }

    // 2. Xử lý logic Category: Tìm ID trước (Step 1)

    // console.log("categorySlug",categorySlug)
    if (categorySlug) {
      const category = await Category.findOne({
        where: { slug: `/${categorySlug}` },
        attributes: ['id'], // Chỉ lấy ID cho nhẹ
        raw: true
      });

      // console.log(" res",category)

      if (!category) {
        return {
          count: 0,
          rows: [],
        };
      }

      whereCondition.categoryId = category.id;
    }

    // console.log("whereCondition",whereCondition)
    const result = await this.findAll({
      page: Number(page) || 1,
      pageSize: Number(limit) || 10,
      where: whereCondition,
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["name", "slug"],
        },
        {
          model: Tag,
          as: "tags",
          attributes: ["name", "id"]
        }
      ],
      order: [["createdAt", "DESC"]],
    });

    return result;
  }

  async reviewPost(postId, { status, note, reviewerId = '123', ...otherData }) {
    // 1. Tìm bài viết kèm thông tin để trả về update UI ngay lập tức
    const post = await this.model.findByPk(postId, {
      include: [{ association: 'category' }, { association: 'tags' }]
    });

    if (!post) throw new Error('Không tìm thấy bài viết để thẩm định');

    // 2. Kiểm tra trạng thái hợp lệ
    const VALID_STATUSES = ['draft', 'pending', 'editing', 'approved', 'published', 'rejected', 'archived'];
    if (!VALID_STATUSES.includes(status)) {
      throw new Error('Trạng thái phê duyệt không hợp lệ');
    }

    // 3. Chuẩn bị dữ liệu cập nhật
    const updateData = {
      ...otherData, 
      status,
      reviewerId,
      moderationNote: note || post.moderationNote // Nếu duyệt nhanh không có note, giữ lại note cũ hoặc để mặc định bên dưới
    };

    // 4. Xử lý Logic ghi chú cho từng trạng thái (Tối ưu cho nút bấm nhanh)
    switch (status) {
      case 'published':
        // Khi xuất bản: Xóa sạch ghi chú để bài viết "sạch" khi ra công chúng
        updateData.moderationNote = null; 
        break;

      case 'editing':
      case 'rejected':
        // Đối với từ chối/yêu cầu sửa: Nếu bấm nhanh không có note thì gán nội dung mặc định
        if (!updateData.moderationNote) {
            updateData.moderationNote = status === 'rejected' ? 'Nội dung bị từ chối bởi quản trị viên' : 'Yêu cầu chỉnh sửa lại nội dung';
        }
        break;

      case 'approved':
        // Trạng thái trung gian (đã duyệt nhưng chưa đăng)
        if (!updateData.moderationNote) updateData.moderationNote = 'Nội dung đã được thông qua';
        break;
        
      case 'pending':
        updateData.moderationNote = 'Đang chờ thẩm định';
        break;
    }

    // 5. Thực hiện cập nhật
    // Lưu ý: Vì Model của bạn đã có beforeSave xử lý:
    // - Tự set/reset publishedAt
    // - Tự render HTML từ contentJson
    // Nên ở đây chúng ta chỉ cần gọi update là đủ.
    await post.update(updateData);

    return post;
  }


}

module.exports = new PostService();
