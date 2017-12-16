module.exports = {
    defineModel: (Sequelize, sequelize) => {
        const modelName = 'SupplierProduct';
        return {
            name: modelName,
            instance: sequelize.define(modelName, {
                supplierId: {
                    type: Sequelize.INTEGER,
                    primaryKey: true
                },
                productId: {
                    type: Sequelize.INTEGER,
                    primaryKey: true
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
                }
            }, {
                tableName: 'supplier_product',
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                freezeTableName: true
            })
        }
    },
    postSettings: ({SupplierProduct, Supplier, Product}) => {
        SupplierProduct.belongsTo(Supplier, {as: 'supplier', foreignKey: 'supplierId'});
        SupplierProduct.belongsTo(Product, {as: 'product', foreignKey: 'productId'});
    }
};
