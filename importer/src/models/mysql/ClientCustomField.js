import Sequelize from 'sequelize'
import _ from 'lodash'

module.exports = {
    defineModel: (server) => {
        const TIMESTAMP = require('sequelize-mysql-timestamp')(server.sequelize);
        const modelName = 'ClientCustomField';
        return {
            name: modelName,
            instance: server.sequelize.define(_.camelCase(modelName), {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                clientId: {
                    type: Sequelize.INTEGER
                },
                customFieldId: {
                    type: Sequelize.INTEGER
                },
                value: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    set(val) {
                        this.setDataValue('value', (val == '' | val == null) ? 'Nada preenchido' : _.toUpper(val).trim());
                    }
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
                tableName: 'client_custom_field',
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                deletedAt: 'dateRemoved',
                paranoid: true,
                freezeTableName: true
            })
        }
    },
    postSettings: ({ClientCustomField, Client, CustomField}) => {
        ClientCustomField.belongsTo(Client, {as: 'client', foreignKey: 'clientId'});
        ClientCustomField.belongsTo(CustomField, {as: 'customField', foreignKey: 'customFieldId'});
    }
};
