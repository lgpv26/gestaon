module.exports = {
    defineModel: (Sequelize, sequelize) => {
        const modelName = 'ClientPhone';
        return {
            name: modelName,
            instance: sequelize.define('clientPhone', {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                clientId: {
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
                tableName: 'client_phone',
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                deletedAt: 'dateRemoved',
                paranoid: true,
                freezeTableName: true
            })
        }
    },
    postSettings: ({ClientPhone, Client}) => {
        ClientPhone.belongsTo(Client, {as: 'client', foreignKey: 'clientId'});
    }
};
