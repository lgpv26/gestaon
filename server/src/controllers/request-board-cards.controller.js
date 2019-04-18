const utils = require('../utils/index')
const _ = require('lodash')
const shortid = require('shortid')
const Controller = require('./../models/Controller')

module.exports = (server) => {

    return {

        ////////////////
        ///   CRUD   ///
        ////////////////
        //

        getAll: (controller) => {
            return server.mongodb.Card.find({ companyId: controller.request.companyId }).then((cards) => {
                cards = JSON.parse(JSON.stringify(cards))
                return server.mysql.User.findAll({
                    include: [{
                        model: server.mysql.CompanyUser,
                        as: 'userCompanies',
                        where: {
                            companyId: controller.request.companyId
                        }
                    }]
                }).then((user) => {
                    _.map(cards, (card, index) => {
                        _.find(user, (userCard) => {
                            if (userCard.id === card.createdBy) {
                                cards[index] = _.assignIn(card, { createdBy: userCard.name })
                            }
                        })
                    })
                    return cards
                }).catch((err) => {
                    return err
                })
            })
        },

        createOne: (controller) => {
            //requestId
            //position
            //sectionId

            const createData = _.cloneDeep(controller.request.data)
            _.assign(createData, {
                companyId: controller.request.companyId,
                createdBy: controller.request.createdBy
            })

            return server.mongodb.Card.create(createData).then((card) => {
                //card = _.assignIn(card, { createdBy: controller.request.user.name }) // change createdBy to user name for emit to all users

                // check socket connections and emit 
                let ids = Object.keys(server.io.sockets.connected)
                ids.forEach(function (id) {
                    const socket = server.io.sockets.connected[id]

                    if (_.includes(socket.user.companies, parseInt(controller.request.companyId))) {
                        socket.join('card/' + card.id)
                    }
                    const companyActiveId = (socket.user.activeCompanyUserId) ? socket.user.activeCompanyUserId : socket.user.companies[0]
                    if (parseInt(controller.request.companyId) === parseInt(companyActiveId)) {
                        socket.emit('cardCreated', { data: card, sectionId: controller.request.section.id})
                    }
                })
                return card
            }).catch((err) => {
                console.log(err)
                return err
            });
        },

        
        removeAll() {
            server.mongodb.Card.remove({}, (err, service) => {
                if (err) {
                    return next(
                        new restify.InternalServerError({
                            body: {
                                "code": err.name,
                                "message": err.message,
                                "detailed": err
                            }
                        })
                    );
                };
                return "OK"
            });
        },
        // <-- end CRUD


    } // <-- end RETURN

} // <-- end EXPORTS