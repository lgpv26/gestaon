const _ = require('lodash')
const Op = require('sequelize').Op
const Controller = require('../models/Controller')

module.exports = (server, restify) => {

    const productsController = require('./../controllers/products.controller')(server);

    return {

        setRequestsProducts: (controller) => {
            return new Promise((resolve, reject) => {
                let productsResolverPromisses = []
                let setData = _.cloneDeep(controller.request.data)

                const productsControllerObj = new Controller({
                    request: {
                        companyId: controller.request.companyId,
                        data: setData
                    },
                    transaction: controller.transaction
                })

                productsResolverPromisses.push(productsController.saveProducts(productsControllerObj).then((response) => {
                    return response
                }))

                return Promise.all(productsResolverPromisses).then((resolvedProductPromisses) => {
                    
                    let requestsProductsData = []
                    _.first(resolvedProductPromisses).forEach((result) => {
                        requestsProductsData.push({
                            id: (result.id) ? result.id : null,
                            requestId: parseInt(controller.request.requestId),
                            productId: parseInt(result.product.id),
                            quantity: (result.quantity) ? result.quantity : null,
                            unitPrice: (result.unitPrice) ? result.unitPrice : null,
                            unitDiscount: (result.unitDiscount) ? result.unitDiscount : null,
                            productES: (result.productES) ? result.productES : null
                        })
                    })                    

                    let requestsProductsPromisses = []

                    const requestsProductsControllerObj = new Controller({
                        request: {
                            companyId: controller.request.companyId,
                            requestId: controller.request.requestId,
                            data: requestsProductsData
                        },
                        transaction: controller.transaction
                    })
                    requestsProductsPromisses.push(saveInRequestProducts(requestsProductsControllerObj).then((response) => {
                        return response
                    }))

                    return Promise.all(requestsProductsPromisses).then((resultRequestProductsPromises) => {
                        let productsES = []
                        _.map(resultRequestProductsPromises, (result) => {
                            productsES.push(result.productsES) 
                        })
                        resolve({productsES: _.first(productsES)})
                    }).catch((err) => {
                        //console.log(err)
                        reject(err)
                    })
                }).catch((err) => {
                    reject(err)
                })
            })         
        },

    }

    
    function saveInRequestProducts(controller) {
        return new Promise((resolve, reject) => {
            return server.mysql.RequestProduct.destroy({
                where: {
                    requestId: parseInt(controller.request.requestId)
                },
                transaction: controller.transaction
            }).then(() => {
                return server.mysql.RequestProduct.bulkCreate(controller.request.data, {
                    updateOnDuplicate: ['requestId', 'productId', 'quantity', 'unitPrice', 'unitDiscount', 'dateUpdate', 'dateRemoved'],
                    returning: true,
                    transaction: controller.transaction
                }).then((response) => {
                    if (!response) {
                        reject(new restify.ResourceNotFoundError("Registro não encontrado."));
                    }

                    let productsES = []
                    controller.request.data.forEach((value) => {
                        if(_.has(value, 'productES') && value.productES){
                            productsES.push(value.productES) 
                        }
                    })

                    resolve({productsES: productsES});
                })

            }).catch((error) => {
                reject(error);
            })
        }).then((response) => {
            return response
        }).catch((error) => {
            return error
        })
    }
}