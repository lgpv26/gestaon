import Sequelize from 'sequelize'
import _ from 'lodash'

module.exports = {
    defineModel: (server) => {
        const TIMESTAMP = require('sequelize-mysql-timestamp')(server.sequelize);
        const modelName = 'CompanySetting';
        return {
            name: modelName,
            instance: server.sequelize.define(_.camelCase(modelName), {
                companyId: {
                    type: Sequelize.INTEGER,
                    primaryKey: true
                },
                name: {
                    type: Sequelize.STRING,
                    primaryKey: true
                },
                value: {
                    type: Sequelize.STRING,
                },
                dateUpdated: {
                    type: TIMESTAMP,
                },
                dateCreated: {
                    type: TIMESTAMP,
                }
            }, {
                tableName: "company_setting",
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                paranoid: false,
                freezeTableName: true
            })
        }
    },
    postSettings: ({CompanySetting,Company}) => {
        CompanySetting.belongsTo(Company, {as: 'company'});
    }
}
