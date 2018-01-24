const Controller = require('./../Controller')

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

    postSettings: ({Request,Company,Client,User,Order}) => {
        Request.belongsTo(Company, {as: 'company', foreignKey: 'companyId'})
        Request.belongsTo(Client, {as: 'client', foreignKey: 'clientId'})
        Request.belongsTo(User, {as: 'user', foreignKey: 'userId'});
        Request.belongsTo(Order, {as: 'order', foreignKey: 'orderId'});
    },

    afterPostSettings: ({Request}, server) => {

        const cardsController = require('./../../controllers/request-board-cards.controller')(server)
        const sectionsController = require('./../../controllers/request-board-sections.controller')(server)

        Request.hook('afterCreate', (request, options) => {

            return server.mysql.Request.findOne({
                where: {
                    id: request.id
                },
                include: [{
                    model: this.server.mysql.Client,
                    as: 'client'
                }],
            }).then((request) => {
                const consultSection  = new Controller({
                    request: {
                        companyId: request.companyId
                    }
                })
                return sectionsController.consultSection(consultSection).then((section) => {
                    const createData = {
                        requestId: request.id,
                        position: 70000,
                        sectionId: section.id
                    }
                    const createCard  = new Controller({
                        request: {
                            section: section,
                            companyId: request.companyId,
                            createdBy: request.userId,
                            data: createData
                        }
                    })
                    return cardsController.createOne(createCard).then((card) => {
                        card.request = request
                        // transaction: options.transaction
                        section.cards.push(card._id)
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

            })
        })

    }

}
