const fs = require('fs'),
    path = require('path'),
    _ = require('lodash')

module.exports = function(server){

    let draftFormModels = {}

    const allModelFiles = fs.readdirSync(path.join(__dirname, '/')).filter((fileName) => {
        return fileName !== 'index.js'
    })

    allModelFiles.forEach(function(fileName) {
        // Ignore this file and invalid ones
        if(fileName === 'index.js' || fileName.substr(0, 1) === '.') {
            return
        }
        draftFormModels[_.replace(fileName,'.js', '')] = require('./' + fileName)
    })

    return draftFormModels

}
