import Sequelize from 'sequelize'
import _ from 'lodash'

module.exports = {
    defineModel: (server) => {
        const TIMESTAMP = require('sequelize-mysql-timestamp')(server.sequelize);
        const modelName = 'SupplierCompany';
        return {
            name: modelName,
            instance: server.sequelize.define(_.camelCase(modelName), {
                supplierId: {
                    type: Sequelize.INTEGER,
                    primaryKey: true
                },
                companyId: {
                    type: Sequelize.INTEGER,
                    primaryKey: true
                },
                dateUpdated: {
                    type: TIMESTAMP
                },
                dateCreated: {
                    type: TIMESTAMP
                }
            }, {
                tableName: 'supplier_company',
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                freezeTableName: true
            })
        }
    },
    postSettings: ({SupplierCompany, Supplier, Company}) => {
        SupplierCompany.belongsTo(Supplier, {as: 'supplier', foreignKey: 'supplierId'})
        SupplierCompany.belongsTo(Company, {as: 'company', foreignKey: 'companyId'})
    }
};
