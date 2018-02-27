const bcrypt = require('bcryptjs');
const _ = require('lodash');

module.exports = {
    defineModel: (Sequelize, sequelize) => {
        const modelName = 'User';
        return {
            name: modelName,
            instance: sequelize.define(modelName, {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                activeCompanyUserId: {
                    type: Sequelize.INTEGER,
                    defaultValue: null
                },
                name: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    validate: {
                        len: {
                            args: [2, 55],
                            msg: "O nome deve possuir entre 2 a 55 dígitos."
                        }
                    },
                    set(val) {
                        this.setDataValue('name', (val === '' || val === null) ? null : val.toUpperCase().trim());
                    }
                },
                email: {
                    type: Sequelize.STRING,
                    validate: {
                        isEmail: {
                            msg: "Formato de e-mail inválido!"
                        }
                    },
                    set(val) {
                        this.setDataValue('email', (val === '' || val === null) ? null : val.toLowerCase().trim());
                    }
                },
                type: {
                    type: Sequelize.STRING,
                    validate: {
                        isIn: {
                            args: [['admin', 'user']],
                            msg: "Tipo de usuário inválido! O valor deve ser \"admin\" ou \"user\"."
                        }
                    }
                },
                password: {
                    type: Sequelize.STRING,
                    validate: {
                        min: {
                            args: 7,
                            msg: "A senha deve possuir no mínimo 7 dígitos."
                        }
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
                tableName: "user",
                timestamps: true,
                updatedAt: 'dateUpdated',
                createdAt: 'dateCreated',
                deletedAt: 'dateRemoved',
                paranoid: false,
                freezeTableName: true,
                hooks: {
                    beforeCreate(instance){
                        instance.password = bcrypt.hashSync(instance.password, 8);
                    }
                }
            })
        };
    },
    postSettings({User, CompanyUser, Company, UserAccessToken, UserRefreshToken, Request, RequestUserInCharge}){
        User.belongsToMany(Company, {through: CompanyUser, as: 'companies', foreignKey: 'userId'});
        User.hasMany(CompanyUser, {as: 'userCompanies', foreignKey: 'userId'});
        User.hasMany(UserAccessToken, {as: 'userAccessTokens', foreignKey: 'userId'});
        User.hasMany(UserRefreshToken, {as: 'userRefreshTokens', foreignKey: 'userId'});
        User.queryMappings = {
            companies: {
                model: CompanyUser
            },
            userCompanies: {
                model: CompanyUser
            }
        };
        User.addScope('companies', {
            include: [
                { model: Company, as: 'companies' }
            ]
        });
        User.addScope('userCompanies', {
            include: [
                { model: CompanyUser, as: 'userCompanies' }
            ]
        });
        User.hasMany(Request, {as: 'userRequests', foreignKey: 'userId'});
    },
    afterPostSettings(models){
    }
};

