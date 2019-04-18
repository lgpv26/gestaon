import Sequelize from 'sequelize'
import _ from 'lodash'

module.exports = {
    defineModel: (server) => {
        const TIMESTAMP = require('sequelize-mysql-timestamp')(server.sequelize);
        const modelName = 'Product';
        return {
            name: modelName,
            instance: server.sequelize.define(_.camelCase(modelName), {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                name: {
                    type: Sequelize.STRING,
                    set(val) {
                        this.setDataValue('name', (val == '' | val == null) ? null : val.toUpperCase().trim());
                    }
                },
                companyId: {
                    type: Sequelize.INTEGER
                },
                price: {
                    type: Sequelize.DECIMAL(10,2),
                    default: null
                },
                quantity: {
                    type: Sequelize.INTEGER,
                    default: null
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
                    type: Sequelize.STRING,
                    default: 'activated'
                }
            }, {
                tableName: "product",
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                deletedAt: 'dateRemoved',
                paranoid: true,
                freezeTableName: true
            })
        }
    },
    postSettings: ({ Product, RequestOrderProduct, RequestOrder, Supplier, SupplierProduct }) => {
        Product.hasMany(SupplierProduct, {as: 'productSuppliers', foreignKey: 'productId'});

        Product.belongsToMany(RequestOrder, {through: RequestOrderProduct, as: 'requestOroductOrders', foreignKey: 'productId'});
        Product.belongsToMany(Supplier, {through: SupplierProduct, as: 'suppliers', foreignKey: 'productId'});
    }
}
