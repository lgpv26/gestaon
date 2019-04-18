import Sequelize from 'sequelize'

import _ from 'lodash'

module.exports = {
    defineModel: (server) => {
        const modelName = 'tipocliente';
        return {
            name: modelName,
            instance: server.sequelizeImporter.define(_.camelCase(modelName), {
                codigo: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                descricao: {
                    type: Sequelize.STRING
                }
            }, {
                tableName: "tipocliente",
                timestamps: false,
                freezeTableName: true
            })
        }
    },

    postSettings: ({tipocliente, clientes}) => {
        tipocliente.hasMany(clientes, {as: 'tipo', foreignKey: 'codigo_tipoCLiente'})
    }

}
