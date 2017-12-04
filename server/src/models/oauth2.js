const OAuth2Server = require('oauth2-server');
const config = require('../config');
const bcrypt = require('bcryptjs');

module.exports = (server) => {
    return new OAuth2Server({
        requireClientAuthentication: {
            password: false
        },
        model: {
            getClient(clientId, clientSecret){
                return new Promise((resolve, reject) => {
                    switch (clientId) {
                        case config.oAuth2.webClient.encryptedId:
                            if(clientSecret === config.oAuth2.webClient.encryptedSecret){
                                resolve({
                                    id: config.oAuth2.webClient.encryptedId,
                                    grants: ['password','refresh_token']
                                });
                            }
                            else {
                                reject(new Error("Invalid client_secret."));
                            }
                            break;
                        case config.oAuth2.rnClient.encryptedId:
                            if(clientSecret === config.oAuth2.rnClient.encryptedSecret){
                                resolve({
                                    id: config.oAuth2.rnClient.encryptedId,
                                    grants: ['password','refresh_token']
                                });
                            }
                            else {
                                reject(new Error("Invalid client_secret."));
                            }
                            break;
                        default:
                            reject(new Error("Invalid client_id."));
                            break;
                    }
                });
            },
            getUser(email, password){
                return server.mysql.User.findOne({
                    where: {
                        email: email
                    },
                    include: [
                        {
                            model: server.mysql.Company,
                            as:'companies',
                            include: [
                                {
                                    model: server.mysql.CompanySetting,
                                    as:'companySettings'
                                }
                            ],
                        }
                    ]
                }).then((user) => {
                    if(!user){
                        throw new Error('Invalid e-mail or password.');
                    }
                    if(!bcrypt.compareSync(password, user.password)){
                        throw new Error("Password is not valid.");
                    }
                    return user;
                });
            },
            saveToken(token, client, user){
                return server.sequelize.transaction((t) => {
                    return server.mysql.UserAccessToken.create({
                        accessToken: token.accessToken,
                        expiresAt: token.accessTokenExpiresAt,
                        scope: token.scope,
                        appId: client.id,
                        userId: user.id
                    }, {transaction: t}).then((userAccessToken) => {
                        return server.mysql.UserRefreshToken.create({
                            refreshToken: token.refreshToken,
                            expiresAt: token.refreshTokenExpiresAt,
                            scope: token.scope,
                            appId: client.id,
                            userId: user.id
                        }, {transaction: t}).then((userRefreshToken) => {
                            return {
                                userAccessToken,
                                userRefreshToken
                            };
                        });
                    });
                }).then(({userAccessToken, userRefreshToken}) => {
                    return {
                        accessToken: userAccessToken.accessToken,
                        accessTokenExpiresAt: userAccessToken.expiresAt,
                        refreshToken: userRefreshToken.refreshToken,
                        refreshTokenExpiresAt: userRefreshToken.expiresAt,
                        scope: userAccessToken.scope,
                        client: {
                            id: client.id
                        },
                        user
                    };
                }).catch((err) => {
                    console.log("Error saving user Access Token.", err);
                    return err;
                });
            },
            getRefreshToken(refreshToken){
                return server.mysql.UserRefreshToken.findOne({
                    where: {
                        refreshToken: refreshToken
                    },
                    include: [
                        {
                            model: server.mysql.User,
                            as: 'user',
                            include:[
                                {
                                    model: server.mysql.Company,
                                    as: 'companies',
                                    include: [
                                        {
                                            model: server.mysql.CompanySetting,
                                            as: 'companySettings'
                                        }
                                    ],
                                }
                            ]
                        }
                    ]
                }).then((refreshToken) => {
                    if(!refreshToken){
                        throw new Error("Invalid refresh token.");
                    }
                    return {
                        refreshToken: refreshToken.refreshToken,
                        refreshTokenExpiresAt: refreshToken.expiresAt,
                        scope: refreshToken.scope,
                        client: {
                            id: refreshToken.appId
                        },
                        user: refreshToken.user
                    };
                });
            },
            revokeToken(token){
                return server.mysql.UserRefreshToken.destroy({
                    where: {
                        refreshToken: token.refreshToken
                    }
                });
            }
        }
    });
}