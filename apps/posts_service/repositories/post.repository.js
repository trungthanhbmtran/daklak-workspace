const { Post, Variable } = require('../models');

class PostRepository {
  async create(data) {
    return await Post.create(data);
  }

  async findById(id) {
    return await Post.findByPk(id, { include: { all: true } });
  }

  async update(post, data) {
    return await post.update(data);
  }

  async delete(post) {
    return await post.destroy();
  }

  async findAndCountAll({ where, offset, limit }) {
    return await Post.findAndCountAll({ where, offset, limit, order: [['createdAt', 'DESC']] });
  }

  async addTags(post, tagIds) {
    return await post.addTags(tagIds);
  }

  async removeTags(post, tagIds) {
    return await post.removeTags(tagIds);
  }

  async addCategory(post, categoryId) {
    return await post.addCategory(categoryId);
  }

  async removeCategory(post, categoryId) {
    return await post.removeCategory(categoryId);
  }
}

module.exports = new PostRepository();
