import Sequelize from 'sequelize'

module.exports = {
    defineModel: (server) => {
        const modelName = 'SupplierAddress';
        return {
            name: modelName,
            instance: server.sequelize.define('supplierAddress', {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                supplierId: {
                    type: Sequelize.INTEGER
                },
                addressId: {
                    type: Sequelize.INTEGER
                },
                name: {
                    type: Sequelize.STRING,
                    set(val) {
                        this.setDataValue('name', (val == '' | val == null) ? null : val.toUpperCase().trim());
                    }
                },
                number: {
                    type: Sequelize.INTEGER
                },
                complement: {
                    type: Sequelize.STRING,
                    set(val) {
                        this.setDataValue('complement', (val == '' | val == null) ? null : val.toUpperCase().trim());
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
                tableName: 'supplier_address',
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                deletedAt: 'dateRemoved',
                paranoid: true,
                freezeTableName: true
            })
        }
    },
    postSettings: ({SupplierAddress, Supplier, Address}) => {
        SupplierAddress.belongsTo(Address, {as: 'address', foreignKey: 'addressId'});
        SupplierAddress.belongsTo(Supplier, {as: 'supplier', foreignKey: 'supplierId'});
    }
}
