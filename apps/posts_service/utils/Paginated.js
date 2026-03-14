
const createError = require("http-errors");

const getPaginatedData = async (
    model,
    {
        page = 1,
        pageSize = 2,
        ...props // Specify the attributes parameter
    }
) => {
    // console.log('props',props)
    try {
        const offset = (page - 1) * pageSize;
        const limit = parseInt(pageSize);

        const { rows, count } = await model.findAndCountAll({
            ...props,
            offset,
            limit,
        });

        const totalPages = Math.ceil(count / pageSize);
        const currentPage = Math.min(Math.max(page, 1), totalPages);

        return {
            totalItems: count,
            startItems : offset + 1,
            endItems : Math.min(offset + limit, count),
            totalPages,
            currentPage,
            pageSize,
            data: rows,
        };
    } catch (error) {
        throw createError.InternalServerError(`Error: ${error.message}`);
    }
};

module.exports = { getPaginatedData };
