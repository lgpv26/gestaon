import Sequelize from 'sequelize'
import _ from 'lodash'

module.exports = {
    defineModel: (server) => {
        const TIMESTAMP = require('sequelize-mysql-timestamp')(server.sequelize);
        const modelName = 'RequestCard';
        return {
            name: modelName,
            instance: server.sequelize.define(_.camelCase(modelName), {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                name: {
                    type: Sequelize.STRING,
                    set(val) {
                        this.setDataValue('name', (val === '' || val === null) ? null : val.toUpperCase().trim());
                    }
                },
                code: {
                    type: Sequelize.STRING,
                    set(val) {
                        this.setDataValue('code', (val === '' || val === null) ? null : val.toUpperCase().trim());
                    }
                },
                position: {
                    type: Sequelize.INTEGER
                },
                requestId: {
                    type: Sequelize.INTEGER
                },
                sectionId: {
                    type: Sequelize.INTEGER
                },
                deliveryDate: {
                    type: TIMESTAMP
                },
                createdBy: {
                    type: Sequelize.INTEGER
                },
                companyId: {
                    type: Sequelize.INTEGER
                },
                dateUpdated: {
                    type: TIMESTAMP
                },
                dateCreated: {
                    type: TIMESTAMP
                },
                dateRemoved: {
                    type: TIMESTAMP
                }
            }, {
                tableName: 'request_card',
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                deletedAt: 'dateRemoved',
                freezeTableName: true,
                paranoid: true
            })
        }
    },
    postSettings: ({RequestCard, RequestSection, Request, User}) => {
        RequestCard.belongsTo(RequestSection, {as: 'card', foreignKey: 'sectionId'})
        RequestCard.belongsTo(Request, {as: 'request', foreignKey: 'requestId'})
        RequestCard.belongsTo(User, {as: 'user', foreignKey: 'createdBy'})
    }
}
