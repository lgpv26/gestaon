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
                const message = {
                    to: userAccessToken.fcmToken, // required fill with device token or topics
                    collapse_key: null,
                    priority: 'HIGH',
                    data: {
                        your_custom_data_key: 'your_custom_data_value'
                    },
                    notification: {
                        title: ctx.params.data.title,
                        body: ctx.params.data.message,
                        icon : 'icon_notification',
                        color : '#059A79',
                        sound : 'notification'
                    }
                }
                if(_.get(ctx.params,'data.payload',false)){
                    _.assign(message, {
                        data: ctx.params.data.payload
                    })
                }
                server.fcm.send(message)
            })
        }
    }
}}