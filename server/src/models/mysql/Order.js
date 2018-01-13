module.exports = {
    defineModel: (Sequelize, sequelize) => {
        const modelName = 'Order';
        return {
            name: modelName,
            instance: sequelize.define(modelName, {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                clientAddressId: {
                    type: Sequelize.INTEGER,
                    set(val) {
                        this.setDataValue('clientAddressId', (val == '' | val == null) ? null : val);
                    }
                },
                clientPhoneId: {
                    type: Sequelize.INTEGER,
                    set(val) {
                        this.setDataValue('clientPhoneId', (val == '' | val == null) ? null : val);
                    }
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
                tableName: "order",
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                deletedAt: 'dateRemoved',
                paranoid: true,
                freezeTableName: true
            })
        }
    },
    postSettings: ({Order,OrderProduct,Product}) => {
        
        Order.hasMany(OrderProduct, {as: 'orderProducts', foreignKey: 'orderId'});
        Order.belongsToMany(Product, {through: OrderProduct, as: 'products', foreignKey: 'orderId'});
    }
}
