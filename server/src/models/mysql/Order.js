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
                companyId: {
                    type: Sequelize.INTEGER
                },
                userId: {
                    type: Sequelize.INTEGER
                },
                clientId: {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                    set(val) {
                        this.setDataValue('clientId', (val == '' | val == null) ? null : val);
                    }
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
    postSettings: ({Order,Client,User,OrderProduct,Product}) => {
        Order.belongsTo(Client, {as: 'client', foreignKey: 'clientId'});
        Order.belongsTo(User, {as: 'user', foreignKey: 'userId'});
        
        Order.hasMany(OrderProduct, {as: 'orderProducts', foreignKey: 'orderId'});
        Order.belongsToMany(Product, {through: OrderProduct, as: 'products', foreignKey: 'orderId'});
    }
}
