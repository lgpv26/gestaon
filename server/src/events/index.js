import fs from 'fs'
import path from 'path'
import _ from 'lodash'
import config from '../config'
import EventResponse from '../models/EventResponse'
import RSMQWorker from "rsmq-worker"
import moment from "moment"


module.exports = function (server) {
    /**
     * attach server instance, load socket.io events files
     * @param server
     */

    this.server = server
    this._versionInterval = null

    this.events = fs.readdirSync(path.join(__dirname, '/')).filter((fileName) => {
        return fileName !== 'index.js'
    }).map((directory) => {
        return {
            directoryName: directory,
            files: _.filter(fs.readdirSync(path.join(__dirname, '/', directory, '/')), (fileName) => {
                return directory + '.js' !== fileName
            })
        }
    })

    this.server.io.on('connection', (socket) => {
        
        if(!!this._versionInterval){
            clearInterval(this._versionInterval)
        }

        const webAppVersion = require('../../../client/package.json').version
        this._versionTimeInterval = setInterval(() => {
            socket.instance.emit('version', new EventResponse({
                webApp: webAppVersion,
                android: config.mainServer.androidVersion
            }))
        }, 1000 * 10)

        // get token and get connected user
        let token = socket.handshake.query.token
        socket = {
            instance: socket
        }
        this.server.mysql.UserAccessToken.findOne({
            where: {
                accessToken: token
            },
            include: [{
                model: this.server.mysql.User,
                as: 'user',
                attributes: { exclude: ['password']},
                include: [{
                    model: this.server.mysql.Company,
                    as: 'companies'
                }, {
                    model: this.server.mysql.CompanyUser,
                    as: 'userCompanies'
                }]
            }]
        }).then((userAccessToken) => {
            if (userAccessToken && typeof userAccessToken.user !== 'undefined') {
                // initial setting when user connects, or reconnects
                socket.user = userAccessToken.user
                socket.activeUserCompany = _.find(socket.user.userCompanies, {
                    id: socket.user.activeCompanyUserId
                })
                if(!socket.activeUserCompany) socket.activeUserCompany =  _.first(socket.user.userCompanies)
                socket.activeCompany = _.find(socket.user.companies, {
                    id: socket.activeUserCompany.companyId
                })
                if(!socket.activeCompany) socket.activeCompany = _.first(socket.user.companies)

                return this.server.broker.call('socket.active', {
                    userId: socket.user.id,
                    activeSocketId: socket.instance.id
                }).then(() => {
                    return this.server.broker.call('socket.consult', {
                        key: 'userId:' + socket.user.id
                    }).then((consult) => {
                        const roomsConsult = consult.rooms
                        socket.instance.join('company/' + socket.activeCompany.id)
        
                        return new Promise((resolve, reject) => {
        
                            // join the user to its company events
                            if(roomsConsult) {
                                const promises = []
                                const rooms = roomsConsult.split(",")
                                rooms.forEach((room) => {
                                    promises.push(new Promise((resolve, reject) => {
                                        socket.instance.join(room)
                                        resolve()
                                    }))
                                })
        
                                return Promise.all(promises).then(() => {
                                    resolve()
                                })
                            }
                            else{
                                return this.server.broker.call('socket.control', {
                                    userId: socket.user.id,
                                    socketId: socket.instance.id,
                                    companyId: socket.activeCompany.id
                                }).then(() => {
                                    resolve()
                                })
                            }
                        }).then(() => {
                            // Importing all events
                            
                            this.events.forEach((event) => {
                                event.files.forEach((file) => {
                                    const tEventFile = require('./' + event.directoryName + '/' + file)
                                    new tEventFile(this.server, socket)
                                })
                            })
                        })
                    })
                })
            }
        })

    })

}