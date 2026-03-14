const { Op } = require('sequelize');
const BaseService = require('./Base.service');

class NestedSetService extends BaseService {
    constructor(model) {
        super(model);
    }

    /**
     * Tạo node mới dưới parentId (hoặc root nếu không có)
     */
    async insertNode(data) {
        const { parentId, ...rest } = data;
        // console.log("Data",data)

        const sequelize = this.model.sequelize;

        return await sequelize.transaction(async (t) => {
            let lft, rgt, depth;

            if (parentId) {
                const parent = await this.findById(parentId);
                if (!parent) throw new Error('Parent node not found');

                lft = parent.rgt;
                rgt = parent.rgt + 1;
                depth = parent.depth + 1;

                await this.model.increment('rgt', {
                    by: 2,
                    where: { rgt: { [Op.gte]: lft } },
                    transaction: t
                });

                await this.model.increment('lft', {
                    by: 2,
                    where: { lft: { [Op.gt]: lft } },
                    transaction: t
                });
            } else {
                const maxRgt = (await this.model.max('rgt', { transaction: t })) || 0;
                lft = maxRgt + 1;
                rgt = maxRgt + 2;
                depth = 0;
            }
            // console.log("chay toi day chua", parentId,lft,rgt,depth,rest)

            const node = await this.create({
                ...rest,
                parentId: `${parentId}` || null,
                lft,
                rgt,
                depth,
            }, { transaction: t });
            // console.log("node",node)
            return node;
        });
    }

    /**
     * Lấy toàn bộ cây (dạng phẳng hoặc dạng tree nếu cần)
     */
    async getTree(where = {}, options = {}) {
        const nodes = await this.model.findAll({
            where,
            order: [['lft', 'ASC']],
            ...options,
        });
        return nodes;
    }

    /**
     * Lấy toàn bộ descendants (con cháu) của 1 node
     */
    async getDescendants(id) {
        const node = await this.findById(id);
        return this.model.findAll({
            where: {
                lft: { [Op.gt]: node.lft },
                rgt: { [Op.lt]: node.rgt }
            },
            order: [['lft', 'ASC']]
        });
    }

    /**
     * Lấy toàn bộ ancestors (cha ông) của 1 node
     */
    async getAncestors(id) {
        const node = await this.findById(id);
        return this.model.findAll({
            where: {
                lft: { [Op.lt]: node.lft },
                rgt: { [Op.gt]: node.rgt }
            },
            order: [['lft', 'ASC']]
        });
    }

    /**
     * Xóa node và toàn bộ descendants
     */
    async deleteWithDescendants(id) {
        const sequelize = this.model.sequelize;
        return await sequelize.transaction(async (t) => {
            const node = await this.findById(id);
            const width = node.rgt - node.lft + 1;

            // Xoá toàn bộ node trong cây con
            await this.model.destroy({
                where: {
                    lft: { [Op.gte]: node.lft },
                    rgt: { [Op.lte]: node.rgt }
                },
                transaction: t
            });

            // Cập nhật lại các node còn lại
            await this.model.increment('lft', {
                by: -width,
                where: { lft: { [Op.gt]: node.rgt } },
                transaction: t
            });

            await this.model.increment('rgt', {
                by: -width,
                where: { rgt: { [Op.gt]: node.rgt } },
                transaction: t
            });

            return { success: true };
        });
    }

    /**
     * Di chuyển node đến 1 parent mới
     */
    async moveNode(id, newParentId) {
        const sequelize = this.model.sequelize;

        return await sequelize.transaction(async (t) => {
            const node = await this.findById(id);
            const newParent = newParentId ? await this.findById(newParentId) : null;

            if (!node) throw new Error('Node not found');
            if (newParentId && !newParent) throw new Error('New parent not found');

            // Không cho di chuyển vào chính nó hoặc con cháu của nó
            if (newParent && newParent.lft > node.lft && newParent.rgt < node.rgt) {
                throw new Error('Cannot move into own descendant');
            }

            const subtreeWidth = node.rgt - node.lft + 1;
            const oldLft = node.lft;

            // Xoá tạm vị trí của subtree bằng cách "chừa chỗ"
            await this.model.update({
                lft: sequelize.literal(`lft * -1`),
                rgt: sequelize.literal(`rgt * -1`)
            }, {
                where: {
                    lft: { [Op.gte]: node.lft },
                    rgt: { [Op.lte]: node.rgt }
                },
                transaction: t
            });

            // Cập nhật khoảng trống (thu hẹp vùng cây cũ)
            await this.model.increment('lft', {
                by: -subtreeWidth,
                where: { lft: { [Op.gt]: node.rgt } },
                transaction: t
            });
            await this.model.increment('rgt', {
                by: -subtreeWidth,
                where: { rgt: { [Op.gt]: node.rgt } },
                transaction: t
            });

            // Xác định vị trí mới để chèn subtree vào
            const targetRgt = newParent ? newParent.rgt : (await this.model.max('rgt', { transaction: t })) + 1;

            await this.model.increment('lft', {
                by: subtreeWidth,
                where: { lft: { [Op.gte]: targetRgt } },
                transaction: t
            });
            await this.model.increment('rgt', {
                by: subtreeWidth,
                where: { rgt: { [Op.gte]: targetRgt } },
                transaction: t
            });

            // Tính offset dịch chuyển
            const offset = targetRgt - oldLft;
            const depthDiff = (newParent ? newParent.depth + 1 : 0) - node.depth;

            // Di chuyển subtree sang vị trí mới
            await this.model.update({
                lft: sequelize.literal(`-lft + ${offset}`),
                rgt: sequelize.literal(`-rgt + ${offset}`),
                depth: sequelize.literal(`depth + ${depthDiff}`),
                parentId: newParentId || null
            }, {
                where: {
                    lft: { [Op.lte]: -node.lft },
                    rgt: { [Op.lte]: -node.rgt }
                },
                transaction: t
            });

            return { success: true };
        });
    }

    buildTree(nodes) {
        const map = {};
        const roots = [];

        nodes.forEach(n => {
            map[n.id] = { ...n.get({ plain: true }), children: [] };
        });

        nodes.forEach(n => {
            const node = map[n.id];
            if (node.parentId && map[node.parentId]) {
                map[node.parentId].children.push(node);
            } else {
                roots.push(node);
            }
        });

        return roots;
    }

    async getSubTree(id) {
        // console.log("id",id)
        const root = await this.findById(id);
        // console.log("root",root)
        if (!root) throw new Error("Category not found");

        const nodes = await this.model.findAll({
            where: {
                lft: { [Op.gte]: root.lft },
                rgt: { [Op.lte]: root.rgt }
            },
            order: [['lft', 'ASC']]
        });

        return this.buildTree(nodes);
    }

  

}

module.exports = NestedSetService;
