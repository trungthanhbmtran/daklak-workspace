const tagService = require('../services/tag.service');

class TagController {
  constructor() {
    this.serviceName = 'TagService'; 
  }

  async CreateTag(call, callback) {
    try {
      // console.log("CreateTag called with request:", call.request);
      const tag = await tagService.create(call.request);
      console.log("Tag created:", tag);
      callback(null, { success: true, message: "Tag created successfully" });
    } catch (error) {
      callback(error);
    }
  }

  async GetTag(call, callback) {
    try {
      const tag = await tagService.findById(call.request.id);
      callback(null, tag);
    } catch (error) {
      callback(error);
    }
  }

  async ListTags(call, callback) {
    try {
      const result = await tagService.findAll(call.request);
      console.log("result", result)
      callback(null, result);
    } catch (error) {
      callback(error);
    }
  }

  async UpdateTag(call, callback) {
    try {
      const result = await tagService.update(call.request.id, call.request);
      callback(null, result);
    } catch (error) {
      callback(error);
    }
  }

  async DeleteTag(call, callback) {
    try {
      await tagService.delete(call.request.id);
      callback(null, { success: true });
    } catch (error) {
      callback(error);
    }
  }

}

module.exports = new TagController();
