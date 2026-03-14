const NestedSetService = require('./NestedSet.service');
const { Category, Post } = require('../models');
const { Op } = require('sequelize');

class CategoryService extends NestedSetService {
    constructor() {
        super(Category);
    }

    // ======================
    // Create category
    // ======================
    async createCategory(data) {
        return this.insertNode(data);
    }

    // ======================
    // Update category + move parent nếu cần
    // ======================
    async updateCategory(id, data) {
        const category = await this.findById(id);
        if (!category) throw new Error("Category not found");

        const { parentId, ...rest } = data;

        if (parentId && parentId !== category.parentId) {
            await this.moveNode(id, parentId);
        }

        await category.update(rest);
        return category;
    }

    // ======================
    // Delete category
    // ======================
    async deleteCategory(id) {
        return this.deleteWithDescendants(id);
    }

    // ======================
    // Count posts in category
    // ======================
    async countPostsInCategory(categoryId) {
        return Post.count({ where: { categoryId } });
    }

    // ======================
    // Get tree for frontend (flat / full tree / forPost)
    // ======================
    async getAllFlat() {
        return this.getTree({}, { raw: true });
    }

    async getFullTree() {
        const rows = await this.getTree();
        // console.log("rows",rows)
        const tree = this.buildTree(rows);
        // console.log("tree",tree)
        return tree;
    }

    async getAllForPost() {
        return this.getTree({ status: true }, { raw: true });
    }

    // ======================
    // Get options for select dropdown (business logic)
    // ======================
    async getForSelect({ search = '', limit = 200 } = {}) {
        const where = search ? { name: { [Op.like]: `%${search}%` } } : undefined;
        const rows = await this.model.findAll({
            where,
            order: [['lft', 'ASC']],
            limit,
            attributes: ['id', 'name', 'slug', 'parentId', 'depth']
        });

        return rows.map(c => ({
            id: c.id,
            name: `${'— '.repeat(c.depth)}${c.name}`,
            slug: c.slug,
            parentId: c.parentId,
            depth: c.depth
        }));
    }
}

module.exports = new CategoryService();
