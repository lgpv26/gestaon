import Sequelize from 'sequelize'
import _ from 'lodash'

module.exports = {
    defineModel: (server) => {
        const modelName = 'Enderecos';
        return {
            name: modelName,
            instance: server.sequelize.define(_.camelCase(modelName), {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                cep: Sequelize.STRING,
                logradouro: Sequelize.STRING,
                rua: Sequelize.STRING,
                bairro: Sequelize.STRING,
                cidade: Sequelize.STRING,
                estado: Sequelize.STRING
            }, {
                tableName: "enderecos",
                timestamps: false,
                paranoid: true,
                freezeTableName: true
            })
        }
    },
    postSettings: (models) => {
    }
}
