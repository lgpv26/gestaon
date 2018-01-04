const fs = require('fs'),
    _ = require('lodash');

module.exports = function(mongoose){
    let tMongodbModels = [];
    let mongodbModels = {};
    let modelFiles = [
        "Device.js", "Position.js", "Service.js", "Geofence.js", "Event.js", "Draft.js",
        "Section.js", "Card.js"
    ];
    const filesInDirectory = fs.readdirSync(__dirname);
    modelFiles.forEach(function(fileName) {
        // Ignore this file and invalid ones
        if(fileName == 'index.js' || fileName.substr(0, 1) == '.') {
            return
        }
        let model = require('./' + fileName).defineModel(mongoose);
        tMongodbModels.push(model);
    });
    tMongodbModels.forEach(function(tModel){
        let newModel = {};
        let model = require('./' + tModel.name).postSettings(mongoose, tModel);
        newModel[model.name] = model.instance;
        _.assign(mongodbModels, newModel);
    });
    return mongodbModels;
};
