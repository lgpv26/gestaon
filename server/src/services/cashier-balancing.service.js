import _ from 'lodash'
import moment from 'moment'
import Sequelize, {Op} from 'sequelize'
import EventResponse from '~server/models/EventResponse'
import config from '~config'
import { base64encode, base64decode } from 'nodejs-base64'
import { ServerResponse } from 'http';

module.exports = (server) => {
    //PRIVATES
    let _transaction = null
    let _saveInRequest = null

    return {
        name: "cashier-balancing",
        actions: {
            /**
             * Load the cashier-balancing list, https://stackoverflow.com/questions/207477/restful-url-design-for-search
             * @param {Object} ctx.params.data = { companyId:Number }
             * @returns {Promise.<Array>} sections
             */
            getList(ctx) {

                const searchObj = {
                    requestId: null,
                    deliveryDate: null,
                    responsibleUser: null,
                    clientGroup: null,
                    product: null,
                    paymentMethod: null,
                    status: null,
                    paid: null
                }

                if (_.get(ctx.params, 'data.filter', false)) {
                    _.assign(searchObj, JSON.parse(base64decode(ctx.params.data.filter)))
                }

                const where = {}
                const clientWhere = {}
                const requestWhere = {}
                const productWhere = {}

                // set requestId

                if (_.get(searchObj, 'requestId', false)) {
                    where.requestId = searchObj.requestId
                }

                // set payment method filter

                if (_.get(searchObj, 'paymentMethod', false)) {
                    if (_.isArray(searchObj.paymentMethod) && searchObj.paymentMethod.length) {
                        where.paymentMethodId = {
                            [Op.or]: searchObj.paymentMethod
                        }
                    }
                    else {
                        where.paymentMethodId = searchObj.paymentMethod
                    }
                }

                // set client group filter

                if (_.get(searchObj, 'clientGroup', false)) {
                    if (_.isArray(searchObj.clientGroup) && searchObj.clientGroup.length) {
                        clientWhere.clientGroupId = {
                            [Op.or]: searchObj.clientGroup
                        }
                    }
                    else {
                        clientWhere.clientGroupId = searchObj.clientGroup
                    }
                }

                // set product filter

                if (_.get(searchObj, 'product', false)) {
                    if (_.isArray(searchObj.product) && searchObj.product.length) {
                        productWhere.productId = {
                            [Op.or]: searchObj.product
                        }
                    }
                    else {
                        productWhere.productId = searchObj.product
                    }
                }

                // set created dates filter

                if (_.get(searchObj, 'deliveryDate', false)) {
                    if (_.isArray(searchObj.deliveryDate) && searchObj.deliveryDate.length) {
                        requestWhere.deliveryDate = {
                            [Op.or]: _.map(searchObj.deliveryDate, (oneDeliveryDateFromArray) => {
                                if (_.isArray(oneDeliveryDateFromArray)) { // its a date interval
                                    return {
                                        [Op.gte]: moment(_.first(oneDeliveryDateFromArray)).startOf("day").toDate(),
                                        [Op.lte]: moment(_.last(oneDeliveryDateFromArray)).endOf("day").toDate()
                                    }
                                }
                                else {
                                    return {
                                        [Op.gte]: moment(oneDeliveryDateFromArray).startOf("day").toDate(),
                                        [Op.lte]: moment(oneDeliveryDateFromArray).endOf("day").toDate()
                                    }
                                }
                            })
                        }
                    }
                    else if (moment(searchObj.deliveryDate).isValid()) {
                        requestWhere.deliveryDate = {
                            [Op.gte]: moment(searchObj.deliveryDate).startOf("day").toDate(),
                            [Op.lte]: moment(searchObj.deliveryDate).endOf("day").toDate()
                        }
                    }
                }
                else {
                    requestWhere.deliveryDate = {
                        [Op.gte]: moment().startOf("day").toDate(),
                        [Op.lte]: moment().endOf("day").toDate()
                    }
                }

                // set paid filter
                if (_.get(searchObj, 'paid', false)) {
                    where.paid = {
                        [Op.eq]: searchObj.paid
                    }
                }

                // set resposible users filter

                if (_.get(searchObj, 'responsibleUser', false)) {
                    if (_.isArray(searchObj.responsibleUser) && searchObj.responsibleUser.length) {
                        requestWhere.userId = {
                            [Op.or]: searchObj.responsibleUser
                        }
                    }
                    else {
                        requestWhere.userId = searchObj.responsibleUser
                    }
                }

                // set status filter

                if (_.get(searchObj, 'status', false)) {
                    if (_.isArray(searchObj.status) && searchObj.status.length) {
                        requestWhere.status = {
                            [Op.or]: searchObj.status
                        }
                    }
                    else {
                        requestWhere.status = searchObj.status
                    }
                }

                const promises = []

                promises.push(server.mysql.RequestPayment.findAndCountAll({
                    where,
                    include: [
                        {
                            model: server.mysql.Request,
                            as: 'request',
                            include: [
                                {
                                    model: server.mysql.Client,
                                    as: 'client',
                                    required: false,
                                    include: [
                                        {
                                            model: server.mysql.ClientGroup,
                                            as: 'clientGroup',
                                            required: false
                                        }
                                    ],
                                    where: clientWhere
                                },
                                {
                                    model: server.mysql.RequestClientAddress,
                                    as: "requestClientAddresses",
                                    include: [{
                                        model: server.mysql.ClientAddress,
                                        as: "clientAddress",
                                        include: [{
                                            model: server.mysql.Address,
                                            as: "address"
                                        }]
                                    }]
                                }
                            ],
                            where: {
                                companyId: parseInt(ctx.params.data.companyId),
                                ...requestWhere
                            }
                        },
                        {
                            model: server.mysql.PaymentMethod,
                            as: 'paymentMethod'
                        },
                        {
                            model: server.mysql.RequestPaymentTransaction,
                            as: 'requestPaymentTransactions',
                            include: [{
                                model: server.mysql.Transaction,
                                as: 'transaction'
                            }]
                        }
                    ],
                    distinct: 'id',
                    order: [
                        ['id', 'ASC'],
                    ],
                    limit: parseInt(ctx.params.data.limit),
                    offset: parseInt(ctx.params.data.offset),
                }))

                promises.push(server.mysql.RequestPayment.sum('amount', {
                    where,
                    include: [
                        {
                            model: server.mysql.Request,
                            as: 'request',
                            include: [
                                {
                                    model: server.mysql.Client,
                                    as: 'client',
                                    where: clientWhere,
                                    required: false
                                }
                            ],
                            where: {
                                companyId: parseInt(ctx.params.data.companyId),
                                ...requestWhere
                            }
                        }
                    ]
                }))



                return Promise.all(promises).then(([list, totalAmount]) => {
                    return {
                        list,
                        totalAmount: totalAmount || 0
                    }
                })

            },

            markAsSettled(ctx) {
                const vm = this
                if (ctx.params.data && ctx.params.data.length) {

                    let initialOffset = 0
                    let limitReached = false
                    const totalItemsLimit = (ctx.params.data.length - 1)

                    const objReturn = []
                    /*
                    return new Promise((resolve, reject) => {

                        const bunch = function (offset) {                   
                            console.log("Objeto index " + (offset + 1) + "/" + (totalItemsLimit + 1))

                            return new Promise((resolve, reject) => {
                                async function start() {
                                    let obj = ctx.params.data[offset]
                                    try{

                                        const objId = obj.data.id
                                        const path = await vm.path(obj)
                                        const checkId = await vm.checkId(obj, mapIds)

                                        delete obj.data.id
                                        if(checkId) obj.data.id = checkId

                                        const params = await vm.checkParams(obj, mapIds)
                                        if(params) obj.params = params

                                        obj.data = await vm.cleanTempIds(obj, mapIds)
                                      
                                        if(obj.data.id) await vm.validDate(obj)
                                    
                                        const newData = await vm.validParams(obj)
                                        if(newData) obj.data = newData

                                        const action = await ctx.call(path, {
                                            data: _.assign(obj.data, {
                                                companyId: ctx.params.companyId,
                                                createdBy: ctx.params.userId,
                                            })
                                        })

                                        if(!checkId) _.set(mapIds, objId, action.id)
                                        _.set(action, 'tmpId', objId)

                                        objReturn.push(action)
                                        
                                        resolve(action)

                                    }
                                    catch(err) {
                                        console.log(err, 'catch try - queue')
                                        reject(err)
                                    }
                                }

                                start()
                            })
                            .then(() => {
                                offset++
                                if (totalItemsLimit && !limitReached) {                                  
                                    if((totalItemsLimit - offset) === 0) limitReached = true
                                    bunch(offset)                                    
                                }
                                else {
                                    console.log("Sincronização concluida! Total: ", offset)

                                    return ctx.call('socket.processedQueue', {
                                        userId: ctx.params.userId,
                                        companyId: ctx.params.companyId,
                                        data: objReturn
                                    })
                                    .then(() => {
                                        resolve(objReturn)
                                    })

                                    
                                }
                            })
                            .catch((err) => {
                                return ctx.call('socket.processedQueue', {
                                    userId: ctx.params.userId,
                                    companyId: ctx.params.companyId,
                                    data: objReturn,
                                    offset,
                                    error: true
                                }).then(() => {
                                    reject({
                                        data: objReturn,
                                        error: err.message,
                                        offset
                                    })
                                })
                            })
                        }

                        bunch(initialOffset)
                    })
                    */
                }
            },

            markAsReceived(ctx) {
                const vm = this

                return server.sequelize.transaction((transaction) => {
                    return new Promise((resolve, reject) => {
                        async function start() {
                            try {
                                const data = await vm.setData(ctx.params.data)
                               
                                const requestPayments = vm.removeReactivity(await server.mysql.RequestPayment.findAll({
                                    where: {
                                        id: {
                                            [Op.in]: ctx.params.data.requestPaymentIds
                                        },
                                        paid: {
                                            [Op.or]: [false, null]
                                        }
                                    },
                                    include: [{
                                            model: server.mysql.RequestPaymentTransaction,
                                            as: 'requestPaymentTransactions',
                                            include: [{
                                                model: server.mysql.Transaction,
                                                as: 'transaction'
                                            }]
                                        }, {
                                            model: server.mysql.Request,
                                            as: 'request',
                                            where: {
                                                companyId: {
                                                    [Op.in]: [ctx.params.data.companyId]
                                                }
                                            },
                                            include: [{
                                                model: server.mysql.User,
                                                as: "responsibleUser"
                                            }]
                                        }
                                    ],
                                    transaction
                                }))

                                const account = vm.removeReactivity(await server.mysql.Account.findOne({
                                    include:[{
                                        model: server.mysql.User,
                                        as: "user",
                                        attributes: ['id'],
                                        where: {
                                            id: data.createdById
                                        },
                                        required: true
                                    }]
                                }))

                                let balance = account.balance

                                if(!account) return reject("Não foi possível definir a conta para crédito do recebimento!")
                               
                                let promises = []

                                requestPayments.forEach((requestPayment) => {
                                    promises.push(new Promise(async (resolve, reject) => {

                                        const transactionFinance = await ctx.call('data/transaction.create', {
                                            data: {
                                                amount: Math.abs(requestPayment.amount),
                                                createdById: data.createdById,
                                                accountId: account.id,
                                                companyId: data.companyId,
                                                description: 'Adição do valor do pagamento do pedido #' + requestPayment.request.id + ' na conta de destino',
                                            },
                                            transaction
                                        })

                                        balance = parseFloat(balance) + parseFloat(requestPayment.amount)

                                        await server.mysql.RequestPaymentTransaction.create({                   
                                            requestPaymentId: requestPayment.id,
                                            transactionId: transactionFinance.id,
                                            action: 'payment',
                                            operation: null,
                                            revert: false
                                            }, {
                                            transaction
                                        })

                                        await server.mysql.RequestPayment.update(data,{
                                            where: {
                                                id: requestPayment.id
                                            },
                                            transaction
                                        })
                                        return resolve()
                                    }))
                                })

                            await Promise.all(promises)
                                await server.mysql.Account.update({
                                    balance
                                }, {
                                    where: {
                                        id: account.id,
                                        companyId: data.companyId
                                    },
                                    transaction
                                })

                                return resolve()
                            }
                            catch(err) {
                                console.log(err)
                                return reject(err)
                            }
                        }
                        start()

                    })
                    
                })    
            },

            changeReceived(ctx){
                let counts = 1
                let i = 0
                const vm = this

                    return server.sequelize.transaction((transaction) => {
                        return new Promise(async (resolve, reject) => {

                            const count = await server.mysql.RequestPayment.count({
                                where: {
                                    received: {
                                        [Op.or]: [true, 1]
                                    },
                                    receivedDate: {
                                        [Op.not]: null
                                    }
                                }
                            })
                                                   
                            let limitPerConsult = 200
                            let initialOffset = 0
                            let limitReached = false
            
                            const totalItemsLimit = count
                      
                            const bunch = async function (offset) {
                                
                                if ((offset + limitPerConsult) > totalItemsLimit) {  
                                    limitPerConsult = ((totalItemsLimit - offset) !== 0) ? totalItemsLimit - offset : limitPerConsult 
                                    limitReached = true
                                }

                                const requestPayments = vm.removeReactivity(await server.mysql.RequestPayment.findAll({
                                    where: {
                                        received: {
                                            [Op.or]: [true, 1]
                                        },
                                        receivedDate: {
                                            [Op.not]: null
                                        }
                                    },
                                    limit: limitPerConsult,
                                    offset: offset
                                }))

                                console.log("Consultou com offset " + offset + "-" + (offset + limitPerConsult) + "/" + totalItemsLimit + ' - Total de interações: ' + counts)
                
                                let promises = []

                                requestPayments.forEach((requestPayment, index) => {
                                    promises.push(new Promise(async (resolve, reject) => {
                                            _.set(requestPayments[index], "paid", true)
                                            _.set(requestPayments[index], "paidDatetime", requestPayments[index].receivedDate)
    
                                            i++
                                            return resolve()
                                        }))          
                                })

                                // requestPayments.forEach((requestPayment, index) => {
                                //     promises.push(new Promise(async (resolve, reject) => {

                                //         _.set(requestPayment, "paid", true)
                                //         _.set(requestPayment, "paidDatetime", requestPayment.receivedDate)

                                //         await server.mysql.RequestPayment.update(requestPayment, {
                                //             where: {
                                //                 id: requestPayment.id
                                //             },
                                //             transaction
                                //         })
                                //         i++
                                //         return resolve()
                                //     }))
                                // })

                                await Promise.all(promises)
                                    offset += limitPerConsult
                                    counts++

                                await server.mysql.RequestPayment.bulkCreate(requestPayments, {
                                    updateOnDuplicate:['paid', 'paidDatetime'],
                                    returning: true,
                                    transaction
                                })

                                if (!limitReached) {
                                    if((totalItemsLimit - (offset + limitPerConsult)) === 0) limitReached = true 
                                    bunch(offset)
                                }
                                else {
                                    console.log("Alteração concluida! Total: ", i)
                                    return resolve()
                                }                                
                            }
            
                            bunch(initialOffset)
                        
                        })  
                    })  
            },

        },
        methods: {
            removeReactivity(data){
                return JSON.parse(JSON.stringify(data))
            },
            setData(data) {
                return new Promise((resolve, reject) => {
                    _.set(data, "paid", data.received)
                    _.set(data, "paidDatetime", (data.receivedDate) ? data.receivedDate : moment().toDate())

                    delete data.received
                    delete data.receivedDate

                    return resolve(data)
                })
            } 
        }
    }
}