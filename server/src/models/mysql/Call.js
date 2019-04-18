import Sequelize from 'sequelize'
import _ from 'lodash'

module.exports = {
    defineModel: (server) => {
        const TIMESTAMP = require('sequelize-mysql-timestamp')(server.sequelize);
        const modelName = 'Call';
        return {
            name: modelName,
            instance: server.sequelize.define(_.camelCase(modelName), {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                companyId: {
                    type: Sequelize.INTEGER
                },
                number: {
                    type: Sequelize.STRING,
                    validate: {
                        isValidPhoneNumber(value){
                            if(parseInt(value) <= 999999999 || parseInt(value) > 99999999999){
                                throw new Error('Número de telefone/celular inválido!')
                            }
                        }
                    }
                },
                destination: {
                    type: Sequelize.STRING,
                    set(val){
                        this.setDataValue('destination', (!val) ? null : val.toUpperCase().trim())
                    }
                },
                isAnonymous: {
                    type: Sequelize.BOOLEAN,
                    defaultValue: false
                },
                isValid: {
                    type: Sequelize.BOOLEAN,
                    defaultValue: false
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
                    defaultValue: 'activated'
                }
            }, {
                tableName: 'call',
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                deletedAt: 'dateRemoved',
                paranoid: true,
                freezeTableName: true
            })
        }
    },
    postSettings: ({Call, Company}) => {
        Call.belongsTo(Company, {as: 'company', foreignKey: 'companyId'})
    }
};
