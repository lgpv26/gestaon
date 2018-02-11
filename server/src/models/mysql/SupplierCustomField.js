module.exports = {
    defineModel: (Sequelize, sequelize) => {
        const modelName = 'SupplierCustomField';
        return {
            name: modelName,
            instance: sequelize.define('supplierCustomField', {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                supplierId: {
                    type: Sequelize.INTEGER
                },
                customFieldId: {
                    type: Sequelize.INTEGER
                },
                value: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    set(val) {
                        this.setDataValue('value', (val == '' | val == null) ? null : val.toUpperCase().trim());
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
                tableName: 'supplier_custom_field',
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                deletedAt: 'dateRemoved',
                paranoid: true,
                freezeTableName: true
            })
        }
    },
    postSettings: ({SupplierCustomField, Supplier, CustomField}) => {
        SupplierCustomField.belongsTo(Supplier, {as: 'supplier', foreignKey: 'supplierId'});
        SupplierCustomField.belongsTo(CustomField, {as: 'customField', foreignKey: 'customFieldId'});
    }
};
