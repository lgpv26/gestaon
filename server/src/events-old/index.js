import fs from 'fs'
import path from 'path'
import _ from 'lodash'

module.exports = class Sockets {

    constructor(server){
        this.server = server
        this.eventFiles = fs.readdirSync(path.join(__dirname, '/')).filter((fileName) => {
            return fileName !== 'index.js'
        }).map((directory) => {
            return {
                directoryName: directory,
                files: _.filter(fs.readdirSync(path.join(__dirname, '/', directory, '/')), (fileName) => {
                    return directory + '.js' !== fileName && fileName !== 'index.js'
                })
            }
        })
    }

    setMainEvents(){
        this.server.io.on('connection', (socket) => {
            let token = socket.handshake.query.token, user
            this.server.mysql.UserAccessToken.findOne({
                where: {
                    accessToken: token
                },
                include: [
                    {
                        model: this.server.mysql.User,
                        as: 'user',
                        include: [
                            {
                                model: this.server.mysql.Company,
                                as: 'companies'
                            }
                        ]
                    }
                ]
            }).then((userAccessToken) => {
                if (userAccessToken && typeof userAccessToken.user !== 'undefined') {

                    /* Initial setting when user connects, or reconnects */

                    user = userAccessToken.user;
                    socket.user = {id: user.id, name: user.name, email: user.email, activeCompanyUserId: user.activeCompanyUserId, companies: []}
                    user.companies.forEach((company) => {
                        socket.user.companies.push(company.id)
                        this.server.mongodb.Device.find({
                            companyId: company.id
                        }).exec().then((devices) => {
                            devices.forEach((device) => {
                                // console.log(user.name + " connected to room: " + 'device/' + device.code);
                                socket.join('device/' + device.code)
                            })
                        }).catch((err) => {
                            console.log(err)
                        })
                    })



                    /* Importing draft events */
                    drafts.forEach((s) => {
                        new s(this.server, channels, socket)
                    })

                    /* Importing request board events */
                    const RequestBoard = require('.//RequestBoard/index')
                    new RequestBoard(this.server, socket)
                }
            })

            socket.on('join-device-room', (deviceCode) => {
                // console.log(user.name + " joins device/" + deviceCode + ".");
                socket.join('device/' + deviceCode)
            })
            socket.on('leave-device-room', (deviceCode) => {
                // console.log(user.name + " leaves device/" + deviceCode + ".");
                socket.leave('device/' + deviceCode)
            })
        })
    }

}