import _ from 'lodash'
import EventEmitter from 'events'

/**
 * Class that deals with server internal rooms
 * @class Innkeeper
 * @type {module.Innkeeper}
 */
module.exports = class Innkeeper extends EventEmitter {

    /**
     * @constructor
     */
    constructor(){
        super()
        this.rooms = {}
    }

    /**
     * Get the reference to the room
     * @param roomName
     * @returns {Object}
     */
    room(roomName){
        if(_.has(this.rooms, roomName)){
            return this.rooms[roomName]
        }
    }

    /**
     * Join or create a room if not existent
     * @param {Socket.io} socket
     * @param {String} roomName
     */
    join(socket, roomName){
        const vm = this
        /* create room if not already existent */
        if(!_.has(this.rooms, roomName)) {
            this.create(roomName)
        }
        /* add socket to room's socket list */
        this.rooms[roomName].sockets[socket.id] = socket
        /* add listener to the socket */
        this.rooms[roomName].on = function(roomIdentifier, cb){
            const channel = 'room:' + roomName + ':' + roomIdentifier
            const listener = (data) => {
                cb(data)
            }
            this.listeners.push({
                socket,
                channel,
                instance: listener
            })
            vm.on(channel, listener)
        }
    }

    /**
     * Remove the socket from a room
     * @param {Socket.io} socket
     * @param {String} roomName
     */
    leave(socket, roomName){
        const vm = this
        if(_.has(this.rooms, roomName + '.sockets.' + socket.id)){
            this.rooms[roomName].listeners = this.rooms[roomName].listeners.filter((listener) => {
                if(socket.id === listener.socket.id){
                    vm.removeListener(listener.channel, listener.instance)
                    return false
                }
                return true
            })
            this.rooms[roomName].sockets = _.omit(this.rooms[roomName].sockets, socket.id)
        }
    }

    /**
     * Remove the socket from every rooms he's attached to
     * @param {Socket.io} socket
     */
    leaveAll(socket){
        const vm = this
        this.rooms = _.pickBy(this.rooms, (room) => {
            room.listeners = room.listeners.filter((listener) => {
                if(socket.id === listener.socket.id){
                    vm.removeListener(listener.channel, listener.instance)
                    return false
                }
                return true
            })
            room.sockets = _.pickBy(room.sockets, (roomSocket, socketId) => {
                if(socketId !== socket.id){
                    return true
                }
            })
            if(_.keys(room.sockets).length > 0){
                return true
            }
        })
    }

    /**
     * Create an empty room, this method should be used through join()
     * @param roomName
     */
    create(roomName){
        const vm = this
        this.rooms[roomName] = {
            sockets: {},
            data: {},
            listeners: [],
            /**
             * Emit a data
             * @param roomIdentifier
             * @param data
             */
            emit: function(roomIdentifier, data){
                vm.emit('room:' + roomName + ':' + roomIdentifier, data)
            },
            /**
             * Set a data to the room
             * @param key
             * @param value
             */
            set(key, value){
                this.data[key] = value
            },
            /**
             * Get a data from the room
             * @param key
             */
            get(key){
                return this.data[key]
            }
        }
    }
}