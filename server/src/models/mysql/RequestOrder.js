import Sequelize from 'sequelize'

module.exports = {
    defineModel: (server) => {
        const modelName = 'RequestOrder';
        return {
            name: modelName,
            instance: server.sequelize.define(modelName, {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                obs: {
                    type: Sequelize.STRING,
                    set(val) {
                        this.setDataValue('obs', (val == '' | val == null) ? null : val.toUpperCase().trim());
                    }
                },
                dateUpdated: {
                    type: Sequelize.DATE
                },
                dateCreated: {
                    type: Sequelize.DATE
                },
                dateRemoved: {
                    type: Sequelize.DATE
                },
                status: Sequelize.STRING
            }, {
                tableName: "request_order",
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                deletedAt: 'dateRemoved',
                paranoid: true,
                freezeTableName: true
            })
        }
    },
    postSettings: ({RequestOrder,OrderProduct,Product}) => { 
        RequestOrder.hasMany(OrderProduct, {as: 'orderProducts', foreignKey: 'requestOrderId'});
        RequestOrder.belongsToMany(Product, {through: OrderProduct, as: 'products', foreignKey: 'requestOrderId'});
    }
}