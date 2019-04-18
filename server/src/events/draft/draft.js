import EventResponse from '~server/models/EventResponse'
import _ from 'lodash'
import merge from 'deepmerge'

module.exports = class Draft {

    /**
     * @constructor
     * @param {Object} server
     * @param {Object} socket = { instance, user:Object, activeCompany:Number, activeUserCompany:Number}
     */
    constructor(server, socket){
        this.server = server
        this.socket = socket

        this.draft = {}

        this._timeoutUntilSave = null

        this._setParentListeners()
    }

    /**
     * Set listeners
     * @private
     */
    _setParentListeners(){

        const vm = this

        /**
         * Load the draft for the socket, get draft
         * @param {object} evData = { draftId:Number }
         */
        vm.socket.instance.on('draft.load', (evData) => {
            return new Promise((resolve, reject) => {
                vm.socket.instance.join('company/' + vm.socket.activeCompany.id + '/draft/' + evData.draftId)
                return vm.server.broker.call('socket.control', {
                    userId: vm.socket.user.id,
                    socketId: vm.socket.instance.id,
                    companyId: vm.socket.activeCompany.id
                }).then(() => {
                    resolve()
                })
            }).then(() => {

                /*
                const room = _.get(vm.server.io.sockets.adapter.rooms, '[company/' + vm.socket.activeCompany.id + '/draft/' + evData.draftId + ']', {length: 0})
                if(room.length !== 1) return vm.socket.instance.emit('draft.load', new EventResponse(new Error ('Outro atendente já está com este rascunho aberto!')))
                */

                // if from database, call the service
                vm.server.broker.call('draft.get', {
                    where: {
                        companyId: vm.socket.activeCompany.id,
                        draftId: evData.draftId
                    }
                }).then((draft) => {
                    vm.draft = draft
                    vm.socket.instance.emit('draft.load', new EventResponse(draft))
                })
            })
        })

        /**
         * Socket is leaving the draft, remove the socket from its listeners
         * @param {object} evData = { draftId:Number }
         */
        vm.socket.instance.on('draft.leave', (evData) => {
            vm.socket.instance.leave('company/' + vm.socket.activeCompany.id + '/draft/' + evData.draftId)

            return vm.server.broker.call('socket.control', {
                userId: vm.socket.user.id,
                socketId: vm.socket.instance.id,
                companyId: vm.socket.activeCompany.id
            })
        })

        /**
         * Socket is leaving the draft, remove the socket from its listeners
         * @param {object} evData = { draftId:Number, data:Object|Array, timeout:Number }
         */
        vm.socket.instance.on('draft.setData', (evData) => {
            if (_.isArray(evData.data)) {
                evData.data.forEach((dataObj) => {
                    if(_.get(dataObj,'remove', false)){ // if it has to be removed
                        const containerToRemoveKey = _.get(vm.draft.data, dataObj.path)
                        if(_.isArray(containerToRemoveKey)){
                            containerToRemoveKey.splice(dataObj.key, 1)
                            _.set(vm.draft.data, dataObj.path, containerToRemoveKey)
                        }
                        else if(_.isObject(containerToRemoveKey)){
                            _.unset(vm.draft.data, dataObj.path)
                        }
                    }
                    else {
                        _.set(vm.draft.data, dataObj.path, dataObj.value)
                    }
                })
            }
            else if (_.isObject(evData.data)) {
                if(_.get(evData.data,'remove', false)) {
                    const containerToRemoveKey = _.get(vm.draft.data, evData.data.path)
                    if(_.isArray(containerToRemoveKey)){
                        containerToRemoveKey.splice(evData.data.key, 1)
                        _.set(vm.draft.data, evData.data.path, containerToRemoveKey)
                    }
                    else if(_.isObject(containerToRemoveKey)){
                        _.unset(vm.draft.data, evData.data.path)
                    }
                }
                else {
                    _.set(vm.draft.data, evData.data.path, evData.data.value)
                }
            }
            this.saveInstantly()
        })

    }

    /**
     * Save draft after x seconds if nothing are saved in the meantime
     * Reset/renew the timeout if a method with timeout is executed
     * @param {Number} timeout
     */
    saveWithTimeout(timeout = 3000){
        const vm = this
        if(vm._timeoutUntilSave){
            clearTimeout(vm._timeoutUntilSave)
        }
        vm._timeoutUntilSave = setTimeout(() => {
            return vm.saveInstantly()
        }, timeout)
    }

    /**
     * Save the draft instantly
     * Also, if something are left to be saved in a timeout, save it too
     */
    saveInstantly(){
        const vm = this
        if(vm._timeoutUntilSave){
            clearTimeout(vm._timeoutUntilSave)
        }
        this.server.broker.call('draft.update', {
            data: vm.draft
        })
    }

}