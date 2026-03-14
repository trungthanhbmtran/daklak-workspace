const { Banner } = require('../models');
const BaseService = require('./Base.service');

class bannerService extends BaseService {
    constructor() {
        super(Banner);
    }


}

module.exports = new bannerService();
