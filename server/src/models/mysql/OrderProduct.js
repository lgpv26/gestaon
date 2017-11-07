module.exports = {
    defineModel: (Sequelize, sequelize) => {
        const modelName = 'OrderProduct';
        return {
            name: modelName,
            instance: sequelize.define(modelName, {
                orderId: {
                    type: Sequelize.INTEGER,
                    primaryKey: true
                },
                productId: {
                    type: Sequelize.INTEGER,
                    primaryKey: true
                },
                quantity: Sequelize.INTEGER,
                unitPrice: {
                    type: Sequelize.DECIMAL(10,2),
                    default: 0
                },
                unitDiscount: {
                    type: Sequelize.DECIMAL(10,2),
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
                tableName: 'order_product',
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                deletedAt: 'dateRemoved',
                freezeTableName: true
            })
        }
    },
    postSettings: ({OrderProduct, Order, Product}) => {
        OrderProduct.belongsTo(Order, {as: 'order', foreignKey: 'orderId'});
        OrderProduct.belongsTo(Product, {as: 'product', foreignKey: 'productId'});
    }
};
