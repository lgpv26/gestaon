import Sequelize from 'sequelize'

const Controller = require('./../Controller')
const _ = require('lodash')

module.exports = {
    defineModel: (server) => {
        const modelName = 'Request';
        return {
            name: modelName,
            instance: server.sequelize.define(modelName, {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                companyId: {
                    type: Sequelize.INTEGER
                },
                clientId: {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                    set(val) {
                        this.setDataValue('clientId', (val == '' | val == null) ? null : val);
                    }
                },
                orderId: {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                    set(val) {
                        this.setDataValue('orderId', (val == '' | val == null) ? null : val);
                    }
                },
                taskId: {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                    set(val) {
                        this.setDataValue('taskId', (val == '' | val == null) ? null : val);
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
                }
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

    postSettings: ({Request,Company,Client,Order,RequestClientPhone,RequestClientAddress,RequestTimeline,
        ClientPhone,ClientAddress}) => {

        Request.belongsTo(Company, {as: 'company', foreignKey: 'companyId'})
        Request.belongsTo(Client, {as: 'client', foreignKey: 'clientId'})
        Request.belongsTo(Order, {as: 'order', foreignKey: 'orderId'})

        Request.hasMany(RequestTimeline, {as: 'requestTimeline', foreignKey: 'requestId'});

        Request.hasMany(RequestClientPhone, {as: 'requestClientPhones', foreignKey: 'requestId'});
        Request.belongsToMany(ClientPhone, { through: RequestClientPhone, as: 'clientPhones', foreignKey: 'requestId' });

        Request.hasMany(RequestClientAddress, {as: 'requestClientAddresses', foreignKey: 'requestId'});
        Request.belongsToMany(ClientAddress, { through: RequestClientAddress, as: 'clientAddresses', foreignKey: 'requestId' });
    }

}
