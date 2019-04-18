import ExtendableError from 'es6-error'
import process from 'process'

class HTTPError extends ExtendableError {
    // constructor is optional; you should omit it if you just want a custom error
    // type for inheritance and type checking
    constructor(message = 'Internal server error', statusCode = 500) {
        super(message)
        if(process.env.NODE_ENV === 'production' && this.hasOwnProperty('stack')) delete this.stack
        this.setStatusCode(statusCode)
        this.success = false
    }

    setStatusCode(statusCode){
        this.statusCode = statusCode
    }

    setData(data){
        this.data = data
    }

    setCode(code){
        this.code = code
    }
}

export default HTTPError