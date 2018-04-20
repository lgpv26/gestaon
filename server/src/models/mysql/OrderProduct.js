import Sequelize from 'sequelize'

module.exports = {
    defineModel: (server) => {
        const modelName = 'OrderProduct';
        return {
            name: modelName,
            instance: server.sequelize.define(modelName, {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                requestOrderId: {
                    type: Sequelize.INTEGER
                },
                productId: {
                    type: Sequelize.INTEGER
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
    postSettings: ({OrderProduct, RequestOrder, Product}) => {
        OrderProduct.belongsTo(RequestOrder, {as: 'requestOrder', foreignKey: 'requestOrderId'});
        OrderProduct.belongsTo(Product, {as: 'product', foreignKey: 'productId'});
    }
};
