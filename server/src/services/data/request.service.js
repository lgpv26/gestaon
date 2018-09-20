import _ from 'lodash'
import moment from 'moment'
const Op = require('sequelize').Op

module.exports = (server) => {
     return {
        name: "data/request",
        actions: {

            start(ctx){
                const vm = this
                const companyId = ctx.params.data.companyId
                const userId = ctx.params.data.userId
                    return server.sequelize.transaction((transaction) => {
                        return new Promise((resolve, reject) => {
                            async function start() {
                                    try{
                                        let oldRequest = null
                                        const data = await vm.checkTempIds(ctx.params.data)
                                        if(data.id) oldRequest = await vm.oldRequest(data, companyId)

                                        const client = await vm.checkClient(
                                            data.client || null,
                                            transaction,
                                            companyId)
                                        
                                        const requestOrder = await vm.checkRequestOrder(
                                            data.requestOrder || null,
                                            transaction,
                                            companyId)

                                        const task = null

                                        const request = await vm.saveRequest(
                                            {
                                                id: _.get(data, 'id', null),
                                                companyId,
                                                clientId: _.get(client, 'id', null),
                                                requestOrderId: _.get(requestOrder, 'id', null),
                                                taskId: _.get(task, 'id', null),
                                                userId: (data.responsibleUserId) ? data.responsibleUserId : userId,
                                                deliveryDate: (data.deliveryDate) ? moment(data.deliveryDate) : (!data.id) ? moment().add(20, 'm') : (!oldRequest.isScheduled) ? oldRequest.deliveryDate : moment().add(20, 'm'),
                                                isScheduled: !!data.deliveryDate,
                                                phoneLine: (data.phoneLine) ? data.phoneLine : null,
                                                obs: (data.obs) ? data.obs : null,
                                                status: (data.status) ? (_.get(client, 'id', null)) ? data.status : (data.status === 'finished' || data.status === 'canceled') ? data.status : 'finished' : (_.get(client, 'id', null)) ? 'pending' : 'finished',
                                                tempId: _.get(data, 'tempId', null)
                                            },
                                            transaction)

                                        const timeline = await vm.createTimeline({
                                            requestId: _.get(request, 'id', null),
                                            triggeredBy: userId,
                                            companyId: companyId,
                                            action: (data.id) ? 'update' : 'create',
                                            userId: (data.responsibleUserId) ? data.responsibleUserId : userId,
                                            status: (data.status) ? (_.get(client, 'id', null)) ? data.status : data.status : (_.get(client, 'id', null)) ? 'pending' : 'finished'
                                        },
                                        transaction)

                                        resolve(request)
/*
                                        const requestPayments = await vm.checkRequestPayments(
                                            data,
                                            request,
                                            oldRequest,
                                            companyId,
                                            userId,
                                            transaction
                                        )

                                        console.log(requestPayments)
                  /*                      

                                        //console.log(ctx.params.data)

                                        /*
                                        const teste = await vm.createRequest({
                                            companyId: 1,
                                            userId: 2
                                        }, transaction) 
                                        */

                                        // console.log(teste)
                                       // resolve(teste)

                                        
                                    }
                                    catch(err) {
                                        console.log('try catch do request')
                                        reject(err)
                                    }
                            }
                        start() 
                    })   
                })             
                .then((result) => {
                    //console.log(result)
                    return Promise.resolve(result)
                })
                .catch((err) => {
                    console.log('catch transaction')
                    return Promise.reject(err)
                })               
            

        }

        },
        methods: {
            checkTempIds(data){
                let removeTemps = []

                if(_.has(data, "requestOrder") && _.has(data, "requestOrder.requestOrderProducts")){
                    removeTemps.push(this.removeArrayTempIds(data, "requestOrder.requestOrderProducts")
                        .then((orderProducts) => {
                            _.set(data, "requestOrder.requestOrderProducts", orderProducts)
                        })
                    )
                }
                if(_.has(data, "requestPayments")){
                    removeTemps.push(this.removeArrayTempIds(data, "requestPayments")
                        .then((requestPayments) => {
                            _.set(data, "requestPayments", requestPayments)
                        })
                    )
                }

                return Promise.all(removeTemps).then(() => {
                    const id = _.get(data, 'id', false)
                    if((typeof id == 'string') && id.substring(0,4) === "tmp/") {
                        _.set(data, 'tempId', id)
                        _.set(data, 'id', null)
                    }

                    return Promise.resolve(data)
                })
            },
            removeArrayTempIds(data, path){
                let newValue = []
                const promises = []
                _.map(_.get(data, path), (obj) => {
                    promises.push(new Promise((resolve, reject) => {
                        if(_.get(obj, 'id', false) && !_.isNumber(obj.id) && obj.id.substring(0,4) === "tmp/"){
                            obj.tempId = obj.id
                            obj.id = null              
                        }
                        newValue.push(obj)
                        resolve()
                    }))
                })
                return Promise.all(promises)
                .then(() => {
                    return newValue
                })                
            },      
            consultRequest(data, companyId){
                return server.mysql.Request.findOne({
                    where: {
                        id: data.id,
                        companyId
                    },
                    include: [{
                        model: server.mysql.RequestTimeline,
                        as: "requestTimeline",
                        include: [{
                            model: server.mysql.User,
                            as: "triggeredByUser",
                        },{
                            model: server.mysql.User,
                            as: "user",
                        }]
                    },
                    {
                        model: server.mysql.RequestClientPhone,
                        as: "requestClientPhones",
                        include: [{
                            model: server.mysql.ClientPhone,
                            as: "clientPhone",
                        }]
                    },{
                        model: server.mysql.RequestClientAddress,
                        as: "requestClientAddresses",
                        include: [{
                            model: server.mysql.ClientAddress,
                            as: "clientAddress",
                            include:[{
                                model: server.mysql.Address,
                                as: "address"
                            }]
                        }]
                    },{
                        model: server.mysql.Client,
                        as: "client",
                        include: [{
                            model: server.mysql.ClientPhone,
                            as: 'clientPhones'
                        }, {
                            model: server.mysql.ClientAddress,
                            as: 'clientAddresses',
                            include: [{
                                model: server.mysql.Address,
                                as: 'address'
                            }]
                        }, {
                            model: server.mysql.ClientCustomField,
                            as: 'clientCustomFields',
                            include: [{
                                model: server.mysql.CustomField,
                                as: 'customField'
                            }]
                        }, {
                            model: server.mysql.ClientGroup,
                            as: 'clientGroup'
                        }]
                    },{
                        model: server.mysql.RequestOrder,
                        as: "requestOrder",
                        include: [{
                            model: server.mysql.RequestOrderProduct,
                            as: 'requestOrderProducts',
                            include: [{
                                model: server.mysql.Product,
                                as: 'product'
                            }]
                        }]
                    },{
                        model: server.mysql.RequestPayment,
                        as: "requestPayments",
                        include: [{
                            model: server.mysql.PaymentMethod,
                            as: 'paymentMethod'
                        },{
                            model: server.mysql.RequestPaymentTransaction,
                            as: 'requestPaymentTransactions',
                            include: [{
                                model: server.mysql.Transaction,
                                as: 'transaction'
                            }]
                        }, {
                            model: server.mysql.RequestPaymentBill,
                            as: 'requestPaymentBills',
                            include: [{
                                model: server.mysql.RequestPaymentBillPayment,
                                as: 'requestPaymentBillPayments'
                            }]
                        }]
                    }]
                }).then((request) => {
                    return JSON.parse(JSON.stringify(request))
                })
            },
            checkClient(data, transaction, companyId){
                if(!data) return Promise.resolve(null)
                if((data.name === '' || data.name === null) && !data.id) return Promise.resolve(null)
                return server.broker.call('data/client.start', {
                    data,
                    companyId,
                    transaction
                })
            },
            checkRequestOrder(data, transaction, companyId){
                if(!data) return Promise.resolve(null)
                return server.broker.call('data/request-order.start', {
                    data,
                    companyId,
                    transaction
                })
            },
            saveRequest(data, transaction){
                if (data.id) { // update request      
                    return server.mysql.Request.update(data, {
                        where: {
                            id: data.id,
                            companyId: data.companyId
                        },
                        transaction
                    }).then((updated) => {
                        if (parseInt(_.toString(updated)) < 1 ) {
                            console.log("Nenhum registro encontrado. Update.")
                            return Promise.reject('Erro ao atualizar o pedido (geral).')
                        }
                        return server.mysql.Request.findById(ctx.params.data.id, {transaction})
                        .then((request) => {
                            return JSON.parse(JSON.stringify(request))
                        })
                    })
                }
                else { // create request
                    return server.mysql.Request.create(data, {transaction})
                    .then((request) => {
                        if (!request) return Promise.reject('Erro ao cadastrar o Request!')
                        return _.assign(JSON.parse(JSON.stringify(request)), {tempId: data.tempId})
                    }).catch((err) => {
                        console.log(err, "Erro em: data/request.create")
                        return Promise.reject('Erro ao criar o pedido.')
                    })
                }
            },  
            createTimeline(data, transaction){
                return server.mysql.RequestTimeline.create(data, {transaction})
                    .then((response) => {
                        return JSON.parse(JSON.stringify(response))
                    }).catch((err) => {
                        console.log("Erro em: data/request.createTimeline")
                        return Promise.reject(err)
                    }) 
            },
            checkRequestPayments(data, request, oldRequest, companyId, userId, transaction){
                if(!_.has(data, 'requestPayments')) return Promise.resolve(null)
                return server.broker.call('data/request-payments.start', {
                    data: data.requestPayments,
                    request,
                    oldRequest,
                    companyId,
                    userId,
                    transaction
                })
            }
        }
    }
}