const bannerService = require('../services/banner.service');

class BannerController {
  constructor() {
    this.serviceName = 'BannerService'; 
  }

  async CreateBanner(call, callback) {
    try {
      // console.log("call",call.request)
      const banner = await bannerService.create(call.request);
      // console.log("banner",banner)
      callback(null, { success: true, data: banner });
    } catch (error) {
      callback(error);
    }
  }

  async ListBanners(call, callback) {
    try {
      const banner = await bannerService.findAll(call.request);
      // console.log("banner",banner)
      callback(null, banner);
    } catch (error) {
      callback(error);
    }
  }
  
  async GetBanner(call, callback) {
    try {
      const banner = await bannerService.findById(call.request);
      // console.log("banner",banner)
      callback(null, { success: true, data: post });
    } catch (error) {
      callback(error);
    }
  }

  async UpdateBanner(call, callback) {
    try {
      const banner = await bannerService.update(call.request);
      console.log("banner",banner)
      callback(null, { success: true, data: post });
    } catch (error) {
      callback(error);
    }
  }

  async DeleteBanner(call, callback) {
    try {
      const banner = await bannerService.delete(call.request);
      console.log("banner",banner)
      callback(null, { success: true, data: post });
    } catch (error) {
      callback(error);
    }
  }
}

module.exports = new BannerController();
