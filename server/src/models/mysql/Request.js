const Controller = require('./../Controller')
const _ = require('lodash')

module.exports = {
    defineModel: (Sequelize, sequelize) => {
        const modelName = 'Request';
        return {
            name: modelName,
            instance: sequelize.define(modelName, {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                companyId: {
                    type: Sequelize.INTEGER
                },
                userId: {
                    type: Sequelize.INTEGER
                },
                clientId: {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                    set(val) {
                        this.setDataValue('clientId', (val == '' | val == null) ? null : val);
                    }
                },
                orderId: {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                    set(val) {
                        this.setDataValue('orderId', (val == '' | val == null) ? null : val);
                    }
                },
                taskId: {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                    set(val) {
                        this.setDataValue('taskId', (val == '' | val == null) ? null : val);
                    }
                },
                obs: {
                    type: Sequelize.STRING,
                    set(val) {
                        this.setDataValue('obs', (val == '' | val == null) ? null : val.toUpperCase().trim());
                    }
                },
                dateUpdated: {
                    type: Sequelize.DATE
                },
                dateCreated: {
                    type: Sequelize.DATE
                },
                dateRemoved: {
                    type: Sequelize.DATE
                },
                status: Sequelize.STRING
            }, {
                tableName: "request",
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                deletedAt: 'dateRemoved',
                paranoid: true,
                freezeTableName: true
            })
        }
    },

    postSettings: ({Request,Company,Client,User,Order,RequestClientPhone,RequestClientAddress,RequestUserInCharge,
        ClientPhone,ClientAddress}) => {

        Request.belongsTo(Company, {as: 'company', foreignKey: 'companyId'})
        Request.belongsTo(Client, {as: 'client', foreignKey: 'clientId'})
        Request.belongsTo(User, {as: 'user', foreignKey: 'userId'});
        Request.belongsTo(Order, {as: 'order', foreignKey: 'orderId'})

        Request.hasMany(RequestUserInCharge, {as: 'requestUserInCharges', foreignKey: 'requestId'});

        Request.hasMany(RequestClientPhone, {as: 'requestClientPhones', foreignKey: 'requestId'});
        Request.belongsToMany(ClientPhone, { through: RequestClientPhone, as: 'clientPhones', foreignKey: 'requestId' });

        Request.hasMany(RequestClientAddress, {as: 'requestClientAddresses', foreignKey: 'requestId'});
        Request.belongsToMany(ClientAddress, { through: RequestClientAddress, as: 'clientAddresses', foreignKey: 'requestId' });
    },

    afterPostSettings: ({Request}, server) => {

        const cardsController = require('./../../controllers/request-board-cards.controller')(server)
        const sectionsController = require('./../../controllers/request-board-sections.controller')(server)

        Request.hook('afterCreate', (instance, options) => {
            return server.mysql.Request.findOne({
                where: {
                    id: instance.id
                },
                include: [{
                    model: server.mysql.Client,
                    as: 'client'
                }],
                transaction: options.transaction
            }).then((request) => {
                const consultSection  = new Controller({
                    request: {
                        companyId: request.companyId
                    }
                })
                return sectionsController.consultSection(consultSection).then((section) => {
                    let maxCard = _.maxBy(section.cards, (card) => {
                        return card.position
                    })
                    let maxCardPosition = 65535
                    if(maxCard) maxCardPosition += maxCard.position
                    const createData = {
                        requestId: request.id,
                        position: maxCardPosition,
                        section: section.id
                    }
                    const createCard  = new Controller({
                        request: {
                            section: section,
                            companyId: request.companyId,
                            createdBy: request.userId,
                            data: createData
                        }
                    })
                    return cardsController.createOne(createCard).then((createdCard) => {
                        const card = createdCard.toJSON()
                        card.request = request
                        section.cards.push(createdCard)
                        section.save().then((section) => {
                            server.io.sockets.emit('requestBoardCardCreate', {
                                data: {
                                    card,
                                    section
                                }
                            })
                        })
                    })
                })

            }).catch((err) => {
                console.log(err)
            })
        })

    }

}
