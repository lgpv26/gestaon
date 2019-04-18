import Sequelize from 'sequelize'

import _ from 'lodash'

module.exports = {
    defineModel: (server) => {
        const modelName = 'clientes';
        return {
            name: modelName,
            instance: server.sequelizeImporter.define(_.camelCase(modelName), {
                codigo_clientes: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                nome: {
                    type: Sequelize.STRING,
                },
                cidade: {
                    type: Sequelize.STRING,
                },
                endereco: {
                    type: Sequelize.STRING,
                },
                numero: {
                    type: Sequelize.STRING,
                },
                complemento: {
                    type: Sequelize.STRING,
                },
                bairro: {
                    type: Sequelize.STRING,
                },
                cep: {
                    type: Sequelize.STRING,
                },
                estado: {
                    type: Sequelize.STRING,
                },
                codigo_tipoCLiente: {
                    type: Sequelize.INTEGER,
                },
                OBS: {
                    type: Sequelize.STRING,
                },
                DataCadastro: {
                    type: Sequelize.DATE,
                },
                Data_Ultima_Compra: {
                    type: Sequelize.DATE
                },
            }, {
                tableName: "clientes",
                timestamps: true,
                createdAt: 'DataCadastro',
                updatedAt: 'Data_Ultima_Compra',
                freezeTableName: true
            })
        }
    },

    postSettings: ({clientes, telefones, tipocliente}) => {
        clientes.hasMany(telefones, {as: 'telefones', foreignKey: 'Codigo_Cliente'})
        clientes.belongsTo(tipocliente, {as: 'tipocliente', foreignKey: 'codigo_tipoCLiente'})
    }

}
