import {Op} from 'sequelize'
import _ from 'lodash'

module.exports = (server) => { return {
    name: "push-notification",
    actions: {
        push(ctx){
            return server.mysql.UserAccessToken.findOne({
                where: {
                    userId: ctx.params.data.userId,
                    fcmToken: {
                        [Op.ne]: null
                    }
                },
                order: [
                    [ 'dateCreated', 'DESC' ]
                ]
            }).then((userAccessToken) => {
                if(!userAccessToken){
                    if(ctx.params.notRejectNotLogged){
                        return "User didn't logged in through the app before"
                    }
                    else{
                        return Promise.reject("User didn't logged in through the app before")
                    }
                }
                const message = {
                    data: ctx.params.data.payload,
                    android: {
                        priority: 'high'
                    },
                    token: userAccessToken.fcmToken
                }

                const sendMessage = server.firebaseAdmin.messaging().send(message)

                let sound = _.get(ctx.params.data,'sound','sound1') + '.mp3'

                const notification = {
                    data: ctx.params.data.payload,
                    notification: {
                        title: ctx.params.data.title,
                        body: ctx.params.data.message
                    },
                    android: {
                        priority: 'high',
                        notification: {
                            title: ctx.params.data.title,
                            body: ctx.params.data.message,
                            icon : 'icon_notification',
                            color : '#059A79',
                            sound : sound
                        }
                    },
                    token: userAccessToken.fcmToken
                }

                const sendNotification = server.firebaseAdmin.messaging().send(notification)

                return Promise.all([sendMessage, sendNotification])
            })
        }
    }
}}