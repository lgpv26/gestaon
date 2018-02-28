module.exports = {
    defineModel: (Sequelize, sequelize) => {
        const modelName = 'RequestTimeline';
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
                status: {
                    type: Sequelize.STRING,
                    default: null
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
                tableName: "request_timeline",
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                deletedAt: 'dateRemoved',
                paranoid: true,
                freezeTableName: true
            })
        }
    },
    postSettings: ({RequestTimeline,Request,User}) => {
        RequestTimeline.belongsTo(Request, {as: 'request', foreignKey: 'requestId'})
        RequestTimeline.belongsTo(User, {as: 'user', foreignKey: 'userId'})
        RequestTimeline.belongsTo(User, {as: 'triggered', foreignKey: 'triggeredBy'})
    }
}
