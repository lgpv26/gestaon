module.exports = {
    defineModel: (Sequelize, sequelize) => {
        const modelName = 'Request';
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
                tableName: "request",
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                deletedAt: 'dateRemoved',
                paranoid: true,
                freezeTableName: true
            })
        }
    },
    postSettings: ({Request,Client,User,RequestProduct,Product}) => {
        Request.belongsTo(Client, {as: 'client', foreignKey: 'clientId'});
        Request.belongsTo(User, {as: 'user', foreignKey: 'userId'});
        
        Request.hasMany(RequestProduct, {as: 'requestProducts', foreignKey: 'requestId'});
        Request.belongsToMany(Product, {through: RequestProduct, as: 'products', foreignKey: 'requestId'});
    }
}
