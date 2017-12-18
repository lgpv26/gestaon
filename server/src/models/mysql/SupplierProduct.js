module.exports = {
    defineModel: (Sequelize, sequelize) => {
        const modelName = 'SupplierProduct';
        return {
            name: modelName,
            instance: sequelize.define(modelName, {
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
