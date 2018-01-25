const fs = require('fs'),
    _ = require('lodash');

module.exports = function(server, Sequelize, sequelize){

    let mysqlModels = {};
    let modelFiles = [
        "CompanyUser.js","CompanyUserPermission.js","CompanyUserInvitation.js","CompanySetting.js","Company.js","User.js",
        "Client.js","Product.js",
        "ClientAddress.js","Address.js",
        "ClientPhone.js","Device.js", "DeviceSetting.js",
        "UserAccessToken.js","UserRefreshToken.js",
        "Request.js","Order.js","OrderProduct.js", "Supplier.js", 
        "SupplierProduct.js", "SupplierCompany.js",
        "CustomField.js", "ClientCustomField.js", "ClientGroup.js",
        "RequestClientAddress.js", "RequestClientPhone"
    ];

    modelFiles.forEach(function(fileName) {
        // Ignore this file and invalid ones
        if(fileName == 'index.js' || fileName.substr(0, 1) == '.') {
            return
        }
        const model = require('./' + fileName).defineModel(Sequelize, sequelize);
        let newModel = {};
        newModel[model.name] = model.instance;
        _.assign(mysqlModels, newModel);
    });

    _.forOwn(mysqlModels, function(model, modelName){
        require('./' + modelName).postSettings(mysqlModels);
    });

    _.forOwn(mysqlModels, function(model, modelName){
        if(_.hasIn(require('./' + modelName), 'afterPostSettings')){
            require('./' + modelName).afterPostSettings(mysqlModels, server);
        }
    });

    return mysqlModels;
};
