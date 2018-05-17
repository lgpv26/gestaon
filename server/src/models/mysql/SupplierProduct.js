import Sequelize from 'sequelize'
import _ from 'lodash'

module.exports = {
    defineModel: (server) => {
        const modelName = 'SupplierProduct';
        return {
            name: modelName,
            instance: server.sequelize.define(_.camelCase(modelName), {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                supplierId: {
                    type: Sequelize.INTEGER,
                },
                productId: {
                    type: Sequelize.INTEGER,
                },
                price: {
                    type: Sequelize.DECIMAL(10,2),
                    default: 0
                },
                quantity: {
                    type: Sequelize.INTEGER,
                    default: 0
                },
                price: {
                    type: Sequelize.DECIMAL(10,2),
                    default: 0
                },
                quantity: {
                    type: Sequelize.INTEGER,
                    default: 0
                },
                dateUpdated: {
                    type: Sequelize.DATE
                },
                dateCreated: {
                    type: Sequelize.DATE
                },
                dateRemoved: {
                    type: Sequelize.DATE
                }
            }, {
                tableName: 'supplier_product',
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                deletedAt: 'dateRemoved',
                paranoid: true,
                freezeTableName: true
            })
        }
    },
    postSettings: ({SupplierProduct, Supplier, Product}) => {
        SupplierProduct.belongsTo(Supplier, {as: 'supplier', foreignKey: 'supplierId'});
        SupplierProduct.belongsTo(Product, {as: 'product', foreignKey: 'productId'});
    }
};
