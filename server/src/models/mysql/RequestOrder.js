import Sequelize from 'sequelize'
import _ from 'lodash'

module.exports = {
    defineModel: (server) => {
        const modelName = 'RequestOrder';
        return {
            name: modelName,
            instance: server.sequelize.define(_.camelCase(modelName), {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                promotionChannelId: {
                    type: Sequelize.INTEGER,
                    default: null
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
    postSettings: ({RequestOrder,RequestOrderProduct,Product, PromotionChannel}) => { 
        RequestOrder.hasMany(RequestOrderProduct, {as: 'requestOrderProducts', foreignKey: 'requestOrderId'})
        RequestOrder.belongsToMany(Product, {through: RequestOrderProduct, as: 'products', foreignKey: 'requestOrderId'})

        RequestOrder.belongsTo(PromotionChannel, {as: 'promotionChannel', foreignKey: 'promotionChannelId'})
    }
}
