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
                        return Promise.reject(new Error("User didn't logged in through the app before"))
                    }
                }

                let message = {
                    data: ctx.params.data.payload,
                    android: {
                        priority: 'high'
                    },
                    token: userAccessToken.fcmToken
                }

                server.firebaseAdmin.messaging().send(message).then((response) => {
                    console.log('Successfully sent message:', response)
                }).catch((error) => {
                    console.log('Error sending message:', error)
                })

                message = {
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
                            sound : 'sound1.mp3'
                        }
                    },
                    token: userAccessToken.fcmToken
                }

                server.firebaseAdmin.messaging().send(message).then((response) => {
                    console.log('Successfully sent notification:', response)
                }).catch((error) => {
                    console.log('Error sending notification:', error)
                })
            })
        }
    }
}}