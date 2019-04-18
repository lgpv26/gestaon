import Sequelize from 'sequelize'
import _ from 'lodash'

module.exports = {
    defineModel: (server) => {
        const TIMESTAMP = require('sequelize-mysql-timestamp')(server.sequelize);
        const modelName = 'SupplierCustomField';
        return {
            name: modelName,
            instance: server.sequelize.define(_.camelCase(modelName), {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                supplierId: {
                    type: Sequelize.INTEGER
                },
                customFieldId: {
                    type: Sequelize.INTEGER
                },
                value: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    set(val) {
                        this.setDataValue('value', (val == '' | val == null) ? null : val.toUpperCase().trim());
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
                tableName: 'supplier_custom_field',
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                deletedAt: 'dateRemoved',
                paranoid: true,
                freezeTableName: true
            })
        }
    },
    postSettings: ({SupplierCustomField, Supplier, CustomField}) => {
        SupplierCustomField.belongsTo(Supplier, {as: 'supplier', foreignKey: 'supplierId'});
        SupplierCustomField.belongsTo(CustomField, {as: 'customField', foreignKey: 'customFieldId'});
    }
};
