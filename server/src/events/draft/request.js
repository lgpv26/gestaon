import Draft from './draft'

module.exports = class Request extends Draft {
    constructor(server, socket){
        super(server, socket)
    }
}