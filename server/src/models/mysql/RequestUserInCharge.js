module.exports = {
    defineModel: (Sequelize, sequelize) => {
        const modelName = 'RequestUserInCharge';
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
                userId: {
                    type: Sequelize.INTEGER,
                },
                triggeredBy: {
                    type: Sequelize.STRING,
                    set(val) {
                        this.setDataValue('triggeredBy', (val == '' | val == null) ? null : val);
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
                tableName: "request_user_in_charge",
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                deletedAt: 'dateRemoved',
                paranoid: true,
                freezeTableName: true
            })
        }
    },
    postSettings: ({RequestUserInCharge,Request, User}) => {
        RequestUserInCharge.belongsTo(Request, {as: 'request', foreignKey: 'requestId'})
        RequestUserInCharge.belongsTo(User, {as: 'user', foreignKey: 'userId'})
    }
}
