import _ from 'lodash'
import moment from 'moment'
import Sequelize, {Op} from 'sequelize'
import EventResponse from '~server/models/EventResponse'
import config from '~config'
import { base64encode, base64decode } from 'nodejs-base64'

module.exports = (server) => { return {
    name: "cashier-balancing",
    actions: {
        /**
         * Load the cashier-balancing list, https://stackoverflow.com/questions/207477/restful-url-design-for-search
         * @param {Object} ctx.params.data = { companyId:Number }
         * @returns {Promise.<Array>} sections
         */
        getList(ctx){

            const searchObj = {
                requestId: null,
                dateCreated: null,
                responsibleUser: null,
                clientGroup: null,
                paymentMethod: null,
                status: null,
                paid: null
            }

            if(_.get(ctx.params,'data.filter',false)){
                _.assign(searchObj,JSON.parse(base64decode(ctx.params.data.filter)))
            }

            const where = {}
            const clientWhere = {}
            const requestWhere = {}

            // set requestId

            if(_.get(searchObj,'requestId',false)){
                where.requestId = searchObj.requestId
            }

            // set payment method filter

            if(_.get(searchObj,'paymentMethod',false)){
                if(_.isArray(searchObj.paymentMethod) && searchObj.paymentMethod.length){
                    where.paymentMethodId = {
                        [Op.or]: searchObj.paymentMethod
                    }
                }
                else{
                    where.paymentMethodId = searchObj.paymentMethod
                }
            }

            // set client group filter

            if(_.get(searchObj,'clientGroup',false)){
                if(_.isArray(searchObj.clientGroup) && searchObj.clientGroup.length){
                    clientWhere.clientGroupId = {
                        [Op.or]: searchObj.clientGroup
                    }
                }
                else{
                    clientWhere.clientGroupId = searchObj.clientGroup
                }
            }

            // set created dates filter

            if(_.get(searchObj,'dateCreated',false)){
                if(_.isArray(searchObj.dateCreated) && searchObj.dateCreated.length){
                    where.dateCreated = {
                        [Op.or]: _.map(searchObj.dateCreated, (oneDateCreatedFromArray) => {
                            if(_.isArray(oneDateCreatedFromArray)){ // its a date interval
                                return {
                                    [Op.gte]: moment(_.first(oneDateCreatedFromArray)).startOf("day").toDate(),
                                    [Op.lte]: moment(_.last(oneDateCreatedFromArray)).endOf("day").toDate()
                                }
                            }
                            else {
                                return {
                                    [Op.gte]: moment(oneDateCreatedFromArray).startOf("day").toDate(),
                                    [Op.lte]: moment(oneDateCreatedFromArray).endOf("day").toDate()
                                }
                            }
                        })
                    }
                }
                else if(moment(searchObj.dateCreated).isValid()) {
                    where.dateCreated = {
                        [Op.gte]: moment(searchObj.dateCreated).startOf("day").toDate(),
                        [Op.lte]: moment(searchObj.dateCreated).endOf("day").toDate()
                    }
                }
            }

            // set paid filter
            if(_.get(searchObj,'paid',false)){
                where.paid = {
                    [Op.eq]: searchObj.paid
                }
            }

            // set resposible users filter

            if(_.get(searchObj,'responsibleUser',false)){
                if(_.isArray(searchObj.responsibleUser) && searchObj.responsibleUser.length){
                    requestWhere.userId = {
                        [Op.or]: searchObj.responsibleUser
                    }
                }
                else{
                    requestWhere.userId = searchObj.responsibleUser
                }
            }

            // set status filter

            if(_.get(searchObj,'status',false)){
                if(_.isArray(searchObj.status) && searchObj.status.length){
                    requestWhere.status = {
                        [Op.or]: searchObj.status
                    }
                }
                else{
                    requestWhere.status = searchObj.status
                }
            }

            const promises = []

            promises.push(server.mysql.RequestPaymentMethod.findAndCountAll({
                where,
                include: [
                    {
                        model: server.mysql.Request,
                        as: 'request',
                        include: [
                            {
                                model: server.mysql.Client,
                                as: 'client',
                                include: [
                                    {
                                        model: server.mysql.ClientGroup,
                                        as: 'clientGroup'
                                    }
                                ],
                                where: clientWhere
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

            promises.push(server.mysql.RequestPaymentMethod.sum('amount', {
                where,
                include: [
                    {
                        model: server.mysql.Request,
                        as: 'request',
                        include: [
                            {
                                model: server.mysql.Client,
                                as: 'client',
                                where: clientWhere
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
        markAsPaid(ctx){
            return server.mysql.RequestPaymentMethod.findAll({
                include: [
                    {
                        model: server.mysql.Request,
                        as: 'request',
                        where: {
                            companyId: {
                                [Op.in]: [ctx.params.data.companyId]
                            }
                        }
                    }
                ],
                where: {
                    id: {
                        [Op.in]: ctx.params.data.requestPaymentIds
                    },
                    paid: false
                }
            }).then((requestPaymentMethods) => {
                const promises = _.map(requestPaymentMethods, (requestPaymentMethod) => {
                    return requestPaymentMethod.update({
                        paid: true,
                        paidDatetime: new Date(),
                    },{
                        returning: true,
                        plain: true
                    })
                })
                return Promise.all(promises)
            })
        },
        markAsSettled(ctx){
            console.log(ctx.params.data)

            return server.mysql.RequestPaymentMethod.findAll({
                include: [
                    {
                        model: server.mysql.Request,
                        as: 'request',
                        include: [
                            {
                                model: server.mysql.User,
                                as: 'responsibleUser'
                            }
                        ],
                        where: {
                            companyId: {
                                [Op.in]: [ctx.params.data.companyId]
                            }
                        }
                    },
                    {
                        model: server.mysql.RequestPaymentTransaction,
                        as: 'requestPaymentTransactions'
                    }
                ],
                where: {
                    id: {
                        [Op.in]: ctx.params.data.requestPaymentIds
                    }
                }
            }).then((requestPaymentMethods) => {
                let requestPaymentsToMarkAsSettled = _.filter(requestPaymentMethods, (requestPaymentMethod) => {
                    requestPaymentMethod.requestPaymentTransactions.sort(function(a, b) { return new Date(a.dateCreated) - new Date(b.dateCreated) })
                    if(!requestPaymentMethod.requestPaymentTransactions.length){
                        return true
                    }
                    return _.last(requestPaymentMethod.requestPaymentTransactions).action !== 'settle.origin' && _.last(requestPaymentMethod.requestPaymentTransactions) !== 'settle.destination'
                })

                const transactionPromises = []
                const accountBalances = {}

                _.forEach(requestPaymentsToMarkAsSettled, (requestPaymentToMarkAsSettled) => {
                    const iterationPromises = []
                    iterationPromises.push(ctx.call('data/transaction.create', {
                        data: {
                            amount: Math.abs(requestPaymentToMarkAsSettled.amount),
                            createdById: ctx.params.data.createdById,
                            accountId: ctx.params.data.accountId,
                            companyId: ctx.params.data.companyId,
                            description: 'Adição do valor do acerto de contas na conta de destino',
                        }
                    }).then((transaction) => {
                        return server.mysql.Account.findById(ctx.params.data.accountId).then((account) => {
                            if(!accountBalances[account.id]) accountBalances[account.id] = account.balance
                            accountBalances[account.id] = parseFloat(accountBalances[account.id]) + parseFloat(transaction.amount)
                            return server.mysql.RequestPaymentTransaction.create({
                                requestPaymentId: requestPaymentToMarkAsSettled.id,
                                transactionId: transaction.id,
                                settledDatetime: ctx.params.data.settledDatetime || new Date(),
                                action: 'settle.destination'
                            })
                        })
                    }))
                    iterationPromises.push(ctx.call('data/transaction.create', {
                        data: {
                            amount: -Math.abs(requestPaymentToMarkAsSettled.amount),
                            createdById: ctx.params.data.createdById,
                            accountId: requestPaymentToMarkAsSettled.request.responsibleUser.accountId,
                            companyId: ctx.params.data.companyId,
                            description: 'Remoção do valor do acerto de contas na conta de origem',
                        }
                    }).then((transaction) => {
                        return server.mysql.Account.findById(requestPaymentToMarkAsSettled.request.responsibleUser.accountId).then((account) => {
                            if(!accountBalances[account.id]) accountBalances[account.id] = account.balance
                            accountBalances[account.id] = parseFloat(accountBalances[account.id]) + parseFloat(transaction.amount)
                            return server.mysql.RequestPaymentTransaction.create({
                                requestPaymentId: requestPaymentToMarkAsSettled.id,
                                transactionId: transaction.id,
                                settledDatetime: ctx.params.data.settledDatetime || new Date(),
                                action: 'settle.origin'
                            })
                        })
                    }))
                    transactionPromises.push(
                        Promise.all(iterationPromises)
                    )
                })

                return Promise.all(transactionPromises).then((res) => {
                    const updateAccountBalancesPromise = []
                    _.forEach(_.keys(accountBalances),(accountId) => {
                        updateAccountBalancesPromise.push(server.mysql.Account.update({
                            balance: accountBalances[accountId]
                        }, {
                            where: {
                                id: parseInt(accountId)
                            }
                        }))
                    })
                    return Promise.all(updateAccountBalancesPromise)
                })
            })
        }
    }
}}