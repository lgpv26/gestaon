module.exports = class EventResponse {

    constructor(data, message = false){
        this.setEventResponse(data, message)
    }

    setEventResponse(data, message){
        if(data instanceof Error){
            this.success = false
            const error = {
                message: data.message
            }
            if(data.data){
                error.data = data.data
            }
            if(data.code){
                error.code = data.code
            }
            if(message) {
                this.message = message
            }
            this.error = error
        }
        else {
            this.success = true
            if(message){
                this.message = message
            }
            this.evData = data
        }
    }

    setMessage(message){
        this.message = message
    }

}