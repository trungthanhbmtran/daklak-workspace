const categoryService = require('../services/category.service');

class CategoryController { 
  constructor() {
    this.serviceName = 'CategoryService'; 
  }
  
  async CreateCategory(call, callback) {
    try {
      // console.log("call",call.request)
      const category = await categoryService.insertNode(call.request);
      callback(null, category);
    } catch (error) {
      callback(error);
    }
  }

  async GetCategory(call, callback) {
    try {
      const category = await categoryService.findById(call.request.id);
      callback(null, category);
    } catch (error) {
      callback(error);
    }
  }

  async GetCategorySubTree(call, callback) {
    try {
      const category = await categoryService.getSubTree(call.request.id);
      callback(null, { data: category });
    } catch (error) {
      callback(error);
    }
  }

  async ListCategories(call, callback) {
    try {
      const { mode , id } = call.request;

      // console.log("call.request", call.request)

      let result;

      switch (mode) {
        case "flat":
          result = await categoryService.getAllFlat();
          break;

        case "tree":
          result = await categoryService.getFullTree();
          break;

        case "subtree":
          result = await categoryService.getSubTree(id);
          break;

        case "forPost":
          result = await categoryService.getAllForPost();
          break;

        default:
          result = await categoryService.getAllFlat();
      }

      // console.log("result", result)

      callback(null, { data: result });

    } catch (error) {
      callback(error);
    }
  }

  async UpdateCategory(call, callback) {
    try {
      const result = await categoryService.update(call.request.id, call.request);
      callback(null, result);
    } catch (error) {
      callback(error);
    }
  }

  async DeleteCategory(call, callback) {
    try {
      await categoryService.delete(call.request.id);
      callback(null, { success: true });
    } catch (error) {
      callback(error);
    }
  }
}

module.exports = new CategoryController();
