import Sequelize from 'sequelize'
import _ from 'lodash'

module.exports = {
    defineModel: (server) => {
        const TIMESTAMP = require('sequelize-mysql-timestamp')(server.sequelize);
        const modelName = 'RequestSection';
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
                tableName: 'request_section',
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                deletedAt: 'dateRemoved',
                freezeTableName: true,
                paranoid: true
            })
        }
    },
    postSettings: ({RequestSection, RequestCard}) => {
        RequestSection.hasMany(RequestCard, {as: 'cards', foreignKey: 'sectionId'})
    }
}
