module.exports = {
    defineModel: (Sequelize, sequelize) => {
        const modelName = 'Address';
        return {
            name: modelName,
            instance: sequelize.define(modelName, {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                companyId: {
                    type: Sequelize.INTEGER,
                    field: 'company_id'
                },
                originId: {
                    type: Sequelize.INTEGER,
                    field: 'origin_id'
                },
                name: {
                    type: Sequelize.STRING,
                    set(val) {
                        this.setDataValue('name', (val == '' | val == null) ? null : val.toUpperCase().trim());
                    }
                },
                neighborhood: {
                    type: Sequelize.STRING,
                    set(val) {
                        this.setDataValue('neighborhood', (val == '' | val == null) ? null : val.toUpperCase().trim());
                    }
                },
                city: {
                    type: Sequelize.STRING,
                    set(val) {
                        this.setDataValue('city', (val == '' | val == null) ? null : val.toUpperCase().trim());
                    }
                },
                state: {
                    type: Sequelize.STRING,
                    set(val) {
                        this.setDataValue('state', (val == '' | val == null) ? null : val.toUpperCase().trim());
                    }
                },
                cep: {
                    type: Sequelize.STRING
                },
                dateUpdated: {
                    type: Sequelize.DATE,
                    field: 'date_updated'
                },
                dateCreated: {
                    type: Sequelize.DATE,
                    field: 'date_created'
                },
                dateRemoved: {
                    type: Sequelize.DATE,
                    field: 'date_removed'
                },
                status: {
                    type: Sequelize.STRING,
                    defaultValue: 'activated'
                }
            }, {
                tableName: "address",
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                deletedAt: 'dateRemoved',
                paranoid: true,
                freezeTableName: true
            })
        }
    },
    postSettings: ({Address, Client, ClientAddress}) => {
        Address.belongsToMany(Client, {through: ClientAddress, as: 'addressClients', foreignKey: 'addressId'});
    }
};
