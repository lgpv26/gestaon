module.exports = {
    defineModel: (Sequelize, sequelize) => {
        const modelName = 'RequestProduct';
        return {
            name: modelName,
            instance: sequelize.define(modelName, {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                requestId: {
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
                tableName: 'request_product',
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                deletedAt: 'dateRemoved',
                freezeTableName: true
            })
        }
    },
    postSettings: ({RequestProduct, Request, Product}) => {
        RequestProduct.belongsTo(Request, {as: 'request', foreignKey: 'requestId'});
        RequestProduct.belongsTo(Product, {as: 'product', foreignKey: 'productId'});
    }
};
