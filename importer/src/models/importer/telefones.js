import Sequelize from 'sequelize'

import _ from 'lodash'

module.exports = {
    defineModel: (server) => {
        const modelName = 'telefones';
        return {
            name: modelName,
            instance: server.sequelizeImporter.define(_.camelCase(modelName), {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                Codigo_Cliente: {
                    type: Sequelize.STRING
                },
                Telefone: {
                    type: Sequelize.STRING
                }
            }, {
                tableName: "telefones",
                timestamps: false,
                freezeTableName: true
            })
        }
    },

    postSettings: ({telefones, clientes}) => {
        telefones.belongsTo(clientes, {as: 'telefone', foreignKey: 'Codigo_Cliente'})
    }

}
