const fs = require("fs");
const path = require("path");

function loadControllers(controllersDir) {
    const controllers = {};
    fs.readdirSync(controllersDir)
      .filter(file => file.endsWith('.js'))
      .forEach(file => {
        const controllerFileName = path.basename(file, '.js');
        const controllerName = controllerFileName.charAt(0).toUpperCase() + controllerFileName.slice(1) + 'Service';
        const controllerPath = path.join(controllersDir, file);
        controllers[controllerName] = require(controllerPath);
      });
  
    return controllers;
  }

  module.exports = {loadControllers}