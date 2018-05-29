import ExtendableError from 'es6-error'
import process from 'process'

class ValidationError extends ExtendableError {
    // constructor is optional; you should omit it if you just want a custom error
    // type for inheritance and type checking
    constructor(message = 'Permission Error') {
        super(message)
        if(process.env.NODE_ENV === 'production' && this.hasOwnProperty('stack')) delete this.stack
    }
    setCode(code){
        this.code = code
    }
}

export default ValidationError