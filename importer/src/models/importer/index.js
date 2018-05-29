const fs = require('fs'),
    path = require('path'),
    _ = require('lodash');

module.exports = function(server){

    let importerModels = {};

    const allModelFiles = fs.readdirSync(path.join(__dirname, '/')).filter((fileName) => {
        return fileName !== 'index.js'
    })

    allModelFiles.forEach(function(fileName) {
        const model = require('./' + fileName).defineModel(server)
        let newModel = {}
        newModel[model.name] = model.instance
        _.assign(importerModels, newModel)
    });

    _.forOwn(importerModels, function(model, modelName){
        require('./' + modelName).postSettings(importerModels)
    });

    _.forOwn(importerModels, function(model, modelName){
        if(_.hasIn(require('./' + modelName), 'afterPostSettings')){
            require('./' + modelName).afterPostSettings(importerModels, server)
        }
    });

    return importerModels

};
