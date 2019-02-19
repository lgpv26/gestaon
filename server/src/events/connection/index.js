import fs from 'fs'
import path from 'path'
import _ from 'lodash'
import config from '../../config'
import EventResponse from '../../models/EventResponse'
import RSMQWorker from "rsmq-worker"
import moment from "moment"

module.exports = class Connection {
    /**
     * attach server instance, load socket.io events files
     * @param server
     */
    constructor(server, socket){
        this.server = server
        this.socket = socket

        this._rsmqWorkers = {} /// MAPEAMENTO DOS USER RSMQWORKER
        this._usersSystemReady = {} /// MAPEAMENTO DOS USER SYSTEM READY
        
        this._connection()

        this._setListeners()
    }

    /**
     * private
     * set connection on socket
     */
    _connection(){
        const vm = this
        this.server.rsmq.listQueues()
            .then((queues) => {
                if(!_.includes(queues, "userId-" + this.socket.user.id)){
                    this.server.rsmq.createQueue({ qname: "userId-" + this.socket.user.id, maxsize: -1 })
                        .then(() => {
                            console.log("queue userId:" + this.socket.user.id + " created")
                        })
                }

            })
            .catch((err) => console.log(err))

            this.socket.instance.to('company/' + this.socket.activeCompany.id).emit('presence:add', new EventResponse({
                id: this.socket.user.id,
                name: this.socket.user.name,
                email: this.socket.user.email,
                userCompanies: this.socket.user.companies,
                socketId: this.socket.instance.id
            }))
            
            this.server.broker.call('socket.stream', {
                event: 'import',
                socketId: this.socket.instance.id
            })

            if(this._rsmqWorkers["userId:" + this.socket.user.id]) delete this._rsmqWorkers["userId:" + this.socket.user.id]

            this._rsmqWorkers["userId:" + this.socket.user.id] = new RSMQWorker("userId-" + this.socket.user.id, {
                maxReceiveCount: 1,
                interval: [ .2, 1, 1.5, 2]
            })

            this._rsmqWorkers["userId:" + this.socket.user.id].on("message", function (msg, next, id) {

                const message = JSON.parse(msg)
                switch (message.type) {
                    case "request":
                        return vm.server.broker.call("socket.processedQueue", _.assign(message, { userId: vm.socket.user.id, messageID: id }))
                            .then(() => {
                                next()
                            })
                    break;
                    default:
                            console.log("type error on rsmq")
                    break;
                }

            })
    }

    /**
     * private
     * set main this.socket.io events
     */
    _setListeners(){
        const vm = this
        
        this.socket.instance.on('system:ready', () => {
            const usersSystemArray = _.map(_.keys(this._usersSystemReady))
            if(_.includes(usersSystemArray, "userId:" + this.socket.user.id)) return console.log("Já deu system ready")
            this._usersSystemReady["userId:" + this.socket.user.id] = true
            console.log("O client do usuario " + this.socket.user.name + " esta pronto!" )
            this._rsmqWorkers["userId:" + this.socket.user.id].size((err, size) => {
                console.log("A fila do",  this.socket.user.name, "está atualmente com", size, "pendentes de ser entregue!")
            })
            this.server.broker.call('socket.conected', {
                companyId: this.socket.activeCompany.id,
                activeSocketId: this.socket.instance.id,
                userId: this.socket.user.id
            }).then(() => {
                this._rsmqWorkers["userId:" + this.socket.user.id].start()
            })
        })

        this.socket.instance.on('disconnect', () => {
            if(this.socket.user && this._rsmqWorkers["userId:" + this.socket.user.id]) {
                this._rsmqWorkers["userId:" + this.socket.user.id].quit()
                delete this._rsmqWorkers["userId:" + this.socket.user.id]
            }

            const usersSystemArray = _.map(_.keys(this._usersSystemReady))
            if(this.socket.user && _.includes(usersSystemArray, "userId:" + this.socket.user.id)) delete this._usersSystemReady["userId:" + this.socket.user.id]

            if(this.socket.user) console.log("O usuario", this.socket.user.name, "saiu")

            if(!!this._versionInterval){
                clearInterval(this._versionInterval)
            }

            if(this.socket.activeCompany) this.server.io.in('company/' + this.socket.activeCompany.id).emit('presence:remove', new EventResponse({userId: this.socket.user.id, socketId: this.socket.instance.id}))

            this.server.broker.call('socket.remove', {
                activeSocketId: this.socket.instance.id
            })

        })

    }

}