module.exports = {
    defineModel: (Sequelize, sequelize) => {
        const modelName = 'Product';
        return {
            name: modelName,
            instance: sequelize.define(modelName, {
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
                    type: Sequelize.DATE
                },
                dateCreated: {
                    type: Sequelize.DATE
                },
                dateRemoved: {
                    type: Sequelize.DATE
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
    postSettings: ({ Product, RequestProduct, Request, Supplier, SupplierProduct }) => {
        Product.hasMany(SupplierProduct, {as: 'productSuppliers', foreignKey: 'productId'});

        Product.belongsToMany(Request, {through: RequestProduct, as: 'productRequests', foreignKey: 'productId'});
        Product.belongsToMany(Supplier, {through: SupplierProduct, as: 'suppliers', foreignKey: 'productId'});
    }
}
