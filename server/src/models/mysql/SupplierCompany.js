import Sequelize from 'sequelize'

module.exports = {
    defineModel: (server) => {
        const modelName = 'SupplierCompany';
        return {
            name: modelName,
            instance: server.sequelize.define(modelName, {
                supplierId: {
                    type: Sequelize.INTEGER,
                    primaryKey: true
                },
                companyId: {
                    type: Sequelize.INTEGER,
                    primaryKey: true
                },
                dateUpdated: {
                    type: Sequelize.DATE
                },
                dateCreated: {
                    type: Sequelize.DATE
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
