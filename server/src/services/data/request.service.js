import _ from 'lodash'
import moment from 'moment'
import { POINT_CONVERSION_COMPRESSED } from 'constants';
const Op = require('sequelize').Op

module.exports = (server) => {
     return {
        name: "data/request",
        actions: {

            start(ctx){
                //console.log(' REQUEST',ctx.params)
                const vm = this
                const companyId = ctx.params.data.companyId
                const userId = ctx.params.data.userId
                    return server.sequelize.transaction((transaction) => {
                        return new Promise((resolve, reject) => {
                            async function start() {
                                    try{
                                        let oldRequest = null
                                        const data = await vm.checkTempIds(ctx.params.data)
                                        if(data.id) oldRequest = await vm.consultRequest(data, companyId)     
                                        
                                    
                                        const client = await vm.checkClient(
                                            data.client || null,
                                            { request: data},
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
                                                status: (data.status && data.status !== "processing" && data.status !== "draft") ? (_.get(client, 'id', null)) ? data.status : (data.status === 'finished' || data.status === 'canceled') ? data.status : 'finished' : (_.get(client, 'id', null)) ? 'pending' : 'finished',
                                                tmpId: _.get(data, 'tmpId', null)
                                            },
                                            transaction)

                                        const requestTimeline = await vm.createTimeline({
                                            requestId: _.get(request, 'id', null),
                                            triggeredBy: userId,
                                            companyId: companyId,
                                            action: (data.id) ? 'update' : 'create',
                                            userId: (data.responsibleUserId) ? data.responsibleUserId : userId,
                                            status: (data.status && data.status !== "processing" && data.status !== "draft") ? (_.get(client, 'id', null)) ? data.status : data.status : (_.get(client, 'id', null)) ? 'pending' : 'finished'
                                        },
                                        transaction)

                                        const requestPayments = await vm.checkRequestPayments(
                                            data,
                                            request,
                                            userId,
                                            transaction
                                        )

                                        const requestDetails = await vm.checkRequestDetails(
                                            data,
                                            request,
                                            client,
                                            userId,
                                            transaction
                                        )

                                        await vm.dashboard(request, client, oldRequest, companyId, transaction)


                                        if (request.status === 'pending' && request.userId) {
                                            await vm.pushNotification(request)
                                        }

                                        return resolve(
                                            _.assign(
                                                request,
                                                {client},
                                                {requestOrder},
                                                {requestTimeline},
                                                {requestPayments},
                                                requestDetails
                                            )
                                        )
                                        
                                    }
                                    catch(err) {
                                        console.log(err, 'try catch do request')
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
        },

        getOne(ctx) {
            return server.mysql.Request.findOne({
                where: ctx.params.where || {},
                include: ctx.params.include || []
            }).then((request) => {
                return JSON.parse(JSON.stringify(request))
            })
        },
        /**
         * @param {Object} where, {Array} include
         * @returns {Promise.<Array>} requests
         */
        getList(ctx){
            return server.mysql.Request.findAll({
                where: ctx.params.where || {},
                include: ctx.params.include || []
            })
        },

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
                        _.set(data, 'tmpId', id)
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
                            obj.tmpId = obj.id
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
            checkClient(data, dataRequest, transaction, companyId){
                if(!data) return Promise.resolve(null)
                if((data.name === '' || data.name === null) && !data.id) return Promise.resolve(null)
                const request = dataRequest.request
                return server.broker.call('data/client.start', {
                    data,
                    request,
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
                        return server.mysql.Request.findById(data.id, {transaction})
                        .then((request) => {
                            return JSON.parse(JSON.stringify(request))
                        })
                    })
                }
                else { // create request
                    return server.mysql.Request.create(data, {transaction})
                    .then((request) => {
                        if (!request) return Promise.reject('Erro ao cadastrar o Request!')
                        return _.assign(JSON.parse(JSON.stringify(request)), {tmpId: data.tmpId})
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
            checkRequestPayments(data, request, userId, transaction){
                if(!_.has(data, 'requestPayments')) return Promise.resolve(null)
                return server.broker.call('data/request-payments.start', {
                    data: data.requestPayments,
                    request,
                    userId,
                    transaction
                })
            },
            checkRequestDetails(detailsData, request, client, userId, transaction){

                //if(!_.has(data, 'requestClientAddresses') || !_.has(data, 'requestClientPhones')) return Promise.resolve(null)

               const data = {}
                
                if(_.has(detailsData, 'requestClientAddresses')) {
                    data.requestClientAddresses = []
                    detailsData.requestClientAddresses.forEach((requestClientAddress, index) => {
                        data.requestClientAddresses.push(_.find(client.clientAddresses, (clientAddress) => { 
                            if(_.has(clientAddress, 'tmpId')) {
                                return clientAddress.tmpId == requestClientAddress.clientAddressId  
                            }
                            else {
                                return clientAddress.id == requestClientAddress.clientAddressId  
                            }
                             
                        }))
                    })
                }
                
                if(_.has(detailsData, 'requestClientPhones')) {
                    detailsData.requestClientPhones.forEach((requestClientPhone, index) => {
                        data.requestClientPhones.push(_.find(client.clientPhones, (clientPhone) => { 
                            if(_.has(clientPhone, 'tmpId')) {
                                return clientPhone.tmpId == requestClientPhone.clientPhoneId  
                            }
                            else {
                                return clientPhone.id == requestClientPhone.clientPhoneId  
                            }
                        }))
                    })
                }
                
                return server.broker.call('data/request-details.start', {
                    data,
                    request,
                    userId,
                    transaction
                })
            },
            dashboard(request, client, oldRequest, companyId, transaction) {
                return new Promise((resolve, reject) => {
                    if(!client.id || (request.status === 'finished' || request.status === 'canceled')){
                        if(request.id && (oldRequest && oldRequest.status !== 'finished' && oldRequest.status !== 'canceled')){
                            return server.broker.call('request-board.getCard', {
                                where: {
                                    requestId: parseInt(request.id)
                                }
                            }).then((card) => {                 
                                return server.broker.call('request-board.removeCard', {
                                    data: {
                                        cardId: card.id,
                                        companyId: companyId
                                    }
                                }).then(() => {
                                    return server.broker.call("push-notification.push", {
                                        data: {
                                            userId: request.userId,
                                            title: 'O pedido #' + request.id + ' foi encerrado.',
                                            sound: 'deny1',
                                            message: 'Abra a notificação para ver mais detalhes',
                                            payload: {
                                                type: 'request.removed',
                                                id: '' + request.id
                                            }
                                        },
                                        notRejectNotLogged: true
                                    })
                                    .then(() => {
                                        resolve()
                                    })
                                })
                            })
                        }
                        else{
                            resolve()
                        }                
                    }
                    else {
                        return server.broker.call("data/request.getOne", {
                            where: {
                                id: request.id
                            },
                            transaction,
                            include: [{
                                model: server.mysql.RequestTimeline,
                                as: "requestTimeline",
                                include: [{
                                    model: server.mysql.User,
                                    as: "triggeredByUser",
                                    attributes: ['id', 'name', 'email', 'activeCompanyUserId']
                                },{
                                    model: server.mysql.User,
                                    as: "user",
                                    attributes: ['id', 'name', 'email', 'activeCompanyUserId']
                                }]
                            },
                            {
                                model: server.mysql.RequestCard,
                                as: "requestCard"
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
                                }]
                            }]
                        }).then((consultResquest) => {
                            if(request.id && (oldRequest && oldRequest.status !== 'finished' && oldRequest.status !== 'canceled')) {
                                if(consultResquest.deliveryDate === oldRequest.deliveryDate){
                                    return server.broker.call("request-board.reloadCard", {
                                        request: consultResquest,
                                        companyId: companyId,
                                    })
                                    .then(() => {
                                        return resolve()
                                    })
                                }
                                else {
                                    return server.broker.call("request-board.updateCard", {
                                        where: {
                                            requestId: consultResquest.id
                                        },
                                        data: {
                                            deliveryDate: consultResquest.deliveryDate
                                        },
                                        cardId: consultResquest.requestCard.id,
                                        companyId: companyId,
                                        transaction
                                    })
                                    .then(() => {
                                        return resolve()
                                    })
                                }
                            }
                            else{
                                return server.broker.call("request-board.consultSectionOne", {
                                    where: {
                                        companyId: consultResquest.companyId
                                    },
                                    companyId: consultResquest.companyId
                                }).then((section) => {
                                    let maxCard = _.maxBy(section.cards, (card) => {
                                        return card.position
                                    })
                                    let maxCardPosition = 65535
                                    if (maxCard) maxCardPosition += maxCard.position
                                    return server.broker.call("request-board.createCard", {
                                        section: section,
                                        data: {
                                            requestId: consultResquest.id,
                                            position: maxCardPosition,
                                            section: section.id,
                                            deliveryDate: consultResquest.deliveryDate,
                                            createdBy: _.first(consultResquest.requestTimeline).triggeredBy,
                                            companyId: consultResquest.companyId
                                        },
                                        request: consultResquest,
                                        transaction
                                    }).then((card) => {
                                        return resolve(card)
                                    }).catch((err) => {
                                        console.log("Erro em: draft/request.dashboard createCard")
                                        return reject(err)
                                    })
                                })
                            }
                        }).catch((err) => {
                            console.log(err, "Erro em: draft/request.dashboard consult do request")
                            return reject("Erro ao consultar o pedido para criar o card.")
                        })
                    }
                })
            },
            pushNotification(request){
                return new Promise((resolve, reject) => {
                    return server.broker.call("push-notification.push", {
                        data: {
                            userId: request.userId,
                            title: 'Novo pedido #' + request.id,
                            message: 'Abra a notificação para ver mais detalhes',
                            payload: {
                                type: 'request.create',
                                id: '' + request.id
                            }
                        },
                        notRejectNotLogged: true
                    }).then(() => {
                        return resolve()
                    }).catch(() => {
                        return resolve('Não foi possivel notificar o entregador!')
                    })
                })
                
            }

        }
    }
}