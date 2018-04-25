import EventResponse from '~server/models/EventResponse'
import _ from 'lodash'

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
            vm.socket.instance.join('company/' + vm.socket.activeCompany.id + '/draft/' + evData.draftId)
            vm.server.innkeeper.join(vm.socket.instance, evData.draftId)
            // get draft from memory or from database to the respective draft id
            if(vm.server.innkeeper.room(evData.draftId).get('draft')){
                // if from memory
                vm.draft = vm.server.innkeeper.room(evData.draftId).get('draft')
                vm.socket.instance.emit('draft.load', new EventResponse(vm.server.innkeeper.room(evData.draftId).get('draft')))
            }
            else {
                // if from database, call the service
                vm.server.broker.call('draft.get', {
                    data: {
                        companyId: vm.socket.activeCompany.id,
                        draftId: evData.draftId
                    }
                }).then((draft) => {
                    vm.draft = draft
                    vm.socket.instance.emit('draft.load', new EventResponse(draft))
                    vm.server.innkeeper.room(evData.draftId).set('draft', draft)
                })
            }
            // this should be executed to sync every draft opened for each client connected to its respective draft
            vm.server.innkeeper.room(evData.draftId).on('draft.update', (draft) => {
                vm.draft = draft
            })
        })

        /**
         * Socket is leaving the draft, remove the socket from its listeners
         * @param {object} evData = { draftId:Number }
         */
        vm.socket.instance.on('draft.leave', (evData) => {
            vm.socket.instance.leave('company/' + vm.socket.activeCompany.id + '/draft/' + evData.draftId)
            vm.server.innkeeper.leave(vm.socket.instance, evData.draftId)
            vm.draft = {}
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
        // only emit if the room still exists
        if(vm.server.innkeeper.room(vm.draft.draftId)){
            vm.server.innkeeper.room(vm.draft.draftId).emit('draft.update', vm.draft)
        }
        this.server.broker.call('draft.update', {
            data: vm.draft
        })
    }

    /**
     * Set a path and its value for the draft form
     * The path is relative to the form property in the draft object
     * @param path
     * @param value
     */
    setDraftForm(path, value){
        if(_.has(this.draft, 'form')) _.set(this.draft.form, path, value)
    }

     /**
     * Set a path and its value for the draft data
     * The path is relative to the form property in the draft array
     * @param path
     * @param value
     */
    setDraftData(path, values, reset = false){

        if(reset){
            _.set(this.draft, 'data.' + path, values)
        }
        else{
            return new Promise((resolve, reject) => {
                let update = _.get(this.draft, 'data.' + path)

                values.map((value, index) => {
                    const arrayIndex = _.findIndex(update, { id: value.id })
                    if (arrayIndex !== -1) {
                        update[arrayIndex] = _.assign(update[arrayIndex], value)
                    }
                    else {
                        update.push(values[index])
                    }
                })
                resolve(update)
            }).then((update) => {
                _.set(this.draft, 'data.' + path,
                    update
                )
            }).catch((err) => {
                console.log(err)
            })
        }

    }

}