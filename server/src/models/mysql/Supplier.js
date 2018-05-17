import Sequelize from 'sequelize'
import _ from 'lodash'

module.exports = {
    defineModel: (server) => {
        const modelName = 'Supplier';
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
                    allowNull: false,
                    validate: {
                        len: {
                            args: [2, 55],
                            msg: "O nome deve possuir entre 2 a 55 dígitos."
                        }
                    },
                    set(val) {
                        this.setDataValue('name', (val === '' || val === null) ? null : val.toUpperCase().trim());
                    }
                },
                obs: {
                    type: Sequelize.STRING,
                    set(val) {
                        this.setDataValue('obs', (val == '' | val == null) ? null : val.toUpperCase().trim());
                    }
                },
                addressId: {
                    type: Sequelize.INTEGER
                },
                addressNumber: {
                    type: Sequelize.INTEGER
                },
                addressComplement: {
                    type: Sequelize.STRING,
                    set(val) {
                        this.setDataValue('addressComplement', (val == '' | val == null) ? null : val.toUpperCase().trim());
                    }
                },
                email: {
                    type: Sequelize.STRING,
                    validate: {
                        isEmail: {
                            msg: "Formato de e-mail inválido!"
                        }
                    },
                    set(val) {
                        this.setDataValue('email', (val === '' || val === null) ? null : val.toLowerCase().trim());
                    }
                },
                phoneDDD: {
                    type: Sequelize.STRING,
                    validate: {
                        isValidDDD(value) {
                            if (parseInt(value) <= 9 || parseInt(value) > 99) {
                                throw new Error('DDD inválido!');
                            }
                        }
                    }
                },
                phoneNumber: {
                    type: Sequelize.STRING,
                    validate: {
                        isValidPhoneNumber(value) {
                            if (parseInt(value) <= 9999999 || parseInt(value) > 999999999) {
                                throw new Error('Número de telefone/celular inválido!');
                            }
                        }
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
                status: {
                    type: Sequelize.STRING,
                    defaultValue: 'activated'
                }
            }, {
                    tableName: "supplier",
                    timestamps: true,
                    updatedAt: 'dateUpdated',
                    createdAt: 'dateCreated',
                    deletedAt: 'dateRemoved',
                    paranoid: true,
                    freezeTableName: true
                })
        }
    },
    postSettings: ({ Supplier, Company, SupplierCompany, SupplierProduct, Product, Address, SupplierAddress, SupplierPhone, SupplierCustomField, CustomField }) => {
        Supplier.hasMany(SupplierCompany, {as: 'supplierCompanies', foreignKey: 'supplierId'});
        Supplier.belongsToMany(Company, { through: SupplierCompany, as: 'companies', foreignKey: 'supplierId' });

        Supplier.hasMany(SupplierProduct, {as: 'supplierProducts', foreignKey: 'supplierId'});
        Supplier.belongsToMany(Product, { through: SupplierProduct, as: 'products', foreignKey: 'supplierId' });

        Supplier.hasMany(SupplierAddress, {as: 'supplierAddresses', foreignKey: 'supplierId'});
        Supplier.belongsToMany(Address, {through: SupplierAddress, as: 'addresses', foreignKey: 'supplierId'});

        Supplier.hasMany(SupplierPhone, {as: 'supplierPhones', foreignKey: 'supplierId'});

        Supplier.hasMany(SupplierCustomField, {as: 'supplierCustomFields', foreignKey: 'supplierId'});
        Supplier.belongsToMany(CustomField, { through: SupplierCustomField, as: 'customFields', foreignKey: 'supplierId' });
    }
}
