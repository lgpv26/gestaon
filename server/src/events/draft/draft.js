module.exports = class Draft {
    /**
     * @constructor
     * @param {Object} server
     * @param {Object} socket = { instance, user, activeCompany, activeUserCompany}
     */
    constructor(server, socket){
        this.server = server
        this.socket = socket
    }

}