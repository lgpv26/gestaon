const _ = require('lodash')
const Op = require('sequelize').Op
const Controller = require('../models/Controller')

module.exports = (server, restify) => {

    const productsController = require('./../controllers/products.controller')(server);

    return {

        setOrdersProducts: (controller) => {
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
                    
                    let ordersProductsData = []
                    _.first(resolvedProductPromisses).forEach((result) => {
                        
                        ordersProductsData.push({
                            id: (result.id) ? result.id : null,
                            orderId: parseInt(controller.request.orderId),
                            productId: parseInt(result.product.id),
                            quantity: (result.quantity) ? result.quantity : null,
                            unitPrice: (result.unitPrice) ? result.unitPrice : null,
                            unitDiscount: (result.unitDiscount) ? result.unitDiscount : null,
                            productES: (result.productES) ? result.productES : null
                        })
                    })                    

                    let ordersProductsPromisses = []

                    const ordersProductsControllerObj = new Controller({
                        request: {
                            companyId: controller.request.companyId,
                            orderId: controller.request.orderId,
                            data: ordersProductsData
                        },
                        transaction: controller.transaction
                    })
                    ordersProductsPromisses.push(saveInOrderProducts(ordersProductsControllerObj).then((response) => {
                        return response
                    }))

                    return Promise.all(ordersProductsPromisses).then((resultOrderProductsPromises) => {
                        let productsES = []
                        _.map(resultOrderProductsPromises, (result) => {
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

    
    function saveInOrderProducts(controller) {
        return new Promise((resolve, reject) => {
            return server.mysql.OrderProduct.destroy({
                where: {
                    orderId: parseInt(controller.request.orderId)
                },
                transaction: controller.transaction
            }).then(() => {
                return server.mysql.ClientAddress.bulkCreate(controller.request.data, {
                    updateOnDuplicate: ['productId', 'orderId', 'quantity', 'unitPrice', 'unitDiscount', 'dateUpdate', 'dateRemoved'],
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