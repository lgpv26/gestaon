const fs = require('fs'),
    _ = require('lodash');

module.exports = function(){
    let tMongodbModels = [];
    let mongodbModels = {};
    let modelFiles = [
        "Accounts.js", "Expense.js", "Request.js"
    ];
    const filesInDirectory = fs.readdirSync(__dirname);
    modelFiles.forEach(function(fileName) {
        // Ignore this file and invalid ones
        if(fileName == 'index.js' || fileName.substr(0, 1) == '.') {
            return
        }
        mongodbModels[_.replace(fileName,'.js', '')] = require('./' + fileName)
    });
    return mongodbModels;
};
