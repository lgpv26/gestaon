const fs = require('fs'),
    path = require('path'),
    _ = require('lodash');

module.exports = function(server){

    let mysqlModels = {};

    /*let modelFiles = [
        "CompanyUser.js","CompanyUserPermission.js","CompanyUserInvitation.js","CompanySetting.js","Company.js","User.js",
        "Client.js","Product.js",
        "ClientAddress.js","Address.js",
        "ClientPhone.js","Device.js", "DeviceSetting.js",
        "UserAccessToken.js","UserRefreshToken.js",
        "Request.js","Order.js","OrderProduct.js", "Supplier.js",
        "SupplierProduct.js", "SupplierCompany.js", "SupplierCustomField.js",
        "SupplierAddress.js", "SupplierPhone.js",
        "CustomField.js", "ClientCustomField.js", "ClientGroup.js",
        "RequestClientAddress.js", "RequestClientPhone.js", "RequestTimeline.js",
        "RevenueGroup.js", "RevenueItem.js", "ExpenseGroup.js", "ExpenseItem.js",
        "PaymentMethod.js"
    ];*/

    const allModelFiles = fs.readdirSync(path.join(__dirname, '/')).filter((fileName) => {
        if(fileName !== 'index.js'){
            return true
        }
        return false
    })

    allModelFiles.forEach(function(fileName) {
        const model = require('./' + fileName).defineModel(server)
        let newModel = {}
        newModel[model.name] = model.instance
        _.assign(mysqlModels, newModel)
    });

    _.forOwn(mysqlModels, function(model, modelName){
        require('./' + modelName).postSettings(mysqlModels)
    });

    _.forOwn(mysqlModels, function(model, modelName){
        if(_.hasIn(require('./' + modelName), 'afterPostSettings')){
            require('./' + modelName).afterPostSettings(mysqlModels, server)
        }
    });

    return mysqlModels

};
