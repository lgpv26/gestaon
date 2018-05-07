import Sequelize from 'sequelize'

module.exports = {
    defineModel: (server) => {
        const modelName = 'ClientPhone';
        return {
            name: modelName,
            instance: server.sequelize.define('clientPhone', {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                clientId: {
                    type: Sequelize.INTEGER
                },
                number: {
                    type: Sequelize.STRING,
                    validate: {
                        isValidPhoneNumber(value){
                            if(parseInt(value) <= 999999999 || parseInt(value) > 99999999999){
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
