const { Op } = require('sequelize');

class BaseService {
  constructor(model, cacheService = null) {
    this.model = model;
    this.cacheService = cacheService;
  }

  /* ================= CREATE ================= */
  async create(data, options = {}) {
    const result = await this.model.create(data, options);
    await this.clearCacheList();
    return result;
  }

  /* ================= FIND BY ID ================= */
  async findById(id, options = {}) {
    const cacheKey = `cache:${this.model.name.toLowerCase()}:${id}`;

    if (this.cacheService) {
      const cached = await this.cacheService.get(cacheKey);
      if (cached) return cached;
    }

    const item = await this.model.findByPk(id, options);
    if (!item) {
      const error = new Error(`${this.model.name} not found`);
      error.statusCode = 404;
      throw error;
    }

    if (this.cacheService) {
      await this.cacheService.set(cacheKey, item);
    }

    return item;
  }

  /* ================= UPDATE ================= */
  async update(id, data, options = {}) {
    const item = await this.findById(id);
    await item.update(data, options);

    await this.clearCacheItem(id);
    await this.clearCacheList();

    return item;
  }

  /* ================= DELETE ================= */
  async delete(id, options = {}) {
    const item = await this.findById(id);
    await item.destroy(options);

    await this.clearCacheItem(id);
    await this.clearCacheList();

    return true;
  }

  /* ================= LIST + PAGINATION ================= */
  async findAll({
    page = 1,
    pageSize = 10,
    search = '',
    where = {},
    order = [['createdAt', 'DESC']],
    include = []
  } = {}) {
    const limit = pageSize;
    const offset = (page - 1) * limit;

    /** 🔍 Search */
    if (search && Array.isArray(this.model.searchableFields)) {
      where = {
        ...where,
        [Op.or]: this.model.searchableFields.map(field => ({
          [field]: { [Op.like]: `%${search}%` }
        }))
      };
    }

    const { rows, count } = await this.model.findAndCountAll({
      where,
      limit,
      offset,
      order,
      include
    });

    const data = rows.map(item => item.get({ plain: true }));

    return {
      data: data,
      meta: {
        pagination: {
          total: count,
          page,
          pageSize: limit,
          totalPages: Math.ceil(count / limit)
        },
        search: search || undefined,
        sort: order
      }
    };
  }

  /* ================= CACHE ================= */
  async clearCacheItem(id) {
    if (!this.cacheService) return;
    const key = `cache:${this.model.name.toLowerCase()}:${id}`;
    await this.cacheService.del(key);
  }

  async clearCacheList() {
    if (!this.cacheService) return;
    await this.cacheService.delByPattern(
      `cache:${this.model.name.toLowerCase()}:list:*`
    );
  }
}

module.exports = BaseService;
