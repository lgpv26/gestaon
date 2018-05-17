import Sequelize from 'sequelize'
import _ from 'lodash'

module.exports = {
    defineModel: (server) => {
        const modelName = 'SupplierPhone';
        return {
            name: modelName,
            instance: server.sequelize.define(_.camelCase(modelName), {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                supplierId: {
                    type: Sequelize.INTEGER
                },
                ddd: {
                    type: Sequelize.STRING,
                    validate: {
                        isValidDDD(value){
                            if(parseInt(value) <= 9 || parseInt(value) > 99){
                                throw new Error('DDD inválido!');
                            }
                        }
                    }
                },
                number: {
                    type: Sequelize.STRING,
                    validate: {
                        isValidPhoneNumber(value){
                            if(parseInt(value) <= 9999999 || parseInt(value) > 999999999){
                                throw new Error('Número de telefone/celular inválido!');
                            }
                        }
                    }
                },
                name: {
                    type: Sequelize.STRING,
                    set(val){
                        this.setDataValue('name', (!val) ? null : val.toUpperCase().trim());
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
                tableName: 'supplier_phone',
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                deletedAt: 'dateRemoved',
                paranoid: true,
                freezeTableName: true
            })
        }
    },
    postSettings: ({SupplierPhone, Supplier}) => {
        SupplierPhone.belongsTo(Supplier, {as: 'supplier', foreignKey: 'supplierId'});
    }
};
