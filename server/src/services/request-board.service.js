import _ from 'lodash'
import moment from 'moment'
import {Op} from 'sequelize'
import sequelize from 'sequelize'
import EventResponse from '~server/models/EventResponse'
import config from '~config'
import shortid from 'shortid'

import { base64encode, base64decode } from 'nodejs-base64'

module.exports = (server) => { return {
    name: "request-board",
    actions: {
        /**
         * Load the request-board in a company context
         * @param {Object} ctx.params.data = { companyId:Number }
         * @returns {Promise.<Array>} sections
         */
        load(ctx){

            const searchObj = {
                deliveryDate: null
            }

            if(_.get(ctx.params,'data.filter',false)){
                _.assign(searchObj,JSON.parse(base64decode(ctx.params.data.filter)))
            }

            const where = {}

            // set date created

            if(_.get(searchObj,'deliveryDate',false)){
                _.assign(where, {
                    deliveryDate: {
                        [Op.gte]: moment(searchObj.deliveryDate).startOf("day").toDate(),
                        [Op.lte]: moment(searchObj.deliveryDate).endOf("day").toDate(),
                        [Op.not]: null
                    }
                })
            }
            else {
                _.assign(where, {
                    deliveryDate: {
                        [Op.gte]: moment().startOf("day").toDate(),
                        [Op.lte]: moment().endOf("day").toDate(),
                        [Op.not]: null
                    }
                })
            }

            return server.mysql.RequestSection.findAll({
                where: {
                    companyId: parseInt(ctx.params.data.companyId)
                },
                required: true,
                order: [['position', 'ASC']],
                include: [{
                    model: server.mysql.RequestCard,
                    as: 'cards',
                    where: where,
                    required: false,
                    include: [{
                        model: server.mysql.Request,
                        as: "request",
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
                            }]
                        }, {
                            model: server.mysql.RequestChatItem,
                            as: "requestChatItems",
                            attributes: ['id', 'userId'],
                            include: [{
                                model: server.mysql.RequestChatItemRead,
                                as: 'usersRead',
                                attributes: ['id', 'userId']
                            }]
                        }]   
                    }]
                }]
            })
            .then((sectionsList) => {
                sectionsList = JSON.parse(JSON.stringify(sectionsList))
   
                let sectionPromises = []
                if(sectionsList.length) {
                    sectionsList.forEach((section, indexSection) => {
                        let promises = []
                        sectionsList[indexSection].cards = _.orderBy(sectionsList[indexSection].cards, 'position', 'asc')
                        sectionPromises.push(new Promise((resolve, reject) => {
                            section.cards.forEach((card, indexCard) => {
                                promises.push(new Promise((resolve, reject) => {
                                    const count = _.filter(_.filter(card.request.requestChatItems, (filter) => {
                                        if(filter.userId !== ctx.params.userId) return filter
                                    }), (chat) => {
                                        const read = _.find(chat.usersRead, {userId: ctx.params.userId})
                                        if(!read) return chat
                                    })
                                    _.set(sectionsList[indexSection].cards[indexCard], 'unreadChatItemCount', count.length)
                                    resolve()
                                }))
                            })
                            return Promise.all(promises)
                            .then(() => {
                                resolve()
                            })
                        }))
                    })
                }
                return Promise.all(sectionPromises).then(() => {
                    return sectionsList
                })
            })
        },
        consultSectionOne(ctx){
            return server.mysql.RequestSection.findOne({
                    where: ctx.params.where  || {},
                    include: ctx.params.include || [],
                    order: ctx.params.order || null,
                    attributes: ctx.params.attributes || null
                })
                .then((section) => {
                    if (!section) {
                        return ctx.call("request-board.createSection", {
                            data: {
                                companyId: ctx.params.companyId
                            }
                        }).then((section) => {
                            return section
                        })
                    }
                    else {
                        return section
                    }
                }).catch((err) => {
                    return Promise.reject(err)
                })
        },
        /**
         * Create a section associated to the company request-board
         * @param {Number} data.companyId
         * @returns {Promise.<Object>} section
         */
        createSection(ctx){
            return new Promise((resolve, reject) => {
                server.mysql.RequestSection.findOne({
                    order: [['position','DESC']],
                    where: {
                        companyId: ctx.params.data.companyId
                    }
                })
                .then((lastSection) => {
                    let position = config.requestBoard.defaultPosition
                    if(lastSection) position += lastSection.position
                    const sectionCode = shortid.generate()
                    server.mysql.RequestSection.create({
                        companyId: ctx.params.data.companyId,
                        position,
                        code: sectionCode,
                        name: 'Seção #' + sectionCode
                    })
                    .then((section) => {
                        server.io.in('company/' + ctx.params.data.companyId + '/request-board').emit('requestBoardSectionCreate', new EventResponse(section))
                        resolve(section)
                    }).catch((err) => {
                        console.log('Erro create section, erro:', err)
                        reject()
                    })
                })
            }).then((section) => {
                return section
            })
        },
        updateSection(ctx){
            return server.mysql.RequestSection.update(ctx.params.data, {
               where: ctx.params.where
            }).then((updated) => {
                if (parseInt(_.toString(updated)) < 1 ) {
                    console.log("Nenhum registro encontrado. Update.")
                    return Promise.reject('Erro ao atualizar a sessão.')
                }
                return server.mysql.RequestSection.findByPk(ctx.params.sectionId)
                .then((section) => {
                    section = JSON.parse(JSON.stringify(section))
                    server.io.in('company/' + ctx.params.companyId + '/request-board').emit('requestBoardCardUpdate', new EventResponse(section))
                    return section
                })
            })
        },
        /**
         * Move a section associated to the company request-board
         * @param {String} data.location, {Number} data.companyId, {Number} data.position, {Number} data.sectionId
         * @returns {Promise.<Object>} section
         */
        moveSection(ctx){
            return new Promise((resolve, reject) => {
                switch(ctx.params.data.location){
                    case "first":
                        return server.mysql.RequestSection.findOne({
                            order: [['position','ASC']],
                            where: {
                                companyId: 1 // HARDCODED
                            }
                        })
                        .then((firstSection) => {
                            let position = firstSection.position / 2
                            resolve({position}) 
                        })
                        break;
                    case "last":
                        return server.mysql.RequestSection.findOne({
                            order: [['position','DESC']],
                            where: {
                                companyId: 1 // HARDCODED
                            }
                        })
                        .then((lastSection) => {
                            let position = config.requestBoard.defaultPosition
                            if(lastSection) position += lastSection.position
                            resolve({position}) 
                        })
                        break;
                    default:
                        resolve({position: ctx.params.data.position})
                }
            })
            .then((data) => {
                return server.mysql.RequestSection.update(data, {
                    where: {
                        id: ctx.params.data.sectionId
                    }
                }).then((updated) => {
                    if (parseInt(_.toString(updated)) < 1 ) {
                        console.log("Nenhum registro encontrado. Update.")
                        return Promise.reject('Erro ao mover a Section.')
                    }
                    return server.mysql.RequestSection.findByPk(ctx.params.data.sectionId)
                    .then((section) => {
                        section = JSON.parse(JSON.stringify(section))
                        server.io.in('company/' + ctx.params.data.companyId + '/request-board').emit('requestBoardSectionMove', new EventResponse(section))
                        return section
                    }).catch((err) => {
                        console.log('erro consult by id - request board service update')
                        return Promise.reject("Erro ao recuperar os dados da Section.")
                    })
                })
            })
        },
        /**
         * Remove a section associated to the company request-board
         * @param {Number} data.companyId, {Number} data.sectionId
         * @emits {Object} removedSectionId
         * @returns {Promise.<Number>} removedSectionId
         */
        removeSection(ctx){
            return server.mysql.RequestSection.findOne({
                where: {
                    id: ctx.params.data.sectionId
                },
                include: [{
                        model: server.mysql.RequestCard,
                        attributes: ['id'],
                        as: 'cards'
                    }]
            })
            .then((section) => {
                if(!section) return Promise.reject("Erro ao buscar informações da seção.")
                if(section.cards.length) return Promise.reject("Você não pode remover uma seção que possui pedido(s).")
                section.destroy()
                .then(() => {
                    server.io.in('company/' + ctx.params.data.companyId + '/request-board').emit('requestBoardSectionRemove', new EventResponse({
                        removedSectionId: ctx.params.data.sectionId
                    }))
                    return ctx.params.data.sectionId
                })
            })
        },

        getCard(ctx) {
            return server.mysql.RequestCard.findOne({
                where: ctx.params.where
            })
            .then((card) => {
                if(!card) return null
                return JSON.parse(JSON.stringify(card))
            })
        },

        createCard(ctx){
            return ctx.call("request-board.consultSectionOne", {
                where: {
                    companyId: ctx.params.data.companyId
                },
                order: [['position', 'ASC']],
                include: [{
                    model: server.mysql.RequestCard,
                    attributes: ['id', 'position'],
                    as: 'cards'
                }],
                companyId: ctx.params.data.companyId
            })
            .then((section) => {
                let position = config.requestBoard.defaultPosition
                if(section.cards && section.cards.length) {
                    const lastPosition = _.first(_.orderBy(JSON.parse(JSON.stringify(section.cards)), 'position', 'desc'))
                    position += lastPosition.position
                }
                const code = shortid.generate();
                return server.mysql.RequestCard.create(
                    _.assign(ctx.params.data, {
                            sectionId: section.id,
                            code,
                            name: 'Card #' + code,
                            position,
                            requestId: (ctx.params.data.requestId) ? ctx.params.data.requestId : null
                        })
                )
                .then((card) => {
                    if(!card) return Promise.reject('Erro ao criar o Card')
                    server.io.in('company/' + ctx.params.data.companyId + '/request-board').emit('requestBoardCardCreate', {
                        data: {
                            card,
                            section
                        }
                    })
                    return card
                })
            })
            .catch((err) => {
                console.log(err, "Erro em: request-board.createCard")
                return Promise.reject("Pedido está Ok, porém houve um erro ao criar o card!")
            })   
        },

        reloadCard(ctx){
            return server.mysql.RequestCard.findOne({
                where: {
                    requestId: ctx.params.request.id
                },
                include: [{
                    model: server.mysql.Request,
                    as: 'request'
                }]
            })
            .then((card) => {
                if(!card){
                    return Promise.reject('Erro ao atualizar Card')
                }
                // check socket connections and emit 
                card = JSON.parse(JSON.stringify(card))
            
                server.io.in('company/' + ctx.params.companyId + '/request-board').emit('requestBoardCardUpdate', new EventResponse(card))

                return card
            })
        },
        
        updateCard(ctx){
            return server.mysql.RequestCard.update(ctx.params.data, {
               where: ctx.params.where
            }).then((updated) => {
                if (parseInt(_.toString(updated)) < 1 ) {
                    console.log("Nenhum registro encontrado. Update.")
                    return Promise.reject('Erro ao atualizar o card.')
                }
                return server.mysql.RequestCard.findByPk(ctx.params.cardId, {
                    include: [{
                        model: server.mysql.Request,
                        as: 'request'
                    }]
                })
                .then((card) => {
                    card = JSON.parse(JSON.stringify(card))
                    server.io.in('company/' + ctx.params.companyId + '/request-board').emit('requestBoardCardUpdate', new EventResponse(card))
                    return card
                })
            })
        },
        /**
         * Remove a section associated to the company request-board
         * @param {Number} data.companyId, {String} data.location, {ObjectId} data.toSection, {ObjectId} data.cardId
         * @emits {Object} removedSectionId
         * @returns {Promise.<Number>} removedSectionId
         */
        moveCard(ctx){
            const vm = this
            return new Promise((resolve, reject) => {
                switch(ctx.params.data.location){
                    case "first":
                        return server.mysql.RequestCard.findOne({
                            where: {
                                sectionId: ctx.params.data.toSection,
                                requestId: {
                                    [Op.not]: null
                                }
                            },
                            order: [['position', 'ASC']],
                            attributes: ['id', 'position']
                        })
                        .then((firstCard) => {
                            let position = firstCard.position / 2
                            resolve({position, location: 'first', sectionId: ctx.params.data.toSection})
                        })
                    break;
                    case "last":
                        return server.mysql.RequestCard.findOne({
                            where: {
                                sectionId: ctx.params.data.toSection,
                                requestId: {
                                    [Op.not]: null
                                }
                            },
                            order: [['position', 'DESC']],
                            attributes: ['id', 'position']
                        })
                        .then((lastCard) => {
                            let position = config.requestBoard.defaultPosition
                            if(lastCard) position += lastCard.position
                            resolve({position, location: 'last', sectionId: ctx.params.data.toSection})
                        })
                    break;
                    case "middle":
                        return server.mysql.RequestCard.findAll({
                            where: {
                                id: {
                                    [Op.in]: [ctx.params.data.prevCard, ctx.params.data.nextCard]
                                }
                            },
                            order: [['position', 'DESC']],
                            attributes: ['id', 'position']
                        })
                        .then((prevAndNextCard) => {
                            const position = (( prevAndNextCard[0].position + prevAndNextCard[1].position ) / 2)
                            resolve({position, location: 'middle', sectionId: ctx.params.data.toSection})
                        })
                    break;
                    case "last-and-only":
                        let position = config.requestBoard.defaultPosition
                        resolve({position, location: 'last-and-only', sectionId: ctx.params.data.toSection}) 
                    break
                }
            })
            .then((data) => {
                return server.mysql.RequestCard.update(data, {
                    where: {
                        id: ctx.params.data.cardId
                    }
                }).then((updated) => {
                    if (parseInt(_.toString(updated)) < 1 ) {
                        console.log("Nenhum registro encontrado. Update.")
                        return Promise.reject('Erro ao mover o Card.')
                    }
                    return server.mysql.RequestCard.findByPk(ctx.params.data.cardId)
                    .then((card) => {
                        card = JSON.parse(JSON.stringify(card))
                        return {
                            location: data.location,
                            card
                        }
                    }).catch((err) => {
                        console.log('erro consult by id - request board service update')
                        return Promise.reject("Erro ao recuperar os dados da Section.")
                    })
                })
            })
        },
        removeCard(ctx){
            return server.mysql.RequestCard.destroy({
                where: {
                    id: ctx.params.data.cardId
                }
            })
            .then(() => {
                server.io.emit('requestBoardCardRemove', new EventResponse({
                    removedCardId: ctx.params.data.cardId
                }))
                server.io.in('company/' + ctx.params.data.companyId + '/request-board').emit('requestBoardCardRemove', new EventResponse({
                    removedCardId: ctx.params.data.cardId
                }))
                return ctx.params.data.cardId
            })
        },

        getDashboard(ctx) {
            return new Promise((resolve, reject) => {
                async function start(){
                    try {

                        const requestBoard = await ctx.call("data/request.getList", {
                            where: {
                                deliveryDate: {
                                    [Op.gte]: moment(ctx.params.date).startOf("day").toDate(),
                                    [Op.lte]: moment(ctx.params.date).endOf("day").toDate()
                                },
                                status: {
                                    [Op.notIn]: ['finished','canceled']
                                },
                                companyId: parseInt(ctx.params.companyId)
                            },
                            include: [{
                                model: server.mysql.RequestTimeline,
                                as: "requestTimeline",
                                include: [{
                                    model: server.mysql.User,
                                    as: "triggeredByUser",
                                    attributes: ['id', 'name', 'email']
                                }, {
                                    model: server.mysql.User,
                                    as: "user",
                                    attributes: ['id', 'name', 'email']
                                }]
                            }, {
                                model: server.mysql.RequestClientPhone,
                                as: "requestClientPhones",
                                include: [{
                                    model: server.mysql.ClientPhone,
                                    as: "clientPhone",
                                }]
                            }, {
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
                            }, {
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
                            }, {
                                model: server.mysql.RequestOrder,
                                as: "requestOrder",
                                include: [{
                                    model: server.mysql.RequestOrderProduct,
                                    as: 'requestOrderProducts'
                                }]
                            }, {
                                model: server.mysql.RequestPayment,
                                as: "requestPayments"
                            }, {
                                model: server.mysql.RequestChatItem,
                                as: "requestChatItems",
                                include: [{
                                    model: server.mysql.RequestChatItemRead,
                                    as: 'usersRead',
                                    attributes: ['id', 'userId']
                                }]
                            }]
                        })
                         
                        if(!requestBoard.length) return resolve()
                         
                        // let promises = []

                        // requestBoard.forEach((request, index) => {
                        //     promises.push(server.mysql.RequestChatItem.findAll({
                        //         where: {
                        //             requestId: request.id
                        //         },
                        //         order: [['dateCreated', 'ASC']],
                        //         include: [{
                        //             model: server.mysql.RequestChatItemRead,
                        //             as: "usersRead"
                        //         }, {
                        //             model: server.mysql.User,
                        //             as: "user",
                        //             attributes: ["id", "name", "email"]
                        //         }]
                        //     })
                        //     .then(async (chatItems) => {
                        //         chatItems = JSON.parse(JSON.stringify(chatItems))

                        //         const unRead = _.map(_.filter(chatItems, (chat) => {
                        //             if(!_.some(chat.usersRead, ['userId', ctx.params.userId])) return chat
                        //         }), (chatUnRead) => {
                        //             return chatUnRead.id
                        //         })


                        //         //CHATITEMS = Chat mesmo em si
                        //         //unRead = array de ids dos nao lido
                   
                        //     }))
                        // })

                        // await Promise.all(promises)

                        return resolve(requestBoard)
                    }

                    catch(error) {
                        console.log(error)
                        return reject()
                    }
                    
                }
                start()
            })
        }
    }
}}