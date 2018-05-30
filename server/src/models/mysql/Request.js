import Sequelize from 'sequelize'

const Controller = require('./../Controller')
import _ from 'lodash'

module.exports = {
    defineModel: (server) => {
        const TIMESTAMP = require('sequelize-mysql-timestamp')(server.sequelize);
        const modelName = 'Request';
        return {
            name: modelName,
            instance: server.sequelize.define(_.camelCase(modelName), {
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
                requestOrderId: {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                    set(val) {
                        this.setDataValue('requestOrderId', (val == '' | val == null) ? null : val);
                    }
                },
                taskId: {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                    set(val) {
                        this.setDataValue('taskId', (val == '' | val == null) ? null : val);
                    }
                },
                deadlineDatetime: {
                    type: TIMESTAMP
                },
                isScheduled: {
                    type: Sequelize.BOOLEAN,
                    defaultValue: false
                },
                obs: {
                    type: Sequelize.STRING,
                    set(val) {
                        this.setDataValue('obs', (val == '' | val == null) ? null : val.toUpperCase().trim());
                    }
                },
                dateUpdated: {
                    type: TIMESTAMP
                },
                dateCreated: {
                    type: TIMESTAMP
                },
                dateRemoved: {
                    type: TIMESTAMP
                },
                status: {
                    type: Sequelize.ENUM('pending','finished')
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

    postSettings: ({Request,Company,Client,User,RequestOrder,RequestClientPhone,RequestClientAddress,RequestTimeline,
        ClientPhone,ClientAddress,RequestPaymentMethod, PaymentMethod}) => {

        Request.belongsTo(Company, {as: 'company', foreignKey: 'companyId'})
        Request.belongsTo(Client, {as: 'client', foreignKey: 'clientId'})
        Request.belongsTo(RequestOrder, {as: 'requestOrder', foreignKey: 'requestOrderId'})

        Request.belongsTo(User, {as: 'responsibleUser', foreignKey: 'userId'})

        Request.hasMany(RequestTimeline, {as: 'requestTimeline', foreignKey: 'requestId'})

        Request.hasMany(RequestPaymentMethod, {as: 'requestPaymentMethods', foreignKey: 'requestId'})
        Request.belongsToMany(PaymentMethod, {through: RequestPaymentMethod, as: 'paymentMethod', foreignKey: 'requestId'})

        Request.hasMany(RequestClientPhone, {as: 'requestClientPhones', foreignKey: 'requestId'});
        Request.belongsToMany(ClientPhone, { through: RequestClientPhone, as: 'clientPhones', foreignKey: 'requestId' });

        Request.hasMany(RequestClientAddress, {as: 'requestClientAddresses', foreignKey: 'requestId'});
        Request.belongsToMany(ClientAddress, { through: RequestClientAddress, as: 'clientAddresses', foreignKey: 'requestId' });
    }

}
