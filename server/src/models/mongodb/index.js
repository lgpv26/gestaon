import mongoose from 'mongoose'

const fs = require('fs'),
    path = require('path'),
    _ = require('lodash')

module.exports = function(server){

    let tMongodbModels = []
    let mongodbModels = {}

    const allModelFiles = fs.readdirSync(path.join(__dirname, '/')).filter((fileName) => {
        return fileName !== 'index.js'
    })

    allModelFiles.forEach(function(fileName) {
        // Ignore this file and invalid ones
        let model = require('./' + fileName).defineModel(mongoose)
        tMongodbModels.push(model)
    })

    tMongodbModels.forEach(function(tModel){
        let newModel = {}
        let model = require('./' + tModel.name).postSettings(mongoose, tModel, tMongodbModels)
        newModel[model.name] = model.instance
        _.assign(mongodbModels, newModel)
    })

    return mongodbModels

}