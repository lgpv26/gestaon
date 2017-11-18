module.exports = {
    defineModel: (Sequelize, sequelize) => {
        const modelName = 'Company';
        return {
            name: modelName,
            instance: sequelize.define(modelName, {
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
                            args: [3, 20],
                            msg: "O nome da empresa deve possuir entre 5 a 20 dígitos."
                        }
                    },
                    set(val) {
                        this.setDataValue('name', (val == '' | val == null) ? null : val.toUpperCase().trim());
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
                tableName: "company",
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                deletedAt: 'dateRemoved',
                paranoid: true,
                freezeTableName: true
            })
        }
    },
    postSettings: ({Company, Device, CompanyUser, User, CompanySetting, Supplier, SupplierCompany}) => {
        Company.belongsToMany(User, {through: CompanyUser, as: 'users', foreignKey: 'companyId'});
        Company.belongsToMany(Supplier, {through: SupplierCompany, as: 'companySuppliers', foreignKey: 'companyId'});
        
        Company.hasMany(CompanyUser, {as: 'companyUsers', foreignKey: 'companyId'});
        Company.hasMany(Device, {as: 'devices', foreignKey: 'companyId'});
        Company.hasMany(CompanySetting,  {as: 'companySettings', foreignKey: 'companyId'});
    }
}
