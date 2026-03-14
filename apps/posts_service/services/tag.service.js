const BaseService = require('./Base.service');
const { Tag } = require('../models');
// const { CacheService } = require('../utils/cache.service');
// const cacheService = new CacheService('redis://localhost:6379');

class TagService extends BaseService {
  constructor() {
    super(Tag);
  }

  // Custom logic (nếu có)
  // async publishPost(id) {
  //   const post = await this.findById(id);
  //   post.status = 'published';
  //   await post.save();
  //   return post;
  // }

}

module.exports = new TagService();
